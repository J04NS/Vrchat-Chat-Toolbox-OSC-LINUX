import React, { useState } from 'react';
import { Music, Play, Pause, Disc, Terminal, Check, Copy, Sliders } from 'lucide-react';
import { MediaState } from '../types';

interface MediaSourceCardProps {
  mediaState: MediaState;
  onUpdateMedia: (data: Partial<MediaState>) => void;
  serverPort: number;
}

export const MediaSourceCard: React.FC<MediaSourceCardProps> = ({
  mediaState,
  onUpdateMedia,
  serverPort,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'linux-mpris'>('status');
  const [copied, setCopied] = useState(false);

  const mprisCommand = `playerctl metadata --format '{"title":"{{title}}","artist":"{{artist}}","status":"{{status}}"}' | curl -X POST -H "Content-Type: application/json" -d @- http://localhost:${serverPort || 9090}/api/media/now-playing`;

  const copyCommand = () => {
    navigator.clipboard.writeText(mprisCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePlay = () => {
    onUpdateMedia({ isPlaying: !mediaState.isPlaying });
  };

  const presets = [
    { title: 'Starlight', artist: 'Muse' },
    { title: 'Resonance', artist: 'HOME' },
    { title: 'Around the World', artist: 'Daft Punk' },
    { title: 'Clair de Lune', artist: 'Debussy' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Music className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              Musikquellen & Now Playing
            </h2>
            <p className="text-xs text-slate-400">Spotify, Browser, Linux MPRIS oder benutzerdefinierter Titel</p>
          </div>
        </div>

        <button
          id="btn-media-play-pause"
          type="button"
          onClick={handleTogglePlay}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            mediaState.isPlaying
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {mediaState.isPlaying ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          {mediaState.isPlaying ? 'Wiedergabe' : 'Pausiert'}
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl mb-4 border border-slate-800/80">
        <button
          id="tab-media-current"
          type="button"
          onClick={() => setActiveTab('status')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'status'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Titel & Bearbeiten
        </button>
        <button
          id="tab-media-linux"
          type="button"
          onClick={() => setActiveTab('linux-mpris')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'linux-mpris'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Linux MPRIS / playerctl
        </button>
      </div>

      {activeTab === 'status' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Songtitel</label>
              <input
                id="input-media-title"
                type="text"
                value={mediaState.title}
                onChange={(e) => onUpdateMedia({ title: e.target.value })}
                placeholder="z.B. Blinding Lights"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Künstler / Interpret</label>
              <input
                id="input-media-artist"
                type="text"
                value={mediaState.artist}
                onChange={(e) => onUpdateMedia({ artist: e.target.value })}
                placeholder="z.B. The Weeknd"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Schnellauswahl Test-Songs:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => onUpdateMedia({ title: preset.title, artist: preset.artist, isPlaying: true })}
                  className="px-2.5 py-1.5 text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 transition-colors cursor-pointer truncate"
                >
                  <div className="font-semibold text-white truncate">{preset.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{preset.artist}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              Quelle: <span className="text-slate-200">{mediaState.sourceName || 'Lokal / Eingabe'}</span>
            </span>
            <span>
              Chatbox Variable: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">{'{song}'}</code>
            </span>
          </div>
        </div>
      )}

      {activeTab === 'linux-mpris' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            Unter Linux kannst du laufende Musik aus Spotify, VLC, Firefox oder Chromium mit dem MPRIS-Standard automatisch auslesen:
          </p>

          <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
            <code>{mprisCommand}</code>
            <button
              id="btn-copy-mpris"
              type="button"
              onClick={copyCommand}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
              title="Befehl in Zwischenablage kopieren"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-[11px] text-blue-200 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              Automatischer Dauer-Watcher:
            </div>
            <p>
              Führe im Projektverzeichnis einfach <code className="bg-blue-900/60 px-1 py-0.5 rounded">./playerctl-watcher.sh</code> aus. Bei jedem Songwechsel sendet Linux die Metadaten direkt an die VRChat Chatbox!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
