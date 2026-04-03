# Tasks
- [x] Task 1: 扫描并分析仓库核心目录结构
  - [x] SubTask 1.1: 使用 search sub-agent 深入分析 `rust/` 目录下的核心 crates（如 `api`, `runtime`, `tools`, `orange-cli` 等）的具体作用和核心实现。
  - [x] SubTask 1.2: 使用 search sub-agent 分析 `src/` 目录下 Python 原型代码的作用、核心类及结构。
- [x] Task 2: 梳理模块关联性与数据流
  - [x] SubTask 2.1: 分析 Rust 工作区内部各个 crate 之间的依赖关系（基于 `Cargo.toml` 梳理）。
  - [x] SubTask 2.2: 结合项目说明（如 `README.md`, `PARITY.md`），分析 Python 工作区与 Rust 工作区之间的历史渊源与定位差异。
- [x] Task 3: 撰写二次开发指南与架构文档
  - [x] SubTask 3.1: 汇总前面的分析结果，编写 `ARCHITECTURE.md`，记录整体架构和关联性。
  - [x] SubTask 3.2: 在文档中明确标记推荐的二开扩展点（如如何添加新工具 Tool、新插件 Plugin 或新命令 Command）。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
