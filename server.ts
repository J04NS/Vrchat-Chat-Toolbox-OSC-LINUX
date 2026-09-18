import express from 'express';
import path from 'path';
import dgram from 'dgram';
import WebSocket from 'ws';
import { createServer as createViteServer } from 'vite';
import { encodeVRChatChatboxInput } from './src/lib/osc';
import { formatChatboxMessage } from './src/lib/formatter';
import { ChatboxConfig, HeartRateState, MediaState, OscLogEntry, ServerStatusResponse } from './src/types';

// Load environment variables if available
const PORT = Number(process.env.PORT) || 3000;
const HYPERATE_API_KEY = process.env.HYPERATE_API_KEY || 'gzAQUlyuM3HLpVA3G9PoMFdCRGBwkf5wwsP73J91';

// Masked representation so key is never exposed to browser or other users
const MASKED_HYPERATE_KEY = HYPERATE_API_KEY.length > 8 
  ? '•'.repeat(HYPERATE_API_KEY.length - 4) + HYPERATE_API_KEY.slice(-4)
  : '••••••••';

// Default configuration
const currentConfig: ChatboxConfig = {
  enabled: false,
  template: '[ {hr_icon} {hr} BPM ]  {music_icon} {song}  | ⏱️ {clock}',
  updateIntervalMs: 2000,
  playSound: false,
  bypassTypingIndicator: true,
  marqueeEnabled: false,
  marqueeWidth: 35,
  customStatus: '',
  oscHost: process.env.VRCHAT_OSC_HOST || '127.0.0.1',
  oscPort: Number(process.env.VRCHAT_OSC_PORT) || 9000,
  hyperateSessionId: '',
  pulsoidToken: '',
};

// Current Live State
const hrState: HeartRateState = {
  bpm: 72,
  provider: 'manual',
  connected: true,
  lastUpdated: Date.now(),
  deviceLabel: 'Simulator / Bereit',
};

const mediaState: MediaState = {
  title: 'Starboy',
  artist: 'The Weeknd',
  album: 'Starboy',
  isPlaying: true,
  positionSec: 42,
  durationSec: 230,
  sourceName: 'mpris/local',
  lastUpdated: Date.now(),
};

// OSC Stats and Logs
let packetsSentCount = 0;
let lastSentText = '';
let currentTick = 0;
const oscLogs: OscLogEntry[] = [];

function addLog(address: string, text: string, bytes: number, success: boolean, error?: string) {
  const entry: OscLogEntry = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    address,
    text,
    bytes,
    success,
    error,
  };
  oscLogs.unshift(entry);
  if (oscLogs.length > 40) {
    oscLogs.pop();
  }
}

// UDP Socket for sending OSC to VRChat
const udpSocket = dgram.createSocket('udp4');
udpSocket.on('error', (err) => {
  console.warn('[VRChat OSC] UDP Socket Warning:', err.message);
});

export function sendOscToVRChat(text: string, bypassTyping = true, playSound = false): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const packet = encodeVRChatChatboxInput(text, bypassTyping, playSound);
      const buffer = Buffer.from(packet.buffer, packet.byteOffset, packet.byteLength);

      udpSocket.send(buffer, 0, buffer.length, currentConfig.oscPort, currentConfig.oscHost, (err) => {
        if (err) {
          console.error(`[VRChat OSC] Failed sending to ${currentConfig.oscHost}:${currentConfig.oscPort}`, err.message);
          addLog('/chatbox/input', text, buffer.length, false, err.message);
          resolve(false);
        } else {
          packetsSentCount++;
          lastSentText = text;
          addLog('/chatbox/input', text, buffer.length, true);
          resolve(true);
        }
      });
    } catch (e: any) {
      addLog('/chatbox/input', text, 0, false, e.message);
      resolve(false);
    }
  });
}

// HypeRate WebSocket Manager
let hyperateWs: WebSocket | null = null;
let hyperateHeartbeatTimer: NodeJS.Timeout | null = null;

function connectHyperate(sessionId: string) {
  if (hyperateWs) {
    try {
      hyperateWs.close();
    } catch {}
    hyperateWs = null;
  }
  if (hyperateHeartbeatTimer) {
    clearInterval(hyperateHeartbeatTimer);
    hyperateHeartbeatTimer = null;
  }

  if (!sessionId || sessionId.trim().length === 0) {
    return;
  }

  const cleanSessionId = sessionId.trim().toUpperCase();
  const wsUrl = `wss://app.hyperate.io/socket/websocket?token=${HYPERATE_API_KEY}`;
  console.log(`[HypeRate] Connecting to WebSocket for Session: ${cleanSessionId}...`);

  try {
    const ws = new WebSocket(wsUrl);
    hyperateWs = ws;

    ws.on('open', () => {
      console.log(`[HypeRate] WebSocket verbunden! Trete Kanal hr:${cleanSessionId} bei...`);
      hrState.connected = true;
      hrState.deviceLabel = `HypeRate (${cleanSessionId})`;
      hrState.provider = 'hyperate';

      // Phoenix join message
      const joinMsg = JSON.stringify({
        topic: `hr:${cleanSessionId}`,
        event: 'phx_join',
        payload: {},
        ref: '1',
      });
      ws.send(joinMsg);

      // Heartbeat every 25 seconds
      hyperateHeartbeatTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              topic: 'phoenix',
              event: 'heartbeat',
              payload: {},
              ref: String(Date.now()),
            })
          );
        }
      }, 25000);
    });

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const str = data.toString();
        const json = JSON.parse(str);

        // HypeRate events
        if (json.event === 'hr_update' && json.payload && typeof json.payload.hr === 'number') {
          hrState.bpm = json.payload.hr;
          hrState.lastUpdated = Date.now();
          hrState.connected = true;
        }
      } catch {}
    });

    ws.on('error', (err) => {
      console.warn('[HypeRate] WebSocket Fehler:', err.message);
      hrState.error = err.message;
    });

    ws.on('close', () => {
      console.log('[HypeRate] WebSocket getrennt.');
      if (hyperateWs === ws) {
        hyperateWs = null;
      }
      if (currentConfig.hyperateSessionId === sessionId) {
        // Auto-reconnect after 8 seconds if still configured
        setTimeout(() => {
          if (currentConfig.hyperateSessionId === sessionId) {
            connectHyperate(sessionId);
          }
        }, 8000);
      }
    });
  } catch (err: any) {
    console.error('[HypeRate] Fehler bei Verbindungsaufbau:', err.message);
  }
}

