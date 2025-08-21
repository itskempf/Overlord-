// This is the main process for our Electron app.
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { spawn } = require('child_process');
const fs = require('fs');
const ini = require('ini');
const archiver = require('archiver');
const extract = require('extract-zip');
const cron = require('node-cron');
const crypto = require('crypto');

// Initialize the store to save app data
const store = new Store({
  defaults: {
    scheduledTasks: [],
    installedServers: [],
    steamcmdPath: null
  }
});

// Keep a global reference to the window object and processes
let mainWindow;
let serverProcess;
let activeCronJobs = [];

// --- SCHEDULER ENGINE ---
function initializeScheduler() {
  // 1. Stop all currently running jobs
  activeCronJobs.forEach(job => job.stop());
  activeCronJobs = [];

  // 2. Read the fresh list of tasks
  const tasks = store.get('scheduledTasks');

  // 3. Loop and create new jobs
  tasks.forEach(task => {
    if (cron.validate(task.schedule)) {
      const job = cron.schedule(task.schedule, () => {
        console.log(`Running scheduled task: ${task.type} for server ${task.serverName}`);
        const servers = store.get('installedServers', []);
        const serverToActOn = servers.find(s => s.name === task.serverName);

        if (serverToActOn) {
          if (task.type === 'backup') {
            ipcMain.emit('server:createBackup', {}, serverToActOn);
          } else if (task.type === 'restart') {
            // Simple restart: stop then start
            if (serverProcess && serverProcess.pid) {
                ipcMain.emit('server:stop');
                setTimeout(() => ipcMain.emit('server:start', {}, serverToActOn.path), 5000); // 5s delay
            } else {
                 ipcMain.emit('server:start', {}, serverToActOn.path);
            }
          }
        }
      });
      activeCronJobs.push(job);
    }
  });
  console.log(`Scheduler initialized with ${activeCronJobs.length} tasks.`);
}


// --- MAIN APP WINDOW ---
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const startUrl = process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  initializeScheduler();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


// --- IPC HANDLERS ---

// File Selection
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Server Executable',
    properties: ['openFile'],
    filters: [{ name: 'Executables', extensions: ['exe'] }],
  });
  return canceled ? null : filePaths[0];
});

// Process Management
ipcMain.handle('server:start', (event, filePath) => {
    if (!fs.existsSync(filePath)) {
        return { success: false, message: `Executable not found at: ${filePath}` };
    }
    // ... existing implementation ...
});
ipcMain.handle('server:stop', () => {
    // ... implementation from previous steps ...
});

// Config File Management
ipcMain.handle('server:readConfig', (event, serverPath) => {
    const configPath = path.join(serverPath, 'server.cfg'); // This needs to be smarter later
    try {
        const fileContent = fs.readFileSync(configPath, 'utf-8');
        return ini.parse(fileContent);
    } catch (error) {
        return { error: `Error reading config: ${error.message}` };
    }
});
ipcMain.handle('server:writeConfig', (event, serverPath, content) => {
    const configPath = path.join(serverPath, 'server.cfg');
    try {
        fs.writeFileSync(configPath, ini.stringify(content), 'utf-8');
        return { success: false, message: `Error saving config: ${error.message}` };
    } catch (error) {
        return { success: false, message: `Error saving config: ${error.message}` };
    }
});

// SteamCMD Management
ipcMain.handle('steamcmd:getPath', () => store.get('steamcmdPath'));
ipcMain.handle('steamcmd:setPath', (event, path) => {
    store.set('steamcmdPath', path);
    return { success: true };
});
ipcMain.handle('steamcmd:getInstalledServers', () => store.get('installedServers', []));
ipcMain.handle('steamcmd:installGame', async (event, appId) => {
    // ... implementation from previous steps ...
});

