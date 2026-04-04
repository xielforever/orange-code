# Rust WebSocket Server + ConversationRuntime Integration Plan

&gt; **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 集成 Rust WebSocket Server 与 ConversationRuntime，使 Client 前端可以通过 WebSocket 与真实的 Orange Code 后端交互。

**Architecture:** 
- 在 `server.rs` 中复用 `main.rs` 中的 `build_runtime` 逻辑
- 创建自定义的 `ApiClient` 实现，可以将流式事件推送到 WebSocket
- 实现 JSON-RPC 2.0 协议处理

**Tech Stack:** Rust, warp, tokio, serde_json

---

## 设计分析

### 现有代码结构

1. **`main.rs` 包含：**
   - `DefaultRuntimeClient` - 实现了 `ApiClient` trait
   - `CliToolExecutor` - 实现了 `ToolExecutor` trait
   - `build_runtime()` - 构建 `ConversationRuntime` 的函数
   - `build_system_prompt()` - 构建系统提示词

2. **`server.rs` 当前：**
   - 只有 mock 实现
   - 需要集成真实的 `ConversationRuntime`

### 集成方案

由于 `DefaultRuntimeClient`、`CliToolExecutor` 和 `build_runtime` 都在 `main.rs` 中（非 pub），我们需要：

**方案 A（推荐）：重构代码结构**
1. 创建新的 `server_runtime.rs` 模块
2. 将运行时构建逻辑提取到可复用的位置
3. 创建支持 WebSocket 流式输出的 `ApiClient` 包装器

**方案 B（快速实现）：**
1. 将 `server.rs` 改为使用与 `main.rs` 相同的模式
2. 复制必要的类型定义到 `server.rs` 或使其 pub

我们采用 **方案 B** 进行快速实现，验证可行性后再考虑重构。

---

### Task 1: 创建支持 WebSocket 的 ApiClient 包装器

**Files:**
- Modify: `rust/crates/orange-cli/src/server.rs`

- [ ] **Step 1: 导入必要的依赖和类型**

```rust
use std::sync::{Arc, Mutex};
use std::collections::BTreeSet;

use api::{
    resolve_startup_auth_source, AuthSource, OrangeApiClient, ContentBlockDelta, InputContentBlock,
    InputMessage, MessageRequest, MessageResponse, OutputContentBlock,
    StreamEvent as ApiStreamEvent, ToolChoice, ToolDefinition, ToolResultContentBlock,
};
use runtime::{
    clear_oauth_credentials, generate_pkce_pair, generate_state, load_system_prompt,
    parse_oauth_callback_request_target, save_oauth_credentials, ApiClient, ApiRequest,
    AssistantEvent, CompactionConfig, ConfigLoader, ConfigSource, ContentBlock,
    ConversationMessage, ConversationRuntime, MessageRole, OAuthAuthorizationRequest, OAuthConfig,
    OAuthTokenExchangeRequest, PermissionMode, PermissionPolicy, ProjectContext, RuntimeError,
    Session, TokenUsage, ToolError, ToolExecutor, UsageTracker,
};
use tools::GlobalToolRegistry;
```

- [ ] **Step 2: 创建 WebSocketSender trait 和实现**

```rust
trait WebSocketSender: Send + Sync {
    fn send_text(&self, text: String) -&gt; Result&lt;(), Box&lt;dyn std::error::Error + Send + Sync&gt;&gt;;
}

struct WarpWebSocketSender {
    tx: Arc&lt;Mutex&lt;warp::ws::Sender&gt;&gt;,
}

impl WarpWebSocketSender {
    fn new(tx: warp::ws::Sender) -&gt; Self {
        Self {
            tx: Arc::new(Mutex::new(tx)),
        }
    }
}

impl WebSocketSender for WarpWebSocketSender {
    fn send_text(&amp;self, text: String) -&gt; Result&lt;(), Box&lt;dyn std::error::Error + Send + Sync&gt;&gt; {
        let mut tx = self.tx.lock().unwrap();
        tokio::runtime::Handle::current().block_on(async {
            tx.send(warp::ws::Message::text(text)).await
        })?;
        Ok(())
    }
}
```

- [ ] **Step 3: 创建 StreamingApiClient 包装器**

