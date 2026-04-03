# Orange Desktop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个基于 Electron + React (Vite) 和现有 Rust CLI 的跨平台桌面客户端，支持沙箱安全和通过 WebSocket 进行的 JSON-RPC 流式双向通信。

**Architecture:** C/S 架构。Electron 主进程作为宿主，拉起并管理 Rust 后端子进程。Rust 后端通过增加 `--server` 和 `--port` 参数启动 WebSocket 服务。Electron 前端（React）通过沙箱内的原生 WebSocket 连接该本地服务，发送请求并接收流式响应。

**Tech Stack:** 
- Frontend: Electron, React, Vite, TypeScript
- Backend: Rust (现有 CLI 项目增加 tokio-tungstenite 或 axum-ws 等网络支持)
- Communication: WebSocket (JSON-RPC 2.0)

---

### Task 1: 初始化 Electron + Vite + React 基础项目

**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.ts`
- Create: `client/tsconfig.json`
- Create: `client/electron/main.ts`
- Create: `client/electron/preload.ts`
- Create: `client/src/main.tsx`
- Create: `client/src/App.tsx`
- Create: `client/index.html`

- [ ] **Step 1: 创建 client 目录并初始化 Vite-React 项目**

```bash
npm create vite@latest client -- --template react-ts
cd client
npm install
npm install electron electron-builder concurrently wait-on cross-env --save-dev
```

- [ ] **Step 2: 配置 package.json 中的 Electron 启动脚本**

Modify `client/package.json` to add main entry and scripts:
```json
{
  "name": "orange-desktop",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "concurrently \"vite\" \"npm run dev:electron\"",
    "dev:electron": "wait-on tcp:5173 && tsc -p electron/tsconfig.json && electron .",
    "build": "tsc && vite build && tsc -p electron/tsconfig.json",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 3: 编写 Electron 主进程入口文件 (main.ts)**

Create `client/electron/main.ts`:
```typescript
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
```

- [ ] **Step 4: 编写 Preload 脚本 (preload.ts)**

Create `client/electron/preload.ts`:
```typescript
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // 目前前端直接通过原生 WebSocket 通信，这里仅留作后续扩展（如获取系统信息）的入口
  ping: () => 'pong',
});
```

- [ ] **Step 5: 创建 electron/tsconfig.json**

Create `client/electron/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "../dist-electron",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["**/*.ts"]
}
```

- [ ] **Step 6: 测试运行基础环境**

Run: `cd client && npm run dev`
Expected: 自动拉起 Electron 窗口，显示 Vite + React 默认页面，无报错。

- [ ] **Step 7: Commit**

```bash
git add client/
git commit -m "feat: initialize Electron + React + Vite client app"
```

### Task 2: Rust 后端添加 Server 模式 (WebSocket)

**Files:**
- Modify: `Cargo.toml`
- Modify: `src/main.rs` (假设在 src 下)
- Create: `src/server.rs`

- [ ] **Step 1: 添加网络通信依赖到 Rust 项目**

由于当前工作区根目录为 `/workspace`，假设 Rust 项目在 `/workspace` 根目录或 `/workspace/rust` 下。此处以根目录下的 Rust 项目为例（根据 `ARCHITECTURE.md` 和 `ls -la` 结果，Rust 源码在 `src/` 中，项目根目录有 `Cargo.toml`，如果有的话，如果没有则在 `rust/Cargo.toml`）。

```bash
cargo add tokio --features full
cargo add warp
cargo add serde_json
cargo add futures-util
```

- [ ] **Step 2: 修改命令行参数解析支持 --server 和 --port**

Modify `src/main.rs` to support `--server` flag and `--port` option using `clap` (assuming clap is used).

```rust
// In src/main.rs (pseudocode matching existing CLI logic)
// Add arguments for server mode
// if args.server {
//     server::start_server(args.port.unwrap_or(34567)).await;
//     return;
// }
```

- [ ] **Step 3: 实现 WebSocket 服务器核心逻辑 (server.rs)**

Create `src/server.rs`:
```rust
use warp::Filter;
use warp::ws::{Message, WebSocket};
use futures_util::{StreamExt, SinkExt};
use serde_json::{Value, json};

pub async fn start_server(port: u16) {
    let ws_route = warp::path("ws")
        .and(warp::ws())
        .map(|ws: warp::ws::Ws| {
            ws.on_upgrade(handle_connection)
        });

    println!("Starting WebSocket server on ws://127.0.0.1:{}", port);
    warp::serve(ws_route).run(([127, 0, 0, 1], port)).await;
}

async fn handle_connection(ws: WebSocket) {
    let (mut tx, mut rx) = ws.split();

    while let Some(result) = rx.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("WebSocket error: {}", e);
                break;
            }
        };

        if msg.is_text() {
            let text = msg.to_str().unwrap();
            // 解析 JSON-RPC 请求
            if let Ok(req) = serde_json::from_str::<Value>(text) {
                // 模拟处理流式响应
                let id = req.get("id").cloned().unwrap_or(json!(null));
                
                // 发送开始信号
                let _ = tx.send(Message::text(json!({
                    "jsonrpc": "2.0",
                    "method": "stream_start",
                    "id": id.clone()
                }).to_string())).await;

                // 模拟 Token 流
                for word in ["Hello", " from", " Rust", " Server!"] {
                    tokio::time::sleep(std::time::Duration::from_millis(200)).await;
                    let _ = tx.send(Message::text(json!({
                        "jsonrpc": "2.0",
                        "method": "stream_token",
                        "params": { "token": word },
                        "id": id.clone()
                    }).to_string())).await;
                }

                // 发送结束信号
                let _ = tx.send(Message::text(json!({
                    "jsonrpc": "2.0",
                    "method": "stream_end",
                    "id": id
                }).to_string())).await;
            }
        }
    }
}
```

- [ ] **Step 4: 测试运行 Server 模式**

Run: `cargo run -- --server --port 34567` (在另一个终端中，或使用后台模式)
然后使用 `wscat -c ws://127.0.0.1:34567/ws` 发送 `{"jsonrpc": "2.0", "method": "chat", "params": {"message": "hi"}, "id": 1}`，验证是否收到流式返回。

- [ ] **Step 5: Commit**

```bash
git add Cargo.toml src/
git commit -m "feat(rust): add WebSocket server mode for Electron IPC"
```

### Task 3: Electron 主进程管理 Rust 子进程

**Files:**
- Modify: `client/electron/main.ts`

- [ ] **Step 1: 在 Electron 主进程中引入 child_process**

Modify `client/electron/main.ts`:
```typescript
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let rustProcess: ChildProcess | null = null;
const RUST_PORT = 34567;

function startRustServer() {
  // 在开发环境下，我们可能直接调用 cargo run，或者调用已编译好的二进制文件
  // 这里假设我们先构建好了 rust 二进制，放在项目根目录下的 target/release/orange
  const binaryPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'bin', 'orange') // 打包后的路径
    : path.join(__dirname, '../../target/release/orange'); // 开发环境路径 (相对于 client/electron)

  // 简单起见，如果文件不存在，开发环境下可以 fallback 到 npm 脚本执行 cargo run (此处略过复杂判断)
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

// ... 现有 createWindow 代码 ...
```

- [ ] **Step 2: 修改 app 生命周期事件以启动和关闭 Rust 进程**

Modify `client/electron/main.ts`:
```typescript
app.whenReady().then(() => {
  startRustServer();
  // 等待一下让 server 启动
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
```

- [ ] **Step 3: 测试子进程管理**

先在 `/workspace` 根目录执行 `cargo build --release`。
然后在 `client/` 目录下运行 `npm run dev`。
检查主进程控制台输出，应能看到 `[Rust]: Starting WebSocket server on ws://127.0.0.1:34567`。
关闭 Electron 窗口，检查系统进程确认 Rust 进程已被杀死。

- [ ] **Step 4: Commit**

```bash
git add client/electron/main.ts
git commit -m "feat(electron): manage Rust child process lifecycle"
```

### Task 4: 前端 React WebSocket 客户端与流式渲染

**Files:**
- Modify: `client/src/App.tsx`
- Create: `client/src/hooks/useOrangeWebSocket.ts`

- [ ] **Step 1: 编写 WebSocket Hook (useOrangeWebSocket.ts)**

Create `client/src/hooks/useOrangeWebSocket.ts`:
```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

export function useOrangeWebSocket(port: number = 34567) {
  const [messages, setMessages] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'stream_token') {
        setMessages((prev) => prev + data.params.token);
      } else if (data.method === 'stream_start') {
        setMessages(''); // clear for new message
      }
    };

    return () => {
      ws.close();
    };
  }, [port]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        jsonrpc: "2.0",
        method: "chat",
        params: { message: text },
        id: Date.now()
      };
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return { isConnected, messages, sendMessage };
}
```

- [ ] **Step 2: 修改 App.tsx 实现交互界面**

Modify `client/src/App.tsx`:
```typescript
import { useState } from 'react';
import { useOrangeWebSocket } from './hooks/useOrangeWebSocket';
import './App.css';

function App() {
  const { isConnected, messages, sendMessage } = useOrangeWebSocket(34567);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Orange Desktop</h1>
      <div style={{ marginBottom: '10px' }}>
        Status: <span style={{ color: isConnected ? 'green' : 'red' }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '10px', 
        height: '300px', 
        overflowY: 'auto',
        marginBottom: '10px',
        whiteSpace: 'pre-wrap'
      }}>
        {messages || 'No messages yet...'}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ flex: 1, padding: '5px' }}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} disabled={!isConnected}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 3: 测试端到端流式响应**

确保 Rust Server 正在运行或由 Electron 自动拉起。
运行 `npm run dev`，在前端输入 "test"，点击 Send。
Expected: 界面逐字显示 "Hello from Rust Server!"。

- [ ] **Step 4: Commit**

```bash
git add client/src/
git commit -m "feat(react): implement WebSocket client and streaming UI"
```

### Task 5: 配置 Electron Builder 打包脚本

**Files:**
- Modify: `client/package.json`
- Create: `build_scripts/build_all.sh`

- [ ] **Step 1: 修改 package.json 的 build 配置**

Modify `client/package.json` to configure `electron-builder`:
```json
{
  // ... 其他配置
  "build": {
    "appId": "com.orange.desktop",
    "productName": "Orange",
    "directories": {
      "output": "release"
    },
    "extraResources": [
      {
        "from": "../target/release/orange",
        "to": "bin/orange",
        "filter": ["**/*"]
      }
    ],
    "mac": {
      "target": ["dmg"]
    },
    "win": {
      "target": ["nsis"]
    },
    "linux": {
      "target": ["AppImage"]
    }
  },
  "scripts": {
    // ... 现有脚本
    "pack": "electron-builder --dir",
    "dist": "electron-builder"
  }
}
```

- [ ] **Step 2: 编写全局构建脚本**

Create `build_scripts/build_all.sh`:
```bash
#!/bin/bash
set -e

echo "Building Rust Backend..."
cd "$(dirname "$0")/.."
cargo build --release

echo "Building Frontend and Electron app..."
cd client
npm run build
npm run dist

echo "Build complete! Check client/release directory."
```

- [ ] **Step 3: 赋予执行权限并测试构建**

Run: `chmod +x build_scripts/build_all.sh && ./build_scripts/build_all.sh`
Expected: 成功生成包含 Rust 二进制的 Electron 独立应用程序安装包（在 `client/release` 目录下）。

- [ ] **Step 4: Commit**

```bash
git add client/package.json build_scripts/
git commit -m "chore: configure electron-builder and global build script"
```
