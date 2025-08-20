const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const Store = require('electron-store');

const store = new Store({
  schema: {
    steamcmdPath: { type: 'string' },
    installedServers: { type: 'array', default: [], items: { type: 'object' } }
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function broadcastLog(message) {
  BrowserWindow.getAllWindows().forEach(w => w.webContents.send('server:log', message));
}

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong');

  // Return installed servers list
  ipcMain.handle('steamcmd:getInstalledServers', () => {
    return store.get('installedServers', []);
  });

  // Read server configuration file server.cfg given a server path
  ipcMain.handle('server:readConfig', (_event, serverPath) => {
    try {
      if (!serverPath) return { ok: false, error: 'No path provided' };
      const cfgPath = path.join(serverPath, 'server.cfg');
      if (!fs.existsSync(cfgPath)) {
        return { ok: false, error: 'Config file not found' };
      }
      const content = fs.readFileSync(cfgPath, 'utf-8');
      return { ok: true, content };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  // Create an asynchronous IPC handler for the 'server:writeConfig' channel. It will receive a 'serverPath' and the new 'content'.
  // This handler should use Node's `fs.writeFileSync` module to overwrite the contents of the config file ('server.cfg') inside the provided serverPath.
  // It should write the 'content' as a UTF-8 string.
  // It must include error handling and return a success or failure message to the UI.
  ipcMain.handle('server:writeConfig', (_event, serverPath, content) => {
    try {
      if (!serverPath) return { ok: false, error: 'No path provided' };
      const cfgPath = path.join(serverPath, 'server.cfg');
      fs.writeFileSync(cfgPath, content ?? '', 'utf-8');
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  // Install / update game server using SteamCMD
  ipcMain.handle('steamcmd:installGame', async (_event, appId) => {
    if (!appId || !/^\d+$/.test(String(appId))) {
      return { ok: false, error: 'Invalid App ID' };
    }

    const steamcmdPath = store.get('steamcmdPath');
    if (!steamcmdPath) {
      return { ok: false, error: 'SteamCMD path not configured' };
    }

    const exePath = path.join(steamcmdPath, 'steamcmd.exe');
    broadcastLog(`[steamcmd] Starting install/update for app ${appId}`);

    return await new Promise((resolve) => {
      try {
        const args = ['+login', 'anonymous', '+app_update', String(appId), 'validate', '+quit'];
        const child = spawn(exePath, args, { cwd: steamcmdPath });

        child.stdout.on('data', data => {
          data.toString().split(/\r?\n/).filter(Boolean).forEach(line => broadcastLog(line));
        });
        child.stderr.on('data', data => {
          data.toString().split(/\r?\n/).filter(Boolean).forEach(line => broadcastLog('[ERR] ' + line));
        });

        child.on('error', err => {
          broadcastLog(`[steamcmd] Failed to start: ${err.message}`);
          resolve({ ok: false, error: err.message });
        });

        child.on('close', code => {
          if (code === 0) {
            broadcastLog(`[steamcmd] Completed for app ${appId}`);
            // Derive install directory (SteamCMD default under steamapps) - placeholder logic
            const installDir = path.join(steamcmdPath, 'steamapps', 'common', appId.toString());
            const servers = store.get('installedServers', []);
            if (!servers.find(s => s.appId === appId)) {
              servers.push({ appId: String(appId), name: `App ${appId}`, path: installDir, installedAt: Date.now() });
              store.set('installedServers', servers);
            }
            resolve({ ok: true });
          } else {
            broadcastLog(`[steamcmd] Exited with code ${code}`);
            resolve({ ok: false, error: 'SteamCMD failed with code ' + code });
          }
        });
      } catch (err) {
        broadcastLog(`[steamcmd] Exception: ${err.message}`);
        resolve({ ok: false, error: err.message });
      }
    });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
