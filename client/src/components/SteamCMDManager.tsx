import { useEffect, useState } from 'react';

// A React functional component to manage the SteamCMD installation.
// 1. STATE: status + install flag
const SteamCMDManager = () => {
  const [status, setStatus] = useState('Checking...');
  const [isInstalled, setIsInstalled] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // 2. INITIAL CHECK
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const found = await window.electronAPI.getSteamCMDPath();
        if (!mounted) return;
        if (found) { setIsInstalled(true); setStatus('SteamCMD is ready'); }
        else { setIsInstalled(false); setStatus('SteamCMD not found. Please download.'); }
      } catch (e) {
        if (!mounted) return;
        const msg = e instanceof Error ? e.message : String(e);
        setStatus('Error checking SteamCMD: ' + msg);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 3. DOWNLOAD FUNCTION
  const handleDownload = async () => {
    setDownloading(true);
    setStatus('Downloading... Please wait.');
    try {
      const res = await window.electronAPI.downloadSteamCMD();
      if (res?.ok) {
        const found = await window.electronAPI.getSteamCMDPath();
        if (found) { setIsInstalled(true); setStatus('SteamCMD is ready'); }
        else { setIsInstalled(false); setStatus('Downloaded but path missing'); }
      } else {
        setIsInstalled(false);
        setStatus('Download failed: ' + (res?.error || 'Unknown error'));
      }
    } catch (e) {
      setIsInstalled(false);
      const msg = e instanceof Error ? e.message : String(e);
      setStatus('Download error: ' + msg);
    } finally {
      setDownloading(false);
    }
  };

  // 4. RENDER
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ fontSize:12, color: isInstalled ? '#34d399' : '#eab308' }}>{status}</div>
      <button
        onClick={handleDownload}
        disabled={isInstalled || downloading}
        style={{ alignSelf:'flex-start', background: isInstalled ? '#475569' : '#2563eb', color:'#fff', border:0, padding:'6px 14px', borderRadius:6, cursor: isInstalled || downloading ? 'not-allowed':'pointer', fontWeight:600 }}
      >
        {downloading ? 'Downloading...' : (isInstalled ? 'SteamCMD Installed' : 'Download SteamCMD')}
      </button>
    </div>
  );
};

export default SteamCMDManager;
