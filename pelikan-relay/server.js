const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const PORT = Number(process.env.PORT || process.env.SERVER_PORT) || 8080;
const HYPERATE_API_KEY = process.env.HYPERATE_API_KEY ? process.env.HYPERATE_API_KEY.trim() : '';
const RELAY_SECRET = process.env.RELAY_SECRET ? process.env.RELAY_SECRET.trim() : '';

// Security limits
const MAX_CLIENTS_TOTAL = 200; // Maximale gleichzeitige Verbindungen
const MAX_CLIENTS_PER_IP = 10;  // Schutz gegen IP-Spamming
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_MIN = 30;

if (!HYPERATE_API_KEY) {
  console.error('[Relay ERROR] Kein HYPERATE_API_KEY in Umgebungsvariablen oder .env gefunden!');
  console.error('[Relay ERROR] Bitte HYPERATE_API_KEY in Pelikan/Pterodactyl als Environment Variable eintragen.');
  process.exit(1);
}

// IP-Tracking for rate-limiting
const ipConnections = new Map();
const ipRequestCounts = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + RATE_LIMIT_WINDOW_MS;
    ipRequestCounts.set(ip, entry);
    return false;
  }
  entry.count++;
  ipRequestCounts.set(ip, entry);
  return entry.count > MAX_REQUESTS_PER_MIN;
}

// Pool of Upstream Connections: Multiple clients with the same session share 1 HypeRate upstream socket
// This protects your HypeRate API limits completely!
const upstreamPool = new Map(); // sessionId -> { ws, clients: Set<WebSocket>, heartbeat, ping, refCount }

function getOrCreateUpstream(sessionId) {
  if (upstreamPool.has(sessionId)) {
    return upstreamPool.get(sessionId);
  }

  const poolEntry = {
    sessionId,
    ws: null,
    clients: new Set(),
    heartbeatTimer: null,
    pingTimer: null,
    lastBpm: null,
  };

  const targetUrl = `wss://app.hyperate.io/socket/websocket?token=${encodeURIComponent(HYPERATE_API_KEY)}`;
  const ws = new WebSocket(targetUrl);
  poolEntry.ws = ws;

  ws.on('open', () => {
    // Join channel
    ws.send(JSON.stringify({
      topic: `hr:${sessionId}`,
      event: 'phx_join',
      payload: {},
      ref: 0
    }));

    // Phoenix heartbeat
    poolEntry.heartbeatTimer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: 0 }));
        } catch (_) {}
      }
    }, 20000);

    poolEntry.pingTimer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        try { ws.ping(); } catch (_) {}
      }
    }, 25000);

    // Notify all waiting clients
    for (const client of poolEntry.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'subscribed', sessionId, status: 'connected' }));
      }
    }
  });

  ws.on('message', (msg) => {
    try {
      const raw = JSON.parse(msg.toString());
      if (raw.event === 'hr_update' && raw.payload && typeof raw.payload.hr === 'number') {
        const bpm = raw.payload.hr;
        poolEntry.lastBpm = bpm;
        const outMsg = JSON.stringify({ type: 'bpm', bpm, sessionId, timestamp: Date.now() });
        for (const client of poolEntry.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(outMsg);
          }
        }
      }
    } catch (_) {}
  });

  ws.on('error', () => {
    for (const client of poolEntry.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'error', message: 'HypeRate Upstream temporär nicht erreichbar' }));
      }
    }
  });

  ws.on('close', () => {
    if (poolEntry.heartbeatTimer) clearInterval(poolEntry.heartbeatTimer);
    if (poolEntry.pingTimer) clearInterval(poolEntry.pingTimer);
    upstreamPool.delete(sessionId);
  });

  upstreamPool.set(sessionId, poolEntry);
  return poolEntry;
}

function unsubscribeClient(clientWs, sessionId) {
  if (!sessionId || !upstreamPool.has(sessionId)) return;
  const poolEntry = upstreamPool.get(sessionId);
  poolEntry.clients.delete(clientWs);
  if (poolEntry.clients.size === 0) {
    if (poolEntry.heartbeatTimer) clearInterval(poolEntry.heartbeatTimer);
    if (poolEntry.pingTimer) clearInterval(poolEntry.pingTimer);
    if (poolEntry.ws) {
      try {
        poolEntry.ws.removeAllListeners();
        poolEntry.ws.close();
      } catch (_) {}
    }
    upstreamPool.delete(sessionId);
  }
}

