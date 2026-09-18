import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Type,
  Play,
  Square,
  Bookmark,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  HeartOff,
  Music,
  Activity,
  Layers,
  Save,
} from 'lucide-react';
import { ChatboxConfig, ChatboxProfile, AppLanguage } from '../types';
import { translations } from '../lib/i18n';

const BUILT_IN_PROFILES_DE: ChatboxProfile[] = [
  {
    id: 'profil_1_nur_musik',
    name: 'Profil 1: Nur Musik (Kein Puls)',
    description: 'Zeigt Musiktitel & Uhrzeit an – keinerlei Pulsanzeige',
    template: '🎵 {song} | 🕒 {clock}',
    isBuiltIn: true,
  },
  {
    id: 'profil_2_minimal_kein_puls_keine_medien',
    name: 'Profil 2: Minimal (Kein Puls & Keine Medien)',
    description: 'Weder Puls noch Musik – reiner Status/Freitext & Uhrzeit',
    template: '💬 {freitext} | 🕒 {clock}',
    isBuiltIn: true,
  },
  {
    id: 'profil_3_standard_puls_musik',
    name: 'Profil 3: Standard (Puls & Musik)',
    description: 'Klassisches 2-Zeilen-Format mit Herzfrequenz & Spotify',
    template: '❤️ {hr} BPM ❤️\\n{song}',
    isBuiltIn: true,
  },
  {
    id: 'profil_4_nur_puls',
    name: 'Profil 4: Nur Puls',
    description: 'Reine Herzfrequenzanzeige mit animiertem Herzschlag-Icon',
    template: '❤️ {hr} BPM {hr_icon}',
    isBuiltIn: true,
  },
  {
    id: 'profil_5_hardware_afk',
    name: 'Profil 5: Hardware & AFK',
    description: 'CPU- & RAM-Auslastung und automatische AFK-Dauer',
    template: '💻 {hw} | 💤 {afk_time}',
    isBuiltIn: true,
  },
  {
    id: 'profil_6_full_hud',
    name: 'Profil 6: Volles HUD (Alles)',
    description: 'Puls, Musik, Hardware-Monitor & rotierende Freitexte',
    template: '❤️ {hr} BPM • 🎵 {song}\\n💻 {cpu} / {ram} • 💬 {freitext}',
    isBuiltIn: true,
  },
];

const BUILT_IN_PROFILES_EN: ChatboxProfile[] = [
  {
    id: 'profil_1_nur_musik',
    name: 'Profile 1: Music Only (No Heart Rate)',
    description: 'Displays current song & clock, no heart rate',
    template: '🎵 {song} | 🕒 {clock}',
    isBuiltIn: true,
  },
  {
    id: 'profil_2_minimal_kein_puls_keine_medien',
    name: 'Profile 2: Minimal (No HR & No Media)',
    description: 'No heart rate or music, status text & clock only',
    template: '💬 {freitext} | 🕒 {clock}',
    isBuiltIn: true,
  },
  {
    id: 'profil_3_standard_puls_musik',
    name: 'Profile 3: Standard (HR & Music)',
    description: 'Classic 2-line layout with heart rate & music',
    template: '❤️ {hr} BPM ❤️\\n{song}',
    isBuiltIn: true,
  },
  {
    id: 'profil_4_nur_puls',
    name: 'Profile 4: Heart Rate Only',
    description: 'Pure heart rate display with animated heart icon',
    template: '❤️ {hr} BPM {hr_icon}',
    isBuiltIn: true,
  },
  {
    id: 'profil_5_hardware_afk',
    name: 'Profile 5: Hardware & AFK',
    description: 'CPU & RAM telemetry and automatic AFK duration timer',
    template: '💻 {hw} | 💤 {afk_time}',
    isBuiltIn: true,
  },
  {
    id: 'profil_6_full_hud',
    name: 'Profile 6: Full HUD (Everything)',
    description: 'Heart rate, music, hardware monitor & rotating custom texts',
    template: '❤️ {hr} BPM • 🎵 {song}\\n💻 {cpu} / {ram} • 💬 {freitext}',
    isBuiltIn: true,
  },
];

interface ChatboxSettingsCardProps {
  lang?: AppLanguage;
  config: ChatboxConfig;
  activeProfileId?: string;
  effectiveTemplate?: string;
  isAutomationActive?: boolean;
  matchedRuleName?: string;
  onUpdateConfig: (updates: Partial<ChatboxConfig>) => void;
}

