import { useEffect, useRef, useState, useCallback } from 'react';
import { SpeechToTextState } from '../types';

interface UseSpeechToTextProps {
  language?: string;
  sendMode?: 'auto_final' | 'auto_instant' | 'manual';
  prefix?: string;
  clearDelaySec?: number;
  enabled?: boolean;
  onSendOscText?: (text: string) => void;
}

export function useSpeechToText({
  language = 'de-DE',
  sendMode = 'auto_final',
  prefix = '🎙️',
  clearDelaySec = 6,
  enabled = true,
  onSendOscText,
}: UseSpeechToTextProps) {
  const [sttState, setSttState] = useState<SpeechToTextState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    lastFinalText: '',
    isSupported: false,
    language,
    sendMode,
    clearDelaySec,
    prefix,
    lastSpokenTime: 0,
    micPermission: 'unknown',
  });

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const clearTimerRef = useRef<any>(null);
  const onSendOscTextRef = useRef(onSendOscText);
  onSendOscTextRef.current = onSendOscText;

  // Check support on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const isSupported = !!SpeechRecognition;
    setSttState((prev) => ({ ...prev, isSupported, language, sendMode, prefix, clearDelaySec }));

    // Check navigator permission status if available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          setSttState((prev) => ({
            ...prev,
            micPermission: permissionStatus.state as any,
          }));
          permissionStatus.onchange = () => {
            setSttState((prev) => ({
              ...prev,
              micPermission: permissionStatus.state as any,
            }));
          };
        })
        .catch(() => {
          // Permissions API query for mic not supported in all browsers, fallback safely
        });
    }
  }, [language, sendMode, prefix, clearDelaySec]);

  // Handle auto-clear timer
  const scheduleAutoClear = useCallback(() => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    if (clearDelaySec > 0) {
      clearTimerRef.current = setTimeout(() => {
        setSttState((prev) => ({
          ...prev,
          transcript: '',
          interimTranscript: '',
        }));
      }, clearDelaySec * 1000);
    }
  }, [clearDelaySec]);

  const sendText = useCallback(
    (rawText: string) => {
      const clean = rawText.trim();
      if (!clean) return;
      const formatted = prefix ? `${prefix} ${clean}` : clean;
      if (onSendOscTextRef.current) {
        onSendOscTextRef.current(formatted);
      }
      scheduleAutoClear();
    },
    [prefix, scheduleAutoClear]
  );

  const startListening = useCallback(async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSttState((prev) => ({
        ...prev,
        error: 'Speech Recognition not supported in this browser.',
      }));
      return;
    }

    // Explicitly request user media to trigger native browser prompt if needed
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop audio tracks after obtaining permission
        stream.getTracks().forEach((track) => track.stop());
        setSttState((prev) => ({ ...prev, micPermission: 'granted', error: undefined }));
      }
    } catch (err: any) {
      setSttState((prev) => ({
        ...prev,
        micPermission: 'denied',
        error: 'Microphone permission denied.',
      }));
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language || 'de-DE';
      recognition.maxAlternatives = 1;

      isManuallyStoppedRef.current = false;

      recognition.onstart = () => {
        setSttState((prev) => ({
          ...prev,
          isListening: true,
          error: undefined,
          micPermission: 'granted',
        }));
      };

      recognition.onresult = (event: any) => {
        let fullFinalTranscript = '';
        let currentInterimTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          const chunk = item[0]?.transcript || '';
          if (item.isFinal) {
            fullFinalTranscript += (fullFinalTranscript ? ' ' : '') + chunk.trim();
          } else {
            currentInterimTranscript += (currentInterimTranscript ? ' ' : '') + chunk.trim();
          }
        }

        fullFinalTranscript = fullFinalTranscript.trim();
        currentInterimTranscript = currentInterimTranscript.trim();

        const latestPhrase = fullFinalTranscript || currentInterimTranscript;

        setSttState((prev) => ({
          ...prev,
          transcript: fullFinalTranscript,
          interimTranscript: currentInterimTranscript,
          lastFinalText: fullFinalTranscript || prev.lastFinalText,
          lastSpokenTime: Date.now(),
        }));

        // Auto-send modes
        if (fullFinalTranscript && sendMode === 'auto_final') {
          sendText(fullFinalTranscript);
        } else if (currentInterimTranscript && sendMode === 'auto_instant') {
          sendText(currentInterimTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        // 'no-speech' is benign in continuous recognition
        if (event.error === 'no-speech') return;
        if (event.error === 'not-allowed') {
          setSttState((prev) => ({
            ...prev,
            isListening: false,
            micPermission: 'denied',
            error: 'Microphone permission denied by browser.',
          }));
        } else {
          setSttState((prev) => ({
            ...prev,
            error: `Speech recognition error: ${event.error}`,
          }));
        }
      };

      recognition.onend = () => {
        // If not manually stopped and enabled, auto-restart continuous listening
        if (!isManuallyStoppedRef.current && enabled) {
          try {
            recognition.start();
            return;
          } catch (_) {}
        }
        setSttState((prev) => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setSttState((prev) => ({
        ...prev,
        isListening: false,
        error: err?.message || 'Failed to start speech recognition',
      }));
    }
  }, [language, sendMode, enabled, sendText]);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    setSttState((prev) => ({ ...prev, isListening: false }));
  }, []);

  const clearTranscript = useCallback(() => {
    setSttState((prev) => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      lastFinalText: '',
    }));
  }, []);

  const manualSendCurrent = useCallback(() => {
    const textToSend = sttState.interimTranscript || sttState.transcript || sttState.lastFinalText;
    if (textToSend) {
      sendText(textToSend);
    }
  }, [sttState, sendText]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isManuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
    };
  }, []);

  const toggleListening = useCallback(async () => {
    if (sttState.isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [sttState.isListening, startListening, stopListening]);

  return {
    sttState,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    manualSendCurrent,
  };
}
