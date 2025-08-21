import * as React from 'react';
import './App.css';
import Sidebar, { type PageKey } from './components/Sidebar';
import type { InstalledServer } from 'shared';
import ServersPage from './pages/ServersPage';
import Dashboard from './components/Dashboard';
import SettingsPage from './pages/SettingsPage';
import { Toaster } from 'react-hot-toast';

const ServerDetailPage = ({ server, onBack }: { server: InstalledServer; onBack: () => void }) => {
  const [original, setOriginal] = React.useState('');
  const [config, setConfig] = React.useState<string>('Loading config...');
  const [saving, setSaving] = React.useState(false);
  const [savedMsg, setSavedMsg] = React.useState<string | null>(null);

  React.useEffect(() => { setConfig('Loading config...'); setOriginal(''); (async () => { const res = await window.electronAPI.readConfigFile?.(server.path); if (res && 'error' in res) { setConfig(`Error: ${res.error}`); setOriginal(`Error: ${res.error}`); } else if (res) { setConfig(JSON.stringify(res, null, 2)); setOriginal(JSON.stringify(res, null, 2)); } })(); }, [server]);

  const dirty = config !== original;
  const save = async () => { if (!dirty) return; setSaving(true); try { const parsedConfig = JSON.parse(config); const res = await window.electronAPI.writeConfigFile?.(server.path, parsedConfig); setSaving(false); if (res?.success) { setOriginal(config); setSavedMsg('Saved!'); setTimeout(() => setSavedMsg(null), 2000); } else if (res) { setSavedMsg('Error: ' + res.message); setTimeout(() => setSavedMsg(null), 4000); } } catch (e) { setSaving(false); setSavedMsg('Error: Invalid JSON in config'); setTimeout(() => setSavedMsg(null), 4000); } };

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

  const showServers = () => { setSelectedServer(null); setPage('servers'); };

  const content = selectedServer ? <ServerDetailPage server={selectedServer} onBack={showServers} /> : (
    page === 'dashboard' ? <Dashboard /> :
    page === 'servers' ? <ServersPage onManage={(s) => setSelectedServer(s)} /> :
    page === 'settings' ? <SettingsPage /> : null
  );
  const title = selectedServer ? selectedServer.name : (
    page === 'dashboard' ? 'Dashboard' :
    page === 'servers' ? 'Servers' :
    page === 'settings' ? 'Settings' : ''
  );

  return (
    <div className="app-shell">
      <Sidebar current={page} onNavigate={(p) => { setSelectedServer(null); setPage(p); }} />
      <main className="main">
        <header className="main-header"><h1 className="page-title">{title}</h1></header>
        {content}
      </main>
      <Toaster />
    </div>
  );
}

export default App;
