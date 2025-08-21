import React, { useState } from 'react';

const GameInstaller: React.FC = () => {
  const [appId, setAppId] = useState('');
  const [status, setStatus] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    if (!appId) {
      setStatus('Please enter a Steam App ID.');
      return;
    }

    setIsInstalling(true);
    setStatus('Initiating installation...');
    try {
      const result = await window.electronAPI.installGameServer(appId);
      if (result.success) {
        setStatus('Installation complete!');
      } else {
        setStatus(`Installation failed: ${result.message}`);
      }
    } catch (error: any) {
      setStatus(`Error during installation: ${error.message}`);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-white mb-4">Game Server Installer</h2>
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Enter Steam App ID (e.g., 4020 for Garry's Mod Dedicated Server)"
          className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          disabled={isInstalling}
        />
        <button
          onClick={handleInstall}
          className={`py-2 px-4 rounded text-white font-semibold ${
            isInstalling ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          disabled={isInstalling}
        >
          {isInstalling ? 'Installing...' : 'Install/Update Server'}
        </button>
      </div>
      {status && <p className="mt-4 text-sm text-white">{status}</p>}
    </div>
  );
};

export default GameInstaller;