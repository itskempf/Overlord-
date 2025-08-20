import SteamCMDManager from '../components/SteamCMDManager';
import GameInstaller from '../components/GameInstaller';
import InstalledServers, { type InstalledServer } from '../components/InstalledServers';

interface Props { onManage: (s: InstalledServer) => void }

const ServersPage = ({ onManage }: Props) => {
  return (
    <section style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="panel" style={{ width: '100%', display:'flex', flexDirection:'column', gap:16 }}>
        <h2 style={{ margin:0 }}>Install / Update Game Server</h2>
        <SteamCMDManager />
        <GameInstaller />
      </div>
      <div className="panel" style={{ width: '100%' }}>
        <InstalledServers onManageServer={onManage} />
      </div>
    </section>
  );
};

export default ServersPage;
