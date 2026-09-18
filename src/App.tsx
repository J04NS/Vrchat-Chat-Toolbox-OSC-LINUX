import React, { useEffect, useState, useCallback } from 'react';
import { Radio, Terminal, Heart, Music, Sliders, Network, Shield, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { ChatboxConfig, HeartRateProvider, HeartRateState, MediaState, OscLogEntry, ServerStatusResponse } from './types';
import { ChatboxPreview } from './components/ChatboxPreview';
import { HeartRateCard } from './components/HeartRateCard';
import { MediaSourceCard } from './components/MediaSourceCard';
import { ChatboxSettingsCard } from './components/ChatboxSettingsCard';
import { OscNetworkCard } from './components/OscNetworkCard';
import { LinuxGuideModal } from './components/LinuxGuideModal';

export default function App() {
  const [config, setConfig] = useState<ChatboxConfig>({
    enabled: false,
    template: '[ {hr_icon} {hr} BPM ]  {music_icon} {song}  | ⏱️ {clock}',
    updateIntervalMs: 2000,
    playSound: false,
    bypassTypingIndicator: true,
    marqueeEnabled: false,
    marqueeWidth: 35,
    customStatus: '',
    oscHost: '127.0.0.1',
    oscPort: 9000,
    hyperateSessionId: '',
    pulsoidToken: '',
  });

  const [hrState, setHrState] = useState<HeartRateState>({
    bpm: 72,
    provider: 'manual',
    connected: true,
    lastUpdated: Date.now(),
    deviceLabel: 'Simulator',
  });

  const [mediaState, setMediaState] = useState<MediaState>({
    title: 'Starboy',
    artist: 'The Weeknd',
    album: 'Starboy',
    isPlaying: true,
    positionSec: 42,
    durationSec: 230,
    sourceName: 'mpris/local',
    lastUpdated: Date.now(),
  });

  const [serverStatus, setServerStatus] = useState<ServerStatusResponse>({
    oscActive: false,
    oscTarget: { host: '127.0.0.1', port: 9000 },
    serverPort: 3000,
    isLinuxMode: false,
    hasHyperateApiKey: true,
    hyperateKeyMasked: '••••••••3J91',
    hyperateConnected: false,
    currentBpm: 72,
    currentMedia: {
      title: 'Starboy',
      artist: 'The Weeknd',
      isPlaying: true,
      positionSec: 42,
      durationSec: 230,
      sourceName: 'mpris/local',
      lastUpdated: Date.now(),
    },
    lastOscText: '',
    packetsSent: 0,
    logs: [],
  });

  const [showLinuxModal, setShowLinuxModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Fetch initial config & status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data: ServerStatusResponse = await res.json();
        setServerStatus(data);
        if (data.currentBpm && data.currentBpm > 0) {
          setHrState((prev) => ({ ...prev, bpm: data.currentBpm }));
        }
        if (data.currentMedia && data.currentMedia.title) {
          setMediaState(data.currentMedia);
        }
      }
    } catch {
      // Backend might be warming up
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchStatus();
    const interval = setInterval(fetchStatus, 1800);
    return () => clearInterval(interval);
  }, [fetchConfig, fetchStatus]);

  // Update Config
  const handleUpdateConfig = async (updates: Partial<ChatboxConfig>) => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        if (updates.enabled !== undefined) {
          showNotification(updates.enabled ? 'OSC-Übertragung gestartet' : 'OSC-Übertragung gestoppt');
        }
      }
    } catch (err) {
      console.error('Failed to update config', err);
    }
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
        showNotification('OSC-Paket an VRChat gesendet');
        fetchStatus();
      }
    } catch {
      showNotification('Fehler beim Senden');
    }
  };

  // Send Test OSC
  const handleSendTestOsc = async () => {
    await handleSendManual(`❤️ ${hrState.bpm} BPM | 🎵 ${mediaState.title}`);
  };

  // Clear Logs
  const handleClearLogs = async () => {
    try {
      await fetch('/api/logs/clear', { method: 'POST' });
      setServerStatus((prev) => ({ ...prev, logs: [] }));
      showNotification('Log geleert');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">VRChat OSC Chatbox Hub</h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  Linux & Port 9090 Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Puls (HypeRate / Pulsoid) & Musikquellen in Echtzeit via OSC (UDP 9000)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Port indicator badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Web: :{serverStatus.serverPort || 3000}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Linux: :9090</span>
            </div>

            {/* Linux Setup Modal Button */}
            <button
              id="btn-open-linux-guide"
              onClick={() => setShowLinuxModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer border border-slate-700 shadow-sm"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              Linux Anleitung
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Security & System Info Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-900/40 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>HypeRate API-Schlüssel gesichert:</strong> Dein Token ist sicher auf dem Server hinterlegt (
              <code className="font-mono text-emerald-400">{serverStatus.hyperateKeyMasked}</code>) und wird Dritten im
              Browser nicht offengelegt.
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>OSC Ziel:</span>
            <code className="font-mono text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
              {config.oscHost}:{config.oscPort}
            </code>
          </div>
        </div>

        {/* Live In-VR Chatbox Preview Hero */}
        <ChatboxPreview
          template={config.template}
          hrState={hrState}
          mediaState={mediaState}
          customStatus={config.customStatus}
          marqueeEnabled={config.marqueeEnabled}
          marqueeWidth={config.marqueeWidth}
          playSound={config.playSound}
          bypassTyping={config.bypassTypingIndicator}
          updateIntervalMs={config.updateIntervalMs}
          isActive={config.enabled}
          onSendManual={handleSendManual}
        />

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Data Sources (Puls & Musik) */}
          <div className="space-y-6">
            <HeartRateCard
              hrState={hrState}
              hyperateSessionId={config.hyperateSessionId}
              pulsoidToken={config.pulsoidToken}
              hasHyperateApiKey={serverStatus.hasHyperateApiKey}
              hyperateKeyMasked={serverStatus.hyperateKeyMasked}
              hyperateConnected={serverStatus.hyperateConnected}
              onUpdateConfig={handleUpdateConfig}
              onUpdateHrState={handleUpdateHrState}
            />

            <MediaSourceCard
              mediaState={mediaState}
              onUpdateMedia={handleUpdateMedia}
              serverPort={serverStatus.serverPort}
            />
          </div>

          {/* Right Column: Chatbox Formatting & OSC Network */}
          <div className="space-y-6">
            <ChatboxSettingsCard
              config={config}
              onUpdateConfig={handleUpdateConfig}
            />

            <OscNetworkCard
              oscHost={config.oscHost}
              oscPort={config.oscPort}
              packetsSent={serverStatus.packetsSent}
              logs={serverStatus.logs}
              onUpdateTarget={(host, port) => handleUpdateConfig({ oscHost: host, oscPort: port })}
              onSendTest={handleSendTestOsc}
              onClearLogs={handleClearLogs}
            />
          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white shadow-2xl animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Linux Setup Modal */}
      <LinuxGuideModal
        isOpen={showLinuxModal}
        onClose={() => setShowLinuxModal(false)}
        serverPort={serverStatus.serverPort}
      />
    </div>
  );
}
