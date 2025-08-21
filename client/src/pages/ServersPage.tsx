import React from 'react';
import GameInstaller from '../components/GameInstaller';
import InstalledServers from '../components/InstalledServers';
import { InstalledServer } from 'shared';

interface ServersPageProps {
  onManage: (server: InstalledServer) => void;
}

const ServersPage: React.FC<ServersPageProps> = ({ onManage }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Manage Game Servers</h1>
      <GameInstaller />
      <div className="mt-6">
        <InstalledServers onManage={onManage} />
      </div>
    </div>
  );
};

export default ServersPage;
