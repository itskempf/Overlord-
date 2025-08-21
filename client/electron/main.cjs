// This is the main process for our Electron app.
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { spawn } = require('child_process');
const fs = require('fs');

// Initialize the store to save app data
const store = new Store();

// Keep a global reference to the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let serverProcess; // To keep track of the running game server

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the app.
  const startUrl = process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  mainWindow.loadURL(startUrl);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    // Dereference the window object
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// --- OUR CUSTOM IPC HANDLERS ---

// File Selection
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Server Executable',
    properties: ['openFile'],
    filters: [{ name: 'Executables', extensions: ['exe'] }],
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

// Process Management
ipcMain.handle('server:start', (event, filePath) => {
  if (serverProcess) {
    return { success: false, message: 'Server is already running.' };
  }
  try {
    mainWindow.webContents.send('server:status', 'Starting');
    serverProcess = spawn(filePath, [], { detached: true });

    serverProcess.stdout.on('data', (data) => {
      mainWindow.webContents.send('server:log', data.toString());
    });
    serverProcess.stderr.on('data', (data) => {
      mainWindow.webContents.send('server:log', `ERROR: ${data.toString()}`);
    });
    serverProcess.on('close', (code) => {
      mainWindow.webContents.send('server:status', 'Offline');
      mainWindow.webContents.send('server:log', `Server process exited with code ${code}`);
      serverProcess = null;
    });
    serverProcess.on('error', (err) => {
        mainWindow.webContents.send('server:status', 'Error');
        mainWindow.webContents.send('server:log', `Failed to start server: ${err.message}`);
        serverProcess = null;
    });

    mainWindow.webContents.send('server:status', 'Online');
    return { success: true, message: 'Server started.' };
  } catch (error) {
    mainWindow.webContents.send('server:status', 'Error');
    return { success: false, message: `Failed to start server: ${error.message}` };
  }
});

ipcMain.handle('server:stop', () => {
  if (serverProcess) {
    mainWindow.webContents.send('server:status', 'Stopping');
    serverProcess.kill();
    serverProcess = null;
    return { success: true, message: 'Server stopped.' };
  }
  return { success: false, message: 'Server is not running.' };
});

// Config File Management
ipcMain.handle('server:readConfig', (event, serverPath) => {
    // NOTE: This assumes a generic config name. You'll need to make this smarter later.
    const configPath = path.join(serverPath, 'server.cfg');
    try {
        if (fs.existsSync(configPath)) {
            return fs.readFileSync(configPath, 'utf-8');
        }
        return 'Error: server.cfg not found in the server directory.';
    } catch (error) {
        return `Error reading config file: ${error.message}`;
    }
});

ipcMain.handle('server:writeConfig', (event, serverPath, content) => {
    const configPath = path.join(serverPath, 'server.cfg');
     try {
        fs.writeFileSync(configPath, content, 'utf-8');
        return { success: true, message: 'Config saved successfully.' };
    } catch (error) {
        return { success: false, message: `Error saving config file: ${error.message}` };
    }
});


// SteamCMD Management
ipcMain.handle('steamcmd:getPath', () => {
    return store.get('steamcmdPath');
});

ipcMain.handle('steamcmd:getInstalledServers', () => {
    return store.get('installedServers', []);
});

ipcMain.handle('steamcmd:installGame', async (event, appId) => {
    const steamcmdPath = store.get('steamcmdPath');
    if (!steamcmdPath) {
        mainWindow.webContents.send('server:log', 'ERROR: SteamCMD path not configured. Please set it in settings.');
        return { success: false, message: 'SteamCMD path not configured.' };
    }

    // Ensure steamcmd.exe exists
    if (!fs.existsSync(steamcmdPath)) {
        mainWindow.webContents.send('server:log', `ERROR: steamcmd.exe not found at ${steamcmdPath}.`);
        return { success: false, message: `steamcmd.exe not found at ${steamcmdPath}.` };
    }

    mainWindow.webContents.send('server:log', `Starting SteamCMD for App ID: ${appId}`);
    mainWindow.webContents.send('server:status', 'Installing');

    try {
        const steamcmdProcess = spawn(steamcmdPath, ['+login', 'anonymous', '+app_update', appId, 'validate', '+quit']);

        steamcmdProcess.stdout.on('data', (data) => {
            mainWindow.webContents.send('server:log', data.toString());
        });

        steamcmdProcess.stderr.on('data', (data) => {
            mainWindow.webContents.send('server:log', `ERROR: ${data.toString()}`);
        });

        return new Promise((resolve) => {
            steamcmdProcess.on('close', (code) => {
                if (code === 0) {
                    mainWindow.webContents.send('server:log', `SteamCMD process for App ID ${appId} completed successfully.`);
                    mainWindow.webContents.send('server:status', 'Idle');

                    // Save server information to store
                    const installedServers = store.get('installedServers', []);
                    const serverPath = path.join(path.dirname(steamcmdPath), 'steamapps', 'common', appId); // Simplified path
                    const serverName = `App ID: ${appId}`; // Placeholder name

                    const existingServerIndex = installedServers.findIndex(s => s.appId === appId);
                    if (existingServerIndex > -1) {
                        installedServers[existingServerIndex] = { appId, name: serverName, path: serverPath };
                    } else {
                        installedServers.push({ appId, name: serverName, path: serverPath });
                    }
                    store.set('installedServers', installedServers);

                    resolve({ success: true, message: 'Installation complete.' });
                } else {
                    mainWindow.webContents.send('server:log', `SteamCMD process for App ID ${appId} exited with code ${code}.`);
                    mainWindow.webContents.send('server:status', 'Error');
                    resolve({ success: false, message: `SteamCMD process exited with code ${code}.` });
                }
            });

            steamcmdProcess.on('error', (err) => {
                mainWindow.webContents.send('server:log', `Failed to start SteamCMD process: ${err.message}`);
                mainWindow.webContents.send('server:status', 'Error');
                resolve({ success: false, message: `Failed to start SteamCMD: ${err.message}` });
            });
        });
    } catch (error) {
        mainWindow.webContents.send('server:log', `Error during SteamCMD installation: ${error.message}`);
        mainWindow.webContents.send('server:status', 'Error');
        return { success: false, message: `Error during SteamCMD installation: ${error.message}` };
    }
});

// NOTE: Add your steamcmd:download handler logic here if needed.