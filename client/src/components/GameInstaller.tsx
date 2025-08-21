import React, { useState } from 'react';
import toast from 'react-hot-toast';

const GameInstaller: React.FC = () => {
  const [appId, setAppId] = useState<string>('');
  const [installing, setInstalling] = useState<boolean>(false);

  const handleInstall = async () => {
    if (!appId) {
      toast.error('Please enter a Steam App ID.');
      return;
    }

    setInstalling(true);
    const promise = window.electronAPI.steamcmdInstallGame(appId).then((res) => {
      if (!res.success) throw new Error(res.message);
      return res;
    });
    toast.promise(promise, {
      loading: 'Installation in progress...',
      success: 'Installation completed!',
      error: (err) => `Error: ${err.message}`,
    });
    try { await promise; } finally { setInstalling(false); }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-white mb-4">Game Server Installation</h2>
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Enter Steam App ID (e.g., 4020 for Garry's Mod Dedicated Server)"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          className="p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleInstall}
          disabled={installing}
          className={`px-4 py-2 rounded-md ${installing ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center gap-2`}
        >
          {installing && <span className="inline-block h-4 w-4 border-2 border-b-transparent rounded-full animate-spin" />}
          Install/Update Server
        </button>
      </div>
    </div>
  );
};

export default GameInstaller;