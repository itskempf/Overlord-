import React from 'react';

export type PageKey = 'dashboard' | 'servers' | 'settings';

interface SidebarProps {
  current: PageKey;
  onNavigate: (page: PageKey) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ current, onNavigate }) => {
  return (
    <aside className="sidebar">
      <div className="logo">Overlord</div>
      <nav className="nav">
        <ul>
          <li className="nav-section">General</li>
          <li><button className={current==='dashboard'? 'active': ''} onClick={() => onNavigate('dashboard')}>Dashboard</button></li>
          <li><button className={current==='servers'? 'active': ''} onClick={() => onNavigate('servers')}>Servers</button></li>
          <li className="nav-section">Management</li>
          <li><button disabled>Workshop</button></li>
          <li><button disabled>Backups</button></li>
          <li><button className={current==='settings'? 'active': ''} onClick={() => onNavigate('settings')}>Settings</button></li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button className="primary-btn">+ New Server</button>
      </div>
    </aside>
  );
};

export default Sidebar;
