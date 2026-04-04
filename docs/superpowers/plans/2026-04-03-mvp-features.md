# Orange Code Desktop MVP Features Implementation Plan

&gt; **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 Orange Code Desktop 的 MVP 核心功能：项目管理、文件系统集成、会话管理、模型选择。

**Architecture:** 方案 C（混合方案）- 元数据在 Client（IndexedDB），会话数据在 Rust（Session 机制）。保留 Rust 核心层零改动，仅扩展服务层和 Client 层。

**Tech Stack:** 
- Client: React 19 + TypeScript + Vite + Tailwind CSS 4.x + IndexedDB (localForage)
- Service Layer: Rust warp WebSocket + JSON-RPC 2.0（扩展现有 server.rs）
- Core: Rust runtime、api、tools、commands（零改动）

---

## 前置条件

已有基础已完成：
- ✅ Electron + React + Vite 项目初始化
- ✅ Rust WebSocket server（warp）基础框架
- ✅ Electron 主进程管理 Rust 子进程
- ✅ 基础 WebSocket 通信

---

## Phase 0: 数据模型设计

### Task 0.1: 定义 TypeScript 类型与数据结构

**Files:**
- Create: `client/src/types/index.ts`
- Create: `client/src/storage/projectStore.ts`
- Create: `client/src/storage/sessionStore.ts`

**数据模型设计：**

```typescript
// Project 模型
interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;          // 项目目录路径
  createdAt: number;     // timestamp
  updatedAt: number;     // timestamp
  defaultModel?: string;  // 默认模型
}

// Session 元数据（Client 端管理）
interface SessionMetadata {
  id: string;
  projectId: string;
  name: string;
  model: string;         // 该会话使用的模型
  createdAt: number;
  updatedAt: number;
  rustSessionPath?: string;  // Rust Session 文件路径
}

// 模型配置
interface ModelConfig {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'orange';
  apiKey?: string;
  baseUrl?: string;
}
```

- [ ] **Step 1: 创建类型定义文件**

Create `client/src/types/index.ts`:
```typescript
export interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;
  createdAt: number;
  updatedAt: number;
  defaultModel?: string;
}

export interface SessionMetadata {
  id: string;
  projectId: string;
  name: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  rustSessionPath?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'orange';
  apiKey?: string;
  baseUrl?: string;
}

export interface AppState {
  currentProjectId?: string;
  currentSessionId?: string;
}
```

- [ ] **Step 2: 安装 localForage（IndexedDB 包装库）**

Run: `cd client && npm install localforage`

- [ ] **Step 3: 创建 Project Store**

Create `client/src/storage/projectStore.ts`:
```typescript
import localforage from 'localforage';
import { Project } from '../types';

const PROJECTS_KEY = 'orange_projects';

export async function getProjects(): Promise&lt;Project[]&gt; {
  const projects = await localforage.getItem&lt;Project[]&gt;(PROJECTS_KEY);
  return projects || [];
}

export async function createProject(project: Omit&lt;Project, 'id' | 'createdAt' | 'updatedAt'&gt;): Promise&lt;Project&gt; {
  const newProject: Project = {
    ...project,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const projects = await getProjects();
  projects.push(newProject);
  await localforage.setItem(PROJECTS_KEY, projects);
  return newProject;
}

export async function updateProject(id: string, updates: Partial&lt;Project&gt;): Promise&lt;Project | null&gt; {
  const projects = await getProjects();
  const index = projects.findIndex(p =&gt; p.id === id);
  if (index === -1) return null;
  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: Date.now(),
  };
  await localforage.setItem(PROJECTS_KEY, projects);
  return projects[index];
}

export async function deleteProject(id: string): Promise&lt;void&gt; {
  const projects = await getProjects();
  const filtered = projects.filter(p =&gt; p.id !== id);
  await localforage.setItem(PROJECTS_KEY, filtered);
}
```

- [ ] **Step 4: 创建 Session Store**

Create `client/src/storage/sessionStore.ts`:
```typescript
import localforage from 'localforage';
import { SessionMetadata } from '../types';

const SESSIONS_KEY = 'orange_sessions';

export async function getSessions(projectId?: string): Promise&lt;SessionMetadata[]&gt; {
  const sessions = await localforage.getItem&lt;SessionMetadata[]&gt;(SESSIONS_KEY);
  const all = sessions || [];
  return projectId ? all.filter(s =&gt; s.projectId === projectId) : all;
}

export async function createSession(session: Omit&lt;SessionMetadata, 'id' | 'createdAt' | 'updatedAt'&gt;): Promise&lt;SessionMetadata&gt; {
  const newSession: SessionMetadata = {
    ...session,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const sessions = await getSessions();
  sessions.push(newSession);
  await localforage.setItem(SESSIONS_KEY, sessions);
  return newSession;
}

export async function updateSession(id: string, updates: Partial&lt;SessionMetadata&gt;): Promise&lt;SessionMetadata | null&gt; {
  const sessions = await getSessions();
  const index = sessions.findIndex(s =&gt; s.id === id);
  if (index === -1) return null;
  sessions[index] = {
    ...sessions[index],
    ...updates,
    updatedAt: Date.now(),
  };
  await localforage.setItem(SESSIONS_KEY, sessions);
  return sessions[index];
}

export async function deleteSession(id: string): Promise&lt;void&gt; {
  const sessions = await getSessions();
  const filtered = sessions.filter(s =&gt; s.id !== id);
  await localforage.setItem(SESSIONS_KEY, filtered);
}
```

