# 功能对齐差异分析 (PARITY GAP ANALYSIS)

范围：仅对位于 `/home/bellman/Workspace/claw-code/src/` 的原始 TypeScript 源码与 `rust/crates/` 下的 Rust 移植版本进行只读对比。

方法：仅比较功能边界、注册表、入口点以及运行时管道。未复制任何 TypeScript 源码。

## 执行摘要

Rust 移植版本在以下方面具有良好的基础：
- Anthropic API/OAuth 基础功能
- 本地对话/会话状态
- 核心工具循环
- MCP stdio/启动支持
- ORANGE.md (原 CLAW.md) 的发现机制
- 一小套但可用性强的内置工具集

但它与 TypeScript CLI **尚未达到功能对齐 (feature-parity)**。

最大差异：
- **插件 (plugins)** 在 Rust 中实际上不存在
- **钩子 (hooks)** 在 Rust 中仅被解析但未被执行
- **CLI 覆盖广度** 在 Rust 中要窄得多
- **技能 (skills)** 在 Rust 中仅支持本地文件，没有 TS 注册表/捆绑管道
- **助手编排 (assistant orchestration)** 缺乏 TS 中感知钩子的编排以及远程/结构化传输
- **服务 (services)** 除核心 API/OAuth/MCP 外，大部分在 Rust 中缺失

---

## 工具 (tools/)

### TS 现状
证据：
- `src/tools/` 包含了广泛的工具家族，包括 `AgentTool`、`AskUserQuestionTool`、`BashTool`、`ConfigTool`、`FileReadTool`、`FileWriteTool`、`GlobTool`、`GrepTool`、`LSPTool`、`ListMcpResourcesTool`、`MCPTool`、`McpAuthTool`、`ReadMcpResourceTool`、`RemoteTriggerTool`、`ScheduleCronTool`、`SkillTool`、`Task*`、`Team*`、`TodoWriteTool`、`ToolSearchTool`、`WebFetchTool`、`WebSearchTool`。
- 工具执行/编排分布在 `src/services/tools/StreamingToolExecutor.ts`、`src/services/tools/toolExecution.ts`、`src/services/tools/toolHooks.ts` 和 `src/services/tools/toolOrchestration.ts` 中。

### Rust 现状
证据：
- 工具注册表通过 `mvp_tool_specs()` 集中在 `rust/crates/tools/src/lib.rs` 中。
- 当前的内置工具包括 shell/文件/搜索/网页/待办/技能/代理/配置/笔记本/repl/powershell 等基础功能。
- 运行时执行通过 `rust/crates/tools/src/lib.rs` 和 `rust/crates/runtime/src/conversation.rs` 连接。

### Rust 中缺失或损坏的部分
- 缺少 TS 主要工具的 Rust 等效实现，如 `AskUserQuestionTool`、`LSPTool`、`ListMcpResourcesTool`、`MCPTool`、`McpAuthTool`、`ReadMcpResourceTool`、`RemoteTriggerTool`、`ScheduleCronTool`、`Task*`、`Team*` 以及几个工作流/系统工具。
- Rust 的工具边界仍明确为 MVP（最小可行性产品）注册表，而非对齐注册表。
- Rust 缺乏 TS 的分层工具编排拆分。

**状态:** 仅部分核心功能可用。

---

## 钩子 (hooks/)

### TS 现状
证据：
- 钩子命令边界在 `src/commands/hooks/` 下。
- 运行时钩子机制在 `src/services/tools/toolHooks.ts` 和 `src/services/tools/toolExecution.ts` 中。
- TS 支持 `PreToolUse`、`PostToolUse`，以及通过设置配置并在 `src/skills/bundled/updateConfig.ts` 中记录的更广泛的钩子驱动行为。

### Rust 现状
证据：
- 钩子配置在 `rust/crates/runtime/src/config.rs` 中解析并合并。
- 钩子配置可以通过 `rust/crates/commands/src/lib.rs` 和 `rust/crates/claw-cli/src/main.rs` 中的 Rust 配置报告进行检查。
- 提示引导在 `rust/crates/runtime/src/prompt.rs` 中提到了钩子。