```rust
struct StreamingApiClient&lt;C: ApiClient, S: WebSocketSender + 'static&gt; {
    inner: C,
    sender: Arc&lt;S&gt;,
    request_id: serde_json::Value,
}

impl&lt;C: ApiClient, S: WebSocketSender&gt; StreamingApiClient&lt;C, S&gt; {
    fn new(inner: C, sender: Arc&lt;S&gt;, request_id: serde_json::Value) -&gt; Self {
        Self {
            inner,
            sender,
            request_id,
        }
    }

    fn send_stream_event(&amp;self, method: &amp;str, params: Option&lt;serde_json::Value&gt;) {
        let event = serde_json::json!({
            "jsonrpc": "2.0",
            "method": method,
            "params": params,
            "id": self.request_id,
        });
        let _ = self.sender.send_text(event.to_string());
    }
}

impl&lt;C: ApiClient, S: WebSocketSender&gt; ApiClient for StreamingApiClient&lt;C, S&gt; {
    fn stream(&amp;mut self, request: ApiRequest) -&gt; Result&lt;Vec&lt;AssistantEvent&gt;, RuntimeError&gt; {
        // Send stream_start
        self.send_stream_event("stream_start", None);

        // Get events from inner client
        let events = self.inner.stream(request)?;

        // Forward events to WebSocket
        for event in &amp;events {
            match event {
                AssistantEvent::TextDelta(delta) =&gt; {
                    self.send_stream_event("stream_token", Some(serde_json::json!({ "token": delta })));
                }
                AssistantEvent::ToolUse { id, name, input } =&gt; {
                    self.send_stream_event("tool_use", Some(serde_json::json!({
                        "id": id,
                        "name": name,
                        "input": input
                    })));
                }
                AssistantEvent::Usage(usage) =&gt; {
                    self.send_stream_event("usage", Some(serde_json::json!({
                        "input_tokens": usage.input_tokens,
                        "output_tokens": usage.output_tokens,
                        "cache_creation_input_tokens": usage.cache_creation_input_tokens,
                        "cache_read_input_tokens": usage.cache_read_input_tokens,
                    })));
                }
                AssistantEvent::MessageStop =&gt; {}
            }
        }

        // Send stream_end
        self.send_stream_event("stream_end", None);

        Ok(events)
    }
}
```

---

### Task 2: 实现运行时构建函数

**Files:**
- Modify: `rust/crates/orange-cli/src/server.rs`

- [ ] **Step 1: 添加必要的类型定义（从 main.rs 复制）**