- [ ] **Step 5: Commit**

```bash
cd /home/xielei/orange-code
git add client/src/types/ client/src/storage/ client/package.json
git commit -m "feat: add TypeScript types and IndexedDB storage"
```

---

## Phase 1: 扩展 Rust Server 协议

### Task 1.1: 扩展 JSON-RPC 协议支持新功能

**Files:**
- Modify: `rust/crates/orange-cli/src/server.rs`

**新增 JSON-RPC 方法：**
- `create_session` - 创建新会话（指定模型）
- `list_sessions` - 列出会话
- `switch_session` - 切换会话
- `delete_session` - 删除会话
- `get_models` - 获取可用模型列表
- `set_model` - 设置当前模型

- [ ] **Step 1: 扩展 server.rs 集成 ConversationRuntime**

首先让我查看当前的 server.rs 和 LiveCli 的实现方式来了解如何集成 ConversationRuntime。

Read: `rust/crates/orange-cli/src/main.rs` (build_runtime 函数部分)

然后修改 `rust/crates/orange-cli/src/server.rs`:
```rust
use warp::Filter;
use warp::ws::{Message, WebSocket};
use futures_util::{StreamExt, SinkExt};
use serde_json::{Value, json};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

// 导入必要的 runtime 模块
use runtime::{
    Session, ConversationRuntime, DefaultRuntimeClient, CliToolExecutor,
    build_runtime, PermissionMode,
};

type SessionId = String;

struct ServerState {
    sessions: Mutex&lt;HashMap&lt;SessionId, Session&gt;&gt;,
    // 可以存储运行时，但需要小心 Send/Sync
}

impl ServerState {
    fn new() -&gt; Self {
        Self {
            sessions: Mutex::new(HashMap::new()),
        }
    }
}

pub fn run_server(port: u16) -&gt; Result&lt;(), Box&lt;dyn std::error::Error&gt;&gt; {
    let runtime = tokio::runtime::Runtime::new()?;
    let state = Arc::new(ServerState::new());
    
    runtime.block_on(async {
        let state_filter = warp::any().map(move || state.clone());
        
        let ws_route = warp::path("ws")
            .and(warp::ws())
            .and(state_filter)
            .map(|ws: warp::ws::Ws, state| {
                ws.on_upgrade(move |socket| handle_connection(socket, state))
            });

        println!("Starting WebSocket server on ws://127.0.0.1:{}", port);
        warp::serve(ws_route).run(([127, 0, 0, 1], port)).await;
    });
    Ok(())
}

async fn handle_connection(ws: WebSocket, state: Arc&lt;ServerState&gt;) {
    let (mut tx, mut rx) = ws.split();

    while let Some(result) = rx.next().await {
        let msg = match result {
            Ok(msg) =&gt; msg,
            Err(e) =&gt; {
                eprintln!("WebSocket error: {}", e);
                break;
            }
        };

        if msg.is_text() {
            let text = msg.to_str().unwrap();
            if let Ok(req) = serde_json::from_str::&lt;Value&gt;(text) {
                let id = req.get("id").cloned().unwrap_or(json!(null));
                let method = req.get("method").and_then(|m| m.as_str());
                
                match method {
                    Some("chat") =&gt; {
                        // 原有的 chat 处理逻辑，集成 ConversationRuntime
                        handle_chat(&amp;mut tx, req, &amp;state).await;
                    }
                    Some("create_session") =&gt; {
                        handle_create_session(&amp;mut tx, id, req, &amp;state).await;
                    }
                    Some("list_sessions") =&gt; {
                        handle_list_sessions(&amp;mut tx, id, &amp;state).await;
                    }
                    Some("get_models") =&gt; {
                        handle_get_models(&amp;mut tx, id).await;
                    }
                    _ =&gt; {
                        let _ = tx.send(Message::text(json!({
                            "jsonrpc": "2.0",
                            "error": { "code": -32601, "message": "Method not found" },
                            "id": id
                        }).to_string())).await;
                    }
                }
            }
        }
    }
}

async fn handle_chat(tx: &amp;mut (impl SinkExt&lt;Message&gt; + Unpin), req: Value, state: &amp;Arc&lt;ServerState&gt;) {
    // 这里需要完整集成 ConversationRuntime
    // 参考 LiveCli 的实现方式
    // 由于篇幅原因，这里先保留 mock 实现，后续 Task 1.2 完善
    let id = req.get("id").cloned().unwrap_or(json!(null));
    
    let _ = tx.send(Message::text(json!({
        "jsonrpc": "2.0",
        "method": "stream_start",
        "id": id.clone()
    }).to_string())).await;

    for word in ["Hello", " from", " Rust", " Server!"] {
        tokio::time::sleep(std::time::Duration::from_millis(200)).await;
        let _ = tx.send(Message::text(json!({
            "jsonrpc": "2.0",
            "method": "stream_token",
            "params": { "token": word },
            "id": id.clone()
        }).to_string())).await;
    }

    let _ = tx.send(Message::text(json!({
        "jsonrpc": "2.0",
        "method": "stream_end",
        "id": id
    }).to_string())).await;
}

async fn handle_create_session(tx: &amp;mut (impl SinkExt&lt;Message&gt; + Unpin), id: Value, req: Value, state: &amp;Arc&lt;ServerState&gt;) {
    let session_id = crypto::random_uuid(); // 需要添加 uuid 依赖
    let session = Session::new();
    
    state.sessions.lock().unwrap().insert(session_id.clone(), session);
    
    let _ = tx.send(Message::text(json!({
        "jsonrpc": "2.0",
        "result": { "session_id": session_id },
        "id": id
    }).to_string())).await;
}

async fn handle_list_sessions(tx: &amp;mut (impl SinkExt&lt;Message&gt; + Unpin), id: Value, state: &amp;Arc&lt;ServerState&gt;) {
    let sessions = state.sessions.lock().unwrap();
    let session_list: Vec&lt;_&gt; = sessions.keys().cloned().collect();
    
    let _ = tx.send(Message::text(json!({
        "jsonrpc": "2.0",
        "result": { "sessions": session_list },
        "id": id
    }).to_string())).await;
}

async fn handle_get_models(tx: &amp;mut (impl SinkExt&lt;Message&gt; + Unpin), id: Value) {
    let models = vec![
        json!({ "id": "claude-opus-4-6", "name": "Claude Opus", "provider": "anthropic" }),
        json!({ "id": "claude-sonnet-4-6", "name": "Claude Sonnet", "provider": "anthropic" }),
        json!({ "id": "deepseek-chat", "name": "DeepSeek", "provider": "openai" }),
    ];
    
    let _ = tx.send(Message::text(json!({
        "jsonrpc": "2.0",
        "result": { "models": models },
        "id": id
    }).to_string())).await;
}
```

