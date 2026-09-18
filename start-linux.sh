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

# Prüfe Node.js
if ! command -v node &> /dev/null; then
    echo "Fehler: Node.js ist nicht installiert!"
    echo "Installiere Node.js via: sudo apt install nodejs npm (oder via nvm / pacman / dnf)"
    exit 1
fi

# Dependencies prüfen
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vite" ]; then
    echo "Installiere Abhängigkeiten..."
    if ! npm install; then
        echo "Versuche Installation mit --legacy-peer-deps..."
        npm install --legacy-peer-deps
    fi
fi

# Baue Server falls noch nicht gebaut
if [ ! -f "dist/server.cjs" ]; then
    echo "Erstelle Production Build..."
    npm run build
fi

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
