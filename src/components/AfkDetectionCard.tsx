import React, { useState } from 'react';
import { Moon, Clock, Radio, Footprints, ShieldCheck, Activity } from 'lucide-react';
import { AfkState, AppLanguage } from '../types';
import { translations } from '../lib/i18n';

interface AfkDetectionCardProps {
  lang?: AppLanguage;
  afkState?: AfkState;
  enabled: boolean;
  afkMode?: 'vrchat_and_timer' | 'vrchat_only' | 'timer_only';
  timeoutMinutes: number;
  template: string;
  overrideChatbox: boolean;
  onUpdateConfig: (updates: {
    afkEnabled?: boolean;
    afkMode?: 'vrchat_and_timer' | 'vrchat_only' | 'timer_only';
    afkTimeoutMinutes?: number;
    afkTemplate?: string;
    afkOverrideChatbox?: boolean;
  }) => void;
  onInsertMainVariable: (tag: string) => void;
}

export const AfkDetectionCard: React.FC<AfkDetectionCardProps> = ({
  lang = 'en',
  afkState,
  enabled,
  afkMode = 'vrchat_and_timer',
  timeoutMinutes,
  template,
  overrideChatbox,
  onUpdateConfig,
  onInsertMainVariable,
}) => {
  const t = translations[lang];
  const [isTogglingManual, setIsTogglingManual] = useState(false);

  const isAfk = afkState?.isAfk ?? false;
  const afkDurationSec = afkState?.afkDurationSec ?? 0;
  const afkSource = afkState?.source ?? 'none';
  const lastMovementTime = afkState?.lastMovementTime ?? 0;
  const isMovingRecently = Date.now() - lastMovementTime < 4000;

  // Format AFK duration as mm:ss or hh:mm:ss
  const formatAfkDuration = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleToggleManualAfk = async () => {
    setIsTogglingManual(true);
    try {
      await fetch('/api/afk/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceAfk: !isAfk }),
      });
    } catch {}
    setTimeout(() => setIsTogglingManual(false), 300);
  };

  const afkVariables = [
    { tag: '{afk_time}', desc: lang === 'de' ? 'AFK Dauer (z.B. 04:20)' : 'AFK duration (e.g. 04:20)' },
    { tag: '{afk_min}', desc: lang === 'de' ? 'Minuten (z.B. 4m)' : 'Minutes (e.g. 4m)' },
    { tag: '{hr}', desc: lang === 'de' ? 'Puls' : 'Heart rate' },
    { tag: '{clock}', desc: lang === 'de' ? 'Uhrzeit' : 'Clock' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              {t.afk.title}
              {enabled ? (
                <span className="text-[10px] font-medium bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {t.common.active}
                </span>
              ) : (
                <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {lang === 'de' ? 'Deaktiviert' : 'Disabled'}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">{t.afk.subtitle}</p>
          </div>
        </div>

        <button
          id="btn-toggle-afk-enabled"
          type="button"
          onClick={() => onUpdateConfig({ afkEnabled: !enabled })}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            enabled
              ? 'bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border-amber-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          {enabled ? (lang === 'de' ? 'AFK aktiv' : 'AFK Enabled') : (lang === 'de' ? 'AFK aus' : 'AFK Disabled')}
        </button>
      </div>

      {/* Live Status Banner */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
          isAfk
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : 'bg-slate-950/60 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isAfk ? 'bg-amber-400 animate-ping' : isMovingRecently ? 'bg-emerald-400 ring-2 ring-emerald-500/50 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <div>
            <div className="text-xs font-semibold flex items-center gap-2">
              {isAfk ? (
                <span className="text-amber-300 flex items-center gap-1.5 font-bold">
                  {t.afk.isAfk}
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                  {t.afk.isOnline}
                </span>
              )}
              {isAfk ? (
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 rounded border border-amber-500/30">
                  {lang === 'de' ? 'Ausgelöst durch:' : 'Triggered by:'} {afkSource === 'vrchat_osc' ? (lang === 'de' ? 'VRChat Headset/Avatar Signal' : 'VRChat Headset/Avatar Signal') : afkSource === 'timer' ? (lang === 'de' ? 'Inaktivitäts-Timer' : 'Inactivity Timer') : (lang === 'de' ? 'Manuell' : 'Manual')}
                </span>
              ) : isMovingRecently ? (
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 font-medium flex items-center gap-1">
                  <Footprints className="w-3 h-3" /> {lang === 'de' ? 'Bewegung in VRChat erkannt' : 'Movement detected in VRChat'}
                </span>
              ) : null}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isAfk ? (
                <span>{lang === 'de' ? 'AFK Dauer:' : 'AFK Duration:'} <strong className="text-white font-mono text-xs">{formatAfkDuration(afkDurationSec)}</strong> — <em>{lang === 'de' ? 'Bewegung im Spiel beendet AFK automatisch' : 'Movement in game will end AFK automatically'}</em></span>
              ) : afkMode === 'vrchat_only' ? (
                <span>{lang === 'de' ? 'Wartet auf VRChat Headset/Avatar AFK Signal (kein automatischer Timer)' : 'Waiting for VRChat headset/avatar signal (no automated timer)'}</span>
              ) : (
                <span>{lang === 'de' ? `Auslösung nach ${timeoutMinutes} Min ohne Bewegung oder per VRChat Headset-Signal` : `Triggers after ${timeoutMinutes} min without movement or via VRChat headset signal`}</span>
              )}
            </div>
          </div>
        </div>

        <button
          id="btn-manual-afk-toggle"
          type="button"
          onClick={handleToggleManualAfk}
          disabled={isTogglingManual}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all cursor-pointer active:scale-95"
          title={lang === 'de' ? 'AFK-Zustand manuell umschalten zum Testen der Chatbox-Anzeige' : 'Manually toggle AFK state to preview in Chatbox'}
        >
          {isAfk ? (lang === 'de' ? 'AFK beenden' : 'End AFK') : (lang === 'de' ? 'AFK testen' : 'Test AFK')}
        </button>
      </div>

      {/* AFK Detection Mode Selector */}
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
        <label className="text-xs font-semibold text-slate-300 block">
          {lang === 'de' ? 'Erkennungs-Modus:' : 'Detection Mode:'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onUpdateConfig({ afkMode: 'vrchat_and_timer' })}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              afkMode === 'vrchat_and_timer'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-medium flex items-center justify-between">
              <span>{lang === 'de' ? 'VRChat & Bewegung' : 'VRChat & Movement'}</span>
              {afkMode === 'vrchat_and_timer' && <span className="text-[10px] text-amber-400 font-bold">{t.common.active}</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {lang === 'de' ? 'Headset-Signal + Timer. Jede Bewegung im Spiel setzt den Timer zurück und beendet AFK sofort.' : 'Headset signal + timer. Any movement in game resets the timer and immediately ends AFK.'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onUpdateConfig({ afkMode: 'vrchat_only' })}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              afkMode === 'vrchat_only'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-medium flex items-center justify-between">
              <span>{lang === 'de' ? 'Nur Headset / Avatar' : 'Headset / Avatar Only'}</span>
              {afkMode === 'vrchat_only' && <span className="text-[10px] text-amber-400 font-bold">{t.common.active}</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {lang === 'de' ? 'Aktiviert sich nur, wenn du das Headset absetzt oder VRChat selbst AFK meldet. Nie durch Zeit!' : 'Only triggers when headset is removed or VRChat itself signals AFK. Never on a timer!'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onUpdateConfig({ afkMode: 'timer_only' })}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              afkMode === 'timer_only'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-medium flex items-center justify-between">
              <span>{lang === 'de' ? 'Nur Inaktivitäts-Timer' : 'Inactivity Timer Only'}</span>
              {afkMode === 'timer_only' && <span className="text-[10px] text-amber-400 font-bold">{t.common.active}</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {lang === 'de' ? `Rein zeitbasiert (${timeoutMinutes} Min). Bewegung in VRChat setzt den Timer zurück.` : `Purely timer based (${timeoutMinutes} min). Movement in VRChat resets timer.`}
            </p>
          </button>
        </div>
      </div>

      {/* Timeout & Override Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Timeout Slider (disabled if vrchat_only) */}
        <div className={`p-3 rounded-xl bg-slate-950/60 border border-slate-800 ${afkMode === 'vrchat_only' ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {t.afk.timeoutLabel}
            </label>
            <span className="text-xs font-bold font-mono text-amber-400">
              {timeoutMinutes} {t.common.minutes}
            </span>
          </div>
          <input
            id="slider-afk-timeout"
            type="range"
            min="1"
            max="30"
            step="1"
            disabled={afkMode === 'vrchat_only'}
            value={timeoutMinutes}
            onChange={(e) => onUpdateConfig({ afkTimeoutMinutes: Number(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>1 {t.common.minutes}</span>
            <span>15 {t.common.minutes}</span>
            <span>30 {t.common.minutes}</span>
          </div>
          {afkMode === 'vrchat_only' && (
            <p className="text-[10px] text-amber-400/80 mt-1">
              {lang === 'de' ? 'Im Modus „Nur Headset / Avatar“ ist der Zeit-Timer deaktiviert.' : 'Timer is disabled in "Headset / Avatar Only" mode.'}
            </p>
          )}
        </div>

        {/* Override Chatbox Checkbox */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-center">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              id="checkbox-afk-override"
              type="checkbox"
              checked={overrideChatbox}
              onChange={(e) => onUpdateConfig({ afkOverrideChatbox: e.target.checked })}
              className="w-4 h-4 rounded accent-amber-500 cursor-pointer mt-0.5"
            />
            <div>
              <span className="text-xs font-medium text-slate-200">{t.afk.overrideChatboxLabel}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t.afk.overrideChatboxDesc}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* AFK Template Input */}
      <div>
        <label className="text-xs font-medium text-slate-300 block mb-1.5">
          {t.afk.customTemplateLabel}:
        </label>
        <input
          id="input-afk-template"
          type="text"
          value={template}
          onChange={(e) => onUpdateConfig({ afkTemplate: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition-colors"
          placeholder={t.afk.placeholderTemplate}
        />

        {/* AFK Variable Pills */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {afkVariables.map((v) => (
            <button
              key={v.tag}
              type="button"
              onClick={() => onUpdateConfig({ afkTemplate: `${template} ${v.tag}`.trim() })}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <span>{v.tag}</span>
              <span className="text-[10px] text-slate-500 font-sans">({v.desc})</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => onInsertMainVariable('{afk_time}')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/40 border border-blue-800/60 text-xs font-mono text-blue-400 transition-colors cursor-pointer"
            title={lang === 'de' ? 'Fügt {afk_time} in dein Haupt-Template ein' : 'Inserts {afk_time} into your main template'}
          >
            + {lang === 'de' ? 'In Haupt-Template' : 'Into Main Template'}
          </button>
        </div>
      </div>

      {/* Ingress OSC Info */}
      <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-teal-400" />
          VRChat UDP Port 9001 Ingress: <code>/avatar/parameters/AFK</code>, inputs &amp; velocity
        </span>
        <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/20 font-medium">
          Auto-Sync
        </span>
      </div>
    </div>
  );
};
