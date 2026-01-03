// Type declarations for Electron IPC bridge
interface ElectronAPI {
  openExternal: (url: string) => Promise<void>;
  onSpotifyAuthCode: (callback: (code: string) => void) => void;
  onSpotifyAuthError: (callback: (error: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export { };

