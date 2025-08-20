// A React functional component for installing game servers.
// Uses minimal inline styles (no Tailwind currently configured).
import React, { useState, useEffect } from 'react';

export interface ElectronAPIShape {
  installGameServer: (appId: string) => Promise<{ ok: boolean; error?: string }>;
  onServerLog: (cb: (line: string) => void) => void;
  getInstalledServers: () => Promise<{ appId: string; name: string; path: string; installedAt?: number; }[]>;
  readConfigFile?: (serverPath: string) => Promise<{ ok: boolean; content?: string; error?: string }>;
}

declare global {
  interface Window { electronAPI: ElectronAPIShape }
}

const GameInstaller = () => {
  const [appId, setAppId] = useState('');
  const [installing, setInstalling] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    window.electronAPI.onServerLog(line => {
      setLogs(prev => [...prev.slice(-400), line]);
    });
  }, []);

  const handleInstall = async () => {
    if (!appId) return;
    setInstalling(true);
    setStatus('Starting installation...');
    const result = await window.electronAPI.installGameServer(appId.trim());
    if (result.ok) setStatus('Installation completed successfully.'); else setStatus('Failed: ' + result.error);
    setInstalling(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2>Install / Update Game Server</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Steam App ID"
          value={appId}
          onChange={e => setAppId(e.target.value)}
          style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #334155', background: '#1e2932', color: '#e2e8f0' }}
        />
        <button
          disabled={installing || !appId}
          onClick={handleInstall}
          style={{ padding: '8px 14px', borderRadius: 6, border: 0, background: installing ? '#475569' : '#2563eb', color: '#fff', cursor: installing ? 'not-allowed' : 'pointer', fontWeight: 600 }}
        >
          {installing ? 'Installing...' : 'Install / Update'}
        </button>
      </div>
      {status && <div style={{ fontSize: 13, color: '#94a3b8' }}>{status}</div>}
      <div style={{ background: '#11171d', border: '1px solid #1f2a33', borderRadius: 8, padding: 12, maxHeight: 260, overflow: 'auto', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
        {logs.length === 0 && <div style={{ color: '#475569' }}>No output yet.</div>}
        {logs.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
};

export default GameInstaller;