### Rust 中缺失或损坏的部分
- `rust/crates/runtime/src/conversation.rs` 中没有实际的钩子执行管道。
- 没有 PreToolUse/PostToolUse 变更/拒绝/重写/结果钩子行为。
- 没有 Rust `/hooks` 对齐命令。

**状态:** 仅支持配置；缺少运行时行为。

---

## 插件 (plugins/)

### TS 现状
证据：
- 位于 `src/plugins/builtinPlugins.ts` 和 `src/plugins/bundled/index.ts` 中的内置插件脚手架。
- 插件生命周期/服务在 `src/services/plugins/PluginInstallationManager.ts` 和 `src/services/plugins/pluginOperations.ts` 中。
- CLI/插件命令边界在 `src/commands/plugin/` 和 `src/commands/reload-plugins/` 下。

### Rust 现状
证据：
- `rust/crates/` 下没有专用的插件子系统。
- 除了文本/帮助提示之外，仓库范围内的 Rust 插件引用实际上不存在。

### Rust 中缺失或损坏的部分
- 没有插件加载器。
- 没有市场安装/更新/启用/禁用流程。
- 没有 `/plugin` 或 `/reload-plugins` 对齐功能。
- 没有插件提供的钩子/工具/命令/MCP 扩展路径。

**状态:** 缺失。

---

## 技能 (skills/) 与 ORANGE.md 发现

### TS 现状
证据：
- 技能加载/注册表管道位于 `src/skills/loadSkillsDir.ts`、`src/skills/bundledSkills.ts` 和 `src/skills/mcpSkillBuilders.ts`。
- 捆绑技能在 `src/skills/bundled/` 下。
- 技能命令边界在 `src/commands/skills/` 下。

### Rust 现状
证据：
- `rust/crates/tools/src/lib.rs` 中的 `Skill` 工具解析并读取本地 `SKILL.md` 文件。
- ORANGE.md 发现机制在 `rust/crates/runtime/src/prompt.rs` 中实现。
- Rust 通过 `rust/crates/commands/src/lib.rs` 和 `rust/crates/claw-cli/src/main.rs` 支持 `/memory` 和 `/init`。

### Rust 中缺失或损坏的部分
- 没有捆绑技能注册表等效项。
- 没有 `/skills` 命令。
- 没有 MCP 技能构建器管道。
- 没有类似 TS 的实时技能发现/重载/变更处理。
- 缺少与技能相关的同等会话记忆/团队记忆集成。

**状态:** 仅支持基本的本地技能加载。

---

## CLI (cli/)

### TS 现状
证据：
- 在 `src/commands/` 下有大量的命令边界，包括 `agents`、`hooks`、`mcp`、`memory`、`model`、`permissions`、`plan`、`plugin`、`resume`、`review`、`skills`、`tasks` 以及许多其他命令。
- 位于 `src/cli/structuredIO.ts`、`src/cli/remoteIO.ts` 和 `src/cli/transports/*` 中的结构化/远程传输栈。
- `src/cli/handlers/*` 中的 CLI 处理程序拆分。

### Rust 现状
证据：
- 共享斜杠命令注册表位于 `rust/crates/commands/src/lib.rs`。
- Rust 斜杠命令当前覆盖了 `help`、`status`、`compact`、`model`、`permissions`、`clear`、`cost`、`resume`、`config`、`memory`、`init`、`diff`、`version`、`export`、`session`。
- 主要的 CLI/repl/提示处理位于 `rust/crates/claw-cli/src/main.rs`。

### Rust 中缺失或损坏的部分
- 缺少主要的 TS 命令家族：`/agents`、`/hooks`、`/mcp`、`/plugin`、`/skills`、`/plan`、`/review`、`/tasks` 等等。
- 没有等效于 TS 结构化 IO / 远程传输层的 Rust 实现。
- 没有针对认证/插件/MCP/代理的类似 TS 的处理程序分解。
- JSON 提示模式在此分支上有所改进，但仍未达到干净的传输对齐：经验证，支持工具的 JSON 输出在最终 JSON 对象之前可能会发出人类可读的工具结果行。

