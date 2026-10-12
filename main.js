const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const http = require('http');
const { fork, spawn } = require('child_process');
const isElectronDev = require('electron-is-dev');

let mainWindow = null;
let backendProcess = null;

// Determine if we should attempt connecting to Vite dev server
const isDev = isElectronDev || process.env.NODE_ENV === 'development';

/**
 * Helper to ping an HTTP endpoint
 */
function pingUrl(url, timeoutMs = 1500) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = http.request({
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: 'GET',
        timeout: timeoutMs
      }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

/**
 * Wait for a URL to become available with retries
 */
async function waitForUrl(url, maxAttempts = 20, delayMs = 500) {
  for (let i = 0; i < maxAttempts; i++) {
    const isUp = await pingUrl(url);
    if (isUp) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

/**
 * Spawn the Express backend process
 */
function startBackend() {
  const backendEntry = path.join(__dirname, 'backend', 'src', 'server.js');
  const backendCwd = path.join(__dirname, 'backend');

  console.log('[Electron] Spawning Express backend from:', backendEntry);

  backendProcess = fork(backendEntry, [], {
    cwd: backendCwd,
    env: {
      ...process.env,
      PORT: '5000'
    },
    silent: false
  });

  backendProcess.on('error', (err) => {
    console.error('[Electron] Backend process error:', err);
  });

  backendProcess.on('exit', (code, signal) => {
    console.log(`[Electron] Backend process exited with code ${code}, signal ${signal}`);
  });
}

/**
 * Safely kill the backend process and its child processes on Windows
 */
function killBackend() {
  if (backendProcess && !backendProcess.killed) {
    console.log('[Electron] Terminating Express backend process (PID:', backendProcess.pid, ')...');
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', backendProcess.pid.toString(), '/f', '/t']);
      } else {
        backendProcess.kill('SIGINT');
      }
    } catch (err) {
      console.warn('[Electron] Error terminating backend process:', err.message);
    }
    backendProcess = null;
  }
}

/**
 * Create the main Electron native application window
 */
async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 1024,
    minHeight: 700,
    title: 'EstateFlow - Real Estate Sales Management System (Oracle 11g XE)',
    backgroundColor: '#f4f6f9',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  // Requirement: Ensure the Electron window hides the native menu bar (File/Edit/View)
  mainWindow.setMenuBarVisibility(false);
  Menu.setApplicationMenu(null);

  // Wait briefly for backend server to be ready
  await waitForUrl('http://localhost:5000/api/health', 10, 300);

  // Determine whether to load dev server or compiled production dist
  let loaded = false;
  if (isDev) {
    const devServerReady = await pingUrl('http://localhost:3000');
    if (devServerReady) {
      console.log('[Electron] Loading React frontend from Vite dev server: http://localhost:3000');
      await mainWindow.loadURL('http://localhost:3000');
      loaded = true;
    }
  }

  if (!loaded) {
    const distPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
    console.log('[Electron] Loading React frontend from production dist bundle:', distPath);
    await mainWindow.loadFile(distPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle hooks
app.whenReady().then(async () => {
  const isBackendUp = await pingUrl('http://localhost:5000/api/health', 800);
  if (isBackendUp) {
    console.log('[Electron] Existing backend detected on port 5000. Reusing active instance.');
  } else {
    startBackend();
  }
  await createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Clean up child process when all windows closed
app.on('window-all-closed', () => {
  killBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  killBackend();
});

app.on('will-quit', () => {
  killBackend();
});

// Process signal handlers
process.on('SIGINT', () => {
  killBackend();
  process.exit(0);
});

process.on('SIGTERM', () => {
  killBackend();
  process.exit(0);
});
