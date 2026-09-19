import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Trash2,
  Languages,
  Sliders,
  Radio,
  RefreshCw,
  Info,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { ChatboxConfig, SpeechToTextState, AppLanguage } from '../types';
import { translations } from '../lib/i18n';

interface SpeechToTextCardProps {
  lang: AppLanguage;
  config: ChatboxConfig;
  sttState: SpeechToTextState;
  onUpdateConfig: (updates: Partial<ChatboxConfig>, notifyMessage?: string) => Promise<void>;
  onStartListening: () => Promise<void>;
  onStopListening: () => void;
  onClearTranscript: () => void;
  onSendManualText: (text: string) => Promise<void>;
  onInsertTemplateVariable?: (varTag: string) => void;
}

const LANGUAGES = [
  { code: 'de-DE', label: 'Deutsch (Deutschland)', flag: '🇩🇪' },
  { code: 'en-US', label: 'English (United States)', flag: '🇺🇸' },
  { code: 'en-GB', label: 'English (United Kingdom)', flag: '🇬🇧' },
  { code: 'ja-JP', label: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'fr-FR', label: 'Français (France)', flag: '🇫🇷' },
  { code: 'es-ES', label: 'Español (España)', flag: '🇪🇸' },
  { code: 'it-IT', label: 'Italiano (Italia)', flag: '🇮🇹' },
  { code: 'ru-RU', label: 'Русский (Russian)', flag: '🇷🇺' },
  { code: 'ko-KR', label: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'zh-CN', label: '中文 (Simplified)', flag: '🇨🇳' },
];

