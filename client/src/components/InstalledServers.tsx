import React, { useState, useEffect } from 'react';
import { InstalledServer } from 'shared';



interface InstalledServersProps {
  onManage: (server: InstalledServer) => void;
}

const InstalledServers: React.FC<InstalledServersProps> = ({ onManage }) => {
  const [servers, setServers] = useState<InstalledServer[]>([]);

  useEffect(() => {
    const fetchServers = async () => {
      const installed = await window.electronAPI.listInstalledServers();
      setServers(installed);
    };
    fetchServers();
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md text-white">
      <h2 className="text-xl font-semibold mb-4">Installed Servers</h2>
      {servers.length === 0 ? (
        <p className="text-gray-400">No servers installed yet.</p>
      ) : (
        <ul className="space-y-3">
          {servers.map((server) => (
            <li key={server.appId} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
              <div>
                <p className="font-medium">{server.name} (App ID: {server.appId})</p>
                <p className="text-sm text-gray-400">Path: {server.path}</p>
              </div>
              <button
                onClick={() => onManage(server)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
              >
                Manage
              </button>
            </li>
          ))
          }
        </ul>
      )}
    </div>
  );
};

export default InstalledServers;