// Backup System
ipcMain.handle('server:createBackup', async (event, server) => {
    // ... implementation from previous steps ...
});
ipcMain.handle('server:listBackups', (event, serverName) => {
    const backupsDir = path.join(app.getPath('userData'), 'backups', serverName);
    if (!fs.existsSync(backupsDir)) return [];
    return fs.readdirSync(backupsDir).filter(file => file.endsWith('.zip'));
});
ipcMain.handle('server:restoreBackup', async (event, server, backupFileName) => {
    if (serverProcess && serverProcess.pid) {
        return { success: false, message: 'Cannot restore backup while server is running. Please stop the server first.' };
    }
    const backupsDir = path.join(app.getPath('userData'), 'backups', server.name);
    const backupPath = path.join(backupsDir, backupFileName);
    const serverPath = server.path;

    try {
        // Ensure the server directory exists
        if (!fs.existsSync(serverPath)) {
            fs.mkdirSync(serverPath, { recursive: true });
        }

        // Clear existing server files (optional, but safer for a clean restore)
        // This is a dangerous operation, consider user confirmation or more granular control
        // For now, we'll just extract over existing files.

        await extract(backupPath, { dir: serverPath });
        return { success: true, message: 'Backup restored successfully.' };
    } catch (error) {
        return { success: false, message: `Failed to restore backup: ${error.message}` };
    }
});

// Scheduled Tasks
ipcMain.handle('tasks:list', () => store.get('scheduledTasks', []));
ipcMain.handle('tasks:create', (event, task) => {
    const tasks = store.get('scheduledTasks', []);
    task.id = crypto.randomUUID();
    tasks.push(task);
    store.set('scheduledTasks', tasks);
    initializeScheduler(); // Reload all jobs
    return { success: true, message: 'Task created.' };
});
ipcMain.handle('tasks:delete', (event, taskId) => {
    let tasks = store.get('scheduledTasks', []);
    tasks = tasks.filter(t => t.id !== taskId);
    store.set('scheduledTasks', tasks);
    initializeScheduler(); // Reload all jobs
    return { success: true, message: 'Task deleted.' };
});

// App Data Management
ipcMain.handle('app:openAppDataFolder', () => {
  shell.openPath(app.getPath('userData'));
});

ipcMain.handle('app:clearCache', async () => {
  try {
    const session = mainWindow.webContents.session;
    await session.clearCache();
    return { success: true, message: 'Cache cleared successfully.' };
  } catch (error) {
    return { success: false, message: `Failed to clear cache: ${error.message}` };
  }
});

// --- SETTINGS ENGINE ---
// Let the user pick steamcmd.exe and store its path
ipcMain.handle('settings:setSteamCMDPath', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Select steamcmd.exe',
      properties: ['openFile'],
      filters: [{ name: 'SteamCMD Executable', extensions: ['exe'] }]
    });
    if (canceled || !filePaths || filePaths.length === 0) {
      return { success: false, message: 'No file selected.' };
    }
    const selectedPath = filePaths[0];
    const filename = path.basename(selectedPath).toLowerCase();
    if (filename !== 'steamcmd.exe') {
      return { success: false, message: 'Please select steamcmd.exe.' };
    }
    store.set('steamcmdPath', selectedPath);
    return { success: true, message: 'SteamCMD path saved.' };
  } catch (error) {
    return { success: false, message: `Failed to set SteamCMD path: ${error.message}` };
  }
});

// Open application data directory
ipcMain.handle('settings:openAppData', () => {
  return shell.openPath(app.getPath('userData'));
});

// Clear application data (delete contents of userData directory, not the directory itself)
ipcMain.handle('settings:clearCache', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const entries = fs.readdirSync(userDataPath, { withFileTypes: true });
    for (const entry of entries) {
      try {
        const fullPath = path.join(userDataPath, entry.name);
        if (entry.isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.rmSync(fullPath, { force: true });
        }
      } catch (e) {
        // continue on individual item failure
      }
    }
    return { success: true, message: 'Application data cleared.' };
  } catch (error) {
    return { success: false, message: `Failed to clear application data: ${error.message}` };
  }
});