export const SpeechToTextCard: React.FC<SpeechToTextCardProps> = ({
  lang,
  config,
  sttState,
  onUpdateConfig,
  onStartListening,
  onStopListening,
  onClearTranscript,
  onSendManualText,
}) => {
  const t = translations[lang];
  const [testInput, setTestInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isEnabled = config.sttEnabled ?? false;
  const currentLanguage = config.sttLanguage || (lang === 'de' ? 'de-DE' : 'en-US');
  const currentSendMode = config.sttSendMode || 'auto_final';
  const currentPrefix = config.sttPrefix !== undefined ? config.sttPrefix : '🎙️';
  const clearDelay = config.sttClearDelaySec ?? 6;

  const handleToggleEnable = (newVal: boolean) => {
    onUpdateConfig(
      { sttEnabled: newVal },
      newVal
        ? lang === 'de'
          ? 'Speech-to-Text aktiviert'
          : 'Speech-to-Text enabled'
        : lang === 'de'
        ? 'Speech-to-Text deaktiviert'
        : 'Speech-to-Text disabled'
    );
    if (!newVal && sttState.isListening) {
      onStopListening();
    }
  };

  const handleToggleListening = async () => {
    if (sttState.isListening) {
      onStopListening();
    } else {
      if (!isEnabled) {
        await onUpdateConfig({ sttEnabled: true });
      }
      await onStartListening();
    }
  };

  const handleSendLiveOrManual = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setIsSending(true);
    const formatted = currentPrefix ? `${currentPrefix} ${textToSend.trim()}` : textToSend.trim();
    await onSendManualText(formatted);
    setTimeout(() => setIsSending(false), 400);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all ${
                sttState.isListening
                  ? 'bg-purple-600 text-white shadow-purple-600/40 ring-4 ring-purple-500/20 animate-pulse'
                  : isEnabled
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              <Mic className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-bold text-white tracking-tight">{t.speechToText.title}</h2>
                {sttState.isListening ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/25 text-purple-300 border border-purple-500/50 shadow-sm animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    {t.speechToText.listeningActive}
                  </span>
                ) : isEnabled ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.common.active}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                    {t.speechToText.micIdle}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">{t.speechToText.subtitle}</p>
            </div>
          </div>

          {/* Quick Action Toggle & Mic Start Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-master-toggle-stt"
              type="button"
              onClick={() => handleToggleEnable(!isEnabled)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border flex items-center gap-2 ${
                isEnabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-950 hover:bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <span>{t.speechToText.enableStt}:</span>
              <span className={isEnabled ? 'text-purple-400 font-extrabold' : 'text-slate-500'}>
                {isEnabled ? t.dashboard.statusOn : t.dashboard.statusOff}
              </span>
            </button>

            <button
              id="btn-toggle-mic-listening"
              type="button"
              onClick={handleToggleListening}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center gap-2 active:scale-95 ${
                sttState.isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 ring-2 ring-rose-400/40 animate-pulse'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50'
              }`}
            >
              {sttState.isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>{t.speechToText.stopMic}</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>{t.speechToText.startMic}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Browser Support & Permission Info Banner */}
        {!sttState.isSupported && (
          <div className="mt-5 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-3 text-xs text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-bold">{t.speechToText.sttNotSupported}</p>
              <p className="text-rose-400/90 text-[11px]">{t.speechToText.sttNotSupportedDesc}</p>
            </div>
          </div>
        )}

        {sttState.error && (
          <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{sttState.error}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Live Transcriber & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Speech Console */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${sttState.isListening ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
                <h3 className="text-sm font-bold text-white">{t.speechToText.recognizedText}</h3>
              </div>
              <div className="flex items-center gap-2">
                {sttState.lastSpokenTime > 0 && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(sttState.lastSpokenTime).toLocaleTimeString()}
                  </span>
                )}
                <button
                  id="btn-clear-stt-transcript"
                  type="button"
                  onClick={onClearTranscript}
                  title={t.speechToText.clearTranscriptBtn}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Big Live Transcript Box */}
            <div
              className={`min-h-[140px] p-4 rounded-xl border transition-all flex flex-col justify-between ${
                sttState.isListening
                  ? 'bg-slate-950/90 border-purple-500/40 ring-1 ring-purple-500/20 shadow-inner'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {sttState.isListening ? t.speechToText.listeningActive : t.speechToText.micIdle}
                  </span>
                  <span className="font-mono text-purple-400">
                    {currentPrefix} {currentLanguage}
                  </span>
                </div>

                <div className="text-base md:text-lg font-medium text-white break-words leading-relaxed min-h-[48px]">
                  {sttState.transcript || sttState.interimTranscript ? (
                    <span>
                      {sttState.transcript}
                      {sttState.transcript && sttState.interimTranscript ? ' ' : ''}
                      {sttState.interimTranscript && (
                        <span className="text-purple-300 italic opacity-90">{sttState.interimTranscript}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-600 italic">
                      {sttState.isListening
                        ? lang === 'de'
                          ? 'Sprich jetzt in dein Mikrofon...'
                          : 'Speak into your microphone now...'
                        : lang === 'de'
                        ? 'Klicke auf "Mikrofon-Aufnahme starten" und erlaube den Browser-Zugriff.'
                        : 'Click "Start Microphone Listening" and grant browser permission.'}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom bar of transcript box */}
              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {lang === 'de' ? 'Modus' : 'Mode'}:{' '}
                  <span className="text-purple-300 font-semibold">
                    {currentSendMode === 'auto_final'
                      ? t.speechToText.modeAutoFinal
                      : currentSendMode === 'auto_instant'
                      ? t.speechToText.modeAutoInstant
                      : t.speechToText.modeManual}
                  </span>
                </span>

                <button
                  id="btn-send-stt-manual-live"
                  type="button"
                  disabled={!sttState.transcript && !sttState.interimTranscript && !sttState.lastFinalText}
                  onClick={() =>
                    handleSendLiveOrManual(
                      sttState.transcript || sttState.interimTranscript || sttState.lastFinalText
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white disabled:text-slate-500 transition-all shadow cursor-pointer active:scale-95"
                >
                  {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{t.speechToText.sendNowBtn}</span>
                </button>
              </div>
            </div>

            {/* Quick Test / Manual Voice Scratchpad */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {lang === 'de' ? 'Manuelle Sprach-Nachricht testen' : 'Test manual speech input'}
              </label>
              <div className="flex gap-2">
                <input
                  id="input-stt-manual-test"
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendLiveOrManual(testInput);
                      setTestInput('');
                    }
                  }}
                  placeholder={lang === 'de' ? 'z.B. Hallo VRChat, ich nutze Voice-to-Text!...' : 'e.g. Hello VRChat, voice text test!...'}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors font-sans"
                />
                <button
                  id="btn-submit-manual-test-stt"
                  type="button"
                  disabled={!testInput.trim()}
                  onClick={() => {
                    handleSendLiveOrManual(testInput);
                    setTestInput('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white disabled:text-slate-500 text-xs font-semibold transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Hint Box on Integration with Profiles */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200">
                  {lang === 'de' ? 'Tipp für deine Vorlagen' : 'Tip for your profiles'}
                </span>
                <p className="mt-0.5 text-slate-400 text-[11px] leading-relaxed">
                  {t.speechToText.variableHint}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                    {`{stt}`}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                    {`{speech}`}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                    {`{voice}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Configuration & Triggers */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                {lang === 'de' ? 'STT-Einstellungen' : 'STT Settings & Mode'}
              </h3>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-purple-400" />
                {t.speechToText.languageLabel}
              </label>
              <select
                id="select-stt-language"
                value={currentLanguage}
                onChange={(e) =>
                  onUpdateConfig({ sttLanguage: e.target.value }, `STT language set to ${e.target.value}`)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.flag} {l.label} ({l.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Transmission Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                {t.speechToText.sendModeLabel}
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'auto_final' as const,
                    title: t.speechToText.modeAutoFinal,
                    desc: t.speechToText.modeAutoFinalDesc,
                    badge: 'Recommended',
                  },
                  {
                    id: 'auto_instant' as const,
                    title: t.speechToText.modeAutoInstant,
                    desc: t.speechToText.modeAutoInstantDesc,
                    badge: 'Real-Time',
                  },
                  {
                    id: 'manual' as const,
                    title: t.speechToText.modeManual,
                    desc: t.speechToText.modeManualDesc,
                    badge: 'Manual',
                  },
                ].map((mode) => (
                  <label
                    key={mode.id}
                    onClick={() => onUpdateConfig({ sttSendMode: mode.id })}
                    className={`block p-3 rounded-xl border transition-all cursor-pointer ${
                      currentSendMode === mode.id
                        ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="sttSendMode"
                          checked={currentSendMode === mode.id}
                          onChange={() => {}}
                          className="accent-purple-500"
                        />
                        <span className="text-xs font-bold text-white">{mode.title}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-purple-300 border border-slate-800">
                        {mode.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 pl-5">{mode.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* Prefix / Icon */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.speechToText.prefixLabel}
              </label>
              <input
                id="input-stt-prefix"
                type="text"
                value={currentPrefix}
                onChange={(e) => onUpdateConfig({ sttPrefix: e.target.value })}
                placeholder={t.speechToText.prefixPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'de'
                  ? 'Wird dem erkannten Text in VRChat vorangestellt (z.B. 🎙️ oder leer lassen).'
                  : 'Prepended to recognized text in VRChat (e.g. 🎙️ or leave empty).'}
              </p>
            </div>

            {/* Auto-Clear Delay */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {t.speechToText.clearDelayLabel}
                </label>
                <span className="text-xs font-mono font-bold text-purple-400">
                  {clearDelay > 0 ? `${clearDelay}s` : lang === 'de' ? 'Aus (0s)' : 'Off (0s)'}
                </span>
              </div>
              <input
                id="slider-stt-clear-delay"
                type="range"
                min="0"
                max="20"
                step="1"
                value={clearDelay}
                onChange={(e) => onUpdateConfig({ sttClearDelaySec: Number(e.target.value) })}
                className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">{t.speechToText.clearDelaySec}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
