# Orange Code

<p align="center">
  <strong>基于 Rust 和 Python 的本地 AI 代码助手个人二次开发项目</strong>
</p>

> [!IMPORTANT]
> **版本:** v1.0.0
> 
> **项目来源说明:** 本项目基于开源项目 [Orange Code](https://github.com/instructkr/orange-code) 的架构进行二次开发与重构。Orange Code 本身受 Claude Code 启发。在此特别感谢原作者的开源贡献。本项目现作为个人工具 **Orange Code** 独立维护，用于探索 Agent 框架设计、工具编排和上下文管理。

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
- `crates/orange-cli` — 交互式 REPL、Markdown 渲染以及项目初始化流程

**编译与运行 Rust 版本:**

<!-- Upstream/English Version Below -->

# Rewriting Project Orange Code

<p align="center">
  <strong>⭐ The fastest repo in history to surpass 50K stars, reaching the milestone in just 2 hours after publication ⭐</strong>
</p>

<p align="center">
  <a href="https://star-history.com/#instructkr/orange-code&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=instructkr/orange-code&type=Date&theme=dark" />
      <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=instructkr/orange-code&type=Date" />
      <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=instructkr/orange-code&type=Date" width="600" />
    </picture>
  </a>
</p>

<p align="center">
  <img src="assets/oranged-hero.jpeg" alt="Orange" width="300" />
</p>

<p align="center">
  <strong>Better Harness Tools, not merely storing the archive of leaked Orange Code</strong>
</p>

<p align="center">
  <a href="https://github.com/sponsors/instructkr"><img src="https://img.shields.io/badge/Sponsor-%E2%9D%A4-pink?logo=github&style=for-the-badge" alt="Sponsor on GitHub" /></a>
</p>

> [!IMPORTANT]
> **Rust port is now in progress** on the [`dev/rust`](https://github.com/instructkr/orange-code/tree/dev/rust) branch and is expected to be merged into main today. The Rust implementation aims to deliver a faster, memory-safe harness runtime. Stay tuned — this will be the definitive version of the project.

> If you find this work useful, consider [sponsoring @instructkr on GitHub](https://github.com/sponsors/instructkr) to support continued open-source harness engineering research.

---

## Rust Port

The Rust workspace under `rust/` is the current systems-language port of the project.

It currently includes:

- `crates/api-client` — API client with provider abstraction, OAuth, and streaming support
- `crates/runtime` — session state, compaction, MCP orchestration, prompt construction
- `crates/tools` — tool manifest definitions and execution framework
- `crates/commands` — slash commands, skills discovery, and config inspection
- `crates/plugins` — plugin model, hook pipeline, and bundled plugins
- `crates/compat-harness` — compatibility layer for upstream editor integration
- `crates/orange-cli` — interactive REPL, markdown rendering, and project bootstrap/init flows

Run the Rust build:

```bash
cd rust
cargo build --release
./target/release/orange --help
```

### Python 原型工作区 (`src/` 目录)

项目根目录的 `src/` 和 `tests/` 包含了早期的 Python 移植原型。它实现了核心架构模式的验证，目前作为参考和辅助测试存在。

**运行 Python 版本验证:**

<!-- Upstream/English Version Below -->

```

## Backstory

At 4 AM on March 31, 2026, I woke up to my phone blowing up with notifications. The Orange Code source had been exposed, and the entire dev community was in a frenzy. My girlfriend in Korea was genuinely worried I might face legal action from the original authors just for having the code on my machine — so I did what any engineer would do under pressure: I sat down, ported the core features to Python from scratch, and pushed it before the sun came up.

The whole thing was orchestrated end-to-end using [oh-my-codex (OmX)](https://github.com/Yeachan-Heo/oh-my-codex) by [@bellman_ych](https://x.com/bellman_ych) — a workflow layer built on top of OpenAI's Codex ([@OpenAIDevs](https://x.com/OpenAIDevs)). I used `$team` mode for parallel code review and `$ralph` mode for persistent execution loops with architect-level verification. The entire porting session — from reading the original harness structure to producing a working Python tree with tests — was driven through OmX orchestration.

The result is a clean-room Python rewrite that captures the architectural patterns of Orange Code's agent harness without copying any proprietary source. I'm now actively collaborating with [@bellman_ych](https://x.com/bellman_ych) — the creator of OmX himself — to push this further. The basic Python foundation is already in place and functional, but we're just getting started. **Stay tuned — a much more capable version is on the way.**

The Rust port was developed with both [oh-my-codex (OmX)](https://github.com/Yeachan-Heo/oh-my-codex) and [oh-my-opencode (OmO)](https://github.com/code-yeongyu/oh-my-openagent): OmX drove scaffolding, orchestration, and architecture direction, while OmO was used for later implementation acceleration and verification support.

https://github.com/instructkr/orange-code

![Tweet screenshot](assets/tweet-screenshot.png)

## The Creators Featured in Wall Street Journal For Avid Orange Code Fans

I've been deeply interested in **harness engineering** — studying how agent systems wire tools, orchestrate tasks, and manage runtime context. This isn't a sudden thing. The Wall Street Journal featured my work earlier this month, documenting how I've been one of the most active power users exploring these systems:

> AI startup worker Sigrid Jin, who attended the Seoul dinner, single-handedly used 25 billion of Orange Code tokens last year. At the time, usage limits were looser, allowing early enthusiasts to reach tens of billions of tokens at a very low cost.
>
> Despite his countless hours with Orange Code, Jin isn't faithful to any one AI lab. The tools available have different strengths and weaknesses, he said. Codex is better at reasoning, while Orange Code generates cleaner, more shareable code.
>
> Jin flew to San Francisco in February for Orange Code's first birthday party, where attendees waited in line to compare notes with Cherny. The crowd included a practicing cardiologist from Belgium who had built an app to help patients navigate care, and a California lawyer who made a tool for automating building permit approvals using Orange Code.
>
> "It was basically like a sharing party," Jin said. "There were lawyers, there were doctors, there were dentists. They did not have software engineering backgrounds."
>
> — *The Wall Street Journal*, March 21, 2026, [*"The Trillion Dollar Race to Automate Our Entire Lives"*](https://lnkd.in/gs9td3qd)

![WSJ Feature](assets/wsj-feature.png)

---

## Porting Status

The main source tree is now Python-first.

- `src/` contains the active Python porting workspace
- `tests/` verifies the current Python workspace
- the exposed snapshot is no longer part of the tracked repository state

The current Python workspace is not yet a complete one-to-one replacement for the original system, but the primary implementation surface is now Python.

## Why this rewrite exists

I originally studied the exposed codebase to understand its harness, tool wiring, and agent workflow. After spending more time with the legal and ethical questions—and after reading the essay linked below—I did not want the exposed snapshot itself to remain the main tracked source tree.

This repository now focuses on Python porting work instead.

## Repository Layout

```text
.
├── src/                                # Python porting workspace
│   ├── __init__.py
│   ├── commands.py
│   ├── main.py
│   ├── models.py
│   ├── port_manifest.py
│   ├── query_engine.py
│   ├── task.py
│   └── tools.py
├── rust/                               # Rust port (orange CLI)
│   ├── crates/api/                     # API client + streaming
│   ├── crates/runtime/                 # Session, tools, MCP, config
│   ├── crates/orange-cli/               # Interactive CLI binary
│   ├── crates/plugins/                 # Plugin system
│   ├── crates/commands/                # Slash commands
│   ├── crates/server/                  # HTTP/SSE server (axum)
│   ├── crates/lsp/                    # LSP client integration
│   └── crates/tools/                   # Tool specs
├── tests/                              # Python verification
├── assets/omx/                         # OmX workflow screenshots
├── 2026-03-09-is-legal-the-same-as-legitimate-ai-reimplementation-and-the-erosion-of-copyleft.md
└── README.md
```

## Python Workspace Overview

The new Python `src/` tree currently provides:

- **`port_manifest.py`** — summarizes the current Python workspace structure
- **`models.py`** — dataclasses for subsystems, modules, and backlog state
- **`commands.py`** — Python-side command port metadata
- **`tools.py`** — Python-side tool port metadata
- **`query_engine.py`** — renders a Python porting summary from the active workspace
- **`main.py`** — a CLI entrypoint for manifest and summary output

## Quickstart

Render the Python porting summary:

```bash
python3 -m src.main summary
```

Print the current Python workspace manifest:

```bash
python3 -m src.main manifest
```

List the current Python modules:

```bash
python3 -m src.main subsystems --limit 16
```

Run verification:

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
│   ├── crates/orange-cli/                # 交互式 CLI 终端
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

- 本项目为基于 [Orange Code](https://github.com/instructkr/orange-code) 源码的二次开发。
- 本项目纯粹出于技术研究、个人学习与工具定制目的而创建和维护，不隶属于原作者团队，也不声称对原始代码的完全所有权。

<!-- Upstream/English Version Below -->

Run the parity audit against the local ignored archive (when present):

```bash
python3 -m src.main parity-audit
```

Inspect mirrored command/tool inventories:

```bash
python3 -m src.main commands --limit 10
python3 -m src.main tools --limit 10
```

## Current Parity Checkpoint

The port now mirrors the archived root-entry file surface, top-level subsystem names, and command/tool inventories much more closely than before. However, it is **not yet** a full runtime-equivalent replacement for the original TypeScript system; the Python tree still contains fewer executable runtime slices than the archived source.

## Built with `oh-my-codex` and `oh-my-opencode`

This repository's porting, cleanroom hardening, and verification workflow was AI-assisted with Yeachan Heo's tooling stack, with **oh-my-codex (OmX)** as the primary scaffolding and orchestration layer.

- [**oh-my-codex (OmX)**](https://github.com/Yeachan-Heo/oh-my-codex) — scaffolding, orchestration, architecture direction, and core porting workflow
- [**oh-my-opencode (OmO)**](https://github.com/code-yeongyu/oh-my-openagent) — implementation acceleration, cleanup, and verification support

Key workflow patterns used during the port:

- **`$team` mode:** coordinated parallel review and architectural feedback
- **`$ralph` mode:** persistent execution, verification, and completion discipline
- **Cleanroom passes:** naming/branding cleanup, QA, and release validation across the Rust workspace
- **Manual and live validation:** build, test, manual QA, and real API-path verification before publish

### OmX workflow screenshots

![OmX workflow screenshot 1](assets/omx/omx-readme-review-1.png)

*Ralph/team orchestration view while the README and essay context were being reviewed in terminal panes.*

![OmX workflow screenshot 2](assets/omx/omx-readme-review-2.png)

*Split-pane review and verification flow during the final README wording pass.*

## Community

<p align="center">
  <a href="https://instruct.kr/"><img src="assets/instructkr.png" alt="instructkr" width="400" /></a>
</p>

Join the [**instructkr Discord**](https://instruct.kr/) — the best Korean language model community. Come chat about LLMs, harness engineering, agent workflows, and everything in between.

[![Discord](https://img.shields.io/badge/Join%20Discord-instruct.kr-5865F2?logo=discord&style=for-the-badge)](https://instruct.kr/)

## Star History

See the chart at the top of this README.

## Ownership / Affiliation Disclaimer

- This repository does **not** claim ownership of the original Orange Code source material.
- This repository is **not affiliated with, endorsed by, or maintained by the original authors**.
