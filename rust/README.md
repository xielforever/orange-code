# Orange Code

Orange Code 是一个基于安全的 Rust 语言实现的本地编码代理（Agent）CLI 工具。本项目是开源项目 **[Claw Code](https://github.com/instructkr/claw-code)** 的二次开发版本。它继承了原项目优秀的架构设计（受 Claude Code 启发），现作为个人定制化工具进行独立维护与演进。

当前的主要产品是这个 Rust 工作区。它提供了一个名为 `claw`（或可通过配置更改）的二进制文件，支持从单一工作区运行交互式会话、感知工作区上下文的工具、本地代理工作流以及插件机制。

## 当前状态

- **版本:** `v1.0.0`
- **发布阶段:** 个人二次开发初始版本
- **主要实现:** 本存储库中的 Rust 工作区
- **专注平台:** macOS 和 Linux 开发者工作站

## 安装、构建与运行

### 依赖项

- Rust 稳定版工具链
- Cargo
- 大语言模型提供商的凭证（API Keys）

### 身份验证

Anthropic 兼容模型：

```bash
export ANTHROPIC_API_KEY="..."
# 当使用兼容的端点时可选
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
```

Grok 模型：

```bash
export XAI_API_KEY="..."
```

也支持 OAuth 登录：

```bash
cargo run --bin claw -- login
```

### 本地安装与构建

```bash
# 从源码构建
cargo build --release -p claw-cli

# 本地安装
cargo install --path crates/claw-cli --locked
```

### 运行示例

```bash
cargo run --bin claw -- prompt "总结这个工作区"
cargo run --bin claw -- --model sonnet "审查最新代码更改"

# 或者运行已构建的二进制
./target/release/claw
```

## 支持的功能

- 交互式 REPL 和单次提示（one-shot prompt）执行
- 检查已保存的会话以及恢复流程
- 内置工作区感知工具：终端、文件读写/编辑、搜索、网页抓取/搜索等
- 斜杠命令（Slash commands），用于查看状态、上下文压缩、配置检查等
- 通过 CLI 发现和管理本地代理（Agents）、技能（Skills）与插件
- 命令行 OAuth 登录及模型选择
- 加载感知工作区的指令/配置（如 `ORANGE.md`）

## 实现细节

Rust 工作区是主要活跃的产品实现，目前包含以下核心 crates：

- `claw-cli` — 面向用户的 CLI 应用程序
- `api` — 提供商客户端与流式处理支持
- `runtime` — 会话、配置、权限、提示词构建及运行时循环
- `tools` — 内置工具实现
- `commands` — 斜杠命令注册表与处理程序
- `plugins` — 插件发现、注册及生命周期支持
- `lsp` — 语言服务器协议 (LSP) 支持类型及进程辅助
- `server` 与 `compat-harness` — 支持服务与兼容性工具

## 发布说明

- v1.0.0 发布说明: [`docs/releases/1.0.0.md`](docs/releases/1.0.0.md)

## 项目来源声明

本项目基于开源项目 [Claw Code](https://github.com/instructkr/claw-code) 源码进行二次开发，不隶属于原始开发团队。感谢原作者的开源贡献。
