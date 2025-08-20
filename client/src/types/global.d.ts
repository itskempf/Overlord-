export {};

declare global {
  interface ElectronAPI {
    installGameServer(appId: string): Promise<{ ok: boolean; error?: string }>;
    onServerLog(cb: (line: string) => void): void;
    getInstalledServers(): Promise<{ appId: string; name: string; path: string; installedAt?: number }[]>;
    readConfigFile?(serverPath: string): Promise<{ ok: boolean; content?: string; error?: string }>;
    writeConfigFile?(serverPath: string, content: string): Promise<{ ok: boolean; error?: string }>;
    getSteamCMDPath(): Promise<string | null>;
    downloadSteamCMD(): Promise<{ ok: boolean; path?: string; error?: string }>;
  }
  interface Window { electronAPI: ElectronAPI }
}
