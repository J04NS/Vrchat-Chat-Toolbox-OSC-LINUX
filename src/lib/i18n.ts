export type AppLanguage = 'en' | 'de';

export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    close: string;
    active: string;
    paused: string;
    connected: string;
    disconnected: string;
    error: string;
    optional: string;
    seconds: string;
    minutes: string;
    settingsSaved: string;
    loading: string;
  };
  header: {
    title: string;
    subtitle: string;
    badgeLinux: string;
    badgeWeb: string;
    linuxGuide: string;
    oscActive: string;
    oscStopped: string;
    langSelect: string;
  };
  preview: {
    title: string;
    subtitle: string;
    liveSending: string;
    paused: string;
    afkMode: string;
    sendNow: string;
    chatboxBadge: string;
    soundOn: string;
    soundOff: string;
    directSendOn: string;
    charsCount: string;
    overflowWarning: string;
    updateInterval: string;
    marqueeActive: string;
    staticText: string;
  };
  chatbox: {
    title: string;
    subtitle: string;
    startBroadcast: string;
    stopBroadcast: string;
    profilesTitle: string;
    profilesAvailable: string;
    saveAsProfile: string;
    closeProfileForm: string;
    resetProfiles: string;
    resetProfilesTooltip: string;
    saveCurrentModalTitle: string;
    profileNamePlaceholder: string;
    profileDescPlaceholder: string;
    profileTemplateLabel: string;
    saveProfileBtn: string;
    activeProfileBadge: string;
    autoActiveBadge: string;
    automationActiveBanner: string;
    deleteProfileTooltip: string;
    activeChatboxText: string;
    adoptToProfile: string;
    clickableVariables: string;
    variables: {
      hr: string;
      hrIcon: string;
      song: string;
      cpu: string;
      ram: string;
      hw: string;
      afkTime: string;
      freitext: string;
      clock: string;
      newline: string;
    };
    sendInterval: string;
    bypassTyping: string;
    profileLoadedNotice: string;
    profileSavedNotice: string;
    profileDeletedNotice: string;
    profilesResetNotice: string;
    profileAdoptedNotice: string;
  };
  heartRate: {
    title: string;
    subtitle: string;
    liveRate: string;
    noBpm: string;
    zones: {
      resting: string;
      normal: string;
      elevated: string;
      high: string;
      max: string;
    };
    tabs: {
      hyperate: string;
      pulsoid: string;
      ble: string;
      sim: string;
      manual: string;
    };
    hyperate: {
      sessionLabel: string;
      sessionPlaceholder: string;
      connectBtn: string;
      disconnectBtn: string;
      connecting: string;
      statusLabel: string;
      statusConnected: string;
      statusConnecting: string;
      statusDisconnected: string;
      description: string;
      guide: string;
      relayServerLabel: string;
      relayPlaceholder: string;
      relayNotice: string;
      upstreamConnected: string;
      upstreamConnecting: string;
      appHint: string;
    };
    pulsoid: {
      tokenLabel: string;
      connectBtn: string;
      disconnectBtn: string;
      hint: string;
      statusConnected: string;
      statusConnecting: string;
      noTokenEntered: string;
      tokenPlaceholder: string;
      tokenHelp: string;
      tokenLink: string;
      savedNotification: string;
    };
    ble: {
      title: string;
      desc: string;
      connectBtn: string;
      disconnectBtn: string;
    };
    sim: {
      title: string;
      sliderLabel: string;
      startBtn: string;
      stopBtn: string;
    };
    manual: {
      title: string;
      inputLabel: string;
      setBtn: string;
    };
  };
  media: {
    title: string;
    subtitle: string;
    playerctlActive: string;
    playerctlInactive: string;
    nowPlaying: string;
    stopped: string;
    noMedia: string;
    titleLabel: string;
    artistLabel: string;
    albumLabel: string;
    sourceLabel: string;
    autoDetectToggle: string;
    onlyWhenPlayingToggle: string;
    manualHeading: string;
    saveMediaBtn: string;
    clearMediaBtn: string;
  };
  hardware: {
    title: string;
    subtitle: string;
    toggleEnable: string;
    cpu: string;
    ram: string;
    gpu: string;
    temp: string;
    statsActive: string;
    statsDisabled: string;
  };
  afk: {
    title: string;
    subtitle: string;
    isAfk: string;
    isOnline: string;
    afkActive: string;
    onlineActive: string;
    timeoutLabel: string;
    timeoutMinutes: string;
    customTemplateLabel: string;
    overrideChatboxLabel: string;
    overrideChatboxDesc: string;
    placeholderTemplate: string;
  };
  customTexts: {
    title: string;
    subtitle: string;
    activeCount: string;
    addTextBtn: string;
    intervalLabel: string;
    variableHint: string;
    inputPlaceholder: string;
    activeNowBadge: string;
  };
  oscNetwork: {
    title: string;
    subtitle: string;
    targetAddress: string;
    port: string;
    updateTargetBtn: string;
    sendTestBtn: string;
    clearLogsBtn: string;
    logsTitle: string;
    packetsSent: string;
    noLogsYet: string;
    logsClearedNotice: string;
    testPacketSentNotice: string;
  };
  linuxModal: {
    title: string;
    subtitle: string;
    closeBtn: string;
    tabs: {
      quickstart: string;
      steamdeck: string;
      systemd: string;
      playerctl: string;
    };
  };
  notifications: {
    oscStarted: string;
    oscStopped: string;
    configSaved: string;
  };
  profileAutomation: {
    title: string;
    subtitle: string;
    masterToggle: string;
    activeStatus: string;
    pausedStatus: string;
    currentRuleBanner: string;
    noRuleMatchedBanner: string;
    liveState: string;
    liveHrActive: string;
    liveHrInactive: string;
    liveMediaPlaying: string;
    liveMediaStopped: string;
    liveAfkYes: string;
    liveAfkNo: string;
    addRuleBtn: string;
    saveRuleBtn: string;
    cancelBtn: string;
    newRuleTitle: string;
    editRuleTitle: string;
    ruleNameLabel: string;
    ruleNamePlaceholder: string;
    conditionHrLabel: string;
    conditionMediaLabel: string;
    conditionAfkLabel: string;
    optTrue: string;
    optFalse: string;
    optAny: string;
    targetProfileLabel: string;
    rulesListTitle: string;
    noRulesYet: string;
    ruleMatchedNow: string;
    deleteTooltip: string;
    editTooltip: string;
    moveUpTooltip: string;
    moveDownTooltip: string;
    resetDefaultRulesBtn: string;
    resetNotice: string;
    savedNotice: string;
  };
}

