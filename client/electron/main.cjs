// This is the main process for our Electron app.
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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
    // ... implementation from previous steps ...
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
    // ... implementation from previous steps ...
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
