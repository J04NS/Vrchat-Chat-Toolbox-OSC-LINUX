import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Trash2, Repeat, Sparkles, Check, ChevronRight } from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../lib/i18n';

interface CustomTextsCardProps {
  lang?: AppLanguage;
  customTexts: string[];
  intervalSec: number;
  currentActiveIndex: number;
  onUpdateCustomTexts: (texts: string[]) => void;
  onUpdateInterval: (intervalSec: number) => void;
  onInsertMainVariable: (tag: string) => void;
}

export const CustomTextsCard: React.FC<CustomTextsCardProps> = ({
  lang = 'en',
  customTexts,
  intervalSec,
  currentActiveIndex,
  onUpdateCustomTexts,
  onUpdateInterval,
  onInsertMainVariable,
}) => {
  const t = translations[lang];
  const fallback = [lang === 'de' ? 'Willkommen in meiner VRChat Instanz! ✨' : 'Welcome to my VRChat instance! ✨'];
  const initialTexts = customTexts && customTexts.length > 0 ? customTexts : fallback;

  const [localTexts, setLocalTexts] = useState<string[]>(initialTexts);
  const isFocusedRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalTexts(customTexts && customTexts.length > 0 ? customTexts : fallback);
    }
  }, [customTexts]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleTextChange = (index: number, val: string) => {
    const updated = [...localTexts];
    updated[index] = val;
    setLocalTexts(updated);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onUpdateCustomTexts(updated);
    }, 450);
  };

  const handleTextBlur = () => {
    isFocusedRef.current = false;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onUpdateCustomTexts(localTexts);
  };

  const handleAddText = () => {
    const nextNum = localTexts.length + 1;
    const newTexts = [...localTexts, lang === 'de' ? `Mein Text ${nextNum}` : `My Text ${nextNum}`];
    setLocalTexts(newTexts);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onUpdateCustomTexts(newTexts);
  };

  const handleRemoveText = (index: number) => {
    let updated = localTexts.filter((_, i) => i !== index);
    if (updated.length === 0) {
      updated = [''];
    }
    setLocalTexts(updated);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onUpdateCustomTexts(updated);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              {t.customTexts.title}
              <span className="text-[10px] font-medium bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                {localTexts.length} {t.customTexts.activeCount}
              </span>
            </h2>
            <p className="text-xs text-slate-400">{t.customTexts.subtitle}</p>
          </div>
        </div>

        <button
          id="btn-add-custom-text"
          type="button"
          onClick={handleAddText}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          {t.customTexts.addTextBtn}
        </button>
      </div>

      {/* Interval Setting */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Repeat className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <div className="font-medium text-slate-200">{t.customTexts.intervalLabel}</div>
            <div className="text-[11px] text-slate-400">{t.customTexts.variableHint}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-48">
          <input
            id="slider-custom-text-interval"
            type="range"
            min="3"
            max="60"
            step="1"
            value={intervalSec}
            onChange={(e) => onUpdateInterval(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <span className="text-xs font-mono font-bold text-indigo-400 w-12 text-right shrink-0">
            {intervalSec}s
          </span>
        </div>
      </div>

      {/* Dynamic Texts List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{lang === 'de' ? 'Eigene Text-Nachrichten' : 'Custom Status Messages'}</span>
          <span className="text-[11px] text-indigo-400">
            {lang === 'de' ? `Wechselt alle ${intervalSec}s` : `Rotating every ${intervalSec}s`}
          </span>
        </div>

        {localTexts.map((textVal, idx) => {
          const isActive = idx === currentActiveIndex % (localTexts.length || 1);
          const tagIndex = idx + 1;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                isActive
                  ? 'bg-indigo-950/30 border-indigo-500/50 shadow-sm'
                  : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Badge & Active Indicator */}
              <div className="flex items-center gap-1.5 pl-1.5 shrink-0">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isActive ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'
                  }`}
                />
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {lang === 'de' ? `Text ${tagIndex}` : `Text ${tagIndex}`}
                </span>
              </div>

              {/* Text Input */}
              <input
                id={`input-custom-text-${idx}`}
                type="text"
                value={textVal}
                onFocus={() => { isFocusedRef.current = true; }}
                onBlur={handleTextBlur}
                onChange={(e) => handleTextChange(idx, e.target.value)}
                placeholder={lang === 'de' ? `Freitext ${tagIndex}...` : `Custom text ${tagIndex}...`}
                className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none px-2 py-1 placeholder:text-slate-600 font-sans"
              />

              {/* Quick Tag Copy Button */}
              <button
                type="button"
                onClick={() => onInsertMainVariable(`{freitext_${tagIndex}}`)}
                className="text-[10px] font-mono text-slate-400 hover:text-indigo-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded-md transition-colors cursor-pointer shrink-0"
                title={lang === 'de' ? `Fügt {freitext_${tagIndex}} in die Chatbox-Vorlage ein` : `Inserts {freitext_${tagIndex}} into chatbox template`}
              >
                {`{freitext_${tagIndex}}`}
              </button>

              {/* Remove button */}
              <button
                id={`btn-remove-custom-text-${idx}`}
                type="button"
                onClick={() => handleRemoveText(idx)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                title={lang === 'de' ? 'Diesen Text löschen' : 'Delete this text'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Insert Into Template Chips */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
          <span>{lang === 'de' ? 'In Chatbox-Vorlage einfügen:' : 'Insert into chatbox template:'}</span>
          <span className="text-[11px] text-slate-500">{lang === 'de' ? 'Klicken zum Hinzufügen' : 'Click to add tag'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onInsertMainVariable('{freitext}')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-xs font-mono text-indigo-300 font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <span>{'{freitext}'}</span>
            <span className="text-[10px] text-indigo-200/70 font-sans">({lang === 'de' ? 'Rotiert automatisch alle Texte' : 'Automatically rotates all texts'})</span>
          </button>

          {localTexts.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onInsertMainVariable(`{freitext_${i + 1}}`)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              <span>{`{freitext_${i + 1}}`}</span>
              <span className="text-[10px] text-slate-500 font-sans">({lang === 'de' ? `Fester Text ${i + 1}` : `Fixed Text ${i + 1}`})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