// Background OSC Loop (sends formatted message at configured interval)
let loopTimer: NodeJS.Timeout | null = null;

function restartLoop() {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }

  if (!currentConfig.enabled) {
    return;
  }

  const interval = Math.max(1200, currentConfig.updateIntervalMs || 2000);
  loopTimer = setInterval(() => {
    currentTick++;
    const { displayText } = formatChatboxMessage(
      currentConfig.template,
      hrState,
      mediaState,
      currentConfig.customStatus,
      currentTick,
      currentConfig.marqueeEnabled,
      currentConfig.marqueeWidth
    );

    sendOscToVRChat(displayText, currentConfig.bypassTypingIndicator, currentConfig.playSound);
  }, interval);
}

// Start Server
async function startServer() {
  const app = express();
  app.use(express.json());

  // API: Get Current Status
  app.get('/api/status', (req, res) => {
    const response: ServerStatusResponse = {
      oscActive: currentConfig.enabled,
      oscTarget: {
        host: currentConfig.oscHost,
        port: currentConfig.oscPort,
      },
      serverPort: PORT,
      isLinuxMode: process.platform === 'linux',
      hasHyperateApiKey: Boolean(HYPERATE_API_KEY && HYPERATE_API_KEY.length > 5),
      hyperateKeyMasked: MASKED_HYPERATE_KEY,
      hyperateConnected: hyperateWs !== null && hyperateWs.readyState === WebSocket.OPEN,
      currentBpm: hrState.bpm,
      currentMedia: mediaState,
      lastOscText: lastSentText,
      packetsSent: packetsSentCount,
      logs: oscLogs,
    };
    res.json(response);
  });

  // API: Get Configuration
  app.get('/api/config', (req, res) => {
    res.json({
      ...currentConfig,
      hasHyperateApiKey: true,
      hyperateKeyMasked: MASKED_HYPERATE_KEY,
    });
  });

  // API: Save Configuration
  app.post('/api/config', (req, res) => {
    const prevSession = currentConfig.hyperateSessionId;
    const body = req.body as Partial<ChatboxConfig>;

    Object.assign(currentConfig, body);

    if (body.hyperateSessionId !== undefined && body.hyperateSessionId !== prevSession) {
      connectHyperate(body.hyperateSessionId);
    }

    restartLoop();
    res.json({ success: true, config: currentConfig });
  });

  // API: Update Heart Rate from Client (BLE or Manual Slider or Pulsoid)
  app.post('/api/heart-rate', (req, res) => {
    const { bpm, provider, deviceLabel, battery } = req.body;
    if (typeof bpm === 'number') {
      hrState.bpm = Math.max(0, Math.min(250, bpm));
      hrState.lastUpdated = Date.now();
      hrState.connected = true;
      if (provider) hrState.provider = provider;
      if (deviceLabel) hrState.deviceLabel = deviceLabel;
      if (battery !== undefined) hrState.battery = battery;
    }
    res.json({ success: true, hrState });
  });

  // API: Update Media (from Linux playerctl, Spotify, or Web UI)
  app.post('/api/media/now-playing', (req, res) => {
    const { title, artist, album, isPlaying, positionSec, durationSec, source } = req.body;
    if (title !== undefined) mediaState.title = String(title);
    if (artist !== undefined) mediaState.artist = String(artist);
    if (album !== undefined) mediaState.album = String(album);
    if (isPlaying !== undefined) mediaState.isPlaying = Boolean(isPlaying);
    if (positionSec !== undefined) mediaState.positionSec = Number(positionSec);
    if (durationSec !== undefined) mediaState.durationSec = Number(durationSec);
    if (source !== undefined) mediaState.sourceName = String(source);
    mediaState.lastUpdated = Date.now();

    res.json({ success: true, mediaState });
  });

  // API: Direct Manual Test Send to VRChat Chatbox
  app.post('/api/send-osc', async (req, res) => {
    const { text, bypassTyping = true, playSound = false } = req.body;
    const message = text || 'Test from VRChat OSC Hub';
    const sent = await sendOscToVRChat(message, bypassTyping, playSound);
    res.json({ success: sent, message });
  });

  // API: Clear Logs
  app.post('/api/logs/clear', (req, res) => {
    oscLogs.length = 0;
    res.json({ success: true });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`  VRChat OSC Chatbox Server running!     `);
    console.log(`  Port: http://0.0.0.0:${PORT}           `);
    console.log(`  Target VRChat: ${currentConfig.oscHost}:${currentConfig.oscPort}`);
    console.log(`  HypeRate Key: ${MASKED_HYPERATE_KEY} (gesichert)`);
    console.log(`=========================================`);
  });
}

startServer();
