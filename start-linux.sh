#!/bin/bash
# ==========================================================
# VRChat OSC Chatbox Hub - Linux Starter
# Startet den Server lokal auf Port 9090 für Linux & VRChat
# ==========================================================

echo "=================================================="
echo "  VRChat OSC Chatbox Hub für Linux               "
echo "  Ziel: VRChat OSC auf 127.0.0.1:9000 (UDP)      "
echo "=================================================="

# Standard Port für die Linux Web-Oberfläche: 9090
export PORT=9090

# 1. Beende eventuell alte im Hintergrund laufende Instanzen auf Port 9090 & 9001
echo "[Cleanup] Prüfe auf alte Instanzen auf Port 9090..."
if command -v fuser &> /dev/null; then
    fuser -k 9090/tcp 2>/dev/null || true
    fuser -k 9001/udp 2>/dev/null || true
elif command -v lsof &> /dev/null; then
    OLD_PIDS=$(lsof -t -i:9090 2>/dev/null || true)
    if [ -n "$OLD_PIDS" ]; then
        kill -9 $OLD_PIDS 2>/dev/null || true
    fi
fi
pkill -f "dist/server.cjs" 2>/dev/null || true
sleep 0.5

# 2. Prüfe Node.js
if ! command -v node &> /dev/null; then
    echo "Fehler: Node.js ist nicht installiert!"
    echo "Installiere Node.js via: sudo apt install nodejs npm (oder via nvm / pacman / dnf)"
    exit 1
fi

# 3. Dependencies prüfen
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vite" ]; then
    echo "Installiere Abhängigkeiten..."
    if ! npm install; then
        echo "Versuche Installation mit --legacy-peer-deps..."
        npm install --legacy-peer-deps
    fi
fi

# 4. Baue Server / Frontend
echo "Erstelle / Aktualisiere Production Build..."
npm run build

if [ ! -f "dist/server.cjs" ]; then
    echo "Fehler: 'dist/server.cjs' konnte nicht erstellt werden!"
    echo "Bitte führe manuell 'npm run build' aus, um den Fehler zu sehen."
    exit 1
fi

echo ""
echo "Starte Web-Konfiguration auf: http://localhost:9090"
echo "Drücke STRG + C zum Beenden."
echo ""

# Öffne Browser wenn möglich
if command -v xdg-open &> /dev/null; then
    (sleep 1 && xdg-open "http://localhost:9090") &
fi

# Starte den Server
node dist/server.cjs
