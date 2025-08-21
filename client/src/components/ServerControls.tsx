import React, { useState } from 'react';

interface ServerControlsProps {
  selectedPath: string | null;
}

const ServerControls: React.FC<ServerControlsProps> = ({ selectedPath }) => {
  const [serverStatus, setServerStatus] = useState<'Offline' | 'Online' | 'Starting' | 'Stopping'>('Offline');

  const handleStartServer = async () => {
    if (selectedPath) {
      setServerStatus('Starting');
      const result = await window.electronAPI.startServer(selectedPath);
      if (result.ok) {
        setServerStatus('Online');
      } else {
        console.error('Failed to start server:', result.error);
        setServerStatus('Offline');
      }
    }
  };

  const handleStopServer = async () => {
    setServerStatus('Stopping');
    const result = await window.electronAPI.stopServer();
    if (result.ok) {
      setServerStatus('Offline');
    } else {
      console.error('Failed to stop server:', result.error);
      setServerStatus('Online'); // Revert to online if stop fails
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-white mb-4">Server Controls</h2>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleStartServer}
          disabled={!selectedPath || serverStatus === 'Online' || serverStatus === 'Starting'}
          className={`px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-200 ease-in-out
            ${!selectedPath || serverStatus === 'Online' || serverStatus === 'Starting'
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
            }`}
        >
          Start Server
        </button>
        <button
          onClick={handleStopServer}
          disabled={serverStatus === 'Offline' || serverStatus === 'Stopping'}
          className={`px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-200 ease-in-out
            ${serverStatus === 'Offline' || serverStatus === 'Stopping'
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
            }`}
        >
          Stop Server
        </button>
      </div>
      <p className="text-gray-300">
        Server Status: <span className="font-medium text-white">{serverStatus}</span>
      </p>
    </div>
  );
};

export default ServerControls;