```rust
type AllowedToolSet = BTreeSet&lt;String&gt;;

#[derive(Debug, Clone)]
struct CliToolExecutor {
    allowed_tools: Option&lt;AllowedToolSet&gt;,
    emit_output: bool,
    tool_registry: GlobalToolRegistry,
}

impl CliToolExecutor {
    fn new(
        allowed_tools: Option&lt;AllowedToolSet&gt;,
        emit_output: bool,
        tool_registry: GlobalToolRegistry,
    ) -&gt; Self {
        Self {
            allowed_tools,
            emit_output,
            tool_registry,
        }
    }
}

impl ToolExecutor for CliToolExecutor {
    fn execute(&amp;mut self, tool_name: &amp;str, input: &amp;str) -&gt; Result&lt;String, ToolError&gt; {
        self.tool_registry
            .execute(tool_name, &amp;serde_json::from_str::&lt;serde_json::Value&gt;(input).unwrap_or(serde_json::Value::Null))
            .map_err(ToolError::new)
    }
}

fn permission_policy(
    permission_mode: PermissionMode,
    tool_registry: &amp;GlobalToolRegistry,
) -&gt; PermissionPolicy {
    let specs = tool_registry.permission_specs(None);
    PermissionPolicy::new_with_specs(permission_mode, specs)
}

fn build_system_prompt() -&gt; Result&lt;Vec&lt;String&gt;, Box&lt;dyn std::error::Error&gt;&gt; {
    Ok(load_system_prompt(
        std::env::current_dir()?,
        "2026-03-31",
        std::env::consts::OS,
        "unknown",
    )?)
}

fn build_runtime_plugin_state(
) -&gt; Result&lt;(runtime::RuntimeFeatureConfig, GlobalToolRegistry), Box&lt;dyn std::error::Error&gt;&gt; {
    let cwd = std::env::current_dir()?;
    let loader = ConfigLoader::default_for(&amp;cwd);
    let runtime_config = loader.load()?;
    let tool_registry = GlobalToolRegistry::builtin();
    Ok((runtime_config.feature_config().clone(), tool_registry))
}

fn build_runtime&lt;C: ApiClient, S: WebSocketSender + 'static&gt;(
    session: Session,
    model: String,
    system_prompt: Vec&lt;String&gt;,
    enable_tools: bool,
    emit_output: bool,
    allowed_tools: Option&lt;AllowedToolSet&gt;,
    permission_mode: PermissionMode,
    sender: Arc&lt;S&gt;,
    request_id: serde_json::Value,
) -&gt; Result&lt;ConversationRuntime&lt;StreamingApiClient&lt;DefaultRuntimeClient, S&gt;, CliToolExecutor&gt;, Box&lt;dyn std::error::Error&gt;&gt;
{
    let (feature_config, tool_registry) = build_runtime_plugin_state()?;
    
    // Build the inner client
    let auth_source = resolve_startup_auth_source(|| {
        let cwd = std::env::current_dir().map_err(api::ApiError::from)?;
        let config = ConfigLoader::default_for(&amp;cwd).load().map_err(|error| {
            api::ApiError::Auth(format!("failed to load runtime OAuth config: {error}"))
        })?;
        Ok(config.oauth().cloned())
    }).ok();
    let inner_client = api::ProviderClient::from_model_with_default_auth(&amp;model, auth_source)?;
    
    let default_client = DefaultRuntimeClient {
        runtime: tokio::runtime::Runtime::new()?,
        client: inner_client,
        model: model.clone(),
        enable_tools,
        emit_output,
        allowed_tools: allowed_tools.clone(),
        tool_registry: tool_registry.clone(),
        progress_reporter: None,
    };
    
    let streaming_client = StreamingApiClient::new(default_client, sender, request_id);
    
    Ok(ConversationRuntime::new_with_features(
        session,
        streaming_client,
        CliToolExecutor::new(allowed_tools.clone(), emit_output, tool_registry.clone()),
        permission_policy(permission_mode, &amp;tool_registry),
        system_prompt,
        feature_config,
    ))
}

// Also need to define DefaultRuntimeClient (simplified version without UI output)
#[derive(Clone)]
struct DefaultRuntimeClient {
    runtime: tokio::runtime::Runtime,
    client: api::ProviderClient,
    model: String,
    enable_tools: bool,
    emit_output: bool,
    allowed_tools: Option&lt;AllowedToolSet&gt;,
    tool_registry: GlobalToolRegistry,
    progress_reporter: Option&lt;()&gt;,
}

impl ApiClient for DefaultRuntimeClient {
    fn stream(&amp;mut self, request: ApiRequest) -&gt; Result&lt;Vec&lt;AssistantEvent&gt;, RuntimeError&gt; {
        let message_request = MessageRequest {
            model: self.model.clone(),
            max_tokens: 64000,
            messages: convert_messages(&amp;request.messages),
            system: (!request.system_prompt.is_empty()).then(|| request.system_prompt.join("\n\n")),
            tools: self
                .enable_tools
                .then(|| self.tool_registry.definitions(self.allowed_tools.as_ref())),
            tool_choice: self.enable_tools.then_some(ToolChoice::Auto),
            stream: true,
        };

        self.runtime.block_on(async {
            let mut stream = self
                .client
                .stream_message(&amp;message_request)
                .await
                .map_err(|error| RuntimeError::new(error.to_string()))?;
            
            let mut events = Vec::new();
            let mut saw_stop = false;

            while let Some(event) = stream
                .next_event()
                .await
                .map_err(|error| RuntimeError::new(error.to_string()))?
            {
                match event {
                    ApiStreamEvent::MessageStart(_) =&gt; {}
                    ApiStreamEvent::ContentBlockStart(start) =&gt; {
                        if let api::OutputContentBlock::Text { text } = start.content_block {
                            events.push(AssistantEvent::TextDelta(text));
                        }
                    }
                    ApiStreamEvent::ContentBlockDelta(delta) =&gt; {
                        if let api::ContentBlockDelta::TextDelta { text } = delta {
                            events.push(AssistantEvent::TextDelta(text));
                        }
                    }
                    ApiStreamEvent::ContentBlockStop(_) =&gt; {}
                    ApiStreamEvent::MessageDelta(_) =&gt; {}
                    ApiStreamEvent::MessageStop(stop) =&gt; {
                        if let Some(usage) = stop.usage {
                            events.push(AssistantEvent::Usage(TokenUsage {
                                input_tokens: usage.input_tokens,
                                output_tokens: usage.output_tokens,
                                cache_creation_input_tokens: usage.cache_creation_input_tokens,
                                cache_read_input_tokens: usage.cache_read_input_tokens,
                            }));
                        }
                        events.push(AssistantEvent::MessageStop);
                        saw_stop = true;
                    }
                    ApiStreamEvent::Error(error) =&gt; {
                        return Err(RuntimeError::new(error.to_string()));
                    }
                }
            }

            if !saw_stop {
                return Err(RuntimeError::new("assistant stream ended without a message stop event"));
            }

            Ok(events)
        })
    }
}

fn convert_messages(messages: &amp;[ConversationMessage]) -&gt; Vec&lt;api::InputMessage&gt; {
    messages
        .iter()
        .filter_map(|msg| match msg.role {
            MessageRole::User =&gt; {
                let blocks = msg
                    .blocks
                    .iter()
                    .filter_map(|block| match block {
                        ContentBlock::Text { text } =&gt; Some(api::InputContentBlock::Text {
                            text: text.clone(),
                        }),
                        _ =&gt; None,
                    })
                    .collect::&lt;Vec&lt;_&gt;&gt;();
                if blocks.is_empty() {
                    None
                } else {
                    Some(api::InputMessage::User { content: blocks })
                }
            }
            MessageRole::Assistant =&gt; {
                let blocks = msg
                    .blocks
                    .iter()
                    .filter_map(|block| match block {
                        ContentBlock::Text { text } =&gt; Some(api::OutputContentBlock::Text {
                            text: text.clone(),
                        }),
                        ContentBlock::ToolUse { id, name, input } =&gt; {
                            Some(api::OutputContentBlock::ToolUse {
                                id: id.clone(),
                                name: name.clone(),
                                input: serde_json::from_str(input).unwrap_or(serde_json::Value::Null),
                            })
                        }
                        _ =&gt; None,
                    })
                    .collect::&lt;Vec&lt;_&gt;&gt;();
                if blocks.is_empty() {
                    None
                } else {
                    Some(api::InputMessage::Assistant { content: blocks })
                }
            }
            MessageRole::Tool =&gt; {
                let blocks = msg
                    .blocks
                    .iter()
                    .filter_map(|block| match block {
                        ContentBlock::ToolResult {
                            tool_use_id,
                            output,
                            is_error,
                            ..
                        } =&gt; Some(api::ToolResultContentBlock {
                            tool_use_id: tool_use_id.clone(),
                            content: vec![api::InputContentBlock::Text {
                                text: output.clone(),
                            }],
                            is_error: *is_error,
                        }),
                        _ =&gt; None,
                    })
                    .collect::&lt;Vec&lt;_&gt;&gt;();
                if blocks.is_empty() {
                    None
                } else {
                    Some(api::InputMessage::User {
                        content: blocks
                            .into_iter()
                            .map(api::InputContentBlock::ToolResult)
                            .collect(),
                    })
                }
            }
            _ =&gt; None,
        })
        .collect()
}
```

