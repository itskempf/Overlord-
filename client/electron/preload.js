const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  installGameServer: (appId) => ipcRenderer.invoke('steamcmd:installGame', appId),
  getInstalledServers: () => ipcRenderer.invoke('steamcmd:getInstalledServers'),
  onServerLog: (callback) => {
    ipcRenderer.on('server:log', (_event, line) => callback(line));
  }
});
