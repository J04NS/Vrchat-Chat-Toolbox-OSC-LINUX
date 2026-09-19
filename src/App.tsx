import React, { useEffect, useState, useCallback } from 'react';
import {
  Radio,
  Terminal,
  Heart,
  Music,
  Sliders,
  Shield,
  CheckCircle2,
  Cpu,
  Moon,
  MessageSquare,
  Globe,
  Upload,
  LayoutDashboard,
  Layers,
  Zap,
  Activity,
  ArrowLeft,
  Mic,
} from 'lucide-react';
import {
  ChatboxConfig,
  HeartRateProvider,
  HeartRateState,
  MediaState,
  OscLogEntry,
  ServerStatusResponse,
  AppLanguage,
  ProfileAutomationRule,
} from './types';
import { translations } from './lib/i18n';
import { DashboardView, NavigationTab } from './components/DashboardView';
import { ChatboxPreview } from './components/ChatboxPreview';
import { HeartRateCard } from './components/HeartRateCard';
import { MediaSourceCard } from './components/MediaSourceCard';
import { ChatboxSettingsCard } from './components/ChatboxSettingsCard';
import { OscNetworkCard } from './components/OscNetworkCard';
import { LinuxGuideModal } from './components/LinuxGuideModal';
import { ConfigMigrateModal } from './components/ConfigMigrateModal';
import { HardwareStatsCard } from './components/HardwareStatsCard';
import { AfkDetectionCard } from './components/AfkDetectionCard';
import { CustomTextsCard } from './components/CustomTextsCard';
import { ProfileAutomationCard } from './components/ProfileAutomationCard';
import { SpeechToTextCard } from './components/SpeechToTextCard';
import { useSpeechToText } from './hooks/useSpeechToText';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>(() => {
    try {
      const saved = localStorage.getItem('vrchat_osc_active_tab') as NavigationTab;
      if (
        saved &&
        [
          'dashboard',
          'profiles',
          'automation',
          'speechToText',
          'heartRate',
          'media',
          'afk',
          'hardware',
          'customTexts',
          'oscNetwork',
        ].includes(saved)
      ) {
        return saved;
      }
    } catch {}
    return 'dashboard';
  });

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('vrchat_osc_active_tab', tab);
    } catch {}
  };
  const [config, setConfig] = useState<ChatboxConfig>({
    language: 'en',
    enabled: true,
    template: '❤️ {hr} BPM ❤️\\n{song}',
    updateIntervalMs: 1500,
    playSound: false,
    bypassTypingIndicator: true,
    marqueeEnabled: false,
    marqueeWidth: 35,
    customStatus: '',
    oscHost: '127.0.0.1',
    oscPort: 9000,
    hyperateSessionId: '',
    pulsoidToken: '',
    autoMediaDetection: true,
    mediaOnlyWhenPlaying: true,
    customTexts: [
      'Welcome to my VRChat world! ✨',
      'VRChat OSC Hub running smoothly on Linux 🐧',
      'Custom text cycling active 🚀',
    ],
    customTextIntervalSec: 10,
    hardwareStatsEnabled: false,
    afkEnabled: false,
    afkTimeoutMinutes: 5,
    afkTemplate: '💤 AFK [{afk_time}] - Back soon! 💤',
    afkOverrideChatbox: true,
  });

  const currentLang: AppLanguage = config.language || 'en';
  const t = translations[currentLang];

  const [hrState, setHrState] = useState<HeartRateState>({
    bpm: 0,
    provider: 'hyperate',
    connected: false,
    lastUpdated: Date.now(),
    deviceLabel: 'HypeRate (Waiting for Session ID)',
  });

  const [mediaState, setMediaState] = useState<MediaState>({
    title: '',
    artist: '',
    album: '',
    isPlaying: false,
    positionSec: 0,
    durationSec: 0,
    sourceName: 'playerctl/auto',
    lastUpdated: Date.now(),
  });

  const [serverStatus, setServerStatus] = useState<ServerStatusResponse>({
    oscActive: true,
    oscTarget: { host: '127.0.0.1', port: 9000 },
    serverPort: 3000,
    isLinuxMode: false,
    hasHyperateApiKey: true,
    hyperateKeyMasked: 'Pelikan Relay (Integrated Server)',
    hyperateConnected: false,
    mediaDetectionActive: true,
    currentBpm: 0,
    currentMedia: {
      title: '',
      artist: '',
      isPlaying: false,
      positionSec: 0,
      durationSec: 0,
      sourceName: 'playerctl',
      lastUpdated: Date.now(),
    },
    lastOscText: '',
    packetsSent: 0,
    logs: [],
  });

  const [showLinuxModal, setShowLinuxModal] = useState(false);
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Speech-to-Text Integration
  const stt = useSpeechToText({
    language: config.sttLanguage || (currentLang === 'de' ? 'de-DE' : 'en-US'),
    sendMode: config.sttSendMode || 'auto_final',
    prefix: config.sttPrefix ?? '🎙️',
    clearDelaySec: config.sttClearDelaySec ?? 6,
    enabled: config.sttEnabled ?? false,
    onSendOscText: (text: string) => {
      handleSendManual(text);
    },
  });

  // Fetch initial config & live status from backend
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data: ServerStatusResponse = await res.json();
        setServerStatus(data);
        if (data.hrState) {
          setHrState(data.hrState);
        } else if (data.currentBpm !== undefined && data.currentBpm > 0) {
          setHrState((prev) => ({
            ...prev,
            bpm: data.currentBpm,
            connected: Boolean(data.hyperateConnected || data.pulsoidConnected),
          }));
        }
        if (data.currentMedia) {
          setMediaState(data.currentMedia);
        }
      }
    } catch {}
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        if (data.heartRateProvider) {
          setHrState((prev) => ({
            ...prev,
            provider: data.heartRateProvider,
          }));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, [fetchConfig, fetchStatus]);

  // Update Config & Persist to disk
  const handleUpdateConfig = async (updates: Partial<ChatboxConfig>, notifyMessage?: string) => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    if (updates.heartRateProvider) {
      setHrState((prev) => ({ ...prev, provider: updates.heartRateProvider! }));
    }
    if (updates.autoMediaDetection === false) {
      setMediaState((prev) => ({
        ...prev,
        title: '',
        artist: '',
        album: '',
        isPlaying: false,
        sourceName: 'disabled',
        lastUpdated: Date.now(),
      }));
    }
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.mediaState) {
          setMediaState(json.mediaState);
        }
        if (notifyMessage) {
          showNotification(notifyMessage);
        } else if (updates.enabled !== undefined) {
          showNotification(updates.enabled ? t.notifications.oscStarted : t.notifications.oscStopped);
        }
      }
    } catch (err) {
      console.error('Failed to update config', err);
    }
  };

  // Switch language
  const handleLanguageChange = (newLang: AppLanguage) => {
    handleUpdateConfig(
      { language: newLang },
      newLang === 'de' ? 'Sprache auf Deutsch gestellt 🇩🇪' : 'Language set to English 🇬🇧'
    );
  };

  // Update HR State from Client
  const handleUpdateHrState = async (data: { bpm: number; provider?: HeartRateProvider; deviceLabel?: string }) => {
    setHrState((prev) => ({
      ...prev,
      bpm: data.bpm,
      provider: data.provider || prev.provider,
      deviceLabel: data.deviceLabel || prev.deviceLabel,
      lastUpdated: Date.now(),
    }));

    try {
      await fetch('/api/heart-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {}
  };

  // Update Media State
  const handleUpdateMedia = async (data: Partial<MediaState>) => {
    setMediaState((prev) => ({
      ...prev,
      ...data,
      lastUpdated: Date.now(),
    }));

    try {
      await fetch('/api/media/now-playing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {}
  };

  // Manual OSC send
  const handleSendManual = async (text: string) => {
    try {
      const res = await fetch('/api/send-osc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          bypassTyping: config.bypassTypingIndicator,
          playSound: config.playSound,
        }),
      });
      if (res.ok) {
        showNotification(currentLang === 'de' ? 'OSC an VRChat gesendet' : 'OSC message sent to VRChat');
        fetchStatus();
      }
    } catch {
      showNotification(currentLang === 'de' ? 'Fehler beim Senden' : 'Error sending OSC message');
    }
  };

  const handleSendTestOsc = async () => {
    await handleSendManual(`❤️ ${hrState.bpm || 80} BPM\n${mediaState.title ? `🎵 ${mediaState.title}` : ''}`);
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/logs/clear', { method: 'POST' });
      setServerStatus((prev) => ({ ...prev, logs: [] }));
      showNotification(t.oscNetwork.logsClearedNotice);
    } catch {}
  };

  const handleInsertTemplateTag = (tag: string) => {
    const current = config.template || '';
    const updated = current.endsWith(' ') || current.length === 0 ? `${current}${tag}` : `${current} ${tag}`;
    handleUpdateConfig({ template: updated });
    showNotification(currentLang === 'de' ? `Variable ${tag} eingefügt` : `Variable ${tag} inserted`);
  };

  const handleUpdateAutomationRules = async (rules: ProfileAutomationRule[], enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      profileRules: rules,
      profileAutomationEnabled: enabled,
    }));
    try {
      const res = await fetch('/api/automation/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules, enabled }),
      });
      if (res.ok) {
        showNotification(t.profileAutomation.savedNotice);
        fetchStatus();
      }
    } catch {}
  };

  const handleToggleAutomation = async (enabled: boolean) => {
    await handleUpdateAutomationRules(config.profileRules || [], enabled);
    showNotification(
      enabled
        ? currentLang === 'de'
          ? 'Profil-Automatisierung aktiviert ⚡'
          : 'Profile Automation enabled ⚡'
        : currentLang === 'de'
        ? 'Profil-Automatisierung pausiert (Manuelle Wahl aktiv)'
        : 'Profile Automation paused (Manual selection active)'
    );
  };

  const handleSelectProfile = async (profileId: string) => {
    const profile = (config.profiles || []).find((p) => p.id === profileId);
    if (!profile) return;

    // Direct profile selection: we set activeProfileId, template and pause automation
    await handleUpdateConfig(
      {
        activeProfileId: profile.id,
        template: profile.template,
        profileAutomationEnabled: false,
      },
      currentLang === 'de'
        ? `Profil "${profile.name}" gewählt & aktiviert`
        : `Profile "${profile.name}" selected & activated`
    );

    // Also inform server about automation status
    try {
      await fetch('/api/automation/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: config.profileRules || [], enabled: false }),
      });
      fetchStatus();
    } catch {}
  };

  const handleResetAutomationRules = async () => {
    try {
      const res = await fetch('/api/automation/rules/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setConfig((prev) => ({
          ...prev,
          profileRules: data.profileRules,
          profileAutomationEnabled: true,
        }));
        showNotification(t.profileAutomation.resetNotice);
        fetchStatus();
      }
    } catch {}
  };

  const handleApplyMigratedConfig = async (migratedConfig: ChatboxConfig) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(migratedConfig),
      });
      if (res.ok) {
        const saved = await res.json();
        setConfig(saved);
        showNotification(
          currentLang === 'de'
            ? 'Konfiguration erfolgreich konvertiert & angewendet! 🎉'
            : 'Configuration successfully converted & applied! 🎉'
        );
        fetchStatus();
      }
    } catch {
      showNotification(
        currentLang === 'de' ? 'Fehler beim Speichern der Konfiguration' : 'Failed to save config'
      );
    }
  };

  const isAutomationActive = Boolean(
    config.profileAutomationEnabled ?? serverStatus.profileAutomationEnabled
  );
  const effectiveProfileId =
    isAutomationActive && serverStatus.autoActiveProfileId
      ? serverStatus.autoActiveProfileId
      : (config.activeProfileId || 'profil_3_standard_puls_musik');

  const effectiveTemplate =
    isAutomationActive && serverStatus.effectiveTemplate
      ? serverStatus.effectiveTemplate
      : (config.template || '❤️ {hr} BPM ❤️\n{song}');

  const activeProfileName =
    (config.profiles || []).find((p) => p.id === effectiveProfileId)?.name ||
    serverStatus.matchedRuleName;

  // Nav items configuration
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'profiles',
      label: t.nav.profiles,
      icon: <Layers className="w-4 h-4" />,
      badge: `${(config.profiles || []).length}`,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'automation',
      label: t.nav.automation,
      icon: <Zap className="w-4 h-4" />,
      badge: isAutomationActive ? 'AUTO' : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'speechToText',
      label: t.nav.speechToText || (currentLang === 'de' ? 'Sprache / Mic' : 'Speech to Text'),
      icon: <Mic className={`w-4 h-4 ${stt.sttState.isListening ? 'text-purple-400 animate-pulse' : ''}`} />,
      badge: stt.sttState.isListening ? 'LIVE' : config.sttEnabled ? 'ON' : undefined,
      badgeColor: stt.sttState.isListening
        ? 'bg-purple-500/30 text-purple-200 border-purple-500/50 animate-pulse'
        : 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'heartRate',
      label: t.nav.heartRate,
      icon: <Heart className={`w-4 h-4 ${hrState.bpm > 0 ? 'text-rose-400 animate-pulse' : ''}`} />,
      badge: hrState.bpm > 0 ? `${hrState.bpm}` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'media',
      label: t.nav.media,
      icon: <Music className="w-4 h-4" />,
      badge: mediaState.isPlaying ? '▶' : undefined,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
    {
      id: 'afk',
      label: t.nav.afk,
      icon: <Moon className="w-4 h-4" />,
      badge: serverStatus.afkState?.isAfk ? 'AFK' : config.afkEnabled ? 'ON' : undefined,
      badgeColor: serverStatus.afkState?.isAfk
        ? 'bg-amber-500/30 text-amber-200 border-amber-500/50 animate-pulse'
        : 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'hardware',
      label: t.nav.hardware,
      icon: <Cpu className="w-4 h-4" />,
      badge: config.hardwareStatsEnabled ? 'HUD' : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    {
      id: 'customTexts',
      label: t.nav.customTexts,
      icon: <MessageSquare className="w-4 h-4" />,
      badge: `${config.customTexts?.length ?? 0}`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'oscNetwork',
      label: t.nav.oscNetwork,
      icon: <Radio className="w-4 h-4" />,
      badge: config.enabled ? '9000' : 'OFF',
      badgeColor: config.enabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white pb-12">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-wide">{t.header.title}</h1>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {config.oscHost}:{config.oscPort}
                </span>
                {serverStatus.afkState?.isAfk && (
                  <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <Moon className="w-3 h-3" /> AFK
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {t.header.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Switch */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800" title={t.header.langSelect}>
              <button
                id="btn-lang-en"
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentLang === 'en'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
              <button
                id="btn-lang-de"
                type="button"
                onClick={() => handleLanguageChange('de')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentLang === 'de'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🇩🇪</span>
                <span>DE</span>
              </button>
            </div>

            <button
              id="btn-header-open-migrate"
              onClick={() => setShowMigrateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-950/40 hover:bg-teal-900/50 text-teal-300 text-xs font-semibold transition-all cursor-pointer border border-teal-500/40 hover:border-teal-400"
              title={currentLang === 'de' ? 'Alte JSON-Konfiguration hochladen & konvertieren' : 'Upload & migrate older JSON config'}
            >
              <Upload className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">{currentLang === 'de' ? 'Config konvertieren' : 'Migrate Config'}</span>
              <span className="sm:hidden">{currentLang === 'de' ? 'Migrieren' : 'Migrate'}</span>
            </button>

            <button
              id="btn-open-linux-guide"
              onClick={() => setShowLinuxModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer border border-slate-700"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">{t.header.linuxGuide}</span>
              <span className="sm:hidden">Linux</span>
            </button>
          </div>
        </div>

        {/* Top Navigation Tiles Row */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-slate-800/80">
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/25'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800/90'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full border font-bold ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main App Body */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
        {/* If Active Tab is DASHBOARD: Render Full High-Level Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardView
            lang={currentLang}
            config={config}
            serverStatus={serverStatus}
            hrState={hrState}
            mediaState={mediaState}
            sttState={stt.sttState}
            effectiveProfileId={effectiveProfileId}
            effectiveTemplate={effectiveTemplate}
            isAutomationActive={isAutomationActive}
            activeProfileName={activeProfileName}
            onUpdateConfig={handleUpdateConfig}
            onToggleAutomation={handleToggleAutomation}
            onSelectProfile={handleSelectProfile}
            onSendManual={handleSendManual}
            onSendTestOsc={handleSendTestOsc}
            onToggleSttListening={stt.toggleListening}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* If Active Tab is PROFILES */}
        {activeTab === 'profiles' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</span>
              </button>
              <span className="text-xs font-semibold text-indigo-400">
                {t.nav.profiles}
              </span>
            </div>

            <ChatboxPreview
              lang={currentLang}
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
              sttState={stt.sttState}
              onSendManual={handleSendManual}
              onToggleSttListening={stt.toggleListening}
              onToggleActive={(enabled) =>
                handleUpdateConfig(
                  { enabled },
                  enabled ? t.notifications.oscStarted : t.notifications.oscStopped
                )
              }
            />

            <ChatboxSettingsCard
              lang={currentLang}
              config={config}
              activeProfileId={effectiveProfileId}
              effectiveTemplate={effectiveTemplate}
              isAutomationActive={isAutomationActive}
              matchedRuleName={serverStatus.matchedRuleName}
              onUpdateConfig={handleUpdateConfig}
            />
          </div>
        )}

        {/* If Active Tab is AUTOMATION */}
        {activeTab === 'automation' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</span>
              </button>
              <span className="text-xs font-semibold text-amber-400">
                {t.nav.automation}
              </span>
            </div>

            <ProfileAutomationCard
              lang={currentLang}
              config={config}
              serverStatus={serverStatus}
              onUpdateRules={handleUpdateAutomationRules}
              onResetRules={handleResetAutomationRules}
            />
          </div>
        )}

        {/* If Active Tab is SPEECH TO TEXT (MIC) */}
        {activeTab === 'speechToText' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</span>
              </button>
              <span className="text-xs font-semibold text-purple-400">
                {t.nav.speechToText || 'Speech to Text'}
              </span>
            </div>

            <SpeechToTextCard
              lang={currentLang}
              config={config}
              sttState={stt.sttState}
              onUpdateConfig={handleUpdateConfig}
              onStartListening={stt.startListening}
              onStopListening={stt.stopListening}
              onClearTranscript={stt.clearTranscript}
              onSendManualText={handleSendManual}
              onInsertTemplateVariable={handleInsertTemplateTag}
            />
          </div>
        )}

        {/* If Active Tab is HEART RATE */}
        {activeTab === 'heartRate' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</span>
              </button>
              <span className="text-xs font-semibold text-rose-400">
                {t.nav.heartRate}
              </span>
            </div>

            <HeartRateCard
              lang={currentLang}
              hrState={hrState}
              hyperateSessionId={config.hyperateSessionId}
              hyperateRelayUrl={config.hyperateRelayUrl}
              pulsoidToken={config.pulsoidToken}
              heartRateProvider={config.heartRateProvider || hrState.provider}
              hasHyperateApiKey={serverStatus.hasHyperateApiKey}
              hyperateKeyMasked={serverStatus.hyperateKeyMasked}
              hyperateConnected={serverStatus.hyperateConnected}
              pulsoidConnected={serverStatus.pulsoidConnected}
              onUpdateConfig={handleUpdateConfig}
              onUpdateHrState={handleUpdateHrState}
            />
          </div>
        )}

        {/* If Active Tab is MEDIA */}
        {activeTab === 'media' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</span>
              </button>
              <span className="text-xs font-semibold text-purple-400">
                {t.nav.media}
              </span>
            </div>

            <MediaSourceCard
              lang={currentLang}
              mediaState={mediaState}
              autoMediaDetection={config.autoMediaDetection}
              mediaOnlyWhenPlaying={config.mediaOnlyWhenPlaying}
              onUpdateMedia={handleUpdateMedia}
              onUpdateConfig={handleUpdateConfig}
              serverPort={serverStatus.serverPort}
            />
          </div>
        )}

        {/* If Active Tab is AFK */}
        {activeTab === 'afk' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</span>
              </button>
              <span className="text-xs font-semibold text-amber-400">
                {t.nav.afk}
              </span>
            </div>

            <AfkDetectionCard
              lang={currentLang}
              afkState={serverStatus.afkState}
              enabled={config.afkEnabled ?? false}
              afkMode={config.afkMode ?? 'vrchat_and_timer'}
              timeoutMinutes={config.afkTimeoutMinutes ?? 5}
              template={config.afkTemplate ?? '💤 AFK [{afk_time}] - Back soon! 💤'}
              overrideChatbox={config.afkOverrideChatbox ?? true}
              onUpdateConfig={handleUpdateConfig}
              onInsertMainVariable={handleInsertTemplateTag}
            />
          </div>
        )}

        {/* If Active Tab is HARDWARE */}
        {activeTab === 'hardware' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</span>
              </button>
              <span className="text-xs font-semibold text-cyan-400">
                {t.nav.hardware}
              </span>
            </div>

            <HardwareStatsCard
              lang={currentLang}
              stats={serverStatus.hardwareStats}
              enabled={config.hardwareStatsEnabled ?? false}
              onToggleEnabled={(enabled) => handleUpdateConfig({ hardwareStatsEnabled: enabled })}
              onInsertVariable={handleInsertTemplateTag}
            />
          </div>
        )}

        {/* If Active Tab is CUSTOM TEXTS */}
        {activeTab === 'customTexts' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</span>
              </button>
              <span className="text-xs font-semibold text-emerald-400">
                {t.nav.customTexts}
              </span>
            </div>

            <CustomTextsCard
              lang={currentLang}
              customTexts={config.customTexts ?? []}
              intervalSec={config.customTextIntervalSec ?? 10}
              currentActiveIndex={serverStatus.currentCustomTextIndex ?? 0}
              onUpdateCustomTexts={(texts) => handleUpdateConfig({ customTexts: texts })}
              onUpdateInterval={(sec) => handleUpdateConfig({ customTextIntervalSec: sec })}
              onInsertMainVariable={handleInsertTemplateTag}
            />
          </div>
        )}

        {/* If Active Tab is OSC NETWORK */}
        {activeTab === 'oscNetwork' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</span>
              </button>
              <span className="text-xs font-semibold text-blue-400">
                {t.nav.oscNetwork}
              </span>
            </div>

            <OscNetworkCard
              lang={currentLang}
              oscHost={config.oscHost}
              oscPort={config.oscPort}
              packetsSent={serverStatus.packetsSent}
              logs={serverStatus.logs}
              config={config}
              onUpdateTarget={(host, port) => handleUpdateConfig({ oscHost: host, oscPort: port })}
              onSendTest={handleSendTestOsc}
              onClearLogs={handleClearLogs}
              onOpenMigrateModal={() => setShowMigrateModal(true)}
            />
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white shadow-2xl animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Linux Guide Modal */}
      <LinuxGuideModal
        lang={currentLang}
        isOpen={showLinuxModal}
        onClose={() => setShowLinuxModal(false)}
        serverPort={serverStatus.serverPort}
      />

      {/* Config Migrate & Import Modal */}
      <ConfigMigrateModal
        lang={currentLang}
        isOpen={showMigrateModal}
        onClose={() => setShowMigrateModal(false)}
        onApplyMigratedConfig={handleApplyMigratedConfig}
      />
    </div>
  );
}