注意：此步骤需要添加依赖和完善 ConversationRuntime 集成，我们在后续 Task 中细化。

- [ ] **Step 2: Commit**

```bash
cd /home/xielei/orange-code
git add rust/crates/orange-cli/src/server.rs
git commit -m "feat: extend JSON-RPC protocol for session and model management"
```

---

## Phase 2: 项目管理功能

### Task 2.1: 创建项目管理 UI 组件

**Files:**
- Create: `client/src/components/ProjectList.tsx`
- Create: `client/src/components/CreateProjectModal.tsx`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: 创建 ProjectList 组件**

Create `client/src/components/ProjectList.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { Folder, Plus, Trash2, Settings } from 'lucide-react';
import { Project } from '../types';
import { getProjects, deleteProject } from '../storage/projectStore';

interface ProjectListProps {
  currentProjectId?: string;
  onSelectProject: (project: Project) =&gt; void;
  onCreateProject: () =&gt; void;
}

export function ProjectList({ currentProjectId, onSelectProject, onCreateProject }: ProjectListProps) {
  const [projects, setProjects] = useState&lt;Project[]&gt;([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =&gt; {
    loadProjects();
  }, []);

  async function loadProjects() {
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  }

  async function handleDelete(project: Project, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(`Delete project "${project.name}"?`)) {
      await deleteProject(project.id);
      loadProjects();
    }
  }

  if (loading) {
    return &lt;div className="p-4 text-gray-500"&gt;Loading...&lt;/div&gt;;
  }

  return (
    &lt;div className="flex flex-col h-full"&gt;
      &lt;div className="flex items-center justify-between p-4 border-b border-surface-300"&gt;
        &lt;span className="text-sm font-bold text-gray-400"&gt;PROJECTS&lt;/span&gt;
        &lt;button
          onClick={onCreateProject}
          className="p-1.5 hover:bg-surface-300 rounded text-orange-500 transition-colors"
        &gt;
          &lt;Plus size={16} /&gt;
        &lt;/button&gt;
      &lt;/div&gt;

      &lt;div className="flex-1 overflow-y-auto py-2"&gt;
        {projects.length === 0 ? (
          &lt;div className="p-4 text-center text-gray-500 text-sm"&gt;
            No projects yet. Create one to get started!
          &lt;/div&gt;
        ) : (
          projects.map((project) =&gt; (
            &lt;div
              key={project.id}
              onClick={() =&gt; onSelectProject(project)}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors
                ${currentProjectId === project.id ? 'bg-orange-500/10 text-orange-400' : 'hover:bg-surface-300 text-gray-300'}`}
            &gt;
              &lt;Folder size={16} className={currentProjectId === project.id ? 'text-orange-400' : 'text-gray-500'} /&gt;
              &lt;div className="flex-1 min-w-0"&gt;
                &lt;div className="text-sm font-medium truncate"&gt;{project.name}&lt;/div&gt;
                &lt;div className="text-xs text-gray-500 truncate"&gt;{project.path}&lt;/div&gt;
              &lt;/div&gt;
              &lt;button
                onClick={(e) =&gt; handleDelete(project, e)}
                className="p-1 hover:text-red-400 text-gray-500 transition-colors"
              &gt;
                &lt;Trash2 size={14} /&gt;
              &lt;/button&gt;
            &lt;/div&gt;
          ))
        )}
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
```

- [ ] **Step 2: 创建 CreateProjectModal 组件**

Create `client/src/components/CreateProjectModal.tsx`:
```tsx
import { useState } from 'react';
import { X, FolderOpen } from 'lucide-react';
import { Project } from '../types';
import { createProject } from '../storage/projectStore';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () =&gt; void;
  onCreated: (project: Project) =&gt; void;
}

