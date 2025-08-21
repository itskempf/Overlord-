import { useEffect, useState } from 'react';

// A React functional component to manage the SteamCMD installation.
// 1. STATE: status + install flag
const SteamCMDManager = () => {
  const [status, setStatus] = useState('Checking...');
  const [isInstalled, setIsInstalled] = useState(false);

  // 2. INITIAL CHECK
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const found = await window.electronAPI.getSteamCMDPath();
        if (!mounted) return;
        if (found) { setIsInstalled(true); setStatus('SteamCMD is ready'); }
        else { setIsInstalled(false); setStatus('SteamCMD not found. Please set it in settings.'); }
      } catch (e) {
        if (!mounted) return;
        const msg = e instanceof Error ? e.message : String(e);
        setStatus('Error checking SteamCMD: ' + msg);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 3. RENDER
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ fontSize:12, color: isInstalled ? '#34d399' : '#eab308' }}>{status}</div>
    </div>
  );
};


export default SteamCMDManager;
