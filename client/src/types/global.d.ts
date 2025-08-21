import { InstalledServer } from '../../shared/src/types';

declare global {
  interface ElectronAPI {
    // MVP Functions
    selectServerFile: () => Promise<string | null>;
    startServer: (filePath: string) => Promise<{ success: boolean; message: string }>;
    stopServer: () => Promise<{ success: boolean; message: string }>;
    onServerStatus: (callback: (status: string) => void) => void;
    onServerLog: (callback: (log: string) => void) => void;

    // SteamCMD Functions
    steamcmdGetPath: () => Promise<string | undefined>;
        listInstalledServers: () => Promise<any[]>;
    steamcmdInstallGame: (appId: string) => Promise<{ success: boolean; message: string }>;

    // Backup Functions
    createBackup: (server: InstalledServer) => Promise<{ success: boolean; message: string }>;
    listBackups: (serverName: string) => Promise<string[]>;
    restoreBackup: (server: InstalledServer, backupFileName: string) => Promise<{ success: boolean; message: string }>;

    // Config Editor Functions
    readConfigFile: (serverPath: string) => Promise<Record<string, string> | { error: string }>;
    writeConfigFile: (serverPath: string, content: Record<string, string>) => Promise<{ success: boolean; message: string }>;

    // Task Management Functions (NEW)
    listTasks: () => Promise<any[]>; // Assuming 'any[]' for now, can define a more specific type later
    createTask: (task: any) => Promise<{ success: boolean; message: string }>; // Assuming 'any' for now
    deleteTask: (taskId: string) => Promise<{ success: boolean; message: string }>;
  }
  interface Window { electronAPI: ElectronAPI }
}