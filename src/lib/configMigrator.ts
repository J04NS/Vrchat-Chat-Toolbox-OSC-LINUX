import { ChatboxConfig, ChatboxProfile, ProfileAutomationRule, RuleConditionValue, AppLanguage } from '../types';

export interface MigrationResult {
  migratedConfig: ChatboxConfig;
  detectedVersion: string;
  changesSummary: string[];
  profilesMigrated: number;
  rulesMigrated: number;
  legacyVariablesFixed: number;
}

const DEFAULT_PROFILES_DE: ChatboxProfile[] = [
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
    id: 'profil_5_gaming_stats',
    name: 'Profil 5: Gaming & Hardware HUD',
    description: 'Puls + CPU / RAM Hardware-Auslastung',
    template: '❤️ {hr} BPM | 💻 {hw}\\n{song}',
    isBuiltIn: true,
  },
];

const DEFAULT_PROFILES_EN: ChatboxProfile[] = [
  {
    id: 'profil_1_nur_musik',
    name: 'Profile 1: Music Only (No Heart Rate)',
    description: 'Shows current song and clock time only',
    template: '🎵 {song} | 🕒 {clock}',
    isBuiltIn: true,
  },
  {
    id: 'profil_2_minimal_kein_puls_keine_medien',
    name: 'Profile 2: Minimal (No HR, No Media)',
    description: 'Shows status/custom text & clock when idle',
    template: '💬 {freitext} | 🕒 {clock}',
    isBuiltIn: true,
  },
  {
    id: 'profil_3_standard_puls_musik',
    name: 'Profile 3: Standard (HR & Music)',
    description: 'Classic 2-line layout with heart rate & song',
    template: '❤️ {hr} BPM ❤️\\n{song}',
    isBuiltIn: true,
  },
  {
    id: 'profil_4_nur_puls',
    name: 'Profile 4: Heart Rate Only',
    description: 'Live heart rate with beating heart visual icon',
    template: '❤️ {hr} BPM {hr_icon}',
    isBuiltIn: true,
  },
  {
    id: 'profil_5_gaming_stats',
    name: 'Profile 5: Gaming & Hardware HUD',
    description: 'Heart rate + CPU / RAM hardware utilization',
    template: '❤️ {hr} BPM | 💻 {hw}\\n{song}',
    isBuiltIn: true,
  },
];

/**
 * Normalizes template strings, converting legacy tags into standard tags:
 * {bpm}, {heartrate}, {heart_rate} -> {hr}
 * {song_name}, {track}, {music}, {title}, {media}, {nowplaying} -> {song}
 * {afk_duration}, {afk} -> {afk_time}
 * {time}, {datetime} -> {clock}
 * {hardware} -> {hw}
 * {mem} -> {ram}
 */
export function migrateTemplateString(template: string): { migrated: string; replacedCount: number } {
  if (!template || typeof template !== 'string') {
    return { migrated: '❤️ {hr} BPM ❤️\\n{song}', replacedCount: 0 };
  }

  let text = template;
  let count = 0;

  const replacements: Array<{ regex: RegExp; replacement: string }> = [
    { regex: /\{heart_?rate\}|\{bpm\}/gi, replacement: '{hr}' },
    { regex: /\{song_name\}|\{track\}|\{music\}|\{now_?playing\}|\{media\}/gi, replacement: '{song}' },
    { regex: /\{afk_duration\}|\{afk_timer\}|\{afk_time_formatted\}/gi, replacement: '{afk_time}' },
    { regex: /\{afk_minutes\}|\{afk_mins\}/gi, replacement: '{afk_min}' },
    { regex: /\{datetime\}|\{system_?time\}|\{local_?time\}/gi, replacement: '{clock}' },
    { regex: /\{hardware_stats\}|\{hardware\}/gi, replacement: '{hw}' },
    { regex: /\{memory\}|\{mem\}/gi, replacement: '{ram}' },
    { regex: /\{cpu_usage\}|\{cpu_percent\}/gi, replacement: '{cpu}' },
    { regex: /\{gpu_usage\}|\{gpu_percent\}/gi, replacement: '{gpu}' },
  ];

  for (const { regex, replacement } of replacements) {
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      count += matches.length;
      text = text.replace(regex, replacement);
    }
  }

  return { migrated: text, replacedCount: count };
}