// HTTP Health Check Server
const server = http.createServer((req, res) => {
  // Never expose sensitive keys or details
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'HypeRate Secure Relay',
      activeClients: wss.clients.size,
      activeSessions: upstreamPool.size,
      time: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

// WebSocket Server with Payload Size Limits (max 4KB payload to stop buffer overflows)
const wss = new WebSocket.Server({
  server,
  maxPayload: 4096,
});

console.log('====================================================');
console.log('🚀 HypeRate Hardened Relay Server gestartet');
console.log(`📡 Port: ${PORT}`);
console.log(`🔒 HypeRate Key: ••••••••${HYPERATE_API_KEY.slice(-4)}`);
console.log(`🛡️ Rate-Limits: Max ${MAX_CLIENTS_TOTAL} Clients, ${MAX_CLIENTS_PER_IP}/IP`);
console.log('====================================================');

// Process error safety so uncaught errors never crash the Pelikan container
process.on('uncaughtException', (err) => {
  console.warn('[Pelikan Relay Warn] Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.warn('[Pelikan Relay Warn] Unhandled Rejection:', reason);
});

wss.on('connection', (clientWs, req) => {
  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  console.log(`[Pelikan Relay] Neuer Client verbunden von: ${clientIp}`);

  // 1. Check Global Client Limit
  if (wss.clients.size > MAX_CLIENTS_TOTAL) {
    clientWs.close(1013, 'Server voll');
    return;
  }

  // 2. Check IP Connection Limit
  const curIpCount = (ipConnections.get(clientIp) || 0) + 1;
  if (curIpCount > MAX_CLIENTS_PER_IP) {
    clientWs.close(1008, 'Zu viele Verbindungen von dieser IP');
    return;
  }
  ipConnections.set(clientIp, curIpCount);

  let currentSessionId = null;

  clientWs.on('message', (message) => {
    try {
      if (isRateLimited(clientIp)) {
        clientWs.send(JSON.stringify({ type: 'error', message: 'Rate limit erreicht. Bitte kurz warten.' }));
        return;
      }

      const str = message.toString();
      if (str.length > 512) return; // Drop oversized packets

      const data = JSON.parse(str);

      if (data.type === 'subscribe' || data.type === 'join') {
        const rawSession = String(data.sessionId || data.session_id || '').trim();
        // Sanitize session ID (only alphanumeric and dash/underscore, max 32 chars)
        const sessionId = rawSession.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);

        if (!sessionId) {
          clientWs.send(JSON.stringify({ type: 'error', message: 'Ungültige Session-ID' }));
          return;
        }

        if (RELAY_SECRET && data.secret !== RELAY_SECRET) {
          clientWs.send(JSON.stringify({ type: 'error', message: 'Ungültiges RELAY_SECRET' }));
          return;
        }

        console.log(`[Pelikan Relay] Client ${clientIp} abonniert Session: ${sessionId}`);

        // Unsubscribe from previous if switching
        if (currentSessionId && currentSessionId !== sessionId) {
          unsubscribeClient(clientWs, currentSessionId);
        }

        currentSessionId = sessionId;
        const pool = getOrCreateUpstream(sessionId);
        pool.clients.add(clientWs);

        if (pool.ws && pool.ws.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ type: 'subscribed', sessionId, status: 'connected' }));
          if (pool.lastBpm) {
            clientWs.send(JSON.stringify({ type: 'bpm', bpm: pool.lastBpm, sessionId, timestamp: Date.now() }));
          }
        }
      }

      if (data.type === 'ping') {
        clientWs.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (_) {}
  });

  const cleanup = () => {
    const c = (ipConnections.get(clientIp) || 1) - 1;
    if (c <= 0) ipConnections.delete(clientIp);
    else ipConnections.set(clientIp, c);

    if (currentSessionId) {
      unsubscribeClient(clientWs, currentSessionId);
      currentSessionId = null;
    }
  };

  clientWs.on('error', (err) => {
    console.log(`[Pelikan Relay] Client Socket Warnung (${clientIp}):`, err.message);
    cleanup();
  });

  clientWs.on('close', () => {
    console.log(`[Pelikan Relay] Client ${clientIp} Verbindung beendet.`);
    cleanup();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Pelikan Relay] Bereit auf Port ${PORT}`);
});
