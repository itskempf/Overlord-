import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const [steamCmdPath, setSteamCmdPath] = useState<string>('');

  useEffect(() => {
    window.electronAPI.getSteamCMDPath().then((path) => {
      if (path) {
        setSteamCmdPath(path);
      }
    });
  }, []);

  const handleOpenAppData = () => {
    window.electronAPI.openAppDataFolder();
    toast.success('Opened App Data Folder');
  };

  const handleClearCache = async () => {
    const promise = window.electronAPI.clearApplicationCache();
    toast.promise(promise, {
      loading: 'Clearing cache...',
      success: (result) => {
        if (result.success) {
          return 'Application cache cleared!';
        } else {
          throw new Error(`Failed to clear cache: ${result.message}`);
        }
      },
      error: (err) => `Failed to clear cache: ${err.message}`,
    });
  };

  const handleSetSteamCmdPath = async () => {
    const promise = window.electronAPI.setSteamCMDPath(steamCmdPath);
    toast.promise(promise, {
      loading: 'Updating SteamCMD path...',
      success: (result) => {
        if (result.success) {
          return 'SteamCMD path updated!';
        } else {
          throw new Error('Failed to update SteamCMD path.');
        }
      },
      error: (err) => `Failed to update SteamCMD path: ${err.message}`,
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">SteamCMD Path</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={steamCmdPath}
            onChange={(e) => setSteamCmdPath(e.target.value)}
            placeholder="Path to steamcmd.exe"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleSetSteamCmdPath}
          >
            Set Path
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">Current path: {steamCmdPath || 'Not set'}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Application Data</h2>
        <div className="flex space-x-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            onClick={handleOpenAppData}
          >
            Open App Data Folder
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={handleClearCache}
          >
            Clear Application Cache
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;