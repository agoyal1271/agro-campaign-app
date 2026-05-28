const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const fs = require('fs');

// Setup logging to file
const logPath = path.join(app.getPath('userData'), 'app.log');
const logStream = fs.createWriteStream(logPath, { flags: 'a' });
const log = (msg) => {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}\n`;
  console.log(line);
  logStream.write(line);
};

log('=== App Starting ===')

let mainWindow;
let nodeServer;

function createWindow() {
  log('Creating BrowserWindow...');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.js')
    },
    icon: path.join(__dirname, 'public/favicon.ico')
  });

  if (isDev) {
    log('Dev mode: Loading http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, 'public/index.html');
    log('Production mode: Loading ' + indexPath);
    mainWindow.loadURL(`file://${indexPath}`).catch(err => {
      log('Failed to load UI: ' + err.message);
    });
  }

  mainWindow.webContents.on('crashed', () => {
    log('ERROR: Renderer process crashed');
  });

  mainWindow.on('closed', () => {
    log('Window closed');
    mainWindow = null;
  });

  log('Window created and UI loading...');
}

function startNodeServer() {
  return new Promise((resolve) => {
    log('Starting Node server from: ' + __dirname);
    nodeServer = spawn('node', ['server.js'], {
      cwd: __dirname,
      stdio: 'pipe'
    });

    nodeServer.stdout.on('data', (data) => {
      log('Server: ' + data.toString().trim());
    });

    nodeServer.stderr.on('data', (data) => {
      log('Server ERROR: ' + data.toString().trim());
    });

    nodeServer.on('error', (err) => {
      log('Failed to start server: ' + err.message);
    });

    log('Server spawn initiated, waiting 2 seconds...');
    setTimeout(resolve, 2000);
  });
}

app.on('ready', async () => {
  log('App ready event fired');
  await startNodeServer();
  log('Node server started, creating window...');
  createWindow();

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Ganesh Agro Campaign Manager',
              message: 'Ganesh Agro Campaign Manager v1.0',
              detail: 'WhatsApp campaign automation for agricultural businesses\n\nRunning locally on your machine\nNo data sent to external servers'
            });
          }
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (nodeServer) {
    nodeServer.kill();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
