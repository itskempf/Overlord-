import { useState, useEffect } from 'react';

interface Props { selectedPath: string | null }

const ServerControls = ({ selectedPath }: Props) => {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.electronAPI.onServerStatus((s) => { setRunning(s === 'Online'); if (s === 'Offline') setError(null); });
  }, []);

  const start = async () => {
    if (!selectedPath) return;
    const res = await window.electronAPI.startServer(selectedPath);
    if (!res.ok) setError(res.error || 'Failed to start'); else setError(null);
  };
  const stop = async () => {
    const res = await window.electronAPI.stopServer();
    if (!res.ok) setError(res.error || 'Failed to stop');
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        <button disabled={!selectedPath || running} onClick={start} style={{ background:(!selectedPath||running)?'#475569':'#16a34a', color:'#fff', border:0, padding:'6px 16px', borderRadius:6, fontWeight:600, cursor:(!selectedPath||running)?'not-allowed':'pointer' }}>Start</button>
        <button disabled={!running} onClick={stop} style={{ background:!running?'#475569':'#dc2626', color:'#fff', border:0, padding:'6px 16px', borderRadius:6, fontWeight:600, cursor:!running?'not-allowed':'pointer' }}>Stop</button>
        <span style={{ fontSize:12, fontWeight:600, color: running ? '#34d399' : '#f87171' }}>Status: {running ? 'Online' : 'Offline'}</span>
      </div>
      {error && <div style={{ fontSize:12, color:'#f87171' }}>{error}</div>}
    </div>
  );
};
export default ServerControls;
