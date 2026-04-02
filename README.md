# Orange Code

<p align="center">
  <strong>基于 Rust 和 Python 的本地 AI 代码助手个人项目</strong>
</p>

> [!IMPORTANT]
> **Rust 移植版本**已合并至主分支。Rust 实现旨在提供更快、内存更安全的代理运行环境。本项目由最初的 Claw Code 重构而来，现已作为个人项目 **Orange Code** 独立维护和发展。

---

## 核心特性

Orange Code 是一个基于安全 Rust 实现的本地代码助手 CLI 工具。它受 Claude Code 启发，旨在提供强大的本地代理（Agent）体验，但它是一个完全重新实现的版本。

当前项目同时包含 Python 原型版本和 Rust 高性能版本：

### Rust 核心模块 (`rust/` 目录)

目前 Rust 工作区是项目的主要交互界面。它包含以下核心组件：

- `crates/api-client` — API 客户端，支持多种提供商抽象、OAuth 认证以及流式输出
- `crates/runtime` — 核心运行时，包含会话状态管理、上下文压缩、MCP (Model Context Protocol) 编排以及提示词构建
- `crates/tools` — 工具清单定义与执行框架，内置终端、文件读写、搜索等工具
- `crates/commands` — 斜杠命令 (Slash commands)、技能发现和配置检查
- `crates/plugins` — 插件模型、生命周期钩子管道和捆绑插件
- `crates/compat-harness` — 用于上游编辑器集成的兼容层
- `crates/claw-cli` — 交互式 REPL、Markdown 渲染以及项目初始化流程

**编译与运行 Rust 版本:**

```bash
cd rust
cargo build --release
./target/release/claw --help
```

### Python 原型工作区 (`src/` 目录)

项目根目录的 `src/` 和 `tests/` 包含了早期的 Python 移植原型。它实现了核心架构模式的验证，目前作为参考和辅助测试存在：

- **`port_manifest.py`** — Python 工作区结构摘要
- **`models.py`** — 子系统、模块和后台状态的数据类
- **`commands.py`** & **`tools.py`** — Python 侧的命令和工具元数据
- **`query_engine.py`** — 渲染 Python 移植进度的摘要引擎
- **`main.py`** — CLI 入口

**运行 Python 版本验证:**

```bash
python3 -m unittest discover -s tests -v
```

## 项目背景

Orange Code 起源于一次对泄漏的 Claw Code 代理框架的学习与重构。为了避免法律和道德问题，我没有保留任何原始代码，而是通过 [oh-my-codex (OmX)](https://github.com/Yeachan-Heo/oh-my-codex) 辅助，从零开始用 Python 实现了其架构模式。

随着项目的演进，为了追求更高的性能和内存安全性，项目重心转移到了 Rust 的实现上。现在，**Orange Code** 完全作为我的个人开源项目进行维护，专注于探索 Agent 框架设计、工具编排和上下文管理。

## 目录结构

```text
.
├── src/                                # Python 原型工作区
├── tests/                              # Python 测试文件
├── rust/                               # Rust 核心实现 (CLI 工具)
│   ├── crates/api/                     # API 客户端与流式处理
│   ├── crates/runtime/                 # 会话、工具、MCP、配置
│   ├── crates/claw-cli/                # 交互式 CLI 终端
│   ├── crates/plugins/                 # 插件系统
│   ├── crates/commands/                # 斜杠命令实现
│   ├── crates/server/                  # HTTP/SSE 服务器 (axum)
│   ├── crates/lsp/                     # LSP 客户端集成支持
│   └── crates/tools/                   # 核心工具规范与实现
├── assets/                             # 静态资源文件
├── ORANGE.md                           # Orange Code 专属项目指令配置
└── README.md                           # 项目说明文档
```

## 免责声明

- 本存储库**不**声称对原始 Claw Code 源代码拥有任何所有权。
- 本存储库**不**隶属于原始作者，也未得到其认可或由其维护。本项目纯粹出于技术研究与个人学习目的而创建。
