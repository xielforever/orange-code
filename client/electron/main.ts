import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let rustProcess: ChildProcess | null = null;
const RUST_PORT = 34567;

function startRustServer() {
  const isWindows = process.platform === 'win32';
  const binaryName = isWindows ? 'orange.exe' : 'orange';

  const binaryPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'bin', binaryName)
    : path.join(__dirname, '../../rust/target/release', binaryName);

  try {
    rustProcess = spawn(binaryPath, ['--server', '--port', RUST_PORT.toString()]);
    
    rustProcess.stdout?.on('data', (data) => {
      console.log(`[Rust]: ${data}`);
    });
    
    rustProcess.stderr?.on('data', (data) => {
      console.error(`[Rust Error]: ${data}`);
    });
    
    rustProcess.on('close', (code) => {
      console.log(`Rust process exited with code ${code}`);
      rustProcess = null;
    });
  } catch (e) {
    console.error('Failed to start rust server:', e);
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  startRustServer();
  setTimeout(() => {
    createWindow();
  }, 1000);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (rustProcess) {
    rustProcess.kill('SIGTERM');
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (rustProcess) {
    rustProcess.kill('SIGTERM');
  }
});
