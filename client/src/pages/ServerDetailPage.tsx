import React, { useState, useEffect } from 'react';
import { InstalledServer } from '../components/InstalledServers';

interface ServerDetailPageProps {
  server: InstalledServer;
  onBack: () => void;
}

const ServerDetailPage: React.FC<ServerDetailPageProps> = ({ server, onBack }) => {
  const [configContent, setConfigContent] = useState<string>('');
  const [originalConfigContent, setOriginalConfigContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const content = await window.electronAPI.readConfigFile(server.path);
      setConfigContent(content);
      setOriginalConfigContent(content);
    };
    fetchConfig();
  }, [server.path]);

  const handleConfigChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfigContent(event.target.value);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const result = await window.electronAPI.writeConfigFile(server.path, configContent);
      if (result.success) {
        setOriginalConfigContent(configContent);
        setSaveMessage('Saved!');
      } else {
        setSaveMessage(`Error: ${result.message}`);
      }
    } catch (error: any) {
      setSaveMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000); // Clear message after 3 seconds
    }
  };

  const hasChanges = configContent !== originalConfigContent;

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
      <textarea
        className="w-full h-96 p-3 rounded-md bg-gray-900 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={configContent}
        onChange={handleConfigChange}
      />
    </div>
  );
};

export default ServerDetailPage;
