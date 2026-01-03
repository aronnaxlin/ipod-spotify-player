const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');

// Store reference to main window
let mainWindow = null;

// Register custom protocol for OAuth callback
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('ipodplayer', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('ipodplayer');
}

// Handle the protocol on macOS
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleProtocolUrl(url);
});

// Handle protocol URL - extract auth code and send to renderer
function handleProtocolUrl(url) {
  console.log('Received protocol URL:', url);

  if (mainWindow) {
    // Bring window to front
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    // Parse the URL and extract the code
    try {
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const error = urlObj.searchParams.get('error');

      if (error) {
        mainWindow.webContents.send('spotify-auth-error', error);
      } else if (code) {
        mainWindow.webContents.send('spotify-auth-code', code);
      }
    } catch (e) {
      console.error('Failed to parse protocol URL:', e);
    }
  }
}

// Handle opening external URLs in system browser
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 350,
    height: 650,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true, // Enable for security with contextBridge
    },
    frame: false, // Frameless for custom UI
    transparent: true, // Transparent background
    backgroundColor: '#00000000',
    titleBarStyle: 'hidden',
    resizable: true,
    hasShadow: true,
  });

  // Hide traffic lights (minimize, maximize, close buttons) on macOS
  if (process.platform === 'darwin') {
    mainWindow.setWindowButtonVisibility(false);
  }

  // Load the index.html of the app.
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  console.log('VITE_DEV_SERVER_URL:', devUrl);

  if (devUrl) {
    console.log('Loading dev URL:', devUrl);
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading production file:', indexPath);
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Handle second instance (Windows/Linux)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    // Handle protocol URL on Windows
    const url = commandLine.find((arg) => arg.startsWith('ipodplayer://'));
    if (url) {
      handleProtocolUrl(url);
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});