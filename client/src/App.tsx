import * as React from 'react';
import './App.css';
import Sidebar, { PageKey } from './components/Sidebar';
import GameInstaller from './components/GameInstaller';
import InstalledServers from './components/InstalledServers';

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
    <div className="panel">
      <h2>Recent Activity</h2>
      <ul className="activity-list empty">
        <li>No recent activity</li>
      </ul>
    </div>
    <div className="panel">
      <h2>Planned Tasks</h2>
      <div className="empty-state">No tasks scheduled</div>
    </div>
    <div className="panel">
      <h2>Alerts</h2>
      <div className="empty-state">All clear</div>
    </div>
    <div className="panel">
      <h2>System</h2>
      <ul className="kv">
        <li><span>Version</span><span>0.1.0</span></li>
        <li><span>Platform</span><span>{navigator.platform}</span></li>
        <li><span>Arch</span><span>{arch}</span></li>
      </ul>
    </div>
  </section>
);

const ServersPage = () => (
  <section style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div className="panel" style={{ width: '100%' }}>
      <GameInstaller />
    </div>
    <div className="panel" style={{ width: '100%' }}>
      <InstalledServers />
    </div>
  </section>
);

function App() {
  const [page, setPage] = React.useState<PageKey>('dashboard');
  const ua = (navigator as Navigator & { userAgentData?: NavigatorUADataLike });
  const arch = ua.userAgentData?.architecture ?? 'n/a';

  return (
    <div className="app-shell">
      <Sidebar current={page} onNavigate={(p) => setPage(p)} />
      <main className="main">
        <header className="main-header">
          <h1 className="page-title">{page === 'dashboard' ? 'Dashboard' : 'Servers'}</h1>
        </header>
        {page === 'dashboard' ? <Dashboard arch={arch} /> : <ServersPage />}
      </main>
    </div>
  );
}

export default App;
