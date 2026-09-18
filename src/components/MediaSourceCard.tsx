import React, { useState } from 'react';
import { Music, Play, Pause, Radio, Disc, Sparkles } from 'lucide-react';
import { MediaState, AppLanguage } from '../types';
import { translations } from '../lib/i18n';

interface MediaSourceCardProps {
  lang?: AppLanguage;
  mediaState: MediaState;
  autoMediaDetection?: boolean;
  mediaOnlyWhenPlaying?: boolean;
  onUpdateMedia: (data: Partial<MediaState>) => void;
  onUpdateConfig: (data: { autoMediaDetection?: boolean; mediaOnlyWhenPlaying?: boolean }) => void;
  serverPort: number;
}

export const MediaSourceCard: React.FC<MediaSourceCardProps> = ({
  lang = 'en',
  mediaState,
  autoMediaDetection = true,
  mediaOnlyWhenPlaying = true,
  onUpdateMedia,
  onUpdateConfig,
}) => {
  const t = translations[lang];
  const [manualTitle, setManualTitle] = useState(mediaState.title);
  const [manualArtist, setManualArtist] = useState(mediaState.artist);

  const handleTogglePlay = () => {
    onUpdateMedia({ isPlaying: !mediaState.isPlaying });
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMedia({
      title: manualTitle.trim(),
      artist: manualArtist.trim(),
      isPlaying: true,
      sourceName: lang === 'de' ? 'Manuell' : 'Manual',
    });
  };

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
              {t.media.title}
            </h2>
            <p className="text-xs text-slate-400">{t.media.subtitle}</p>
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
          {mediaState.isPlaying ? t.media.nowPlaying : t.media.stopped}
        </button>
      </div>

      {/* Auto-Detection status banner */}
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${mediaState.isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <div>
              <div className="text-xs font-semibold text-white">
                {mediaState.isPlaying && mediaState.title
                  ? `${mediaState.title} ${mediaState.artist ? `• ${mediaState.artist}` : ''}`
                  : t.media.noMedia}
              </div>
              <div className="text-[11px] text-slate-400">
                {t.media.sourceLabel}: {mediaState.sourceName || 'playerctl'} | Status: {mediaState.isPlaying ? t.media.nowPlaying : t.media.stopped}
              </div>
            </div>
          </div>

          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
            {mediaState.isPlaying ? 'LIVE' : 'IDLE'}
          </span>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <span className="text-xs text-slate-300 font-medium">{t.media.autoDetectToggle}</span>
            <input
              id="toggle-auto-media"
              type="checkbox"
              checked={autoMediaDetection}
              onChange={(e) => onUpdateConfig({ autoMediaDetection: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <span className="text-xs text-slate-300 font-medium">{t.media.onlyWhenPlayingToggle}</span>
            <input
              id="toggle-media-only-playing"
              type="checkbox"
              checked={mediaOnlyWhenPlaying}
              onChange={(e) => onUpdateConfig({ mediaOnlyWhenPlaying: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </label>
        </div>

        {/* Quick manual override if needed */}
        <form onSubmit={handleSaveManual} className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <input
            id="input-media-title"
            type="text"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            placeholder={t.media.titleLabel}
            className="sm:col-span-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <input
            id="input-media-artist"
            type="text"
            value={manualArtist}
            onChange={(e) => setManualArtist(e.target.value)}
            placeholder={t.media.artistLabel}
            className="sm:col-span-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            id="btn-apply-manual-media"
            type="submit"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-all cursor-pointer border border-slate-700"
          >
            {t.media.saveMediaBtn}
          </button>
        </form>
      </div>
    </div>
  );
};
