# Orange Desktop 架构设计与需求规范

## 1. 架构概览 (Architecture)
整个系统分为三个主要部分，采用典型的 C/S (Client/Server) 架构，运行在同一个本地机器上：
*   **前端 (React + Vite)**：运行在 Electron 的渲染进程中（沙箱环境）。负责 GUI 呈现、用户输入、会话管理和流式消息的展示。
*   **主进程 (Electron Node.js)**：负责窗口管理、系统级 API 调用（如托盘、通知）、安全沙箱配置，以及**最核心的：启动并管理 Rust 子进程的生命周期**。
*   **后端 (Rust CLI - Server 模式)**：在现有的 `orange` CLI 基础上增加一个 `--server` 模式。启动后监听一个**固定端口**（如 `ws://127.0.0.1:34567`），接收 WebSocket 连接，解析 JSON-RPC 请求，执行核心的 AI 逻辑，并将结果（包括流式的 Token）通过 WebSocket 推送回客户端。

## 2. 数据流与通信 (Data Flow)
1.  **启动**：用户双击应用图标 -> Electron 主进程启动 -> 主进程执行 `path/to/orange --server --port 34567` 拉起 Rust 子进程 -> 主进程加载 React 前端页面。
2.  **建立连接**：前端页面加载完成后，直接通过浏览器的原生 `WebSocket` API 连接到 `ws://127.0.0.1:34567`。
3.  **发送请求**：用户在聊天框输入内容 -> 前端构造 JSON-RPC 2.0 请求 -> 通过 WebSocket 发送。
4.  **处理与流式返回**：Rust 后端收到请求，调用大模型 API。每当产生一个新的 Token，就构造一个 JSON-RPC 通知或包含部分结果的响应推送给前端。
5.  **展示**：前端接收到流式消息，更新 React 状态，逐字显示 AI 的回答。
6.  **关闭**：用户关闭应用 -> Electron 主进程捕获 `window-all-closed` 事件 -> 主进程向 Rust 子进程发送终止信号 -> Rust 进程优雅退出 -> Electron 进程退出。

## 3. 目录结构与打包 (Directory Structure & Bundling)
由于选择了**随 Electron 打包 (Bundle)**，我们需要一个包含前后端所有代码的 monorepo 结构：

```text
orange-desktop/
├── rust/                   # 现有的 Rust CLI 源码
│   ├── Cargo.toml
│   └── src/
│       ├── main.rs         # 增加 CLI 参数解析，支持 --server
│       ├── server.rs       # 新增：WebSocket 服务器实现
│       └── ...
├── client/                 # Electron + Vite + React 源码
│   ├── package.json
│   ├── electron/           # Electron 主进程代码
│   │   ├── main.ts         # 窗口管理、子进程拉起
│   │   └── preload.ts      # (可选) 提供一些基础的安全 API 给前端
│   ├── src/                # React 前端代码
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── ...
│   └── vite.config.ts
└── build_scripts/          # 用于打包整个应用的脚本，负责编译 Rust 并将其放入 Electron 的 resources 目录
```

## 4. 安全性与沙箱 (Security & Sandbox)
*   **Electron 侧**：在创建 `BrowserWindow` 时，严格设置 `webPreferences`：
    *   `nodeIntegration: false`
    *   `contextIsolation: true`
    *   `sandbox: true`
*   **通信安全**：WebSocket 服务器绑定在 `127.0.0.1`。

## 5. 任务取消与多会话管理
*   **任务取消**：前端发送特定的 JSON-RPC 请求，Rust 后端接收到后中断任务。
*   **多会话**：前端 React 负责维护多个会话的状态（History）。每次向 Rust 发送请求时携带必要的上下文。
