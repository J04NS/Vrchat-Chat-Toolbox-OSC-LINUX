import React, { useEffect, useState } from 'react';
import { Radio, Volume2, VolumeX, Send, Sparkles, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { formatChatboxMessage, getHeartIcon } from '../lib/formatter';
import { HeartRateState, MediaState } from '../types';

interface ChatboxPreviewProps {
  template: string;
  hrState: HeartRateState;
  mediaState: MediaState;
  customStatus: string;
  marqueeEnabled: boolean;
  marqueeWidth: number;
  playSound: boolean;
  bypassTyping: boolean;
  updateIntervalMs: number;
  isActive: boolean;
  onSendManual: (text: string) => Promise<void>;
}

export const ChatboxPreview: React.FC<ChatboxPreviewProps> = ({
  template,
  hrState,
  mediaState,
  customStatus,
  marqueeEnabled,
  marqueeWidth,
  playSound,
  bypassTyping,
  updateIntervalMs,
  isActive,
  onSendManual,
}) => {
  const [tick, setTick] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);

  // Animation ticker based on update interval or preview timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, Math.max(1000, updateIntervalMs));
    return () => clearInterval(timer);
  }, [updateIntervalMs]);

  // Heartbeat pulse animation
  useEffect(() => {
    if (hrState.bpm > 0) {
      const beatInterval = (60 / hrState.bpm) * 1000;
      const beatTimer = setInterval(() => {
        setPulseScale(1.25);
        setTimeout(() => setPulseScale(1), 180);
      }, beatInterval);
      return () => clearInterval(beatTimer);
    }
  }, [hrState.bpm]);

  const { fullText, displayText, isOverflow } = formatChatboxMessage(
    template,
    hrState,
    mediaState,
    customStatus,
    tick,
    marqueeEnabled,
    marqueeWidth
  );

  const handleTestSend = async () => {
    setIsSending(true);
    await onSendManual(displayText);
    setTimeout(() => setIsSending(false), 500);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className={`w-4 h-4 ${isActive ? 'animate-pulse text-emerald-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              VRChat Chatbox Live-Vorschau
              {isActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Aktiv am Senden
                </span>
              ) : (
                <span className="text-[11px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  Pausiert
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">So wird dein Text in VRChat über deinem Avatar angezeigt</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-manual-send-preview"
            onClick={handleTestSend}
            disabled={isSending}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
            title="Diesen Text sofort als OSC-Paket an VRChat senden"
          >
            {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Jetzt senden
          </button>
        </div>
      </div>

      {/* Simulated VRChat In-VR Chatbox Bubble */}
      <div className="relative my-2 p-6 rounded-2xl bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950/90 border-2 border-slate-700/80 shadow-2xl overflow-hidden">
        {/* VR Chatbox decorative top notch / indicator */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 mb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-slate-300 font-medium">CHATBOX</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {playSound ? (
              <span className="flex items-center gap-1 text-amber-400 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded">
                <Volume2 className="w-3 h-3" /> Sound an
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                <VolumeX className="w-3 h-3" /> Stumm
              </span>
            )}
            <span className="text-slate-400 text-[10px]">
              {bypassTyping ? '⚡ Direkt' : '⌨️ Tippend'}
            </span>
          </div>
        </div>

        {/* Text Display Bubble */}
        <div className="min-h-[58px] flex items-center justify-center text-center px-4 py-3 rounded-xl bg-black/40 border border-slate-800/60">
          <span className="text-lg md:text-xl font-medium tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] break-words font-sans">
            {displayText || <span className="text-slate-500 italic">Chatbox Text ist leer...</span>}
          </span>
        </div>

        {/* Live Metrics Row inside preview */}
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span
                style={{ transform: `scale(${pulseScale})` }}
                className="inline-block transition-transform duration-150 origin-center text-sm"
              >
                {getHeartIcon(hrState.bpm, tick)}
              </span>
              <span className="font-semibold text-slate-200">{hrState.bpm > 0 ? `${hrState.bpm} BPM` : '--'}</span>
            </div>

            <span className="text-slate-600">•</span>

            <div className="flex items-center gap-1.5 truncate max-w-[200px]">
              <span>{mediaState.isPlaying ? '🎵' : '⏸️'}</span>
              <span className="truncate text-slate-300">
                {mediaState.title ? `${mediaState.title} - ${mediaState.artist || 'Unbekannt'}` : 'Keine Musik'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                isOverflow
                  ? 'bg-rose-500/20 text-rose-400 font-bold'
                  : displayText.length > 120
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {displayText.length} / 144 Zeichen
            </span>
          </div>
        </div>

        {isOverflow && (
          <div className="mt-2 text-xs flex items-center gap-1.5 text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Der Text überschreitet das VRChat-Limit (144 Zeichen) und wird im Chat abgeschnitten. Aktiviere Marquee-Laufschrift oder kürze den Text.
            </span>
          </div>
        )}
      </div>

      {/* Info helper */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 px-1">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-400" />
          Aktualisierungsintervall: <span className="text-slate-200 font-mono">{updateIntervalMs / 1000}s</span>
        </span>
        <span>{marqueeEnabled ? '↔️ Laufschrift aktiv' : '⏹️ Statischer Text'}</span>
      </div>
    </div>
  );
};