export const ChatboxSettingsCard: React.FC<ChatboxSettingsCardProps> = ({
  lang = 'en',
  config,
  activeProfileId: propActiveProfileId,
  effectiveTemplate,
  isAutomationActive = false,
  matchedRuleName,
  onUpdateConfig,
}) => {
  const t = translations[lang];
  const builtInList = lang === 'de' ? BUILT_IN_PROFILES_DE : BUILT_IN_PROFILES_EN;
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Local state for template input to prevent focus loss and cursor jumping during typing
  const [templateInput, setTemplateInput] = useState(effectiveTemplate || config.template || '');
  const isInputFocused = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Synchronize local input from external config or effective automated template ONLY when user is NOT focused/typing
  useEffect(() => {
    if (!isInputFocused.current) {
      setTemplateInput(effectiveTemplate || config.template || '');
    }
  }, [config.template, effectiveTemplate]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const profiles: ChatboxProfile[] =
    config.profiles && config.profiles.length > 0 ? config.profiles : builtInList;
  const activeProfileId = (isAutomationActive && propActiveProfileId)
    ? propActiveProfileId
    : (config.activeProfileId || 'profil_3_standard_puls_musik');
  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const isTemplateModifiedFromActive =
    activeProfile && activeProfile.template.trim() !== templateInput.trim();

  const showFeedback = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleInputChange = (val: string) => {
    setTemplateInput(val);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    // Debounce config updates so typing is 100% fluid without input freezing or focus loss
    debounceTimer.current = setTimeout(() => {
      onUpdateConfig({ template: val });
    }, 350);
  };

  const handleInputFocus = () => {
    isInputFocused.current = true;
  };

  const handleInputBlur = () => {
    isInputFocused.current = false;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (templateInput !== config.template) {
      onUpdateConfig({ template: templateInput });
    }
  };

  const insertVariable = (varName: string) => {
    const updated = `${templateInput} ${varName}`.trim();
    setTemplateInput(updated);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    onUpdateConfig({ template: updated });
  };

  const handleSelectProfile = (profile: ChatboxProfile) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setTemplateInput(profile.template);
    onUpdateConfig({
      template: profile.template,
      activeProfileId: profile.id,
    });
    showFeedback(`${t.chatbox.profileLoadedNotice} ("${profile.name}")`);
  };

  const handleSaveCurrentAsProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const newProf: ChatboxProfile = {
      id: `custom_${Date.now()}`,
      name: newProfileName.trim(),
      description: newProfileDesc.trim() || undefined,
      template: templateInput,
      isBuiltIn: false,
    };

    const updated = [...profiles, newProf];
    onUpdateConfig({
      profiles: updated,
      activeProfileId: newProf.id,
      template: templateInput,
    });

    try {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: newProf }),
      });
    } catch (_) {}

    setNewProfileName('');
    setNewProfileDesc('');
    setIsCreatingProfile(false);
    showFeedback(`${t.chatbox.profileSavedNotice} ("${newProf.name}")`);
  };

  const handleUpdateActiveProfileTemplate = async () => {
    if (!activeProfile) return;

    const updatedProfiles = profiles.map((p) =>
      p.id === activeProfile.id ? { ...p, template: templateInput } : p
    );

    onUpdateConfig({ profiles: updatedProfiles, template: templateInput });

    try {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: { ...activeProfile, template: templateInput },
        }),
      });
    } catch (_) {}

    showFeedback(`${t.chatbox.profileAdoptedNotice} ("${activeProfile.name}")`);
  };

  const handleDeleteProfile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const toDelete = profiles.find((p) => p.id === id);
    if (!toDelete) return;

    let remaining = profiles.filter((p) => p.id !== id);
    if (remaining.length === 0) {
      remaining = [
        {
          id: `custom_${Date.now()}`,
          name: lang === 'de' ? 'Mein Profil' : 'My Profile',
          template: '❤️ {hr} BPM ❤️\\n{song}',
          isBuiltIn: false,
        },
      ];
    }

    const nextActive = activeProfileId === id ? remaining[0].id : activeProfileId;
    const nextTemplate = activeProfileId === id ? remaining[0].template : templateInput;

    setTemplateInput(nextTemplate);

    // Also update any automation rules targeting this deleted profile
    const updatedRules = (config.profileRules || []).map((r) =>
      r.targetProfileId === id ? { ...r, targetProfileId: nextActive } : r
    );

    onUpdateConfig({
      profiles: remaining,
      activeProfileId: nextActive,
      template: nextTemplate,
      profileRules: updatedRules,
    });

    try {
      await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
    } catch (_) {}

    const profileName = toDelete.isBuiltIn
      ? (builtInList.find((b) => b.id === id)?.name || toDelete.name)
      : toDelete.name;
    showFeedback(`${t.chatbox.profileDeletedNotice} ("${profileName}")`);
  };

  const handleResetToDefaultProfiles = async () => {
    const fallbackBuiltIn = builtInList[2] || builtInList[0];
    const defaultTemplate = fallbackBuiltIn.template;
    setTemplateInput(defaultTemplate);
    onUpdateConfig({
      profiles: builtInList,
      activeProfileId: fallbackBuiltIn.id,
      template: defaultTemplate,
    });

    try {
      await fetch('/api/profiles/reset', { method: 'POST' });
    } catch (_) {}

    showFeedback(t.chatbox.profilesResetNotice);
  };

  const getProfileIcon = (p: ChatboxProfile) => {
    if (p.id === 'profil_1_nur_musik') return <Music className="w-3.5 h-3.5 text-sky-400" />;
    if (p.id === 'profil_2_minimal_kein_puls_keine_medien')
      return <HeartOff className="w-3.5 h-3.5 text-slate-400" />;
    if (p.id === 'profil_4_nur_puls') return <Activity className="w-3.5 h-3.5 text-rose-400" />;
    if (p.id === 'profil_6_full_hud') return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    return <Layers className="w-3.5 h-3.5 text-blue-400" />;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header with Master Broadcast Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Sliders className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              {t.chatbox.title}
            </h2>
            <p className="text-xs text-slate-400">{t.chatbox.subtitle}</p>
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
              {t.chatbox.stopBroadcast}
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              {t.chatbox.startBroadcast}
            </>
          )}
        </button>
      </div>

      {/* Profiles / Formatvorlagen Section */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">{t.chatbox.profilesTitle}</span>
            <span className="text-[10px] text-slate-400">({profiles.length} {t.chatbox.profilesAvailable})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-add-new-profile"
              type="button"
              onClick={() => setIsCreatingProfile(!isCreatingProfile)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              {isCreatingProfile ? t.chatbox.closeProfileForm : t.chatbox.saveAsProfile}
            </button>

            <button
              id="btn-reset-profiles"
              type="button"
              onClick={handleResetToDefaultProfiles}
              title={t.chatbox.resetProfilesTooltip}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status Notice Badge */}
        {statusNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5 text-blue-400" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Create Profile Expander */}
        {isCreatingProfile && (
          <form
            onSubmit={handleSaveCurrentAsProfile}
            className="p-3 bg-slate-900 border border-blue-500/30 rounded-xl space-y-2.5"
          >
            <div className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              {t.chatbox.saveCurrentModalTitle}
            </div>

            <div className="space-y-1.5">
              <input
                id="input-profile-name"
                type="text"
                placeholder={t.chatbox.profileNamePlaceholder}
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              <input
                id="input-profile-desc"
                type="text"
                placeholder={t.chatbox.profileDescPlaceholder}
                value={newProfileDesc}
                onChange={(e) => setNewProfileDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="text-[11px] font-mono text-slate-400 truncate bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
              {t.chatbox.profileTemplateLabel}: {templateInput}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingProfile(false)}
                className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                id="btn-submit-save-profile"
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow transition-all cursor-pointer"
              >
                <Save className="w-3 h-3" />
                {t.chatbox.saveProfileBtn}
              </button>
            </div>
          </form>
        )}

        {/* Profile Automation Info Banner */}
        {isAutomationActive && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">{t.chatbox.automationActiveBanner}</span>
              {matchedRuleName && (
                <span className="block text-[11px] text-amber-200/80 font-normal">
                  {lang === 'de' ? 'Aktive Bedingung:' : 'Active Rule:'} <strong>{matchedRuleName}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Profile Selector Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {profiles.map((p) => {
            const isActive = p.id === activeProfileId;
            const isAutoActive = isAutomationActive && isActive;
            const localizedBuiltIn = p.isBuiltIn ? builtInList.find((b) => b.id === p.id) : null;
            const displayName = localizedBuiltIn ? localizedBuiltIn.name : p.name;
            const displayDesc = localizedBuiltIn ? localizedBuiltIn.description : p.description;

            return (
              <div
                key={p.id}
                id={`profile-card-${p.id}`}
                onClick={() => handleSelectProfile(p)}
                className={`group text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isAutoActive
                    ? 'bg-amber-950/40 border-amber-500/70 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50'
                    : isActive
                    ? 'bg-blue-950/40 border-blue-500/60 shadow-md shadow-blue-950/40 ring-1 ring-blue-500/30'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {getProfileIcon(p)}
                      <span
                        className={`text-xs font-semibold truncate ${
                          isAutoActive
                            ? 'text-amber-200 font-bold'
                            : isActive
                            ? 'text-blue-200 font-bold'
                            : 'text-slate-200'
                        }`}
                      >
                        {displayName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isAutoActive ? (
                        <span className="text-[10px] font-bold bg-amber-500/25 text-amber-300 border border-amber-500/50 px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-2.5 h-2.5" />
                          {t.chatbox.autoActiveBadge}
                        </span>
                      ) : isActive ? (
                        <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1.5 py-0.5 rounded-md">
                          {t.chatbox.activeProfileBadge}
                        </span>
                      ) : null}
                      <button
                        id={`btn-delete-profile-${p.id}`}
                        type="button"
                        onClick={(e) => handleDeleteProfile(p.id, e)}
                        title={t.chatbox.deleteProfileTooltip || (lang === 'de' ? 'Profil / Vorlage löschen' : 'Delete profile')}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/15 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {displayDesc && (
                    <p className="text-[11px] text-slate-400 line-clamp-1 mb-1.5">
                      {displayDesc}
                    </p>
                  )}
                </div>

                <div className="font-mono text-[10px] text-slate-400 bg-slate-950/90 px-2 py-1 rounded border border-slate-800/80 truncate">
                  {p.template}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Template Input & Action Bar */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1.5 min-h-[26px]">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-400" />
              {t.chatbox.activeChatboxText}
            </label>
            <div className="flex items-center gap-2">
              {isTemplateModifiedFromActive && (
                <button
                  type="button"
                  onClick={handleUpdateActiveProfileTemplate}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  {t.chatbox.adoptToProfile}
                </button>
              )}
              <span className="text-[11px] text-slate-400">{t.chatbox.clickableVariables}</span>
            </div>
          </div>

          <input
            id="textarea-chatbox-template"
            key="chatbox-template-active-input"
            type="text"
            value={templateInput}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="❤️ {hr} BPM ❤️\n{song}"
          />
        </div>

        {/* Variable Pills */}
        <div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { tag: '{hr}', desc: t.chatbox.variables.hr },
              { tag: '{hr_icon}', desc: t.chatbox.variables.hrIcon },
              { tag: '{song}', desc: t.chatbox.variables.song },
              { tag: '{cpu}', desc: t.chatbox.variables.cpu },
              { tag: '{ram}', desc: t.chatbox.variables.ram },
              { tag: '{hw}', desc: t.chatbox.variables.hw },
              { tag: '{afk_time}', desc: t.chatbox.variables.afkTime },
              { tag: '{freitext}', desc: t.chatbox.variables.freitext },
              { tag: '{clock}', desc: t.chatbox.variables.clock },
              { tag: '\\n', desc: t.chatbox.variables.newline },
            ].map((v) => (
              <button
                key={v.tag}
                type="button"
                onClick={() => insertVariable(v.tag)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                <span>{v.tag}</span>
                <span className="text-[10px] text-slate-500 font-sans">({v.desc})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
          {/* Interval */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">{t.chatbox.sendInterval}</label>
              <span className="text-xs font-mono text-blue-400 font-semibold">
                {(config.updateIntervalMs / 1000).toFixed(1)}s
              </span>
            </div>
            <input
              id="slider-interval"
              type="range"
              min="1000"
              max="5000"
              step="250"
              value={config.updateIntervalMs}
              onChange={(e) => onUpdateConfig({ updateIntervalMs: Number(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Quick Checkbox */}
          <div className="flex flex-col justify-center">
            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                id="checkbox-bypass-typing"
                type="checkbox"
                checked={config.bypassTypingIndicator}
                onChange={(e) => onUpdateConfig({ bypassTypingIndicator: e.target.checked })}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-200">{t.chatbox.bypassTyping}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
