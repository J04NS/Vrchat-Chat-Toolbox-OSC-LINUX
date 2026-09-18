import React, { useState } from 'react';
import { Heart, Activity, ShieldCheck, Bluetooth, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { HeartRateProvider, HeartRateState } from '../types';
import { getBpmZoneName, getHeartIcon } from '../lib/formatter';

interface HeartRateCardProps {
  hrState: HeartRateState;
  hyperateSessionId: string;
  pulsoidToken: string;
  hasHyperateApiKey: boolean;
  hyperateKeyMasked: string;
  hyperateConnected: boolean;
  onUpdateConfig: (data: { hyperateSessionId?: string; pulsoidToken?: string }) => void;
  onUpdateHrState: (data: { bpm: number; provider?: HeartRateProvider; deviceLabel?: string }) => void;
}

export const HeartRateCard: React.FC<HeartRateCardProps> = ({
  hrState,
  hyperateSessionId,
  pulsoidToken,
  hasHyperateApiKey,
  hyperateKeyMasked,
  hyperateConnected,
  onUpdateConfig,
  onUpdateHrState,
}) => {
  const [activeTab, setActiveTab] = useState<HeartRateProvider>(hrState.provider || 'hyperate');
  const [sessionIdInput, setSessionIdInput] = useState(hyperateSessionId || '');
  const [pulsoidInput, setPulsoidInput] = useState(pulsoidToken || '');
  const [isConnectingBle, setIsConnectingBle] = useState(false);
  const [bleError, setBleError] = useState<string | null>(null);

  const handleSaveHyperate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({ hyperateSessionId: sessionIdInput.trim().toUpperCase() });
    onUpdateHrState({ bpm: hrState.bpm, provider: 'hyperate', deviceLabel: `HypeRate (${sessionIdInput.trim()})` });
  };

  const handleSavePulsoid = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({ pulsoidToken: pulsoidInput.trim() });
    onUpdateHrState({ bpm: hrState.bpm, provider: 'pulsoid', deviceLabel: 'Pulsoid Feed' });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onUpdateHrState({ bpm: val, provider: 'manual', deviceLabel: 'Simulator Slider' });
  };

  // Web Bluetooth LE connect (Standard 0x180D Heart Rate Service)
  const connectBluetoothLE = async () => {
    setBleError(null);
    const navBluetooth = (navigator as any).bluetooth;
    if (!navBluetooth) {
      setBleError('Web Bluetooth wird von diesem Browser nicht unterstützt. Verwende Google Chrome oder Edge.');
      return;
    }

    try {
      setIsConnectingBle(true);
      const device = await navBluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service'],
      });

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('heart_rate');
      const characteristic = await service?.getCharacteristic('heart_rate_measurement');

      await characteristic?.startNotifications();
      characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        let bpm = 0;
        if ((flags & 0x01) === 0) {
          bpm = value.getUint8(1);
        } else {
          bpm = value.getUint16(1, true);
        }
        onUpdateHrState({
          bpm,
          provider: 'bluetooth',
          deviceLabel: device.name || 'Bluetooth Heart Monitor',
        });
      });

      onUpdateHrState({
        bpm: hrState.bpm || 70,
        provider: 'bluetooth',
        deviceLabel: device.name || 'Bluetooth Smart Device',
      });
      setIsConnectingBle(false);
    } catch (err: any) {
      setIsConnectingBle(false);
      if (err.name !== 'NotFoundError') {
        setBleError(err.message || 'Verbindung fehlgeschlagen');
      }
    }
  };

  const currentZone = getBpmZoneName(hrState.bpm);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              Herzfrequenz & Puls
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {currentZone}
              </span>
            </h2>
            <p className="text-xs text-slate-400">HypeRate, Pulsoid oder Bluetooth direkt an VRChat senden</p>
          </div>
        </div>

        {/* Live BPM Badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-lg">{getHeartIcon(hrState.bpm)}</span>
          <div className="flex flex-col text-right leading-none">
            <span className="text-lg font-bold font-mono text-white">{hrState.bpm > 0 ? hrState.bpm : '--'}</span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">BPM</span>
          </div>
        </div>
      </div>

      {/* Provider Selector Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl mb-4 border border-slate-800/80">
        <button
          id="tab-hr-hyperate"
          type="button"
          onClick={() => setActiveTab('hyperate')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'hyperate'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          HypeRate
        </button>
        <button
          id="tab-hr-pulsoid"
          type="button"
          onClick={() => setActiveTab('pulsoid')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'pulsoid'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Pulsoid
        </button>
        <button
          id="tab-hr-bluetooth"
          type="button"
          onClick={() => setActiveTab('bluetooth')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'bluetooth'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Bluetooth BLE
        </button>
        <button
          id="tab-hr-manual"
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'manual'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Simulator
        </button>
      </div>

      {/* Tab: HypeRate */}
      {activeTab === 'hyperate' && (
        <form onSubmit={handleSaveHyperate} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                HypeRate API-Schlüssel
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                {hasHyperateApiKey ? hyperateKeyMasked : 'Nicht konfiguriert'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Der API-Key ist server-seitig hinterlegt und wird niemals im Quelltext oder an Dritte im Browser übertragen.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              HypeRate Session-ID
            </label>
            <div className="flex gap-2">
              <input
                id="input-hyperate-session"
                type="text"
                placeholder="z.B. 4-6 stelliger Code aus der HypeRate App"
                value={sessionIdInput}
                onChange={(e) => setSessionIdInput(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                id="btn-save-hyperate"
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Verbinden
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Öffne HypeRate auf deiner Apple Watch, WearOS, Garmin oder Handy und trage hier die angezeigte ID ein.
            </p>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/70 text-xs">
            <div className="flex items-center gap-2">
              {hyperateConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Activity className="w-4 h-4 text-slate-400 animate-pulse" />
              )}
              <span className="text-slate-300 font-medium">Status:</span>
              <span className={hyperateConnected ? 'text-emerald-400' : 'text-slate-400'}>
                {hyperateConnected
                  ? `Verbunden mit Session ${hyperateSessionId || sessionIdInput}`
                  : sessionIdInput
                  ? 'Warte auf Verbindung...'
                  : 'Keine Session eingetragen'}
              </span>
            </div>
          </div>
        </form>
      )}

      {/* Tab: Pulsoid */}
      {activeTab === 'pulsoid' && (
        <form onSubmit={handleSavePulsoid} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Pulsoid Feed Token oder Widget ID
            </label>
            <div className="flex gap-2">
              <input
                id="input-pulsoid-token"
                type="text"
                placeholder="Pulsoid Feed ID / Token eingeben"
                value={pulsoidInput}
                onChange={(e) => setPulsoidInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                id="btn-save-pulsoid"
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Speichern
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Erstelle einen Widget-Link auf pulsoid.net und kopiere die ID oder den Zugriffstoken.
            </p>
          </div>
        </form>
      )}

      {/* Tab: Bluetooth LE */}
      {activeTab === 'bluetooth' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
            <p className="mb-2">
              Verbinde deinen Brustgurt (z. B. Polar H10, Garmin HRM-Pro, Wahoo TICKR, CooSpo) direkt per Web Bluetooth LE.
            </p>
            <button
              id="btn-connect-ble"
              type="button"
              onClick={connectBluetoothLE}
              disabled={isConnectingBle}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-medium rounded-xl transition-all cursor-pointer"
            >
              <Bluetooth className="w-4 h-4" />
              {isConnectingBle ? 'Suche nach Bluetooth-Geräten...' : 'Bluetooth Brustgurt koppeln'}
            </button>
          </div>

          {bleError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{bleError}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab: Simulator / Slider */}
      {activeTab === 'manual' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-slate-300">Puls Simulator Regler</label>
              <span className="text-sm font-mono font-bold text-rose-400">{hrState.bpm} BPM</span>
            </div>

            <input
              id="slider-bpm-test"
              type="range"
              min="40"
              max="210"
              value={hrState.bpm || 70}
              onChange={handleSliderChange}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>40 BPM</span>
              <span>100 BPM</span>
              <span>160 BPM</span>
              <span>210 BPM</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Ruhe', bpm: 60, color: 'hover:border-blue-500' },
              { label: 'Normal', bpm: 75, color: 'hover:border-emerald-500' },
              { label: 'Cardio', bpm: 130, color: 'hover:border-amber-500' },
              { label: 'Peak', bpm: 175, color: 'hover:border-rose-500' },
            ].map((preset) => (
              <button
                key={preset.label}
                id={`btn-preset-${preset.bpm}`}
                type="button"
                onClick={() =>
                  onUpdateHrState({ bpm: preset.bpm, provider: 'manual', deviceLabel: `Preset: ${preset.label}` })
                }
                className={`py-1.5 px-2 bg-slate-950 border border-slate-800 ${preset.color} text-slate-200 text-xs rounded-lg transition-colors text-center cursor-pointer`}
              >
                <div className="font-medium">{preset.label}</div>
                <div className="text-[10px] text-slate-400">{preset.bpm} BPM</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