export function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !path.trim()) return;

    setLoading(true);
    try {
      const project = await createProject({
        name: name.trim(),
        path: path.trim(),
        description: description.trim() || undefined,
      });
      onCreated(project);
      onClose();
      setName('');
      setPath('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectFolder() {
    // 使用 Electron 的 dialog 选择文件夹
    // 需要通过 preload 暴露 API
    const selectedPath = await window.electronAPI.selectFolder?.();
    if (selectedPath) {
      setPath(selectedPath);
      // 自动设置项目名为文件夹名
      const folderName = selectedPath.split(/[/\\]/).pop() || '';
      if (!name) setName(folderName);
    }
  }

  return (
    &lt;div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"&gt;
      &lt;div className="bg-surface-100 border border-surface-300 rounded-xl w-full max-w-md mx-4 shadow-2xl"&gt;
        &lt;div className="flex items-center justify-between p-4 border-b border-surface-300"&gt;
          &lt;h2 className="text-lg font-semibold text-gray-200"&gt;Create New Project&lt;/h2&gt;
          &lt;button onClick={onClose} className="p-1 hover:bg-surface-300 rounded text-gray-400"&gt;
            &lt;X size={20} /&gt;
          &lt;/button&gt;
        &lt;/div&gt;

        &lt;form onSubmit={handleSubmit} className="p-4 space-y-4"&gt;
          &lt;div&gt;
            &lt;label className="block text-sm font-medium text-gray-400 mb-1"&gt;Project Name&lt;/label&gt;
            &lt;input
              type="text"
              value={name}
              onChange={(e) =&gt; setName(e.target.value)}
              className="w-full bg-surface-300 border border-surface-400 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500"
              placeholder="My Awesome Project"
              required
            /&gt;
          &lt;/div&gt;

          &lt;div&gt;
            &lt;label className="block text-sm font-medium text-gray-400 mb-1"&gt;Project Path&lt;/label&gt;
            &lt;div className="flex gap-2"&gt;
              &lt;input
                type="text"
                value={path}
                onChange={(e) =&gt; setPath(e.target.value)}
                className="flex-1 bg-surface-300 border border-surface-400 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500"
                placeholder="/path/to/project"
                required
              /&gt;
              &lt;button
                type="button"
                onClick={handleSelectFolder}
                className="px-3 py-2 bg-surface-300 hover:bg-surface-400 border border-surface-400 rounded-lg text-gray-300 transition-colors"
              &gt;
                &lt;FolderOpen size={18} /&gt;
              &lt;/button&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;div&gt;
            &lt;label className="block text-sm font-medium text-gray-400 mb-1"&gt;Description (optional)&lt;/label&gt;
            &lt;textarea
              value={description}
              onChange={(e) =&gt; setDescription(e.target.value)}
              className="w-full bg-surface-300 border border-surface-400 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500 resize-none"
              rows={3}
              placeholder="A short description of this project..."
            /&gt;
          &lt;/div&gt;

          &lt;div className="flex justify-end gap-2 pt-2"&gt;
            &lt;button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-300 hover:bg-surface-400 rounded-lg text-gray-300 transition-colors"
            &gt;
              Cancel
            &lt;/button&gt;
            &lt;button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:bg-surface-400 disabled:text-gray-500 rounded-lg text-white font-medium transition-colors"
            &gt;
              {loading ? 'Creating...' : 'Create Project'}
            &lt;/button&gt;
          &lt;/div&gt;
        &lt;/form&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
```

- [ ] **Step 3: 更新 preload.ts 添加文件夹选择 API**

Modify `client/electron/preload.ts`:
```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () =&gt; 'pong',
  selectFolder: () =&gt; ipcRenderer.invoke('select-folder'),
});
```

- [ ] **Step 4: 更新 main.ts 添加文件夹选择处理**

Modify `client/electron/main.ts`:
```typescript
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
// ... 其他 import

