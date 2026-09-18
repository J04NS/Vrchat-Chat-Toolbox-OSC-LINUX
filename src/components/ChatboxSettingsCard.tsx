import React from 'react';
import { Sliders, Volume2, Sparkles, Type, Play, Square, Hash } from 'lucide-react';
import { ChatboxConfig } from '../types';

interface ChatboxSettingsCardProps {
  config: ChatboxConfig;
  onUpdateConfig: (updates: Partial<ChatboxConfig>) => void;
}

export const ChatboxSettingsCard: React.FC<ChatboxSettingsCardProps> = ({
  config,
  onUpdateConfig,
}) => {
  const insertVariable = (varName: string) => {
    onUpdateConfig({
      template: `${config.template} ${varName}`.trim(),
    });
  };

  const templates = [
    {
      label: 'Standard (Puls + Musik + Uhr)',
      value: '[ {hr_icon} {hr} BPM ]  {music_icon} {song}  | ⏱️ {clock}',
    },
    {
      label: 'Kompakt',
      value: '{hr_icon} {hr} bpm • {song_title}',
    },
    {
      label: 'Nur Herzfrequenz & Zone',
      value: '{hr_icon} {hr} BPM ({hr_zone}) • ⏱️ {clock}',
    },
    {
      label: 'Musik im Fokus',
      value: '{music_icon} {song}  (❤️ {hr} BPM)',
    },
    {
      label: 'Status / AFK',
      value: '💤 {custom_text} | ❤️ {hr} BPM | ⏱️ {clock}',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header with Master Broadcast Toggle */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Sliders className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              Chatbox Format & Einstellungen
            </h2>
            <p className="text-xs text-slate-400">Passe Textformatierung, Variablen und Sende-Intervall an</p>
          </div>
        </div>

        <button
          id="btn-toggle-broadcast"
          type="button"
          onClick={() => onUpdateConfig({ enabled: !config.enabled })}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-lg ${
            config.enabled
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
          }`}
        >
          {config.enabled ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              Senden stoppen
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Senden starten
            </>
          )}
        </button>
      </div>

      {/* Main Template Input */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-400" />
              Chatbox Vorlage (Template)
            </label>
            <span className="text-[11px] text-slate-400">Variablen mit Klick unten einfügen</span>
          </div>

          <textarea
            id="textarea-chatbox-template"
            rows={3}
            value={config.template}
            onChange={(e) => onUpdateConfig({ template: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="z. B. ❤️ {hr} BPM | 🎵 {song} | ⏱️ {clock}"
          />
        </div>

        {/* Variable Pills */}
        <div>
          <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Verfügbare Variablen:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { tag: '{hr}', desc: 'Puls Zahl' },
              { tag: '{hr_icon}', desc: 'Herz Icon' },
              { tag: '{hr_zone}', desc: 'Zone (Normal/Peak)' },
              { tag: '{song}', desc: 'Titel & Artist' },
              { tag: '{song_title}', desc: 'Nur Titel' },
              { tag: '{song_artist}', desc: 'Nur Artist' },
              { tag: '{music_icon}', desc: '🎵/⏸️ Icon' },
              { tag: '{clock}', desc: 'Uhrzeit (HH:MM)' },
              { tag: '{clock_sec}', desc: 'Uhrzeit mit Sek' },
              { tag: '{custom_text}', desc: 'Eigener Status' },
              { tag: '{battery}', desc: 'Batterie %' },
            ].map((v) => (
              <button
                key={v.tag}
                type="button"
                onClick={() => insertVariable(v.tag)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                title={v.desc}
              >
                <span>{v.tag}</span>
                <span className="text-[10px] text-slate-500 font-sans">({v.desc})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preset Templates */}
        <div>
          <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Vorlagen-Presets:</span>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => onUpdateConfig({ template: t.value })}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Status Input */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Benutzerdefinierter Status ({'{custom_text}'})
          </label>
          <input
            id="input-custom-status"
            type="text"
            value={config.customStatus}
            onChange={(e) => onUpdateConfig({ customStatus: e.target.value })}
            placeholder="z. B. Muted / Essen / Müde"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
          {/* Interval */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Sende-Intervall</label>
              <span className="text-xs font-mono text-blue-400 font-semibold">
                {(config.updateIntervalMs / 1000).toFixed(1)}s
              </span>
            </div>
            <input
              id="slider-interval"
              type="range"
              min="1200"
              max="6000"
              step="200"
              value={config.updateIntervalMs}
              onChange={(e) => onUpdateConfig({ updateIntervalMs: Number(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              VRChat Chatbox empfängt optimal alle 1.5 - 3 Sekunden
            </span>
          </div>

          {/* Marquee */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">Marquee (Laufschrift)</label>
              <input
                id="checkbox-marquee"
                type="checkbox"
                checked={config.marqueeEnabled}
                onChange={(e) => onUpdateConfig({ marqueeEnabled: e.target.checked })}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
            </div>
            {config.marqueeEnabled && (
              <div className="mt-2">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Sichtbare Breite</span>
                  <span className="font-mono text-white">{config.marqueeWidth} Zeichen</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={config.marqueeWidth}
                  onChange={(e) => onUpdateConfig({ marqueeWidth: Number(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              id="checkbox-bypass-typing"
              type="checkbox"
              checked={config.bypassTypingIndicator}
              onChange={(e) => onUpdateConfig({ bypassTypingIndicator: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
            />
            <div className="text-xs">
              <div className="text-slate-200 font-medium">Sofort anzeigen (Bypass Typing)</div>
              <div className="text-[10px] text-slate-400">Keine Tipp-Animation vor Nachricht</div>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              id="checkbox-play-sound"
              type="checkbox"
              checked={config.playSound}
              onChange={(e) => onUpdateConfig({ playSound: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
            />
            <div className="text-xs">
              <div className="text-slate-200 font-medium">Chatbox Sound abspielen</div>
              <div className="text-[10px] text-slate-400">Spielt VRChat Benachrichtigungston ab</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
