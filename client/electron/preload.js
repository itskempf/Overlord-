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
  downloadSteamCMD: () => ipcRenderer.invoke('steamcmd:download')
});
