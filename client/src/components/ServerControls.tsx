import React, { useState, useEffect } from 'react';

interface ServerControlsProps {
  selectedPath: string | null;
}

const ServerControls: React.FC<ServerControlsProps> = ({ selectedPath }) => {
  const [serverStatus, setServerStatus] = useState<string>('Offline');

  useEffect(() => {
    window.electronAPI.onServerStatus((status: string) => {
      setServerStatus(status);
    });
  }, []);

  const handleStartServer = async () => {
    if (selectedPath) {
      const result = await window.electronAPI.startServer(selectedPath);
      if (!result.success) {
        console.error("Failed to start server:", result.message);
        // Optionally, update UI to show error message
      }
    }
  };

  const handleStopServer = async () => {
    const result = await window.electronAPI.stopServer();
    if (!result.success) {
      console.error("Failed to stop server:", result.message);
      // Optionally, update UI to show error message
    }
  };

  const isServerRunning = serverStatus === 'Online';
  const isStartDisabled = !selectedPath || isServerRunning;
  const isStopDisabled = !isServerRunning;

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-white mb-4">Server Controls</h2>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleStartServer}
          disabled={isStartDisabled}
          className={`px-4 py-2 rounded-md ${isStartDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
        >
          Start Server
        </button>
        <button
          onClick={handleStopServer}
          disabled={isStopDisabled}
          className={`px-4 py-2 rounded-md ${isStopDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50`}
        >
          Stop Server
        </button>
      </div>
      <p className="text-gray-300">
        Server Status: <span className="font-medium">{serverStatus}</span>
      </p>
    </div>
  );
};

export default ServerControls;