---

### Task 3: 实现 handle_connection 函数

**Files:**
- Modify: `rust/crates/orange-cli/src/server.rs`

- [ ] **Step 1: 重写 handle_connection 函数**

```rust
async fn handle_connection(ws: WebSocket) {
    let (ws_tx, mut ws_rx) = ws.split();
    let sender = Arc::new(WarpWebSocketSender::new(ws_tx));

    // Build runtime once per connection
    let model = "claude-sonnet-4-6".to_string();
    let system_prompt = match build_system_prompt() {
        Ok(p) =&gt; p,
        Err(e) =&gt; {
            eprintln!("Failed to build system prompt: {}", e);
            return;
        }
    };
    let mut session = Session::new();

    while let Some(result) = ws_rx.next().await {
        let msg = match result {
            Ok(msg) =&gt; msg,
            Err(e) =&gt; {
                eprintln!("WebSocket error: {}", e);
                break;
            }
        };

        if msg.is_text() {
            let text = match msg.to_str() {
                Ok(t) =&gt; t,
                Err(_) =&gt; continue,
            };

            if let Ok(req) = serde_json::from_str::&lt;serde_json::Value&gt;(text) {
                let id = req.get("id").cloned().unwrap_or(serde_json::json!(null));
                let method = req.get("method").and_then(|m| m.as_str());
                let params = req.get("params");

                match method {
                    Some("chat") =&gt; {
                        let message = params
                            .and_then(|p| p.get("message"))
                            .and_then(|m| m.as_str())
                            .unwrap_or("");

                        if message.is_empty() {
                            let error = serde_json::json!({
                                "jsonrpc": "2.0",
                                "error": { "code": -32602, "message": "Missing message parameter" },
                                "id": id,
                            });
                            let _ = sender.send_text(error.to_string());
                            continue;
                        }

                        // Clone sender for this request
                        let req_sender = sender.clone();
                        let req_id = id.clone();
                        
                        // Build a new runtime for this turn
                        let runtime_result = build_runtime(
                            session.clone(),
                            model.clone(),
                            system_prompt.clone(),
                            true,
                            false,
                            None,
                            PermissionMode::DangerFullAccess,
                            req_sender,
                            req_id.clone(),
                        );

                        let mut runtime = match runtime_result {
                            Ok(r) =&gt; r,
                            Err(e) =&gt; {
                                let error = serde_json::json!({
                                    "jsonrpc": "2.0",
                                    "error": { "code": -32603, "message": format!("Failed to build runtime: {}", e) },
                                    "id": id,
                                });
                                let _ = sender.send_text(error.to_string());
                                continue;
                            }
                        };

                        // Run the turn (this will stream events via our StreamingApiClient)
                        match runtime.run_turn(message, None) {
                            Ok(summary) =&gt; {
                                // Update session for next turn
                                session = runtime.into_session();
                            }
                            Err(e) =&gt; {
                                let error = serde_json::json!({
                                    "jsonrpc": "2.0",
                                    "error": { "code": -32603, "message": format!("Runtime error: {}", e) },
                                    "id": id,
                                });
                                let _ = sender.send_text(error.to_string());
                            }
                        }
                    }
                    _ =&gt; {
                        let error = serde_json::json!({
                            "jsonrpc": "2.0",
                            "error": { "code": -32601, "message": format!("Unknown method: {:?}", method) },
                            "id": id,
                        });
                        let _ = sender.send_text(error.to_string());
                    }
                }
            }
        }
    }
}
```

