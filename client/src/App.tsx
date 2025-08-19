import * as React from 'react';
import './App.css';

/* Static UI shell for initial Overlord dashboard */
interface NavigatorUADataLike { architecture?: string }

function App() {
  const ua = (navigator as Navigator & { userAgentData?: NavigatorUADataLike });
  const arch = ua.userAgentData?.architecture ?? 'n/a';
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">Overlord</div>
        <nav className="nav">
          <ul>
            <li className="nav-section">General</li>
            <li><a className="active" href="#dashboard">Dashboard</a></li>
            <li><a href="#servers">Servers</a></li>
            <li><a href="#tasks">Tasks</a></li>
            <li className="nav-section">Management</li>
            <li><a href="#workshop">Workshop</a></li>
            <li><a href="#backups">Backups</a></li>
            <li><a href="#settings">Settings</a></li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="primary-btn">+ New Server</button>
        </div>
      </aside>
      <main className="main">
        <header className="main-header">
          <h1 className="page-title">Dashboard</h1>
        </header>
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
      </main>
    </div>
  );
}

export default App;
