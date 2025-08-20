import { useEffect, useState } from 'react';

export interface InstalledServer {
  appId: string;
  name: string;
  path: string;
  installedAt?: number;
}

interface Props { onManageServer?: (s: InstalledServer) => void }

const InstalledServers = ({ onManageServer }: Props) => {
  const [servers, setServers] = useState<InstalledServer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const list = await window.electronAPI.getInstalledServers();
    setServers(list || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div>Loading servers...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3>Installed Servers</h3>
      {servers.length === 0 && <div style={{ fontSize: 13, color: '#64748b' }}>No servers installed yet.</div>}
      {servers.map(s => (
        <div key={s.appId} style={{ padding: 12, background: '#182029', border: '1px solid #222b35', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong>{s.name}</strong>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>AppID: {s.appId}</span>
            <span style={{ fontSize: 11, color: '#64748b' }}>{s.path}</span>
          </div>
            <button onClick={() => onManageServer?.(s)} style={{ background: '#334155', color: '#fff', border: 0, padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>Manage</button>
        </div>
      ))}
    </div>
  );
};

export default InstalledServers;