// ... 在 createWindow 函数之后 ...

ipcMain.handle('select-folder', async () =&gt; {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  });
  if (!result.canceled &amp;&amp; result.filePaths.length &gt; 0) {
    return result.filePaths[0];
  }
  return null;
});
```

- [ ] **Step 5: 更新 App.tsx 集成项目管理**

Modify `client/src/App.tsx` to integrate project management.

- [ ] **Step 6: Commit**

```bash
cd /home/xielei/orange-code
git add client/src/components/ client/electron/preload.ts client/electron/main.ts
git commit -m "feat: add project management UI components"
```

---

## Phase 3: 会话管理系统

### Task 3.1: 会话列表与切换 UI

**Files:**
- Create: `client/src/components/SessionList.tsx`
- Create: `client/src/components/CreateSessionModal.tsx`
- Modify: `client/src/hooks/useOrangeWebSocket.ts` (扩展协议支持)

- [ ] **Step 1: 扩展 WebSocket Hook 支持新协议**

Modify `client/src/hooks/useOrangeWebSocket.ts`:
```typescript
import { useState, useEffect, useCallback, useRef } from 'react';

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}

export function useOrangeWebSocket(port: number = 34567) {
  const [messages, setMessages] = useState&lt;string&gt;('');
  const [isConnected, setIsConnected] = useState(false);
  const [models, setModels] = useState&lt;ModelInfo[]&gt;([]);
  const wsRef = useRef&lt;WebSocket | null&gt;(null);
  const requestIdRef = useRef(0);
  const pendingRequests = useRef&lt;Map&lt;number, (result: any) =&gt; void&gt;&gt;(new Map());

  useEffect(() =&gt; {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    wsRef.current = ws;

    ws.onopen = () =&gt; {
      setIsConnected(true);
      // 连接后获取模型列表
      sendRequest('get_models', {}).then(result =&gt; {
        setModels(result.models || []);
      });
    };
    ws.onclose = () =&gt; setIsConnected(false);
    
    ws.onmessage = (event) =&gt; {
      const data = JSON.parse(event.data);
      
      // 处理响应
      if (data.id &amp;&amp; pendingRequests.current.has(data.id)) {
        const callback = pendingRequests.current.get(data.id)!;
        pendingRequests.current.delete(data.id);
        callback(data.result || data.error);
        return;
      }
      
      // 处理流式事件
      if (data.method === 'stream_token') {
        setMessages((prev) =&gt; prev + data.params.token);
      } else if (data.method === 'stream_start') {
        setMessages('');
      }
    };

    return () =&gt; {
      ws.close();
    };
  }, [port]);

  const sendRequest = useCallback(async (method: string, params: any = {}) =&gt; {
    return new Promise((resolve, reject) =&gt; {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected'));
        return;
      }

      const id = ++requestIdRef.current;
      pendingRequests.current.set(id, (result) =&gt; {
        if (result &amp;&amp; result.code) {
          reject(result);
        } else {
          resolve(result);
        }
      });

      const payload = {
        jsonrpc: "2.0",
        method,
        params,
        id,
      };
      wsRef.current.send(JSON.stringify(payload));
    });
  }, []);

  const sendMessage = useCallback((text: string) =&gt; {
    if (wsRef.current &amp;&amp; wsRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        jsonrpc: "2.0",
        method: "chat",
        params: { message: text },
        id: Date.now()
      };
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const createSession = useCallback((projectId: string, model: string) =&gt; {
    return sendRequest('create_session', { project_id: projectId, model });
  }, [sendRequest]);

  const listSessions = useCallback((projectId?: string) =&gt; {
    return sendRequest('list_sessions', { project_id: projectId });
  }, [sendRequest]);

  return { 
    isConnected, 
    messages, 
    sendMessage,
    models,
    createSession,
    listSessions,
  };
}
```

- [ ] **Step 2: 创建 SessionList 组件**

Create `client/src/components/SessionList.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { SessionMetadata } from '../types';
import { getSessions, deleteSession } from '../storage/sessionStore';

interface SessionListProps {
  projectId: string;
  currentSessionId?: string;
  onSelectSession: (session: SessionMetadata) =&gt; void;
  onCreateSession: () =&gt; void;
}

export function SessionList({ projectId, currentSessionId, onSelectSession, onCreateSession }: SessionListProps) {
  const [sessions, setSessions] = useState&lt;SessionMetadata[]&gt;([]);

  useEffect(() =&gt; {
    loadSessions();
  }, [projectId]);

  async function loadSessions() {
    const data = await getSessions(projectId);
    setSessions(data);
  }

  async function handleDelete(session: SessionMetadata, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(`Delete session "${session.name}"?`)) {
      await deleteSession(session.id);
      loadSessions();
    }
  }

  return (
    &lt;div className="flex flex-col h-full"&gt;
      &lt;div className="flex items-center justify-between p-4 border-b border-surface-300"&gt;
        &lt;span className="text-sm font-bold text-gray-400"&gt;SESSIONS&lt;/span&gt;
        &lt;button
          onClick={onCreateSession}
          className="p-1.5 hover:bg-surface-300 rounded text-orange-500 transition-colors"
        &gt;
          &lt;Plus size={16} /&gt;
        &lt;/button&gt;
      &lt;/div&gt;

      &lt;div className="flex-1 overflow-y-auto py-2"&gt;
        {sessions.length === 0 ? (
          &lt;div className="p-4 text-center text-gray-500 text-sm"&gt;
            No sessions yet. Create one to start chatting!
          &lt;/div&gt;
        ) : (
          sessions.map((session) =&gt; (
            &lt;div
              key={session.id}
              onClick={() =&gt; onSelectSession(session)}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors
                ${currentSessionId === session.id ? 'bg-orange-500/10 text-orange-400' : 'hover:bg-surface-300 text-gray-300'}`}
            &gt;
              &lt;MessageSquare size={16} className={currentSessionId === session.id ? 'text-orange-400' : 'text-gray-500'} /&gt;
              &lt;div className="flex-1 min-w-0"&gt;
                &lt;div className="text-sm font-medium truncate"&gt;{session.name}&lt;/div&gt;
                &lt;div className="text-xs text-gray-500"&gt;{session.model}&lt;/div&gt;
              &lt;/div&gt;
              &lt;button
                onClick={(e) =&gt; handleDelete(session, e)}
                className="p-1 hover:text-red-400 text-gray-500 transition-colors"
              &gt;
                &lt;Trash2 size={14} /&gt;
              &lt;/button&gt;
            &lt;/div&gt;
          ))
        )}
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
```

- [ ] **Step 3: 创建 CreateSessionModal 组件**

Create `client/src/components/CreateSessionModal.tsx`:
```tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { SessionMetadata } from '../types';
import { createSession } from '../storage/sessionStore';

interface CreateSessionModalProps {
  isOpen: boolean;
  projectId: string;
  models: Array&lt;{ id: string; name: string }&gt;;
  onClose: () =&gt; void;
  onCreated: (session: SessionMetadata) =&gt; void;
}

export function CreateSessionModal({ isOpen, projectId, models, onClose, onCreated }: CreateSessionModalProps) {
  const [name, setName] = useState('');
  const [selectedModel, setSelectedModel] = useState(models[0]?.id || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !selectedModel) return;

    setLoading(true);
    try {
      const session = await createSession({
        projectId,
        name: name.trim(),
        model: selectedModel,
      });
      onCreated(session);
      onClose();
      setName('');
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    &lt;div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"&gt;
      &lt;div className="bg-surface-100 border border-surface-300 rounded-xl w-full max-w-md mx-4 shadow-2xl"&gt;
        &lt;div className="flex items-center justify-between p-4 border-b border-surface-300"&gt;
          &lt;h2 className="text-lg font-semibold text-gray-200"&gt;Create New Session&lt;/h2&gt;
          &lt;button onClick={onClose} className="p-1 hover:bg-surface-300 rounded text-gray-400"&gt;
            &lt;X size={20} /&gt;
          &lt;/button&gt;
        &lt;/div&gt;

        &lt;form onSubmit={handleSubmit} className="p-4 space-y-4"&gt;
          &lt;div&gt;
            &lt;label className="block text-sm font-medium text-gray-400 mb-1"&gt;Session Name&lt;/label&gt;
            &lt;input
              type="text"
              value={name}
              onChange={(e) =&gt; setName(e.target.value)}
              className="w-full bg-surface-300 border border-surface-400 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500"
              placeholder="New Session"
              required
            /&gt;
          &lt;/div&gt;

          &lt;div&gt;
            &lt;label className="block text-sm font-medium text-gray-400 mb-1"&gt;AI Model&lt;/label&gt;
            &lt;select
              value={selectedModel}
              onChange={(e) =&gt; setSelectedModel(e.target.value)}
              className="w-full bg-surface-300 border border-surface-400 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-orange-500"
              required
            &gt;
              {models.map((model) =&gt; (
                &lt;option key={model.id} value={model.id}&gt;
                  {model.name}
                &lt;/option&gt;
              ))}
            &lt;/select&gt;
          &lt;/div&gt;

          &lt;div className="flex justify-end gap-2 pt-2"&gt;
            &lt;button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-300 hover:bg-surface-400 rounded-lg text-gray-300 transition-colors"
            &gt;
              Cancel
            &lt;/button&gt;
            &lt;button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:bg-surface-400 disabled:text-gray-500 rounded-lg text-white font-medium transition-colors"
            &gt;
              {loading ? 'Creating...' : 'Create Session'}
            &lt;/button&gt;
          &lt;/div&gt;
        &lt;/form&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /home/xielei/orange-code
git add client/src/components/ client/src/hooks/
git commit -m "feat: add session management UI and WebSocket protocol extensions"
```

---

## Phase 4: 文件系统集成

### Task 4.1: 左侧文件浏览器组件

**Files:**
- Create: `client/src/components/FileExplorer.tsx`
- Modify: `client/electron/preload.ts` (添加文件系统 API)
- Modify: `client/electron/main.ts` (实现文件系统操作)

- [ ] **Step 1: 添加文件系统 API 到 preload**

Modify `client/electron/preload.ts`:
```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () =&gt; 'pong',
  selectFolder: () =&gt; ipcRenderer.invoke('select-folder'),
  readDirectory: (path: string) =&gt; ipcRenderer.invoke('read-directory', path),
  readFile: (path: string) =&gt; ipcRenderer.invoke('read-file', path),
});
```

- [ ] **Step 2: 实现文件系统操作在 main.ts**

Modify `client/electron/main.ts`:
```typescript
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
// ... 其他 import

// ... 现有代码 ...

ipcMain.handle('read-directory', async (_, dirPath: string) =&gt; {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    return entries.map(entry =&gt; ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      path: path.join(dirPath, entry.name),
    }));
  } catch (error) {
    console.error('Failed to read directory:', error);
    throw error;
  }
});

ipcMain.handle('read-file', async (_, filePath: string) =&gt; {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Failed to read file:', error);
    throw error;
  }
});
```

- [ ] **Step 3: 创建 FileExplorer 组件**

Create `client/src/components/FileExplorer.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';

interface FileEntry {
  name: string;
  isDirectory: boolean;
  path: string;
}

interface FileExplorerProps {
  rootPath: string;
  onFileSelect?: (path: string) =&gt; void;
}

export function FileExplorer({ rootPath, onFileSelect }: FileExplorerProps) {
  const [entries, setEntries] = useState&lt;FileEntry[]&gt;([]);
  const [expandedDirs, setExpandedDirs] = useState&lt;Set&lt;string&gt;&gt;(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() =&gt; {
    loadDirectory(rootPath);
  }, [rootPath]);

  async function loadDirectory(dirPath: string) {
    try {
      const data = await window.electronAPI.readDirectory?.(dirPath);
      if (data) {
        setEntries(data.sort((a, b) =&gt; {
          if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
          return a.name.localeCompare(b.name);
        }));
      }
    } catch (error) {
      console.error('Failed to load directory:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleDir(dirPath: string) {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(dirPath)) {
      newExpanded.delete(dirPath);
    } else {
      newExpanded.add(dirPath);
    }
    setExpandedDirs(newExpanded);
  }

  if (loading) {
    return &lt;div className="p-4 text-gray-500"&gt;Loading...&lt;/div&gt;;
  }

  return (
    &lt;div className="flex flex-col h-full"&gt;
      &lt;div className="flex items-center gap-2 p-4 border-b border-surface-300 text-orange-500"&gt;
        &lt;Folder size={18} /&gt;
        &lt;span className="font-bold tracking-wide text-sm"&gt;WORKSPACE&lt;/span&gt;
      &lt;/div&gt;

      &lt;div className="flex-1 overflow-y-auto py-3"&gt;
        {entries.map((entry) =&gt; (
          &lt;div key={entry.path} className="px-2"&gt;
            &lt;div
              className={`flex items-center gap-2 py-1.5 px-2 mx-2 my-0.5 rounded cursor-pointer transition-colors
                hover:bg-surface-300 text-gray-400 hover:text-gray-200`}
              onClick={() =&gt; {
                if (entry.isDirectory) {
                  toggleDir(entry.path);
                } else {
                  onFileSelect?.(entry.path);
                }
              }}
            &gt;
              {entry.isDirectory &amp;&amp; (
                &lt;span className="text-gray-600"&gt;
                  {expandedDirs.has(entry.path) ? &lt;ChevronDown size={14} /&gt; : &lt;ChevronRight size={14} /&gt;}
                &lt;/span&gt;
              )}
              {entry.isDirectory &amp;&amp; !expandedDirs.has(entry.path) &amp;&amp; (
                &lt;span className="w-4" /&gt;
              )}
              {entry.isDirectory ? (
                &lt;Folder size={14} className="text-gray-500" /&gt;
              ) : (
                &lt;FileText size={14} className="text-gray-500" /&gt;
              )}
              &lt;span className="truncate text-xs font-medium"&gt;{entry.name}&lt;/span&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        ))}
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /home/xielei/orange-code
git add client/src/components/ client/electron/preload.ts client/electron/main.ts
git commit -m "feat: add file explorer component with filesystem integration"
```

---

## Phase 5: 模型选择功能

### Task 5.1: 模型选择 UI 与设置

**Files:**
- Create: `client/src/components/ModelSelector.tsx`
- Create: `client/src/components/SettingsModal.tsx`
- Modify: `client/src/App.tsx` (集成设置按钮)

- [ ] **Step 1: 创建 ModelSelector 组件**

Create `client/src/components/ModelSelector.tsx`:
```tsx
import { Cpu } from 'lucide-react';

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}

interface ModelSelectorProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (modelId: string) =&gt; void;
}

export function ModelSelector({ models, selectedModel, onSelectModel }: ModelSelectorProps) {
  const currentModel = models.find(m =&gt; m.id === selectedModel);

  return (
    &lt;div className="flex items-center gap-2"&gt;
      &lt;Cpu size={14} className="text-orange-500" /&gt;
      &lt;select
        value={selectedModel}
        onChange={(e) =&gt; onSelectModel(e.target.value)}
        className="bg-surface-100 border border-surface-300 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-orange-500"
      &gt;
        {models.map((model) =&gt; (
          &lt;option key={model.id} value={model.id}&gt;
            {model.name}
          &lt;/option&gt;
        ))}
      &lt;/select&gt;
    &lt;/div&gt;
  );
}
```

- [ ] **Step 2: 创建 SettingsModal 组件**

Create `client/src/components/SettingsModal.tsx`:
```tsx
import { useState } from 'react';
import { X, Save, Key } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () =&gt; void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  async function handleSave() {
    setSaving(true);
    // TODO: 保存配置到 storage
    setTimeout(() =&gt; {
      setSaving(false);
      onClose();
    }, 500);
  }

  return (
    &lt;div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"&gt;
      &lt;div className="bg-surface-100 border border-surface-300 rounded-xl w-full max-w-lg mx-4 shadow-2xl max-h-[80vh] overflow-y-auto"&gt;
        &lt;div className="flex items-center justify-between p-4 border-b border-surface-300 sticky top-0 bg-surface-100"&gt;
          &lt;h2 className="text-lg font-semibold text-gray-200"&gt;Settings&lt;/h2&gt;
          &lt;button onClick={onClose} className="p-1 hover:bg-surface-300 rounded text-gray-400"&gt;
            &lt;X size={20} /&gt;
          &lt;/button&gt;
        &lt;/div&gt;

        &lt;div className="p-4 space-y-6"&gt;
          &lt;div&gt;
            &lt;h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2"&gt;
              &lt;Key size={16} /&gt;
              API Keys
            &lt;/h3&gt;
            
            &lt;div className="space-y-4"&gt;
              &lt;div&gt;
                &lt;label className="block text-xs font-medium text-gray-500 mb-1"&gt;Anthropic API Key&lt;/label&gt;
                &lt;input
                  type="password"
                  value={anthropicApiKey}
                  onChange={(e) =&gt; setAnthropicApiKey(e.target.value)}
                  className="w-full bg-surface-300 border border-surface-400 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
                  placeholder="sk-ant-..."
                /&gt;
              &lt;/div&gt;

              &lt;div&gt;
                &lt;label className="block text-xs font-medium text-gray-500 mb-1"&gt;OpenAI API Key&lt;/label&gt;
                &lt;input
                  type="password"
                  value={openaiApiKey}
                  onChange={(e) =&gt; setOpenaiApiKey(e.target.value)}
                  className="w-full bg-surface-300 border border-surface-400 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
                  placeholder="sk-..."
                /&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="flex justify-end gap-2 p-4 border-t border-surface-300"&gt;
          &lt;button
            onClick={onClose}
            className="px-4 py-2 bg-surface-300 hover:bg-surface-400 rounded-lg text-gray-300 transition-colors"
          &gt;
            Cancel
          &lt;/button&gt;
          &lt;button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:bg-surface-400 disabled:text-gray-500 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
          &gt;
            &lt;Save size={16} /&gt;
            {saving ? 'Saving...' : 'Save Settings'}
          &lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /home/xielei/orange-code
git add client/src/components/
git commit -m "feat: add model selector and settings modal"
```

---

## Phase 6: 集成与收尾

### Task 6.1: 整合所有组件到 App.tsx

**Files:**
- Modify: `client/src/App.tsx`

- [ ] **Step 1: 完整整合 App.tsx**

将所有组件整合，实现完整的三栏布局、项目/会话切换、模型选择等功能。

- [ ] **Step 2: 测试完整流程**

1. 创建项目
2. 创建会话（选择模型）
3. 打开文件浏览器
4. 发送消息测试

- [ ] **Step 3: Commit**

```bash
cd /home/xielei/orange-code
git add client/src/App.tsx
git commit -m "feat: integrate all MVP components"
```

---

## 计划完成

Plan complete and saved to `docs/superpowers/plans/2026-04-03-mvp-features.md`. 

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
