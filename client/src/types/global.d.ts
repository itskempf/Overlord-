import type { InstalledServer } from 'shared';

type TaskType = 'backup' | 'restart';
interface ScheduledTask {
  id: string;
  serverName: string;
  type: TaskType;
  schedule: string;
}

declare global {
  interface ElectronAPI {
    // MVP Functions
    selectServerFile: () => Promise<string | null>;
    startServer: (filePath: string) => Promise<{ success: boolean; message: string }>;
    stopServer: () => Promise<{ success: boolean; message: string }>;
    onServerStatus: (callback: (status: string) => void) => void;
    onServerLog: (callback: (log: string) => void) => void;

    // SteamCMD Functions
  getSteamCMDPath: () => Promise<string | undefined>;
  setSteamCMDPath: (path: string) => Promise<{ success: boolean }>;
  getInstalledServers: () => Promise<InstalledServer[]>;
    steamcmdInstallGame: (appId: string) => Promise<{ success: boolean; message: string }>;
    downloadSteamCMD: () => Promise<{ success: boolean; message: string }>; // Added this based on preload.js

    // App Data Management Functions
    openAppDataFolder: () => void;
    clearApplicationCache: () => Promise<{ success: boolean; message?: string }>;

    // Backup Functions
    createBackup: (server: InstalledServer) => Promise<{ success: boolean; message: string }>;
    listBackups: (serverName: string) => Promise<string[]>;
    restoreBackup: (server: InstalledServer, backupFileName: string) => Promise<{ success: boolean; message: string }>;

    // Config Editor Functions
    readConfigFile: (serverPath: string) => Promise<Record<string, string> | { error: string }>;
    writeConfigFile: (serverPath: string, content: Record<string, string>) => Promise<{ success: boolean; message: string }>;

  // Task Management Functions
  listTasks: () => Promise<ScheduledTask[]>;
  createTask: (task: { serverName: string; type: TaskType; schedule: string }) => Promise<{ success: boolean; message: string }>;
    deleteTask: (taskId: string) => Promise<{ success: boolean; message: string }>;
  }
  interface Window { electronAPI: ElectronAPI }
}