---

### Task 4: 测试构建

**Files:**
- Build: `rust/crates/orange-cli/`

- [ ] **Step 1: 构建项目验证编译**

```bash
cd /home/xielei/orange-code/rust
cargo check -p orange-cli
```

Expected: 编译通过，无错误

- [ ] **Step 2: 如果有编译错误，修复它们**

根据编译错误调整代码（可能需要调整类型导入或可见性）

---

### Task 5: 端到端测试

**Files:**
- Run: Rust server + Electron client

- [ ] **Step 1: 启动 Rust Server**

```bash
cd /home/xielei/orange-code/rust
cargo run --bin orange -- --server --port 34567
```

Expected: "Starting WebSocket server on ws://127.0.0.1:34567"

- [ ] **Step 2: 启动 Electron Client（新终端）**

```bash
cd /home/xielei/orange-code/client
npm run dev
```

Expected: Electron 窗口启动，显示连接状态为 Connected

- [ ] **Step 3: 发送测试消息**

在 Electron 客户端中输入 "Hello" 并发送
Expected: 收到来自 Rust 后端的流式响应（通过真实的 LLM）

---

## 注意事项

1. **简化版实现**: 本方案暂时使用简化版本的 `DefaultRuntimeClient`，不包含 Markdown 渲染等 UI 输出功能
2. **权限模式**: 默认使用 `DangerFullAccess` 模式进行测试
3. **会话管理**: 每个 WebSocket 连接保持一个会话状态
4. **错误处理**: 需要适当处理 API key 缺失等错误情况

## 后续优化

1. 重构代码结构，将共享逻辑提取到单独的模块
2. 支持通过 JSON-RPC 配置模型和权限模式
3. 添加会话持久化
4. 完善错误处理和用户反馈
