# Orange Code

<p align="center">
  <strong>基于 Rust 和 Python 的本地 AI 代码助手个人二次开发项目</strong>
</p>

> [!IMPORTANT]
> **版本:** v1.0.0
> 
> **项目来源说明:** 本项目基于开源项目 [Claw Code](https://github.com/instructkr/claw-code) 的架构进行二次开发与重构。Claw Code 本身受 Claude Code 启发。在此特别感谢原作者的开源贡献。本项目现作为个人工具 **Orange Code** 独立维护，用于探索 Agent 框架设计、工具编排和上下文管理。

---

## 核心特性

Orange Code 是一个基于安全 Rust 实现的本地代码助手 CLI 工具，旨在提供强大的本地代理（Agent）体验。

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

项目根目录的 `src/` 和 `tests/` 包含了早期的 Python 移植原型。它实现了核心架构模式的验证，目前作为参考和辅助测试存在。

**运行 Python 版本验证:**

```bash
python3 -m unittest discover -s tests -v
```

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

- 本项目为基于 [Claw Code](https://github.com/instructkr/claw-code) 源码的二次开发。
- 本项目纯粹出于技术研究、个人学习与工具定制目的而创建和维护，不隶属于原作者团队，也不声称对原始代码的完全所有权。