# Orange Code

Orange Code 是一个基于安全的 Rust 语言实现的本地编码代理（Agent）CLI 工具。它受到 Claude Code 的启发，并作为一个**纯净环境（clean-room）实现**进行开发：它的目标是提供强大的本地代理体验，但它**并非**是对 Claude Code 的直接移植或复制。

当前的主要产品是这个 Rust 工作区。它提供了一个名为 `claw` 的二进制文件，支持从单一工作区运行交互式会话、单次提示（one-shot prompt）、感知工作区上下文的工具、本地代理工作流以及插件机制。

## 当前状态

- **版本:** `0.1.0`
- **发布阶段:** 初始公开版本，仅支持源码构建分发
- **主要实现:** 本存储库中的 Rust 工作区
- **专注平台:** macOS 和 Linux 开发者工作站

## 安装、构建与运行

### 依赖项

- Rust 稳定版工具链
- Cargo
- 您想要使用的模型提供商的凭证（API Keys）

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
# 当使用兼容的端点时可选
export XAI_BASE_URL="https://api.x.ai"
```

也支持 OAuth 登录：

```bash
cargo run --bin claw -- login
```

### 本地安装

```bash
cargo install --path crates/claw-cli --locked
```

### 从源码构建

```bash
cargo build --release -p claw-cli
```

### 运行

从工作区内运行：

```bash
cargo run --bin claw -- --help
cargo run --bin claw --
cargo run --bin claw -- prompt "总结这个工作区"
cargo run --bin claw -- --model sonnet "审查最新代码更改"
```

从发行版构建运行：

```bash
./target/release/claw
./target/release/claw prompt "解释 crates/runtime 的作用"
```

## 支持的功能

- 交互式 REPL 和单次提示（one-shot prompt）执行
- 检查已保存的会话以及恢复流程
- 内置工作区感知工具：终端、文件读写/编辑、搜索、网页抓取/搜索、待办事项（todos）以及笔记本（notebook）更新
- 斜杠命令（Slash commands），用于查看状态、上下文压缩、配置检查、diff、导出、会话管理和版本报告
- 使用 `claw agents` 和 `claw skills` 发现本地代理和技能
- 通过 CLI 和斜杠命令层面发现和管理插件
- 命令行 OAuth 登录/注销以及模型/提供商选择
- 加载感知工作区的指令/配置（`ORANGE.md`、配置文件、权限、插件设置）

## 当前限制

- 目前公开分发**仅限于源码构建**；此工作区尚未配置为向 crates.io 发布
- GitHub CI 会验证 `cargo check`、`cargo test` 和 release 构建，但尚未提供自动化的发布打包
- 当前的 CI 目标是 Ubuntu 和 macOS；Windows 发布准备工作尚未确定
- 某些在线提供商的集成测试是可选的（opt-in），因为它们需要外部凭证和网络访问
- 命令界面在 `0.x` 系列期间可能会继续演进

## 实现细节

Rust 工作区是主要活跃的产品实现，目前包含以下 crates：

- `claw-cli` — 面向用户的 CLI 应用程序
- `api` — 提供商客户端与流式处理支持
- `runtime` — 会话、配置、权限、提示词构建及运行时循环
- `tools` — 内置工具实现
- `commands` — 斜杠命令注册表与处理程序
- `plugins` — 插件发现、注册及生命周期支持
- `lsp` — 语言服务器协议 (LSP) 支持类型及进程辅助
- `server` 与 `compat-harness` — 支持服务与兼容性工具

## 路线图

- 为公共安装发布打包好的构建工件（Release Artifacts）
- 增加可重复的发布工作流和长期的更新日志（changelog）规范
- 在目前的 CI 矩阵之外扩展平台验证
- 添加更多以任务为中心的示例及操作员文档
- 继续强化 Rust 实现的功能覆盖并打磨用户体验

## 发布说明

- 草稿版本 0.1.0 发布说明: [`docs/releases/0.1.0.md`](docs/releases/0.1.0.md)

## 许可证

有关许可证详情，请参阅存储库根目录。
