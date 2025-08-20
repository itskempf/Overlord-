const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');
const os = require('os');
const Store = require('electron-store');
const unzipper = require('unzipper');

let serverProcess = null;
let mainWindow = null;

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
  mainWindow = win;
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function sendStatus(status) {
  if (mainWindow) mainWindow.webContents.send('server:status', status);
}
function sendLog(line) {
  if (mainWindow) mainWindow.webContents.send('server:log', line);
}

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong');

  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Select Server Executable',
      properties: ['openFile'],
      filters: [{ name: 'Executable', extensions: ['exe'] }]
    });
    if (!result.canceled && result.filePaths.length) return result.filePaths[0];
    return null;
  });

  ipcMain.handle('server:start', (_e, filePath) => {
    if (serverProcess) return { ok: false, error: 'Server already running' };
    if (!filePath || !fs.existsSync(filePath)) return { ok: false, error: 'Invalid file path' };
    try {
      serverProcess = spawn(filePath, [], { cwd: path.dirname(filePath) });
      sendStatus('Online');
      sendLog(`[server] Started: ${filePath}`);
      serverProcess.stdout?.on('data', d => sendLog(d.toString()));
      serverProcess.stderr?.on('data', d => sendLog('[err] ' + d.toString()));
      serverProcess.on('close', code => { sendLog(`[server] Exited with code ${code}`); serverProcess = null; sendStatus('Offline'); });
      serverProcess.on('error', err => { sendLog(`[server] Error: ${err.message}`); });
      return { ok: true };
    } catch (e) {
      serverProcess = null;
      sendStatus('Offline');
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('server:stop', () => {
    if (!serverProcess) return { ok: false, error: 'No running server' };
    try { serverProcess.kill(); return { ok: true }; } catch (e) { return { ok: false, error: e.message }; }
  });

  ipcMain.handle('steamcmd:getInstalledServers', () => store.get('installedServers', []));
  ipcMain.handle('steamcmd:getPath', () => store.get('steamcmdPath') || null);
  ipcMain.handle('steamcmd:download', async () => {
    try {
      const platform = os.platform();
      if (platform !== 'win32') return { ok: false, error: 'SteamCMD auto-download currently only implemented for Windows' };
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'steamcmd-'));
      const zipPath = path.join(tempDir, 'steamcmd.zip');
      const destDir = path.join(app.getPath('userData'), 'steamcmd');
      fs.mkdirSync(destDir, { recursive: true });
      const url = 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip';
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(zipPath);
        https.get(url, res => {
          if (res.statusCode !== 200) { reject(new Error('Failed download: ' + res.statusCode)); return; }
          res.pipe(file); file.on('finish', () => file.close(resolve));
        }).on('error', reject);
      });
      await fs.createReadStream(zipPath).pipe(unzipper.Extract({ path: destDir })).promise();
      const exePath = path.join(destDir, 'steamcmd.exe');
      if (!fs.existsSync(exePath)) return { ok: false, error: 'Extraction failed (steamcmd.exe missing)' };
      store.set('steamcmdPath', destDir);
      return { ok: true, path: destDir };
    } catch (e) { return { ok: false, error: e.message }; }
  });

  ipcMain.handle('server:readConfig', (_event, serverPath) => {
    try { if (!serverPath) return { ok: false, error: 'No path provided' }; const cfg = path.join(serverPath, 'server.cfg'); if (!fs.existsSync(cfg)) return { ok: false, error: 'Config file not found' }; return { ok: true, content: fs.readFileSync(cfg, 'utf-8') }; } catch (e) { return { ok: false, error: e.message }; }
  });
  ipcMain.handle('server:writeConfig', (_e, serverPath, content) => {
    try { if (!serverPath) return { ok: false, error: 'No path provided' }; const cfg = path.join(serverPath, 'server.cfg'); fs.writeFileSync(cfg, content ?? '', 'utf-8'); return { ok: true }; } catch (e) { return { ok: false, error: e.message }; }
  });

  ipcMain.handle('steamcmd:installGame', async (_event, appId) => {
    if (!appId || !/^\d+$/.test(String(appId))) return { ok: false, error: 'Invalid App ID' };
    const steamcmdPath = store.get('steamcmdPath');
    if (!steamcmdPath) return { ok: false, error: 'SteamCMD path not configured' };
    const exePath = path.join(steamcmdPath, 'steamcmd.exe');
    sendLog(`[steamcmd] Starting install/update for app ${appId}`);
    return await new Promise(resolve => {
      try {
        const child = spawn(exePath, ['+login', 'anonymous', '+app_update', String(appId), 'validate', '+quit'], { cwd: steamcmdPath });
        child.stdout.on('data', d => d.toString().split(/\r?\n/).filter(Boolean).forEach(l => sendLog(l)));
        child.stderr.on('data', d => d.toString().split(/\r?\n/).filter(Boolean).forEach(l => sendLog('[ERR] ' + l)));
        child.on('error', err => { sendLog(`[steamcmd] Failed: ${err.message}`); resolve({ ok: false, error: err.message }); });
        child.on('close', code => {
          if (code === 0) {
            sendLog(`[steamcmd] Completed for app ${appId}`);
            const installDir = path.join(steamcmdPath, 'steamapps', 'common', appId.toString());
            const servers = store.get('installedServers', []);
            if (!servers.find(s => s.appId === appId)) { servers.push({ appId: String(appId), name: `App ${appId}`, path: installDir, installedAt: Date.now() }); store.set('installedServers', servers); }
            resolve({ ok: true });
          } else { sendLog(`[steamcmd] Exit code ${code}`); resolve({ ok: false, error: 'SteamCMD failed with code ' + code }); }
        });
      } catch (err) { sendLog(`[steamcmd] Exception: ${err.message}`); resolve({ ok: false, error: err.message }); }
    });
  });

  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
