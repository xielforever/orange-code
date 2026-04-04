import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';

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

  if (!fs.existsSync(binaryPath)) {
    console.error(`Rust backend binary not found at: ${binaryPath}`);
    dialog.showErrorBox(
      'Backend Not Found', 
      `The Rust backend executable was not found.\nExpected path: ${binaryPath}`
    );
    return;
  }

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

function cleanupRustProcess() {
  if (rustProcess) {
    console.log('Killing Rust process...');
    try {
      if (process.platform === 'win32') {
        // Windows 上使用 taskkill 强制终止
        spawn('taskkill', ['/F', '/T', '/PID', rustProcess.pid?.toString() || '']);
      } else {
        rustProcess.kill('SIGTERM');
        // 给进程一点时间优雅退出，然后强制终止
        setTimeout(() => {
          if (rustProcess && !rustProcess.killed) {
            rustProcess.kill('SIGKILL');
          }
        }, 2000);
      }
    } catch (e) {
      console.error('Error killing Rust process:', e);
    }
  }
}

app.on('window-all-closed', function () {
  cleanupRustProcess();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', (e) => {
  cleanupRustProcess();
});

// 监听进程信号，确保 Ctrl+C 时也能清理
process.on('SIGINT', () => {
  console.log('Received SIGINT, cleaning up...');
  cleanupRustProcess();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, cleaning up...');
  cleanupRustProcess();
  process.exit(0);
});

process.on('exit', () => {
  cleanupRustProcess();
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('read-directory', async (_, dirPath: string) => {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    return entries.map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      path: path.join(dirPath, entry.name),
    }));
  } catch (error) {
    console.error('Failed to read directory:', error);
    throw error;
  }
});

ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Failed to read file:', error);
    throw error;
  }
});
