import React, { useState, useEffect } from 'react';
import type { InstalledServer } from 'shared';
import BackupManager from '../components/BackupManager';
import TaskManager from '../components/TaskManager'; // Added import

interface ServerDetailPageProps {
  server: InstalledServer;
  onBack: () => void;
}

const ServerDetailPage: React.FC<ServerDetailPageProps> = ({ server, onBack }) => {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [originalConfig, setOriginalConfig] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const result = await window.electronAPI.readConfigFile(server.path);
      if ('error' in result) {
        setSaveMessage(`Error loading config: ${result.error}`);
        return;
      }
      setConfig(result);
      setOriginalConfig(result);
    };
    fetchConfig();
  }, [server.path]);

  const handleInputChange = (key: string, value: string) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [key]: value,
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const result = await window.electronAPI.writeConfigFile(server.path, config);
      if (result.success) {
        setOriginalConfig(config);
        setSaveMessage('Saved!');
      } else {
        setSaveMessage(`Error: ${result.message}`);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setSaveMessage(`Error: ${msg}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000); // Clear message after 3 seconds
    }
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Editing Config for {server.name}</h2>
        <div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 mr-2"
          >
            Back
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges || isSaving}
            className={`px-4 py-2 rounded-md ${!hasChanges || isSaving ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      {saveMessage && (
        <p className={`mb-4 text-sm ${saveMessage.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {saveMessage}
        </p>
      )}
      <div className="space-y-4">
        {Object.keys(config).map((key) => (
          <div key={key} className="flex items-center">
            <label htmlFor={key} className="w-1/4 text-gray-300 font-medium pr-4">{key}:</label>
            <input
              type="text"
              id={key}
              value={config[key]}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="w-3/4 p-2 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
      <div className="mt-8">
        <BackupManager server={server} />
      </div>
      <div className="mt-8">
        <TaskManager /> {/* Corrected to single instance */}
      </div>
    </div>
  );
};

export default ServerDetailPage;