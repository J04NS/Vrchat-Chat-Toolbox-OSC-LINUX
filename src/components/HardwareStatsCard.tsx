import React from 'react';
import { Cpu, HardDrive, Gauge, Thermometer, Sparkles, Check } from 'lucide-react';
import { HardwareStats, AppLanguage } from '../types';
import { translations } from '../lib/i18n';

interface HardwareStatsCardProps {
  lang?: AppLanguage;
  stats?: HardwareStats;
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  onInsertVariable: (varName: string) => void;
}

export const HardwareStatsCard: React.FC<HardwareStatsCardProps> = ({
  lang = 'en',
  stats,
  enabled,
  onToggleEnabled,
  onInsertVariable,
}) => {
  const t = translations[lang];
  const cpuPercent = stats?.cpuPercent ?? 0;
  const ramPercent = stats?.ramPercent ?? 0;
  const ramUsedGb = stats?.ramUsedGb ?? 0;
  const ramTotalGb = stats?.ramTotalGb ?? 0;
  const gpuPercent = stats?.gpuPercent;
  const cpuTemp = stats?.cpuTemp;
  const gpuTemp = stats?.gpuTemp;

  const hardwareVariables = [
    { tag: '{cpu}', desc: lang === 'de' ? 'CPU Auslastung in %' : 'CPU load in %' },
    { tag: '{ram}', desc: lang === 'de' ? 'RAM Auslastung in %' : 'RAM usage in %' },
    { tag: '{ram_gb}', desc: lang === 'de' ? 'Belegter RAM (z.B. 8.4GB)' : 'Used RAM (e.g. 8.4GB)' },
    { tag: '{gpu}', desc: lang === 'de' ? 'GPU Auslastung in % (Nvidia)' : 'GPU load in % (Nvidia)' },
    { tag: '{cpu_temp}', desc: lang === 'de' ? 'CPU Temperatur' : 'CPU Temperature' },
    { tag: '{gpu_temp}', desc: lang === 'de' ? 'GPU Temperatur' : 'GPU Temperature' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              {t.hardware.title}
              {enabled ? (
                <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {t.common.active}
                </span>
              ) : (
                <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {t.hardware.statsDisabled}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">{t.hardware.subtitle}</p>
          </div>
        </div>

        <button
          id="btn-toggle-hardware-stats"
          type="button"
          onClick={() => onToggleEnabled(!enabled)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            enabled
              ? 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          {enabled ? (lang === 'de' ? 'Stats an' : 'Stats Enabled') : (lang === 'de' ? 'Stats aus' : 'Stats Disabled')}
        </button>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* CPU */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-blue-400" /> CPU
            </span>
            {cpuTemp !== undefined && (
              <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                <Thermometer className="w-3 h-3" /> {cpuTemp}°C
              </span>
            )}
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">{cpuPercent}%</span>
            <span className="text-[10px] text-slate-500 font-mono">tag: {'{cpu}'}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                cpuPercent > 85 ? 'bg-rose-500' : cpuPercent > 60 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, cpuPercent))}%` }}
            />
          </div>
        </div>

        {/* RAM */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" /> RAM
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {ramUsedGb} / {ramTotalGb} GB
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">{ramPercent}%</span>
            <span className="text-[10px] text-slate-500 font-mono">tag: {'{ram}'}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                ramPercent > 85 ? 'bg-rose-500' : ramPercent > 60 ? 'bg-amber-500' : 'bg-purple-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, ramPercent))}%` }}
            />
          </div>
        </div>

        {/* GPU (Nvidia / System) */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" /> GPU
            </span>
            {gpuTemp !== undefined && (
              <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                <Thermometer className="w-3 h-3" /> {gpuTemp}°C
              </span>
            )}
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">
              {gpuPercent !== undefined ? `${gpuPercent}%` : '--'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">tag: {'{gpu}'}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                (gpuPercent || 0) > 85 ? 'bg-rose-500' : (gpuPercent || 0) > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, gpuPercent || 0))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Clickable Variable Tags */}
      <div>
        <div className="text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
          <span>{lang === 'de' ? 'In Chatbox-Vorlage einfügen:' : 'Insert into chatbox template:'}</span>
          <span className="text-[11px] text-slate-500">{lang === 'de' ? 'Klicken zum Hinzufügen' : 'Click to add tag'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {hardwareVariables.map((v) => (
            <button
              key={v.tag}
              type="button"
              onClick={() => onInsertVariable(v.tag)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <span>{v.tag}</span>
              <span className="text-[10px] text-slate-500 font-sans">({v.desc})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
