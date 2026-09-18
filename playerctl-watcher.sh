#!/bin/bash
# ==========================================================
# Linux MPRIS / playerctl Music Sync für VRChat Chatbox Hub
# Sendet laufende Musik (Spotify, VLC, Chrome, Firefox)
# in Echtzeit an http://localhost:9090
# ==========================================================

SERVER_URL="http://localhost:9090/api/media/now-playing"

if ! command -v playerctl &> /dev/null; then
    echo "Hinweis: playerctl ist nicht installiert."
    echo "Installiere es mit: sudo apt install playerctl (bzw. pacman -S playerctl)"
    exit 1
fi

echo "playerctl Watcher aktiv. Lausche auf Musik-Events..."

playerctl metadata --format '{"title":"{{title}}","artist":"{{artist}}","album":"{{album}}","status":"{{status}}"}' --follow | while read -r line; do
    if [ -n "$line" ]; then
        STATUS=$(echo "$line" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        IS_PLAYING="false"
        if [ "$STATUS" = "Playing" ]; then
            IS_PLAYING="true"
        fi

        curl -s -X POST "$SERVER_URL" \
            -H "Content-Type: application/json" \
            -d "{\"title\":$(echo "$line" | jq .title || echo '""'), \"artist\":$(echo "$line" | jq .artist || echo '""'), \"album\":$(echo "$line" | jq .album || echo '""'), \"isPlaying\":$IS_PLAYING, \"source\":\"mpris/playerctl\"}" > /dev/null
    fi
done
