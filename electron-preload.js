// Electron Preload Script - Secure bridge between main and renderer
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Offline status
  checkOfflineStatus: () => ipcRenderer.invoke('check-offline-status'),
  
  // Updates
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  
  // System info
  platform: process.platform,
  isElectron: true,
  
  // Node.js path for accessing local files
  getResourcePath: (relativePath) => {
    const path = require('path');
    return path.join(process.resourcesPath, relativePath);
  }
});

console.log('✅ Electron preload script loaded');
