import * as React from 'react';
import './App.css';
import Sidebar, { type PageKey } from './components/Sidebar';
import { type InstalledServer } from './components/InstalledServers';
import ServersPage from './pages/ServersPage';
import Dashboard from './components/Dashboard';

interface NavigatorUADataLike { architecture?: string }

const ServerDetailPage = ({ server, onBack }: { server: InstalledServer; onBack: () => void }) => {
  const [original, setOriginal] = React.useState('');
  const [config, setConfig] = React.useState<string>('Loading config...');
  const [saving, setSaving] = React.useState(false);
  const [savedMsg, setSavedMsg] = React.useState<string | null>(null);

  React.useEffect(() => { setConfig('Loading config...'); setOriginal(''); (async () => { const res = await window.electronAPI.readConfigFile?.(server.path); if (res?.ok) { setConfig(res.content || ''); setOriginal(res.content || ''); } else if (res) { setConfig(`Error: ${res.error}`); setOriginal(`Error: ${res.error}`); } })(); }, [server]);

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

  const content = selectedServer ? <ServerDetailPage server={selectedServer} onBack={showServers} /> : (page === 'dashboard' ? <Dashboard /> : <ServersPage onManage={(s) => setSelectedServer(s)} />);
  const title = selectedServer ? selectedServer.name : (page === 'dashboard' ? 'Dashboard' : 'Servers');

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
