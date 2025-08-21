const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  installGameServer: (appId) => ipcRenderer.invoke('steamcmd:installGame', appId),
  getInstalledServers: () => ipcRenderer.invoke('steamcmd:getInstalledServers'),
  onServerLog: (callback) => {
    ipcRenderer.on('server:log', (_event, line) => callback(line));
  },
  readConfigFile: (serverPath) => ipcRenderer.invoke('server:readConfig', serverPath),
  writeConfigFile: (serverPath, content) => ipcRenderer.invoke('server:writeConfig', serverPath, content),
  getSteamCMDPath: () => ipcRenderer.invoke('steamcmd:getPath'),
  downloadSteamCMD: () => ipcRenderer.invoke('steamcmd:download'),
  selectServerFile: () => ipcRenderer.invoke('dialog:openFile'),
  startServer: (filePath) => ipcRenderer.invoke('server:start', filePath),
  stopServer: () => ipcRenderer.invoke('server:stop'),
  onServerStatus: (callback) => ipcRenderer.on('server:status', (_e, value) => callback(value)),
  createBackup: (server) => ipcRenderer.invoke('server:createBackup', server),
  listBackups: (serverName) => ipcRenderer.invoke('server:listBackups', serverName),
  restoreBackup: (server, backupFileName) => ipcRenderer.invoke('server:restoreBackup', server, backupFileName)
});
});
