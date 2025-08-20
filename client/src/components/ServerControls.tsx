import { useState, useEffect } from 'react';

interface Props { selectedPath: string | null }

const ServerControls = ({ selectedPath }: Props) => {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const api = window.electronAPI as ElectronAPI & { onServerStatus: (cb: (s: string)=>void)=>void };
    api.onServerStatus((s: string) => { setRunning(s === 'Online'); });
  }, []);

  const start = async () => {
    if (!selectedPath) return;
    const api = window.electronAPI as ElectronAPI & { startServer: (p: string)=>Promise<{ok:boolean; error?:string}> };
    const res = await api.startServer(selectedPath);
    if (!res.ok) {
      // handle error later
    }
  };
  const stop = async () => {
    const api = window.electronAPI as ElectronAPI & { stopServer: ()=>Promise<{ok:boolean; error?:string}> };
    await api.stopServer();
  };

  return (
    <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
      <button disabled={!selectedPath || running} onClick={start} style={{ background:(!selectedPath||running)?'#475569':'#16a34a', color:'#fff', border:0, padding:'6px 16px', borderRadius:6, fontWeight:600, cursor:(!selectedPath||running)?'not-allowed':'pointer' }}>Start</button>
      <button disabled={!running} onClick={stop} style={{ background:!running?'#475569':'#dc2626', color:'#fff', border:0, padding:'6px 16px', borderRadius:6, fontWeight:600, cursor:!running?'not-allowed':'pointer' }}>Stop</button>
      <span style={{ fontSize:12, fontWeight:600, color: running ? '#34d399' : '#f87171' }}>Status: {running ? 'Online' : 'Offline'}</span>
    </div>
  );
};
export default ServerControls;
