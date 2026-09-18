export type HeartRateProvider = 'hyperate' | 'pulsoid' | 'bluetooth' | 'manual';

export interface HeartRateState {
  bpm: number;
  provider: HeartRateProvider;
  connected: boolean;
  lastUpdated: number;
  battery?: number;
  deviceLabel?: string;
  error?: string;
}

export interface MediaState {
  title: string;
  artist: string;
  album?: string;
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  sourceName: string; // 'mpris' | 'browser' | 'spotify' | 'manual'
  lastUpdated: number;
}

export interface ChatboxConfig {
  enabled: boolean;
  template: string;
  updateIntervalMs: number;
  playSound: boolean;
  bypassTypingIndicator: boolean;
  marqueeEnabled: boolean;
  marqueeWidth: number;
  customStatus: string;
  oscHost: string;
  oscPort: number;
  hyperateSessionId: string;
  pulsoidToken: string;
}

export interface OscLogEntry {
  id: string;
  timestamp: string;
  address: string;
  text: string;
  bytes: number;
  success: boolean;
  error?: string;
}

export interface ServerStatusResponse {
  oscActive: boolean;
  oscTarget: {
    host: string;
    port: number;
  };
  serverPort: number;
  isLinuxMode: boolean;
  hasHyperateApiKey: boolean;
  hyperateKeyMasked: string;
  hyperateConnected: boolean;
  currentBpm: number;
  currentMedia: MediaState;
  lastOscText: string;
  packetsSent: number;
  logs: OscLogEntry[];
}
