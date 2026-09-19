import React from 'react';
import {
  Radio,
  Heart,
  Music,
  Moon,
  Cpu,
  MessageSquare,
  Sparkles,
  Zap,
  ArrowRight,
  Layers,
  Sliders,
  CheckCircle2,
  Activity,
  Send,
  Mic,
} from 'lucide-react';
import {
  ChatboxConfig,
  HeartRateState,
  MediaState,
  ServerStatusResponse,
  SpeechToTextState,
  AppLanguage,
} from '../types';
import { translations } from '../lib/i18n';
import { ChatboxPreview } from './ChatboxPreview';

export type NavigationTab =
  | 'dashboard'
  | 'profiles'
  | 'automation'
  | 'speechToText'
  | 'heartRate'
  | 'media'
  | 'afk'
  | 'hardware'
  | 'customTexts'
  | 'oscNetwork';

interface DashboardViewProps {
  lang: AppLanguage;
  config: ChatboxConfig;
  serverStatus: ServerStatusResponse;
  hrState: HeartRateState;
  mediaState: MediaState;
  sttState?: SpeechToTextState;
  effectiveProfileId: string;
  effectiveTemplate: string;
  isAutomationActive: boolean;
  activeProfileName?: string;
  onUpdateConfig: (updates: Partial<ChatboxConfig>, notifyMessage?: string) => Promise<void>;
  onToggleAutomation: (enabled: boolean) => Promise<void>;
  onSelectProfile: (profileId: string) => Promise<void>;
  onSendManual: (text: string) => Promise<void>;
  onSendTestOsc: () => Promise<void>;
  onToggleSttListening?: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  config,
  serverStatus,
  hrState,
  mediaState,
  sttState,
  effectiveProfileId,
  effectiveTemplate,
  isAutomationActive,
  activeProfileName,
  onUpdateConfig,
  onToggleAutomation,
  onSelectProfile,
  onSendManual,
  onSendTestOsc,
  onToggleSttListening,
  onNavigate,
}) => {
  const t = translations[lang];
  const d = t.dashboard;

  const profilesList = config.profiles && config.profiles.length > 0 ? config.profiles : [];

  return (
    <div className="space-y-6">
      {/* 1. Live Chatbox Preview at the Top */}
      <ChatboxPreview
        lang={lang}
        template={effectiveTemplate}
        hrState={hrState}
        mediaState={mediaState}
        customStatus={config.customStatus}
        marqueeEnabled={config.marqueeEnabled}
        marqueeWidth={config.marqueeWidth}
        playSound={config.playSound}
        bypassTyping={config.bypassTypingIndicator}
        updateIntervalMs={config.updateIntervalMs}
        isActive={config.enabled}
        hardwareStats={serverStatus.hardwareStats}
        afkState={serverStatus.afkState}
        afkTemplate={config.afkTemplate}
        afkOverrideChatbox={config.afkOverrideChatbox}
        customTexts={config.customTexts}
        currentCustomTextIndex={serverStatus.currentCustomTextIndex}
        mediaOnlyWhenPlaying={config.mediaOnlyWhenPlaying}
        isAutomated={isAutomationActive}
        activeProfileName={activeProfileName}
        sttState={sttState}
        onSendManual={onSendManual}
        onToggleSttListening={onToggleSttListening}
        onToggleActive={(enabled) =>
          onUpdateConfig(
            { enabled },
            enabled
              ? lang === 'de'
                ? 'VRChat Senden aktiviert'
                : 'VRChat broadcasting enabled'
              : lang === 'de'
              ? 'VRChat Senden pausiert'
              : 'VRChat broadcasting paused'
          )
        }
      />

      {/* 2. Profile Selection & Direct Automation Control Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                {d.activeProfileTitle}
              </h2>
              {isAutomationActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full">
                  <Zap className="w-3 h-3 text-indigo-400 animate-pulse" />
                  {d.autoActive}: {serverStatus.matchedRuleName || activeProfileName}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full">
                  {t.common.active}: {activeProfileName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {d.activeProfileSubtitle}
            </p>
          </div>

          {/* Automation Master Toggle Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">
                {t.profileAutomation.masterToggle}:
              </span>
              <button
                id="btn-dashboard-toggle-automation"
                type="button"
                onClick={() => onToggleAutomation(!isAutomationActive)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  isAutomationActive
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {isAutomationActive ? d.statusOn : d.statusOff}
              </button>
            </div>

            <button
              id="btn-dashboard-go-profiles"
              type="button"
              onClick={() => onNavigate('profiles')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
            >
              <span>{d.manageProfilesBtn}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Profile Grid / Selector */}
        <div className="pt-4">
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>{d.profileSelectPrompt}</span>
            {isAutomationActive && (
              <span className="text-[11px] text-amber-400 font-normal">
                {lang === 'de'
                  ? 'Hinweis: Klick auf ein Profil pausiert die Automatisierung'
                  : 'Note: Selecting a profile pauses automation for manual control'}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {profilesList.map((p) => {
              const isSelected = p.id === effectiveProfileId;
              return (
                <button
                  key={p.id}
                  id={`btn-profile-card-${p.id}`}
                  type="button"
                  onClick={() => onSelectProfile(p.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-950/70 to-blue-950/60 border-indigo-500 shadow-md shadow-indigo-950/40 text-white'
                      : 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800/90 text-slate-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  )}
                  <div className="text-xs font-bold truncate w-full mb-1 flex items-center justify-between">
                    <span className="truncate">{p.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 w-full font-mono bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800/60">
                    {p.template}
                  </p>
                  {isSelected && (
                    <span className="mt-2 text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                      {t.common.active}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 1-Click Module Toggles Grid */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                {d.modulesTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {d.modulesSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
          {/* Module 1: Master OSC Output */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    config.enabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{d.moduleOsc}</h3>
                  <p className="text-[11px] text-slate-400">
                    {config.oscHost}:{config.oscPort} ({config.updateIntervalMs}ms)
                  </p>
                </div>
              </div>
              <button
                id="toggle-master-osc"
                type="button"
                onClick={() => onUpdateConfig({ enabled: !config.enabled })}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  config.enabled
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {config.enabled ? d.statusOn : d.statusOff}
              </button>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                {serverStatus.packetsSent} {d.packetsSent}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('oscNetwork')}
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{d.quickConfigure}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Module: Speech to Text (Microphone) */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    sttState?.isListening
                      ? 'bg-purple-600 text-white shadow-purple-600/40 ring-2 ring-purple-500/20 animate-pulse'
                      : config.sttEnabled
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{d.moduleStt || 'Speech to Text'}</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                    {sttState?.isListening
                      ? (lang === 'de' ? 'Mikrofon lauscht...' : 'Listening...')
                      : config.sttEnabled
                      ? (config.sttLanguage || 'de-DE')
                      : d.disabled}
                  </p>
                </div>
              </div>
              <button
                id="toggle-stt-module"
                type="button"
                onClick={() => onUpdateConfig({ sttEnabled: !config.sttEnabled })}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  config.sttEnabled
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {config.sttEnabled ? d.statusOn : d.statusOff}
              </button>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                {sttState?.transcript || sttState?.interimTranscript ? `"${sttState.transcript || sttState.interimTranscript}"` : '{stt} / {speech}'}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('speechToText')}
                className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{d.quickConfigure}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Module 2: Heart Rate */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    hrState.bpm > 0
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${hrState.bpm > 0 ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{d.moduleHr}</h3>
                  <p className="text-[11px] text-slate-400">
                    {hrState.bpm > 0 ? `${hrState.bpm} BPM (${hrState.provider})` : t.heartRate.noBpm}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  hrState.bpm > 0
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {hrState.bpm > 0 ? `${hrState.bpm} BPM` : d.statusOff}
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                {hrState.deviceLabel || hrState.provider}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('heartRate')}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{d.quickConfigure}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Module 3: Media Player / Music */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    config.autoMediaDetection
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{d.moduleMedia}</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                    {mediaState.title ? `${mediaState.title} - ${mediaState.artist || 'Music'}` : t.media.noMedia}
                  </p>
                </div>
              </div>
              <button
                id="toggle-media-module"
                type="button"
                onClick={() =>
                  onUpdateConfig({ autoMediaDetection: !config.autoMediaDetection })
                }
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  config.autoMediaDetection
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {config.autoMediaDetection ? d.statusOn : d.statusOff}
              </button>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                {mediaState.isPlaying ? '▶️ Playing' : '⏸️ Paused / Idle'}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('media')}
                className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{d.quickConfigure}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Module 4: AFK Detection */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    config.afkEnabled
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{d.moduleAfk}</h3>
                  <p className="text-[11px] text-slate-400">
                    {config.afkEnabled ? `Auto AFK (${config.afkTimeoutMinutes ?? 5} min)` : d.disabled}
                  </p>
                </div>
              </div>
              <button
                id="toggle-afk-module"
                type="button"
                onClick={() => onUpdateConfig({ afkEnabled: !config.afkEnabled })}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  config.afkEnabled
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {config.afkEnabled ? d.statusOn : d.statusOff}
              </button>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                {serverStatus.afkState?.isAfk ? '💤 Currently AFK' : '🟢 Online & Active'}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('afk')}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{d.quickConfigure}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Module 5: Hardware Stats */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    config.hardwareStatsEnabled
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{d.moduleHw}</h3>
                  <p className="text-[11px] text-slate-400">
                    {config.hardwareStatsEnabled && serverStatus.hardwareStats
                      ? `CPU: ${serverStatus.hardwareStats.cpuPercent}% | RAM: ${serverStatus.hardwareStats.ramPercent}%`
                      : d.disabled}
                  </p>
                </div>
              </div>
              <button
                id="toggle-hardware-module"
                type="button"
                onClick={() =>
                  onUpdateConfig({ hardwareStatsEnabled: !config.hardwareStatsEnabled })
                }
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  config.hardwareStatsEnabled
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {config.hardwareStatsEnabled ? d.statusOn : d.statusOff}
              </button>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">
                {`{cpu}`} & {`{ram}`}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('hardware')}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{d.quickConfigure}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Module 6: Custom Texts / Freitexte */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{d.moduleCustomTexts}</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                    {config.customTexts && config.customTexts.length > 0
                      ? `${config.customTexts.length} ${t.customTexts.activeCount} (${config.customTextIntervalSec ?? 10}s)`
                      : 'No texts'}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {config.customTexts?.length ?? 0}
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">
                {`{custom_text}`}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('customTexts')}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{d.quickConfigure}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Telemetry & Quick Action Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-white">OSC UDP:</span>
            <span className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {config.oscHost}:{config.oscPort}
            </span>
          </div>

          <div className="text-slate-400">
            <span>{d.packetsSent}: </span>
            <span className="font-bold text-emerald-400 font-mono">
              {serverStatus.packetsSent}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-dashboard-send-test"
            type="button"
            onClick={onSendTestOsc}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-blue-600/20 inline-flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{d.sendTestPacket}</span>
          </button>

          <button
            id="btn-dashboard-view-logs"
            type="button"
            onClick={() => onNavigate('oscNetwork')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>{d.viewLogs}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
