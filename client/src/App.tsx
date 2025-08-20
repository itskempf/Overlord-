import * as React from 'react';
import './App.css';
import Sidebar, { type PageKey } from './components/Sidebar';
import InstalledServers, { type InstalledServer } from './components/InstalledServers';
import ServersPage from './pages/ServersPage';

interface NavigatorUADataLike { architecture?: string }

const Dashboard = ({ arch }: { arch: string }) => (
  <section className="dashboard-grid">
    <div className="panel span-2">
      <h2>Overview</h2>
      <div className="stat-grid">
        <div className="stat"><span className="label">Running</span><span className="value">0</span></div>
        <div className="stat"><span className="label">Stopped</span><span className="value">0</span></div>
        <div className="stat"><span className="label">Failed</span><span className="value">0</span></div>
        <div className="stat"><span className="label">Updating</span><span className="value">0</span></div>
      </div>
    </div>
    <div className="panel"><h2>Recent Activity</h2><ul className="activity-list empty"><li>No recent activity</li></ul></div>
    <div className="panel"><h2>Planned Tasks</h2><div className="empty-state">No tasks scheduled</div></div>
    <div className="panel"><h2>Alerts</h2><div className="empty-state">All clear</div></div>
    <div className="panel"><h2>System</h2><ul className="kv"><li><span>Version</span><span>0.1.0</span></li><li><span>Platform</span><span>{navigator.platform}</span></li><li><span>Arch</span><span>{arch}</span></li></ul></div>
  </section>
);

const ServerDetailPage = ({ server, onBack }: { server: InstalledServer; onBack: () => void }) => {
  const [original, setOriginal] = React.useState('');
  const [config, setConfig] = React.useState<string>('Loading config...');
  const [saving, setSaving] = React.useState(false);
  const [savedMsg, setSavedMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setConfig('Loading config...'); setOriginal('');
    (async () => { if (window.electronAPI.readConfigFile) { const res = await window.electronAPI.readConfigFile(server.path); if (res.ok) { setConfig(res.content || ''); setOriginal(res.content || ''); } else { setConfig(`Error: ${res.error}`); setOriginal(`Error: ${res.error}`); } } })();
  }, [server]);

  const dirty = config !== original;
  const save = async () => { if (!dirty) return; setSaving(true); const res = await window.electronAPI.writeConfigFile?.(server.path, config); setSaving(false); if (res?.ok) { setOriginal(config); setSavedMsg('Saved!'); setTimeout(() => setSavedMsg(null), 2000); } else if (res) { setSavedMsg('Error: ' + res.error); setTimeout(() => setSavedMsg(null), 4000); } };

  return (
    <section style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display:'flex', gap:12 }}>
        <button onClick={onBack} style={{ background:'#334155', color:'#fff', border:0, padding:'6px 14px', borderRadius:6, cursor:'pointer' }}>? Back to Servers</button>
        <button disabled={!dirty || saving} onClick={save} style={{ background: dirty ? '#2563eb' : '#475569', color:'#fff', border:0, padding:'6px 14px', borderRadius:6, cursor: dirty && !saving ? 'pointer':'not-allowed', fontWeight:600 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
        {savedMsg && <span style={{ alignSelf:'center', fontSize:12, color: savedMsg.startsWith('Error') ? '#f87171' : '#34d399' }}>{savedMsg}</span>}
      </div>
      <div className="panel" style={{ width: '100%', display:'flex', flexDirection:'column', gap:12 }}>
        <h2 style={{ margin:0 }}>{server.name}</h2>
        <div style={{ fontSize:12, color:'#94a3b8' }}>App ID: {server.appId}</div>
        <div style={{ fontSize:12, color:'#64748b' }}>Path: {server.path}</div>
        <h3 style={{ margin:'8px 0 4px' }}>server.cfg</h3>
        <textarea value={config} onChange={e => setConfig(e.target.value)} style={{ minHeight:300, width:'100%', background:'#10171d', color:'#e2e8f0', border:'1px solid #1f2a33', borderRadius:8, padding:12, fontFamily:'ui-monospace,monospace', fontSize:12, resize:'vertical' }} />
      </div>
    </section>
  );
};

function App() {
  const [page, setPage] = React.useState<PageKey>('dashboard');
  const [selectedServer, setSelectedServer] = React.useState<InstalledServer | null>(null);
  const ua = (navigator as Navigator & { userAgentData?: NavigatorUADataLike });
  const arch = ua.userAgentData?.architecture ?? 'n/a';

  const showServers = () => { setSelectedServer(null); setPage('servers'); };

  let content; let title;
  if (selectedServer) { title = selectedServer.name; content = <ServerDetailPage server={selectedServer} onBack={showServers} />; }
  else if (page === 'dashboard') { title = 'Dashboard'; content = <Dashboard arch={arch} />; }
  else { title = 'Servers'; content = <ServersPage onManage={(s) => setSelectedServer(s)} />; }

  return (
    <div className="app-shell">
      <Sidebar current={page} onNavigate={(p) => { setSelectedServer(null); setPage(p); }} />
      <main className="main">
        <header className="main-header"><h1 className="page-title">{title}</h1></header>
        {content}
      </main>
    </div>
  );
}

export default App;
