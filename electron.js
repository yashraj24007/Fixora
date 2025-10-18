// Electron Main Process - Desktop App Entry Point
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let backendProcess;

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.js')
    },
    icon: path.join(__dirname, 'public/logo.png'),
    title: 'Fixora - AI Vehicle Service Assistant',
    backgroundColor: '#ffffff',
    show: false // Don't show until ready
  });

  // Load the app
  if (isDev) {
    // Development: Load from Vite dev server
    mainWindow.loadURL('http://localhost:8081');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from built files
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Start embedded Node.js backend server
function startBackendServer() {
  const serverPath = isDev
    ? path.join(__dirname, 'server/index.ts')
    : path.join(__dirname, 'dist/server/index.js');

  const command = isDev ? 'tsx' : 'node';
  const args = [serverPath];

  backendProcess = spawn(command, args, {
    env: {
      ...process.env,
      PORT: '3001',
      NODE_ENV: isDev ? 'development' : 'production',
      ELECTRON_APP: 'true'
    },
    stdio: 'pipe'
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend Error] ${data.toString()}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

// Stop backend server
function stopBackendServer() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

// App lifecycle events
app.whenReady().then(() => {
  console.log('🚀 Fixora Desktop App starting...');
  
  // Start backend server first
  startBackendServer();
  
  // Wait a bit for server to start, then create window
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopBackendServer();
    app.quit();
  }
});

// Cleanup before quit
app.on('before-quit', () => {
  stopBackendServer();
});

// Handle IPC messages from renderer process
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('check-offline-status', () => {
  return {
    isOffline: true,
    backendRunning: backendProcess !== null,
    datasetAvailable: true
  };
});

// Auto-update handlers (optional)
ipcMain.handle('check-for-updates', async () => {
  // Implement auto-update logic here if needed
  return { updateAvailable: false };
});

console.log('✅ Electron main process initialized');
