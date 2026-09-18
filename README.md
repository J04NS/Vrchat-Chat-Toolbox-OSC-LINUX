- **Live Heart Rate Tracking:** HypeRate & Pulsoid integration featuring BPM target zones and dynamic heartbeat pulse animations.
- **100% Zero-Secret Relay Mode:** HypeRate API keys are never exposed to browser clients or public repositories. Heart rate telemetry is safely streamed through an internal or private Pelikan/Pterodactyl relay.
- **Native Linux Media Detection:** Reads native Playerctl / MPRIS metadata (Spotify, VLC, web browsers) on Linux and transmits track title, artist, and playback status to VRChat.
- **Rotating Custom Texts:** Configure multiple custom status texts that automatically cycle in your Chatbox at customizable intervals (`{freitext}`).
- **Automatic AFK Detection:** Detects inactivity via VRChat OSC parameters or idle timers, displaying an animated AFK banner with elapsed idle duration.
- **Hardware Telemetry HUD:** Transmit live CPU usage, RAM utilization, GPU statistics, and temperatures directly into your VRChat Chatbox.
- **Real-Time In-VR Preview:** Pixel-accurate simulation of the VRChat Chatbox including ticker (Marquee) support and 144-character limit warnings.
- **Bilingual Interface:** Toggle between **English** and **German (Deutsch)** in the web UI anytime with persistent memory.

---
## Disclamer
- Its a Beta made with help of AI, if you have any Ideas contact me
  

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js** (Version 18, 20, or 22 recommended)
- **Linux:** `playerctl` for Spotify / media support (`sudo apt install playerctl` or `sudo pacman -S playerctl`)
- **VRChat:** Ensure OSC is enabled in the VRChat Action Menu (*Options ➔ OSC ➔ Enabled*).

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/vrchat-osc-hub.git
cd vrchat-osc-hub

# Install dependencies
npm install

# Build the application
npm run build
```

### 2. Running on Linux / Steam Deck
```bash
# Easy start with the included startup script:
chmod +x start-linux.sh
./start-linux.sh
```

Or run directly with Node:
```bash
PORT=9090 node dist/server.cjs
```
Then open your browser at `http://localhost:9090` (or `http://localhost:3000`).

---

## 📖 How to Use

1. **Connect to VRChat:** VRChat listens on `127.0.0.1:9000` (OSC Input) by default. The hub connects to this endpoint automatically.
2. **Heart Rate (HypeRate):**
   - Navigate to **Heart Rate & Sensors** ➔ **HypeRate**.
   - Enter your personal **Session ID** (found in your HypeRate mobile/watch app).
   - Click **Connect Session**.
   - The hub transparently connects through the pre-configured, protected Pelikan Relay server—no API key entry required!
3. **Customize your Template:**
   Use the following placeholders in your Chatbox template:
   - `{hr}`: Heart rate (BPM)
   - `{hr_icon}`: Animated heartbeat icon
   - `{song}`: Current playing track & artist
   - `{clock}`: Current time (HH:MM)
   - `{freitext}`: Cycles through your configured custom status messages
   - `{hw}` / `{cpu}` / `{gpu}` / `{ram}`: Hardware monitor telemetry
   - `{afk_time}`: Inactive AFK duration

---

## 🐧 Pelikan / Pterodactyl Relay Server (Self-Hosting)

Want to host your own dedicated HypeRate Relay Server on Pelikan or Pterodactyl to provide your own HypeRate API key securely for yourself and your friends?

The ready-to-use Egg and server bundle are included in this repository:
- **`egg-hyperate-relay.json`** (Pelikan / Pterodactyl Egg definition)
- **`pelikan-relay.tar.gz`** (Pre-packaged server archive with `server.js` and `package.json`)

### Setup Guide: Importing Egg into Pelikan

#### Step 1: Import the Egg
1. Log in to your Pelikan / Pterodactyl panel as an **Admin**.
2. Go to **Nests** (or **Eggs & Nests**) in the sidebar.
3. Select a Nest (e.g. *Node.js* or create a new *VRChat* nest).
4. Click **Import Egg** in the top right corner.
5. Upload `egg-hyperate-relay.json` and confirm.

#### Step 2: Create Server
1. Go to **Servers** ➔ **Create New**.
2. Select name, node, and assign a **Port Allocation** (e.g. port `7871` or `8080`).
3. Select the imported egg **HypeRate OSC Relay**.
4. In the environment variables, provide your **HypeRate API Key**.
5. Click **Create Server**.

#### Step 3: Upload Files & Start
1. Open the created server in Pelikan and navigate to the **File Manager** (or connect via SFTP).
2. Upload `pelikan-relay.tar.gz` and unarchive it with Right-Click ➔ **Unarchive** (or upload `server.js` and `package.json` from the `pelikan-relay/` folder).
3. Click **Start** in the Pelikan console.

Pelikan will automatically install packages and start the relay:
```text
====================================================
🚀 HypeRate Hardened Relay Server started
📡 Port: 7871
🛡️ Rate-Limits: Max 200 Clients, 10/IP
====================================================
[Pelikan Relay] Ready on port 7871
```

#### Step 4: Add Relay URL in VRChat OSC Hub
In the VRChat OSC Hub web interface under:
**Heart Rate & Sensors** ➔ **HypeRate** ➔ **Pelikan Relay Server Configuration (Optional)**
Enter your server address:
```text
ws://your-server-ip:port
```
*(If left empty, the application automatically routes through the default built-in relay).*

---

## 🔒 Security Architecture

- **Zero Secret Leakage:** No HypeRate API keys are stored in client browsers, local storage, or public source code.
- **Isolated Sandbox:** The Pelikan relay runs inside a secure, containerized Node.js environment.
- **DDoS & Flood Protection:** Built-in rate limiting (max 30 requests/minute, max 10 concurrent connections per IP) with upstream WebSocket pooling.
- **Host Obfuscation:** The default relay IP is hidden from browser clients and resolved exclusively server-side.

---

## 📜 License

This project is licensed under the **GNU General Public License v3.0 (GNU GPLv3)**.

- **Free Use & Distribution:** Anyone can use, modify, and distribute this software free of charge.
- **Copyleft / Open Source Requirement:** All modifications or derivative works must also be published as open-source under the **GNU GPLv3**.
- **Transparency:** Closed-source commercialization without releasing the source code is strictly prohibited.

See the [LICENSE](./LICENSE) file for the full license text. Built with ❤️ for the VRChat community.