export const translations: Record<AppLanguage, Translations> = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      close: 'Close',
      active: 'Active',
      paused: 'Paused',
      connected: 'Connected',
      disconnected: 'Disconnected',
      error: 'Error',
      optional: 'Optional',
      seconds: 's',
      minutes: 'min',
      settingsSaved: 'Settings saved',
      loading: 'Loading...',
    },
    header: {
      title: 'VRChat OSC Chatbox Hub',
      subtitle: 'Heart Rate, Media Player & Hardware Monitor for VRChat',
      badgeLinux: 'Linux / Steam Deck',
      badgeWeb: 'Standalone Web Mode',
      linuxGuide: 'Linux & Steam Deck Guide',
      oscActive: 'OSC Broadcasting Active',
      oscStopped: 'OSC Broadcasting Stopped',
      langSelect: 'Language',
    },
    preview: {
      title: 'VRChat Chatbox Live Preview',
      subtitle: 'Real-time rendering of how your text appears over your avatar in VRChat',
      liveSending: 'Broadcasting Live',
      paused: 'Paused',
      afkMode: 'AFK Mode',
      sendNow: 'Send Now',
      chatboxBadge: 'CHATBOX',
      soundOn: 'Sound On',
      soundOff: 'Muted',
      directSendOn: 'Bypass Typing',
      charsCount: 'chars',
      overflowWarning: 'Text exceeds the VRChat limit (144 characters) and will be cut off in game. Enable marquee ticker or shorten the message.',
      updateInterval: 'Broadcast interval',
      marqueeActive: '↔️ Marquee Ticker Active',
      staticText: '⏹️ Static Message',
    },
    chatbox: {
      title: 'Chatbox Format & Profiles',
      subtitle: 'Templates, presets, and transmission controls for VRChat',
      startBroadcast: 'Start Broadcasting',
      stopBroadcast: 'Stop Broadcasting',
      profilesTitle: 'Profiles / Presets',
      profilesAvailable: 'available',
      saveAsProfile: 'Save as Preset',
      closeProfileForm: 'Close',
      resetProfiles: 'Reset to Defaults',
      resetProfilesTooltip: 'Restore standard factory profiles',
      saveCurrentModalTitle: 'Save current template as a new profile',
      profileNamePlaceholder: 'e.g. Profile: Party Mode or Music Only...',
      profileDescPlaceholder: 'Optional description (e.g. Clean layout without heart rate)',
      profileTemplateLabel: 'Template',
      saveProfileBtn: 'Save Profile',
      activeProfileBadge: 'Active',
      autoActiveBadge: 'Auto Active',
      automationActiveBanner: 'Profile Automation is active. Profiles switch automatically based on Heart Rate, Music, and AFK status.',
      deleteProfileTooltip: 'Delete profile',
      activeChatboxText: 'Active Chatbox Template',
      adoptToProfile: 'Save to active profile',
      clickableVariables: 'Clickable Variables',
      variables: {
        hr: 'Heart Rate',
        hrIcon: 'Animated Heart',
        song: 'Song & Artist',
        cpu: 'CPU %',
        ram: 'RAM %',
        hw: 'Hardware HUD',
        afkTime: 'AFK Duration',
        freitext: 'Rotating Text',
        clock: 'Clock (HH:MM)',
        newline: 'Line Break',
      },
      sendInterval: 'Broadcast Interval',
      bypassTyping: 'Display Instantly (Bypass Typing Indicator)',
      profileLoadedNotice: 'Loaded profile',
      profileSavedNotice: 'Profile saved successfully!',
      profileDeletedNotice: 'Profile deleted',
      profilesResetNotice: 'Default profiles restored',
      profileAdoptedNotice: 'Changes saved to active profile',
    },
    heartRate: {
      title: 'Heart Rate & Sensors',
      subtitle: 'HypeRate, Pulsoid, Bluetooth LE or Simulated Heart Rate',
      liveRate: 'Live Heart Rate',
      noBpm: 'No Signal',
      zones: {
        resting: 'Resting',
        normal: 'Normal',
        elevated: 'Elevated',
        high: 'High',
        max: 'Peak',
      },
      tabs: {
        hyperate: 'HypeRate',
        pulsoid: 'Pulsoid',
        ble: 'Bluetooth LE',
        sim: 'Simulated',
        manual: 'Manual',
      },
      hyperate: {
        sessionLabel: 'HypeRate Session ID',
        sessionPlaceholder: 'Enter your 4-6 char Session ID (e.g. ABCD)',
        connectBtn: 'Connect Session',
        disconnectBtn: 'Disconnect',
        connecting: 'Connecting...',
        statusLabel: 'Status:',
        statusConnected: 'Connected',
        statusConnecting: 'Connecting to HypeRate...',
        statusDisconnected: 'Disconnected',
        description: 'Real-time heart rate via HypeRate Cloud (Apple Watch, WearOS, Garmin, FitBit).',
        guide: 'Start the HypeRate app on your phone/watch, copy your Session ID, and connect above.',
        relayServerLabel: 'Pelikan Relay Server Configuration (Optional)',
        relayPlaceholder: 'Default: ws://164.30.71.45:7871',
        relayNotice: 'Connects by default to the Pelikan Relay at ws://164.30.71.45:7871.',
        upstreamConnected: 'Relay Connected',
        upstreamConnecting: 'Connecting to Relay...',
        appHint: 'Open HypeRate on your phone or smartwatch, check your Session ID, and paste it here.',
      },
      pulsoid: {
        tokenLabel: 'Pulsoid Feed Token / URL',
        connectBtn: 'Connect Pulsoid',
        disconnectBtn: 'Disconnect',
        hint: 'Paste your Pulsoid Access Token or your Widget / Feed URL.',
        statusConnected: 'Connected (Pulsoid Feed Active)',
        statusConnecting: 'Connecting to Pulsoid Feed...',
        noTokenEntered: 'No Pulsoid token entered',
        tokenPlaceholder: 'Paste Pulsoid Access Token or Feed URL...',
        tokenHelp: 'You can generate an Access Token at pulsoid.net/ui/keys or paste your widget link.',
        tokenLink: 'Open pulsoid.net/ui/keys',
        savedNotification: 'Pulsoid token saved & feed activated!',
      },
      ble: {
        title: 'Bluetooth Low Energy (Web Bluetooth)',
        desc: 'Connect directly to heart rate straps (Polar H10, Garmin HRM, etc.) via browser Bluetooth.',
        connectBtn: 'Scan for Heart Rate Sensor',
        disconnectBtn: 'Disconnect Bluetooth',
      },
      sim: {
        title: 'Heart Rate Simulator',
        sliderLabel: 'Target BPM',
        startBtn: 'Start Simulator',
        stopBtn: 'Stop Simulator',
      },
      manual: {
        title: 'Manual Heart Rate',
        inputLabel: 'Set Static BPM',
        setBtn: 'Apply BPM',
      },
    },
    media: {
      title: 'Media Player & Music',
      subtitle: 'Spotify, VLC, YouTube & Browser Detection via Playerctl / MPRIS',
      playerctlActive: 'Linux MPRIS / Playerctl Active',
      playerctlInactive: 'Manual / Standalone Mode',
      nowPlaying: 'Now Playing',
      stopped: 'Playback Stopped',
      noMedia: 'No track detected',
      titleLabel: 'Track Title',
      artistLabel: 'Artist',
      albumLabel: 'Album',
      sourceLabel: 'Player Source',
      autoDetectToggle: 'Auto-detect Linux players (Playerctl / MPRIS)',
      onlyWhenPlayingToggle: 'Only show track in Chatbox when music is actively playing',
      manualHeading: 'Manual Media Input',
      saveMediaBtn: 'Apply Track',
      clearMediaBtn: 'Clear Track',
    },
    hardware: {
      title: 'Hardware Monitor',
      subtitle: 'Live CPU, RAM, GPU utilization and temperatures for VRChat HUD',
      toggleEnable: 'Transmit hardware statistics in Chatbox ({cpu}, {ram}, {hw})',
      cpu: 'CPU Usage',
      ram: 'RAM Usage',
      gpu: 'GPU Usage',
      temp: 'Temperature',
      statsActive: 'Hardware telemetry streaming active',
      statsDisabled: 'Hardware telemetry disabled',
    },
    afk: {
      title: 'AFK & Inactivity Detection',
      subtitle: 'Automatic AFK status display via VRChat OSC parameters and idle timers',
      isAfk: 'AFK (Away From Keyboard)',
      isOnline: 'Active / In VRChat',
      afkActive: 'AFK Mode Active',
      onlineActive: 'Player Active',
      timeoutLabel: 'Idle Inactivity Threshold',
      timeoutMinutes: 'minutes of inactivity',
      customTemplateLabel: 'AFK Chatbox Message Template',
      overrideChatboxLabel: 'Override normal Chatbox while AFK',
      overrideChatboxDesc: 'Temporarily replaces your heart rate and song text with your AFK banner while you are away.',
      placeholderTemplate: '💤 AFK [{afk_time}] - Back soon! 💤',
    },
    customTexts: {
      title: 'Rotating Custom Texts',
      subtitle: 'Cycle custom status messages, social links, or greetings into your Chatbox',
      activeCount: 'active messages',
      addTextBtn: 'Add Message',
      intervalLabel: 'Rotation Interval (seconds)',
      variableHint: 'Use the variable {freitext} in your Chatbox template to cycle through these messages.',
      inputPlaceholder: 'Type custom message here...',
      activeNowBadge: 'Displaying Now',
    },
    oscNetwork: {
      title: 'VRChat OSC Connection & Network',
      subtitle: 'UDP target parameters and live OSC debug transmission log',
      targetAddress: 'Target IP Address',
      port: 'Target UDP Port',
      updateTargetBtn: 'Update Target',
      sendTestBtn: 'Send Test Packet',
      clearLogsBtn: 'Clear Logs',
      logsTitle: 'OSC Packet Log',
      packetsSent: 'Packets Sent',
      noLogsYet: 'No OSC packets transmitted yet.',
      logsClearedNotice: 'Logs cleared',
      testPacketSentNotice: 'Test packet sent to VRChat!',
    },
    linuxModal: {
      title: 'Linux & Steam Deck Setup Guide',
      subtitle: 'How to run VRChat OSC Hub smoothly on SteamOS, Arch, Ubuntu, and Fedora',
      closeBtn: 'Close Guide',
      tabs: {
        quickstart: 'Quickstart',
        steamdeck: 'Steam Deck / SteamOS',
        systemd: 'Autostart / Systemd',
        playerctl: 'Spotify & Media (Playerctl)',
      },
    },
    notifications: {
      oscStarted: 'OSC Broadcasting Started',
      oscStopped: 'OSC Broadcasting Stopped',
      configSaved: 'Settings saved',
    },
    profileAutomation: {
      title: 'Profile Automation (Condition Rules)',
      subtitle: 'Automatically switch profiles based on live Heart Rate, Media and AFK conditions',
      masterToggle: 'Enable Automation',
      activeStatus: 'Automation Active',
      pausedStatus: 'Automation Paused (Manual Selection)',
      currentRuleBanner: 'Active Rule',
      noRuleMatchedBanner: 'No matching rule (Fallback profile active)',
      liveState: 'Live Telemetry State',
      liveHrActive: 'HR Active (>0 BPM)',
      liveHrInactive: 'HR Inactive (0 BPM)',
      liveMediaPlaying: 'Music Playing',
      liveMediaStopped: 'Music Stopped',
      liveAfkYes: 'AFK Active',
      liveAfkNo: 'Not AFK (Active)',
      addRuleBtn: 'Add Condition Rule',
      saveRuleBtn: 'Save Rule',
      cancelBtn: 'Cancel',
      newRuleTitle: 'Create New Condition Rule',
      editRuleTitle: 'Edit Condition Rule',
      ruleNameLabel: 'Rule Name / Description',
      ruleNamePlaceholder: 'e.g. When Heart Rate = false & Music = true',
      conditionHrLabel: 'Heart Rate Condition (HR)',
      conditionMediaLabel: 'Music / Media Condition',
      conditionAfkLabel: 'AFK Detection Condition',
      optTrue: 'True (Active)',
      optFalse: 'False (Inactive / Off)',
      optAny: 'Any / Don\'t Care (*)',
      targetProfileLabel: 'Switch to Profile',
      rulesListTitle: 'Configured Rules (Top-down Priority)',
      noRulesYet: 'No automation rules defined yet. Create one or restore defaults.',
      ruleMatchedNow: 'MATCHING NOW',
      deleteTooltip: 'Delete Rule',
      editTooltip: 'Edit Rule',
      moveUpTooltip: 'Move Up (Higher Priority)',
      moveDownTooltip: 'Move Down (Lower Priority)',
      resetDefaultRulesBtn: 'Restore Default Rules',
      resetNotice: 'Default automation rules restored!',
      savedNotice: 'Automation rules saved!',
    },
  },
  de: {
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      close: 'Schließen',
      active: 'Aktiv',
      paused: 'Pausiert',
      connected: 'Verbunden',
      disconnected: 'Getrennt',
      error: 'Fehler',
      optional: 'Optional',
      seconds: 's',
      minutes: 'Min.',
      settingsSaved: 'Einstellungen gespeichert',
      loading: 'Lädt...',
    },
    header: {
      title: 'VRChat OSC Chatbox Hub',
      subtitle: 'Puls, Mediaplayer & Hardware-Monitor für VRChat',
      badgeLinux: 'Linux / Steam Deck',
      badgeWeb: 'Web-Modus',
      linuxGuide: 'Linux & Steam Deck Anleitung',
      oscActive: 'OSC-Senden Aktiv',
      oscStopped: 'OSC-Senden Gestoppt',
      langSelect: 'Sprache',
    },
    preview: {
      title: 'VRChat Chatbox Live-Vorschau',
      subtitle: 'So wird dein Text in VRChat über deinem Avatar angezeigt',
      liveSending: 'Aktiv am Senden',
      paused: 'Pausiert',
      afkMode: 'AFK Modus',
      sendNow: 'Jetzt senden',
      chatboxBadge: 'CHATBOX',
      soundOn: 'Sound an',
      soundOff: 'Stumm',
      directSendOn: 'Bypass Typing',
      charsCount: 'Zeichen',
      overflowWarning: 'Der Text überschreitet das VRChat-Limit (144 Zeichen) und wird im Chat abgeschnitten. Aktiviere Marquee-Laufschrift oder kürze den Text.',
      updateInterval: 'Aktualisierungsintervall',
      marqueeActive: '↔️ Laufschrift aktiv',
      staticText: '⏹️ Statischer Text',
    },
    chatbox: {
      title: 'Chatbox Format & Profile',
      subtitle: 'Formatvorlagen & Sendestatus an VRChat',
      startBroadcast: 'Senden starten',
      stopBroadcast: 'Senden stoppen',
      profilesTitle: 'Profile / Formatvorlagen',
      profilesAvailable: 'verfügbar',
      saveAsProfile: 'Als Profil speichern',
      closeProfileForm: 'Schließen',
      resetProfiles: 'Standard-Profile wiederherstellen',
      resetProfilesTooltip: 'Standard-Profile zurücksetzen',
      saveCurrentModalTitle: 'Aktuelle Vorlage als neues Profil sichern',
      profileNamePlaceholder: 'z.B. Profil: Party-Modus oder Nur Musik...',
      profileDescPlaceholder: 'Optionale Beschreibung (z.B. Nur Musik ohne Herzschlag)',
      profileTemplateLabel: 'Vorlage',
      saveProfileBtn: 'Profil speichern',
      activeProfileBadge: 'Aktiv',
      autoActiveBadge: 'Automatisch aktiv',
      automationActiveBanner: 'Profil-Automation ist aktiv: Profile wechseln vollautomatisch anhand von Puls, Musik und AFK.',
      deleteProfileTooltip: 'Profil löschen',
      activeChatboxText: 'Aktiver Chatbox-Text',
      adoptToProfile: 'In aktives Profil übernehmen',
      clickableVariables: 'Klickbare Variablen',
      variables: {
        hr: 'Puls',
        hrIcon: 'Animiertes Herz',
        song: 'Titel & Interpret',
        cpu: 'CPU %',
        ram: 'RAM %',
        hw: 'Hardware Kompakt',
        afkTime: 'AFK Dauer',
        freitext: 'Rotierender Text',
        clock: 'Uhrzeit (HH:MM)',
        newline: 'Neue Zeile',
      },
      sendInterval: 'Sende-Intervall',
      bypassTyping: 'Direkt anzeigen (Bypass Typing Indicator)',
      profileLoadedNotice: 'Geladenes Profil',
      profileSavedNotice: 'Profil erfolgreich gespeichert!',
      profileDeletedNotice: 'Profil gelöscht',
      profilesResetNotice: 'Standard-Profile wiederhergestellt',
      profileAdoptedNotice: 'Änderungen in aktivem Profil gespeichert',
    },
    heartRate: {
      title: 'Herzfrequenz & Sensoren',
      subtitle: 'HypeRate, Pulsoid, Bluetooth LE oder Simulierter Puls',
      liveRate: 'Live-Herzfrequenz',
      noBpm: 'Kein Signal',
      zones: {
        resting: 'Ruhepuls',
        normal: 'Normal',
        elevated: 'Erhöht',
        high: 'Sehr hoch',
        max: 'Maximal',
      },
      tabs: {
        hyperate: 'HypeRate',
        pulsoid: 'Pulsoid',
        ble: 'Bluetooth LE',
        sim: 'Simuliert',
        manual: 'Manuell',
      },
      hyperate: {
        sessionLabel: 'HypeRate Session-ID',
        sessionPlaceholder: 'Gib deine 4-6 stellige Session-ID ein (z.B. ABCD)',
        connectBtn: 'Verbinden',
        disconnectBtn: 'Trennen',
        connecting: 'Verbinde...',
        statusLabel: 'Status:',
        statusConnected: 'Verbunden',
        statusConnecting: 'Verbinde mit HypeRate...',
        statusDisconnected: 'Nicht verbunden',
        description: 'Echtzeit-Herzfrequenz via HypeRate Cloud (Apple Watch, WearOS, Garmin, FitBit).',
        guide: 'Starte HypeRate auf Handy/Watch, kopiere deine Session-ID und verbinde sie oben.',
        relayServerLabel: 'Pelikan Relay-Server Einstellung (Optional)',
        relayPlaceholder: 'Standard: ws://164.30.71.45:7871',
        relayNotice: 'Verbindet standardmäßig mit deinem Pelikan Server unter ws://164.30.71.45:7871.',
        upstreamConnected: 'Relay verbunden',
        upstreamConnecting: 'Verbinde mit Relay...',
        appHint: 'Öffne HypeRate auf deinem Smartphone oder deiner Smartwatch, lies deine Session-ID ab und trage sie hier ein.',
      },
      pulsoid: {
        tokenLabel: 'Pulsoid Feed Token / URL',
        connectBtn: 'Pulsoid verbinden',
        disconnectBtn: 'Trennen',
        hint: 'Gib dein Pulsoid Access Token oder deine Widget- / Feed-URL ein.',
        statusConnected: 'Verbunden (Pulsoid Feed aktiv)',
        statusConnecting: 'Verbinde mit Pulsoid...',
        noTokenEntered: 'Kein Pulsoid Token eingetragen',
        tokenPlaceholder: 'Pulsoid Token oder Feed-URL einfügen...',
        tokenHelp: 'Du kannst unter pulsoid.net/ui/keys ein Access Token erstellen oder deine Widget-URL einfügen.',
        tokenLink: 'pulsoid.net/ui/keys öffnen',
        savedNotification: 'Pulsoid Token gespeichert & Feed aktiviert!',
      },
      ble: {
        title: 'Bluetooth Low Energy (Web Bluetooth)',
        desc: 'Verbinde dich direkt im Browser mit Brustgurten (Polar H10, Garmin HRM etc.).',
        connectBtn: 'Nach Pulssensor suchen',
        disconnectBtn: 'Bluetooth trennen',
      },
      sim: {
        title: 'Puls-Simulator',
        sliderLabel: 'Ziel-Puls (BPM)',
        startBtn: 'Simulator starten',
        stopBtn: 'Simulator stoppen',
      },
      manual: {
        title: 'Manueller Puls',
        inputLabel: 'Statischen BPM-Wert festlegen',
        setBtn: 'Wert anwenden',
      },
    },
    media: {
      title: 'Mediaplayer & Musik',
      subtitle: 'Spotify, VLC, YouTube & Browser Erkennung via Playerctl / MPRIS',
      playerctlActive: 'Linux MPRIS / Playerctl Aktiv',
      playerctlInactive: 'Manueller / Standalone Modus',
      nowPlaying: 'Aktueller Titel',
      stopped: 'Wiedergabe pausiert',
      noMedia: 'Kein Titel erkannt',
      titleLabel: 'Songtitel',
      artistLabel: 'Interpret',
      albumLabel: 'Album',
      sourceLabel: 'Player-Quelle',
      autoDetectToggle: 'Automatische Linux-Erkennung (Playerctl / MPRIS)',
      onlyWhenPlayingToggle: 'Song nur anzeigen, wenn Musik aktiv abgespielt wird',
      manualHeading: 'Manuelle Medien-Eingabe',
      saveMediaBtn: 'Titel anwenden',
      clearMediaBtn: 'Titel leeren',
    },
    hardware: {
      title: 'Hardware-Monitor',
      subtitle: 'Live CPU-, RAM-, GPU-Auslastung und Temperaturen für das VRChat HUD',
      toggleEnable: 'Hardware-Werte in der Chatbox übertragen ({cpu}, {ram}, {hw})',
      cpu: 'CPU-Auslastung',
      ram: 'RAM-Auslastung',
      gpu: 'GPU-Auslastung',
      temp: 'Temperatur',
      statsActive: 'Hardware-Telemetrie aktiv',
      statsDisabled: 'Hardware-Telemetrie deaktiviert',
    },
    afk: {
      title: 'AFK- & Inaktivitäts-Erkennung',
      subtitle: 'Automatische AFK-Anzeige via VRChat OSC Parameter und Ruhe-Timer',
      isAfk: 'AFK (Nicht am Platz)',
      isOnline: 'Aktiv / In VRChat',
      afkActive: 'AFK Modus Aktiv',
      onlineActive: 'Spieler Aktiv',
      timeoutLabel: 'Inaktivitäts-Schwelle',
      timeoutMinutes: 'Minuten Inaktivität',
      customTemplateLabel: 'AFK Chatbox-Nachrichtenvorlage',
      overrideChatboxLabel: 'Normale Chatbox während AFK überschreiben',
      overrideChatboxDesc: 'Ersetzt vorübergehend Puls und Musik mit deinem AFK-Banner, solange du abwesend bist.',
      placeholderTemplate: '💤 AFK [{afk_time}] - Gleich wieder da! 💤',
    },
    customTexts: {
      title: 'Rotierende Freitexte',
      subtitle: 'Wechsle eigene Statusmeldungen, Socials oder Grüße in deiner Chatbox durch',
      activeCount: 'aktive Texte',
      addTextBtn: 'Text hinzufügen',
      intervalLabel: 'Wechsel-Intervall (Sekunden)',
      variableHint: 'Verwende die Variable {freitext} in deiner Chatbox-Vorlage, um diese Texte durchzuwechseln.',
      inputPlaceholder: 'Eigener Text hier eingeben...',
      activeNowBadge: 'Wird gerade angezeigt',
    },
    oscNetwork: {
      title: 'VRChat OSC-Verbindung & Netzwerk',
      subtitle: 'UDP-Zielparameter und Live-Übertragungsprotokoll',
      targetAddress: 'Ziel IP-Adresse',
      port: 'Ziel UDP-Port',
      updateTargetBtn: 'Ziel aktualisieren',
      sendTestBtn: 'Test-Paket senden',
      clearLogsBtn: 'Logs leeren',
      logsTitle: 'OSC Protokoll',
      packetsSent: 'Pakete gesendet',
      noLogsYet: 'Noch keine OSC-Pakete gesendet.',
      logsClearedNotice: 'Logs geleert',
      testPacketSentNotice: 'Test-Paket an VRChat gesendet!',
    },
    linuxModal: {
      title: 'Linux & Steam Deck Einrichtungs-Guide',
      subtitle: 'VRChat OSC Hub optimal unter SteamOS, Arch, Ubuntu und Fedora betreiben',
      closeBtn: 'Anleitung schließen',
      tabs: {
        quickstart: 'Schnellstart',
        steamdeck: 'Steam Deck / SteamOS',
        systemd: 'Autostart / Systemd',
        playerctl: 'Spotify & Medien (Playerctl)',
      },
    },
    notifications: {
      oscStarted: 'OSC-Senden gestartet',
      oscStopped: 'OSC-Senden gestoppt',
      configSaved: 'Einstellungen gespeichert',
    },
    profileAutomation: {
      title: 'Profil-Automation (Regelbasierter Wechsel)',
      subtitle: 'Automatischer Profilwechsel basierend auf Live-Bedingungen (Puls, Musik, AFK)',
      masterToggle: 'Automation aktivieren',
      activeStatus: 'Automation aktiv',
      pausedStatus: 'Automation pausiert (Manuelle Profilwahl aktiv)',
      currentRuleBanner: 'Aktive Regel',
      noRuleMatchedBanner: 'Keine Regel trifft zu (Standard-Profil aktiv)',
      liveState: 'Aktuelle Live-Bedingungen',
      liveHrActive: 'Puls aktiv (>0 BPM)',
      liveHrInactive: 'Puls inaktiv (0 BPM)',
      liveMediaPlaying: 'Musik spielt',
      liveMediaStopped: 'Musik gestoppt',
      liveAfkYes: 'AFK aktiv',
      liveAfkNo: 'Nicht AFK (Aktiv)',
      addRuleBtn: 'Bedingungs-Regel hinzufügen',
      saveRuleBtn: 'Regel speichern',
      cancelBtn: 'Abbrechen',
      newRuleTitle: 'Neue Bedingungs-Regel erstellen',
      editRuleTitle: 'Bedingungs-Regel bearbeiten',
      ruleNameLabel: 'Regel-Name / Beschreibung',
      ruleNamePlaceholder: 'z.B. Wenn Puls=false und Musik=true',
      conditionHrLabel: 'Bedingung für Puls (Herzfrequenz)',
      conditionMediaLabel: 'Bedingung für Musik / Medien',
      conditionAfkLabel: 'Bedingung für AFK-Status',
      optTrue: 'Ja (true / aktiv)',
      optFalse: 'Nein (false / inaktiv)',
      optAny: 'Egal (beliebig / *)',
      targetProfileLabel: 'Wechsle zu Profil',
      rulesListTitle: 'Definierte Regeln (Priorität von oben nach unten)',
      noRulesYet: 'Noch keine Regeln eingerichtet. Erstelle eine eigene oder lade die Standard-Regeln.',
      ruleMatchedNow: 'GREIFT GERADE',
      deleteTooltip: 'Regel löschen',
      editTooltip: 'Regel bearbeiten',
      moveUpTooltip: 'Nach oben (höhere Priorität)',
      moveDownTooltip: 'Nach unten (niedrigere Priorität)',
      resetDefaultRulesBtn: 'Standard-Regeln wiederherstellen',
      resetNotice: 'Standard-Regeln wurden wiederhergestellt!',
      savedNotice: 'Regeln erfolgreich gespeichert!',
    },
  },
};
