import { useState } from 'react';
import ServerSelector from './ServerSelector';
import ServerControls from './ServerControls';
import ServerConsole from './ServerConsole';

const Dashboard = () => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  return (
    <section style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="panel" style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <h2 style={{ margin:0 }}>Server Target</h2>
        <ServerSelector selectedPath={selectedPath} onSelected={setSelectedPath} />
        <ServerControls selectedPath={selectedPath} />
      </div>
      <div className="panel" style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <h2 style={{ margin:0 }}>Console</h2>
        <ServerConsole />
      </div>
    </section>
  );
};

export default Dashboard;