function parseConditionValue(val: any): RuleConditionValue {
  if (val === 'true' || val === true || val === 1 || val === 'active') return 'true';
  if (val === 'false' || val === false || val === 0 || val === 'inactive') return 'false';
  return 'any';
}

/**
 * Migrates any raw JSON object from an older or alternate version of VRChat OSC Hub / Chatbox
 * into the latest ChatboxConfig schema v3+.
 */
export function migrateConfigJson(rawJson: any, targetLang: AppLanguage = 'en'): MigrationResult {
  const summary: string[] = [];
  let totalReplacedVars = 0;
  let detectedVersion = 'v1.0 / Legacy Format';

  if (!rawJson || typeof rawJson !== 'object') {
    throw new Error(targetLang === 'de' ? 'Ungültige JSON-Datei oder leeres Objekt.' : 'Invalid JSON file or empty object.');
  }

  // Version Detection
  if (rawJson.schemaVersion === 3 || (rawJson.profiles && rawJson.profileRules)) {
    detectedVersion = 'v3.0 (Schema mit Profil-Automation)';
  } else if (rawJson.profiles || rawJson.activeProfileId) {
    detectedVersion = 'v2.0 (Multi-Profil Format)';
  } else if (rawJson.hyperateApiKey || rawJson.bpmTemplate || rawJson.oscIp) {
    detectedVersion = 'v1.0 / v1.5 (Frühere Version)';
  }

  const lang: AppLanguage = rawJson.language === 'de' || rawJson.language === 'en' ? rawJson.language : targetLang;

  // 1. Template Migration
  const rawMainTemplate =
    rawJson.template ??
    rawJson.chatboxTemplate ??
    rawJson.bpmTemplate ??
    rawJson.format ??
    '❤️ {hr} BPM ❤️\\n{song}';

  const { migrated: cleanMainTemplate, replacedCount: mainReplaced } = migrateTemplateString(String(rawMainTemplate));
  totalReplacedVars += mainReplaced;
  if (mainReplaced > 0) {
    summary.push(
      lang === 'de'
        ? `${mainReplaced} veraltete Variablen im Haupt-Template modernisiert (z.B. {bpm} → {hr}, {track} → {song})`
        : `Modernized ${mainReplaced} legacy tags in main template ({bpm} → {hr}, {track} → {song})`
    );
  }

  // 2. Interval normalization
  let rawInterval = 1500;
  if (typeof rawJson.updateIntervalMs === 'number') {
    rawInterval = rawJson.updateIntervalMs;
  } else if (typeof rawJson.intervalMs === 'number') {
    rawInterval = rawJson.intervalMs;
  } else if (typeof rawJson.updateInterval === 'number') {
    rawInterval = rawJson.updateInterval < 100 ? rawJson.updateInterval * 1000 : rawJson.updateInterval;
  } else if (typeof rawJson.intervalSec === 'number') {
    rawInterval = rawJson.intervalSec * 1000;
  }
  rawInterval = Math.max(500, Math.min(10000, rawInterval));

  // 3. AFK Settings
  const rawAfkTemplate = rawJson.afkTemplate ?? '💤 AFK [{afk_time}] - Back soon! 💤';
  const { migrated: cleanAfkTemplate, replacedCount: afkReplaced } = migrateTemplateString(String(rawAfkTemplate));
  totalReplacedVars += afkReplaced;

  const rawAfkMode = rawJson.afkMode;
  const afkMode: 'vrchat_and_timer' | 'vrchat_only' | 'timer_only' =
    rawAfkMode === 'vrchat_only' || rawAfkMode === 'timer_only' ? rawAfkMode : 'vrchat_and_timer';
  const afkTimeoutMinutes = Math.max(1, Number(rawJson.afkTimeoutMinutes || rawJson.afkTimeout || 5));

  // 4. Profiles Migration
  const builtInList = lang === 'de' ? DEFAULT_PROFILES_DE : DEFAULT_PROFILES_EN;
  let migratedProfiles: ChatboxProfile[] = [];

  if (Array.isArray(rawJson.profiles) && rawJson.profiles.length > 0) {
    migratedProfiles = rawJson.profiles.map((p: any, idx: number) => {
      const { migrated: pCleanTemplate, replacedCount } = migrateTemplateString(String(p.template || ''));
      totalReplacedVars += replacedCount;
      return {
        id: String(p.id || `profile_migrated_${idx}`),
        name: String(p.name || `Profil ${idx + 1}`),
        description: p.description ? String(p.description) : undefined,
        template: pCleanTemplate,
        isBuiltIn: Boolean(p.isBuiltIn),
      };
    });
    summary.push(
      lang === 'de'
        ? `${migratedProfiles.length} Profile migriert und Variablen normalisiert`
        : `Migrated ${migratedProfiles.length} profiles and normalized placeholder tags`
    );
  } else {
    migratedProfiles = builtInList;
    summary.push(lang === 'de' ? 'Standard-Profile initialisiert' : 'Initialized standard profile suite');
  }

  // Ensure unique profile IDs
  const existingIds = new Set(migratedProfiles.map((p) => p.id));
  builtInList.forEach((b: ChatboxProfile) => {
    if (!existingIds.has(b.id)) {
      migratedProfiles.push(b);
      existingIds.add(b.id);
    }
  });

  // 5. Active Profile ID
  let activeProfileId = rawJson.activeProfileId ? String(rawJson.activeProfileId) : 'profil_3_standard_puls_musik';
  if (!existingIds.has(activeProfileId)) {
    activeProfileId = migratedProfiles[0]?.id || 'profil_3_standard_puls_musik';
  }

  // 6. Custom Texts
  let customTexts: string[] = [];
  const rawCustomTexts = rawJson.customTexts ?? rawJson.freitexte ?? rawJson.texts;
  if (Array.isArray(rawCustomTexts)) {
    customTexts = rawCustomTexts.map((s) => String(s)).filter((s) => s.trim().length > 0);
  } else if (typeof rawCustomTexts === 'string' && rawCustomTexts.trim().length > 0) {
    customTexts = rawCustomTexts.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  if (customTexts.length === 0) {
    customTexts = lang === 'de'
      ? ['Willkommen in meiner VRChat Instanz! ✨', 'Gerne ansprechen oder joinen 🎧']
      : ['Welcome to my VRChat instance! ✨', 'Feel free to follow for good vibes 🎧'];
  }

  // 7. Profile Automation Rules
  let migratedRules: ProfileAutomationRule[] = [];
  const rawRules = rawJson.profileRules ?? rawJson.automationRules ?? rawJson.rules;

  if (Array.isArray(rawRules) && rawRules.length > 0) {
    migratedRules = rawRules.map((r: any, idx: number) => {
      const cond = r.conditions || {};
      const targetId = existingIds.has(r.targetProfileId) ? r.targetProfileId : (migratedProfiles[0]?.id || 'profil_3_standard_puls_musik');

      return {
        id: String(r.id || `rule_migrated_${idx}_${Date.now()}`),
        name: String(r.name || r.title || `Regel ${idx + 1}`),
        enabled: r.enabled !== false,
        conditions: {
          heartRate: parseConditionValue(cond.heartRate ?? cond.hrActive ?? r.hrActive),
          media: parseConditionValue(cond.media ?? cond.mediaActive ?? r.mediaActive),
          afk: parseConditionValue(cond.afk ?? cond.afkActive ?? r.afkActive),
        },
        targetProfileId: targetId,
      };
    });

    summary.push(lang === 'de' ? `${migratedRules.length} Automationsregeln konvertiert & Zielprofile validiert` : `Migrated ${migratedRules.length} automation rules with verified target profiles`);
  } else {
    // Inject default automation rules
    migratedRules = [
      {
        id: 'rule_afk_priority',
        name: lang === 'de' ? 'AFK aktiv (Höchste Priorität)' : 'AFK Active (Highest Priority)',
        enabled: true,
        conditions: { heartRate: 'any', media: 'any', afk: 'true' },
        targetProfileId: 'profil_2_minimal_kein_puls_keine_medien',
      },
      {
        id: 'rule_full_hud',
        name: lang === 'de' ? 'Puls aktiv & Musik aktiv' : 'Heart Rate + Music Active',
        enabled: true,
        conditions: { heartRate: 'true', media: 'true', afk: 'false' },
        targetProfileId: 'profil_3_standard_puls_musik',
      },
      {
        id: 'rule_only_hr',
        name: lang === 'de' ? 'Nur Puls (Keine Musik)' : 'Heart Rate Only (No Music)',
        enabled: true,
        conditions: { heartRate: 'true', media: 'false', afk: 'false' },
        targetProfileId: 'profil_4_nur_puls',
      },
      {
        id: 'rule_only_media',
        name: lang === 'de' ? 'Nur Musik (Kein Puls / Signal verloren)' : 'Music Only (No Heart Rate)',
        enabled: true,
        conditions: { heartRate: 'false', media: 'true', afk: 'false' },
        targetProfileId: 'profil_1_nur_musik',
      },
      {
        id: 'rule_idle_fallback',
        name: lang === 'de' ? 'Weder Puls noch Musik (Idle)' : 'Neither Heart Rate nor Music (Idle)',
        enabled: true,
        conditions: { heartRate: 'false', media: 'false', afk: 'false' },
        targetProfileId: 'profil_2_minimal_kein_puls_keine_medien',
      },
    ];
    summary.push(lang === 'de' ? 'Standard-Regelwerk für automatischen Profilwechsel integriert' : 'Configured smart automation rules for seamless profile switching');
  }

  // 8. Security requirement: always wipe hyperateSessionId on export/migration if empty or keep safe
  const hyperateSessionId = rawJson.hyperateSessionId ? String(rawJson.hyperateSessionId) : '';
  const pulsoidToken = rawJson.pulsoidToken ? String(rawJson.pulsoidToken) : '';

  // Assemble the modern, fully typed ChatboxConfig
  const migratedConfig: ChatboxConfig = {
    language: lang,
    enabled: rawJson.enabled !== false,
    template: cleanMainTemplate,
    updateIntervalMs: rawInterval,
    playSound: Boolean(rawJson.playSound || rawJson.sound || rawJson.audio),
    bypassTypingIndicator: rawJson.bypassTypingIndicator !== false && rawJson.bypassTyping !== false,
    marqueeEnabled: Boolean(rawJson.marqueeEnabled || rawJson.marquee),
    marqueeWidth: Number(rawJson.marqueeWidth || 35),
    customStatus: rawJson.customStatus ? String(rawJson.customStatus) : '',
    oscHost: String(rawJson.oscHost || rawJson.ip || rawJson.host || '127.0.0.1'),
    oscPort: Number(rawJson.oscPort || rawJson.port || 9000),
    heartRateProvider: rawJson.heartRateProvider || rawJson.provider || 'hyperate',
    hyperateSessionId,
    hyperateRelayUrl: rawJson.hyperateRelayUrl ? String(rawJson.hyperateRelayUrl) : '',
    pulsoidToken,
    autoMediaDetection: rawJson.autoMediaDetection !== false && rawJson.mediaDetection !== false,
    mediaOnlyWhenPlaying: rawJson.mediaOnlyWhenPlaying !== false,
    customTexts,
    customTextIntervalSec: Math.max(2, Number(rawJson.customTextIntervalSec || rawJson.textInterval || 10)),
    hardwareStatsEnabled: Boolean(rawJson.hardwareStatsEnabled || rawJson.hardwareStats),
    afkEnabled: Boolean(rawJson.afkEnabled || rawJson.afk),
    afkMode,
    afkTimeoutMinutes,
    afkTemplate: cleanAfkTemplate,
    afkOverrideChatbox: rawJson.afkOverrideChatbox !== false,
    profiles: migratedProfiles,
    activeProfileId,
    profileAutomationEnabled: rawJson.profileAutomationEnabled !== false && rawJson.autoProfiles !== false,
    profileRules: migratedRules,
  };

  summary.push(lang === 'de' ? 'Vollständige Chatbox-Konfiguration auf Schema v3+ aktualisiert' : 'Configuration successfully upgraded to modern schema v3+');

  return {
    migratedConfig,
    detectedVersion,
    changesSummary: summary,
    profilesMigrated: migratedProfiles.length,
    rulesMigrated: migratedRules.length,
    legacyVariablesFixed: totalReplacedVars,
  };
}
