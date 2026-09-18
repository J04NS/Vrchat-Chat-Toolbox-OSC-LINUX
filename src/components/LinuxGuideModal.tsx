import React, { useState } from 'react';
import { Terminal, Copy, Check, X, Server, ShieldCheck, Gamepad2, Radio } from 'lucide-react';

interface LinuxGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverPort: number;
}

export const LinuxGuideModal: React.FC<LinuxGuideModalProps> = ({
  isOpen,
  onClose,
  serverPort,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startScriptCmd = `# 1. Starte die App auf Linux (Port 9090)
chmod +x start-linux.sh
./start-linux.sh`;

  const manualInstallCmd = `# Manueller Befehl bei npm Versionskonflikten:
npm install --legacy-peer-deps
npm run build
PORT=9090 node dist/server.cjs`;

  const nodeDirectCmd = `# Alternativer direkter Start mit Node.js (nach Build):
PORT=9090 node dist/server.cjs`;

  const systemdFile = `[Unit]
Description=VRChat OSC Chatbox Hub
After=network.target

[Service]
Type=simple
Environment="PORT=9090"
Environment="VRCHAT_OSC_HOST=127.0.0.1"
Environment="VRCHAT_OSC_PORT=9000"
WorkingDirectory=%h/vrchat-chatbox-hub
ExecStart=/usr/bin/node dist/server.cjs
Restart=on-failure

[Install]
WantedBy=default.target`;

  const systemdInstallCmd = `# Systemd User Service aktivieren (startet automatisch mit Linux)
mkdir -p ~/.config/systemd/user
# Datei speichern unter ~/.config/systemd/user/vrcosc.service
systemctl --user daemon-reload
systemctl --user enable --now vrcosc.service`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-200">
        {/* Close Button */}
        <button
          id="btn-close-linux-guide"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Linux & Port 9090 Anleitung</h2>
            <p className="text-xs text-slate-400">VRChat Chatbox unter Linux einrichten und betreiben</p>
          </div>
        </div>

        <div className="space-y-5 text-sm">
          {/* Section 1: Launch */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Server className="w-4 h-4" /> 1. Start auf Linux (Port 9090)
            </h3>
            <p className="text-xs text-slate-300">
              Wenn du die Anwendung auf deinem Linux-System (Ubuntu, Arch, Fedora, SteamOS) herunterlädst oder exportierst, startet das beiliegende Skript den Server direkt auf <strong>http://localhost:9090</strong>:
            </p>
            <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400">
              <pre className="whitespace-pre-wrap">{startScriptCmd}</pre>
              <button
                onClick={() => copyCode('start', startScriptCmd)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedId === 'start' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
              <pre className="whitespace-pre-wrap">{nodeDirectCmd}</pre>
              <button
                onClick={() => copyCode('node', nodeDirectCmd)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedId === 'node' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300/90">
              <pre className="whitespace-pre-wrap">{manualInstallCmd}</pre>
              <button
                onClick={() => copyCode('manual', manualInstallCmd)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedId === 'manual' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Section 2: VRChat OSC activation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4" /> 2. OSC in VRChat (Steam / Proton) aktivieren
            </h3>
            <p className="text-xs text-slate-300">
              Damit VRChat die Chatbox-Nachrichten empfängt, muss OSC im Spiel aktiviert sein:
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <li>Drücke in VRChat auf der Tastatur <strong>R</strong> oder öffne das Quick Menu (Action Wheel).</li>
              <li>Gehe auf <strong>Options</strong> &rarr; <strong>OSC</strong>.</li>
              <li>Stelle sicher, dass <strong>OSC Enabled</strong> eingeschaltet ist.</li>
              <li>VRChat lauscht standardmäßig auf <code>127.0.0.1:9000</code> UDP.</li>
            </ol>
          </div>

          {/* Section 3: Security of HypeRate Key */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 3. Schutz deines HypeRate API-Keys
            </h3>
            <p className="text-xs text-slate-300">
              Dein hinterlegter HypeRate-Schlüssel ist server-seitig geschützt:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <li>Der Schlüssel wird niemals unverschlüsselt an den Browser gesendet.</li>
              <li>In der Oberfläche wird lediglich ein maskierter Status (z.B. <code>••••••••3J91</code>) angezeigt.</li>
              <li>Die WebSocket-Verbindung zu <code>app.hyperate.io</code> wird direkt vom lokalen Backend-Dienst aufgebaut.</li>
            </ul>
          </div>

          {/* Section 4: Systemd Service */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Radio className="w-4 h-4" /> 4. Optional: Systemd Autostart-Dienst
            </h3>
            <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
              <pre className="whitespace-pre-wrap">{systemdFile}</pre>
              <button
                onClick={() => copyCode('systemd', systemdFile)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedId === 'systemd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
              <pre className="whitespace-pre-wrap">{systemdInstallCmd}</pre>
              <button
                onClick={() => copyCode('syscmd', systemdInstallCmd)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedId === 'syscmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
};
