import React, { useState } from 'react';
import { Network, Send, CheckCircle2, XCircle, Trash2, Shield, Activity, RefreshCw } from 'lucide-react';
import { OscLogEntry } from '../types';

interface OscNetworkCardProps {
  oscHost: string;
  oscPort: number;
  packetsSent: number;
  logs: OscLogEntry[];
  onUpdateTarget: (host: string, port: number) => void;
  onSendTest: () => Promise<void>;
  onClearLogs: () => Promise<void>;
}

export const OscNetworkCard: React.FC<OscNetworkCardProps> = ({
  oscHost,
  oscPort,
  packetsSent,
  logs,
  onUpdateTarget,
  onSendTest,
  onClearLogs,
}) => {
  const [hostInput, setHostInput] = useState(oscHost);
  const [portInput, setPortInput] = useState(String(oscPort));
  const [isSending, setIsSending] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTarget(hostInput.trim(), Number(portInput) || 9000);
  };

  const handleTestClick = async () => {
    setIsSending(true);
    await onSendTest();
    setTimeout(() => setIsSending(false), 400);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
            <Network className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              VRChat OSC Netzwerk (UDP 9000)
            </h2>
            <p className="text-xs text-slate-400">Verbindung zu VRChat auf Linux oder lokalem PC</p>
          </div>
        </div>

        {/* Packet counter badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Activity className="w-4 h-4 text-teal-400" />
          <div className="text-right leading-none">
            <span className="text-sm font-bold font-mono text-white">{packetsSent}</span>
            <span className="text-[10px] text-slate-400 ml-1">Pakete</span>
          </div>
        </div>
      </div>

      {/* Target configuration */}
      <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">VRChat OSC Ziel IP / Host</label>
          <input
            id="input-osc-host"
            type="text"
            value={hostInput}
            onChange={(e) => setHostInput(e.target.value)}
            placeholder="127.0.0.1 (Standard)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Port (Standard 9000)</label>
          <div className="flex gap-2">
            <input
              id="input-osc-port"
              type="number"
              value={portInput}
              onChange={(e) => setPortInput(e.target.value)}
              placeholder="9000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
            />
            <button
              id="btn-save-osc-target"
              type="submit"
              className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              Speichern
            </button>
          </div>
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-300">Live OSC Protokoll (Letzte Pakete)</span>
        <div className="flex items-center gap-2">
          <button
            id="btn-send-test-osc"
            type="button"
            onClick={handleTestClick}
            disabled={isSending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            {isSending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Test-Paket
          </button>
          <button
            id="btn-clear-logs"
            type="button"
            onClick={onClearLogs}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Log leeren"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="max-h-48 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 p-2 font-mono text-[11px] space-y-1.5">
        {logs.length === 0 ? (
          <div className="py-6 text-center text-slate-500 italic">
            Noch keine Pakete gesendet. Klicke auf "Test-Paket" oder starte die Übertragung.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                {log.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                <span className="text-teal-400 shrink-0">{log.address}</span>
                <span className="text-slate-200 truncate">{log.text}</span>
              </div>
              <div className="text-[10px] text-slate-500 shrink-0 pl-2">
                {log.bytes} B
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
