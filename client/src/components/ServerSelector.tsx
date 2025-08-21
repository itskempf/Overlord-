import React from 'react';

interface ServerSelectorProps {
  selectedPath: string | null;
  onSelected: (path: string | null) => void;
}

const ServerSelector: React.FC<ServerSelectorProps> = ({ selectedPath, onSelected }) => {
  const handleSelectFile = async () => {
    const filePath = await window.electronAPI.selectServerFile();
    onSelected(filePath);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-white mb-4">Server Selection</h2>
      <button
        onClick={handleSelectFile}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Select Server Executable...
      </button>
      <p className="mt-4 text-gray-300">
        Selected File: <span className="font-medium">{selectedPath || "None"}</span>
      </p>
    </div>
  );
};

export default ServerSelector;
