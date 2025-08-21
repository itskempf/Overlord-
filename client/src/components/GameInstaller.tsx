import React, { useState } from 'react';

const GameInstaller: React.FC = () => {
  const [appId, setAppId] = useState<string>('');
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  const handleInstall = async () => {
    if (!appId) {
      setMessage('Please enter a Steam App ID.');
      setIsError(true);
      return;
    }

    setIsInstalling(true);
    setMessage('Installation in progress...');
    setIsError(false);

    try {
      const result = await window.electronAPI.installGameServer(appId);
      if (result.success) {
        setMessage(result.message);
        setIsError(false);
      } else {
        setMessage(result.message);
        setIsError(true);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
      setIsError(true);
    } finally {
      setIsInstalling(false);
    }
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
          disabled={isInstalling}
        />
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className={`px-4 py-2 rounded-md ${isInstalling ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
        >
          {isInstalling ? 'Installing...' : 'Install/Update Server'}
        </button>
      </div>
      {message && (
        <p className={`mt-4 text-sm ${isError ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default GameInstaller;
