import { useState } from 'react';

const ServerSelector = ({ onSelected }: { onSelected?: (path: string | null) => void }) => {
  const [filePath, setFilePath] = useState<string | null>(null);
  const pick = async () => {
    const selected = await window.electronAPI.selectServerFile();
    setFilePath(selected);
    onSelected?.(selected);
  };
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <button onClick={pick} style={{ alignSelf:'flex-start', background:'#2563eb', color:'#fff', border:0, padding:'6px 14px', borderRadius:6, fontWeight:600, cursor:'pointer' }}>Select Server Executable...</button>
      <div style={{ fontSize:12, color:'#94a3b8' }}>Selected File: {filePath || 'None'}</div>
    </div>
  );
};
export default ServerSelector;
