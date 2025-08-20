import { useEffect, useRef, useState } from 'react';

const ServerConsole = () => {
  const [status, setStatus] = useState('Offline');
  const [logs, setLogs] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.electronAPI.onServerStatus((s: string) => setStatus(s));
    window.electronAPI.onServerLog(line => {
      setLogs(prev => [...prev.slice(-999), line]);
    });
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ fontSize:12, fontWeight:600, color: status==='Online' ? '#34d399' : '#f87171' }}>Server Status: {status}</div>
      <div style={{ background:'#0f1419', border:'1px solid #1f2a33', borderRadius:8, padding:10, minHeight:180, maxHeight:300, overflow:'auto', fontFamily:'ui-monospace,monospace', fontSize:12, lineHeight:1.35 }}>
        {logs.length===0 && <div style={{ color:'#475569' }}>No output yet.</div>}
        {logs.map((l,i)=>(<div key={i}>{l}</div>))}
        <div ref={endRef} />
      </div>
    </div>
  );
};
export default ServerConsole;
