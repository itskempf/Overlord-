import React, { useState } from 'react';

interface ServerSelectorProps {
  onSelected: (path: string | null) => void;
}

const ServerSelector: React.FC<ServerSelectorProps> = ({ onSelected }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  const handleSelectFile = async () => {
    try {
      const filePath = await window.electronAPI.selectServerFile();
      if (filePath) {
        setSelectedFilePath(filePath);
        onSelected(filePath);
      }
    } catch (error) {
      console.error('Error selecting server file:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-white mb-4">Server Selection</h2>
      <button
        onClick={handleSelectFile}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
      >
        Select Server Executable...
      </button>
      <p className="mt-4 text-gray-300">
        Selected File: <span className="font-medium text-white">{selectedFilePath || 'None'}</span>
      </p>
    </div>
  );
};

export default ServerSelector;