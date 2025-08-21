import React, { useState } from 'react';

const GameInstaller: React.FC = () => {
  const [appId, setAppId] = useState<string>('');
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleInstallClick = async () => {
    if (!appId) {
      setStatusMessage('Please enter a Steam App ID.');
      return;
    }

    setIsInstalling(true);
    setStatusMessage('Installation in progress...');

    try {
      const result = await window.electronAPI.installGameServer(appId);
      if (result.ok) {
        setStatusMessage('Server installed/updated successfully!');
      } else {
        setStatusMessage(`Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setStatusMessage(`An unexpected error occurred: ${error.message}`);
      console.error('Error installing game server:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md text-white">
      <h2 className="text-xl font-semibold mb-4">Game Server Installer</h2>
      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          placeholder="Enter Steam App ID (e.g., 4020)"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          className="flex-grow p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
          disabled={isInstalling}
        />
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-200 ease-in-out
            ${isInstalling
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
        >
          {isInstalling ? 'Installing...' : 'Install/Update Server'}
        </button>
      </div>
      {statusMessage && (
        <p className={`text-sm ${statusMessage.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {statusMessage}
        </p>
      )}
    </div>
  );
};

export default GameInstaller;
