const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods for renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Listen for Spotify auth code from protocol handler
  onSpotifyAuthCode: (callback) => {
    ipcRenderer.on('spotify-auth-code', (event, code) => callback(code));
  },

  // Listen for Spotify auth errors
  onSpotifyAuthError: (callback) => {
    ipcRenderer.on('spotify-auth-error', (event, error) => callback(error));
  },
});