# ORANGE.md

本文件为 Orange Code 在处理本存储库代码时提供指导。

## 检测到的技术栈
- 语言：Rust, Python。
- 框架：未检测到受支持的入门标记。

## 验证与测试
- 在 `rust/` 目录下运行 Rust 验证命令：`cargo fmt`，`cargo clippy --workspace --all-targets -- -D warnings`，`cargo test --workspace`
- `src/`（Python 原型）和 `tests/`（Python 测试）同时存在；当行为发生变化时，请同时更新这两个目录。

## 存储库结构
- `rust/` 包含 Rust 工作区以及活跃的 CLI/运行时实现。
- `src/` 包含 Python 源文件，应与生成的指南和测试保持一致。
- `tests/` 包含在代码变更时应该一同被审查的 Python 验证测试。

## 工作约定
- 倾向于进行小的、易于审查的代码更改，并使生成的引导文件与实际的仓库工作流保持一致。
- 将共享的默认配置保留在 `.claw.json`（或 `.orange.json`）中；保留 `.claw/settings.local.json` 用于本地计算机级别的覆盖。
- 不要自动覆盖现有的 `ORANGE.md` 内容；只有当代码库工作流发生变化时，才有意地去更新它。
