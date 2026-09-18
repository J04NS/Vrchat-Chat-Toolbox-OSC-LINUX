# Pelikan / Pterodactyl HypeRate Relay Server

Dieser Relay-Server leitet HypeRate-Herzschlag-Events sicher an Clients (z. B. deinen VRChat OSC Hub oder Freunde) weiter.

### 🔒 Sicherheit:
- Der geheime `HYPERATE_API_KEY` verbleibt **ausschließlich** auf deinem Pelikan-Server in der `.env`-Datei.
- Clients und Freunde verbinden sich nur mit deiner Server-Adresse (`ws://deine-server-ip:port`).
- Niemand kann deinen API-Key auslesen oder abfangen.

---

## 🚀 Installation auf Pelikan / Pterodactyl

### Option A: Über Pelikan Web-Panel (SFTP / File Manager)
1. Erstelle in Pelikan einen neuen Server mit dem **Node.js Egg** (Node 18, 20 oder 22).
2. Lade das Archiv `pelikan-relay.tar.gz` oder den Ordner `pelikan-relay` per SFTP hoch.
3. Entpacke das Archiv falls nötig:
   ```bash
   tar -xzf pelikan-relay.tar.gz
   ```
4. Passe die Datei `.env` an:
   - Trage deinen `HYPERATE_API_KEY` ein.
   - Trage den `PORT` ein, den Pelikan deinem Server zugewiesen hat (z. B. 8080 oder den Primary Allocation Port).
5. Klicke im Pelikan-Panel auf **Start**. Pelikan führt automatisch `npm install` und `npm start` aus.

---

### Option B: Über SCP / SSH Direktübertragung
1. Übertrage das Archiv vom PC auf deinen Server:
   ```bash
   scp pelikan-relay.tar.gz nutzer@deine-server-ip:/pfad/zum/server/
   ```
2. Auf dem Server entpacken und starten:
   ```bash
   tar -xzf pelikan-relay.tar.gz
   cd pelikan-relay
   npm install
   node server.js
   ```

---

## 🛠️ In VRChat OSC Hub nutzen
In den HypeRate-Einstellungen des Hubs kannst du die Relay-URL deines Pelikan-Servers eintragen:
`ws://deine-server-ip:8080` (oder `wss://deine-domain.com`, falls du einen Reverse Proxy mit SSL nutzt).
Sobald du deine Session-ID eingibst, verbindet sich der Hub mit deinem Pelikan-Server, und dieser streamt den Puls ohne Key-Weitergabe!