**状态:** 本地 CLI 核心功能可用，但比 TS 窄得多。

---

## 助手 (assistant/) (代理循环、流式传输、工具调用)

### TS 现状
证据：
- 助手/会话边界位于 `src/assistant/sessionHistory.ts`。
- 工具编排位于 `src/services/tools/StreamingToolExecutor.ts`、`src/services/tools/toolExecution.ts`、`src/services/tools/toolOrchestration.ts`。
- 远程/结构化流式传输层位于 `src/cli/structuredIO.ts` 和 `src/cli/remoteIO.ts`。

### Rust 现状
证据：
- 核心循环位于 `rust/crates/runtime/src/conversation.rs`。
- 流/工具事件转换位于 `rust/crates/claw-cli/src/main.rs`。
- 会话持久化位于 `rust/crates/runtime/src/session.rs`。

### Rust 中缺失或损坏的部分
- 没有类似 TS 的感知钩子的编排层。
- 没有 TS 结构化/远程助手传输栈。
- 缺少更丰富的 TS 助手/会话历史/后台任务集成。
- JSON 输出路径在此分支上不再仅限单轮，但在工具触发时，输出的干净度仍然滞后于 TS 传输预期（会有预先的人类可读文本）。

**状态:** 核心循环强大，但缺少编排层。

---

## 服务 (services/) (API 客户端、认证、模型、MCP)

### TS 现状
证据：
- `src/services/api/*` 下的 API 服务。
- `src/services/oauth/*` 下的 OAuth 服务。
- `src/services/mcp/*` 下的 MCP 服务。
- `src/services/*` 下的其他服务层，用于分析、提示建议、会话记忆、插件操作、设置同步、策略限制、团队记忆同步、通知、语音等。

### Rust 现状
证据：
- 核心 Anthropic API 客户端位于 `rust/crates/api/src/{client,error,sse,types}.rs`。
- OAuth 支持位于 `rust/crates/runtime/src/oauth.rs`。
- MCP 配置/启动/客户端支持位于 `rust/crates/runtime/src/{config,mcp,mcp_client,mcp_stdio}.rs`。
- 使用量统计位于 `rust/crates/runtime/src/usage.rs`。
- 远程上游代理支持位于 `rust/crates/runtime/src/remote.rs`。

### Rust 中缺失或损坏的部分
- 核心消息/认证/MCP 之外的大部分 TS 服务生态系统缺失。
- 没有 TS 等效的插件服务层。
- 没有 TS 等效的分析/设置同步/策略限制/团队记忆子系统。
- 没有类似 TS 的 MCP 连接管理器/UI 层。
- 模型/提供商的人体工程学支持仍然比 TS 单薄。

**状态:** 核心基础存在；更广泛的服务生态系统缺失。

---

## 此工作树中的严重 Bug 状态

### 已修复
- **启用了提示模式工具**
  - `rust/crates/claw-cli/src/main.rs` 现在使用 `LiveCli::new(model, true, ...)` 构建提示模式。
- **默认权限模式 = DangerFullAccess**
  - 运行时默认现在在 `rust/crates/claw-cli/src/main.rs` 中解析为 `DangerFullAccess`。
  - Clap 默认也使用 `rust/crates/claw-cli/src/args.rs` 中的 `DangerFullAccess`。
  - Init 模板在 `rust/crates/claw-cli/src/init.rs` 中写入 `dontAsk`。
- **流式 `{}` 工具输入前缀 bug**
  - `rust/crates/claw-cli/src/main.rs` 现在仅针对流式工具输入剥离初始的空对象，同时保留非流式响应中合法的 `{}`。
- **无限制的 max_iterations**
  - 已在 `rust/crates/runtime/src/conversation.rs` 中验证为 `usize::MAX`。

### 剩余显著的对齐问题
- **JSON 提示输出干净度**
  - 具有工具能力的 JSON 模式现在支持循环，但实证验证表明，当工具触发时，在最终 JSON 输出前仍会有预先发出的人类可读工具结果输出。
