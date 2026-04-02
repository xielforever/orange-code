# 贡献指南

感谢您为 Orange Code 贡献代码。

## 开发环境设置

- 安装稳定版 (stable) 的 Rust 工具链。
- 请在此 Rust 工作区的存储库根目录下进行开发。如果您位于父存储库的根目录，请先执行 `cd rust/`。

## 构建

```bash
cargo build
cargo build --release
```

## 测试与验证

在提交拉取请求 (Pull Request) 之前，请运行完整的 Rust 验证集：

```bash
cargo fmt --all --check
cargo clippy --workspace --all-targets -- -D warnings
cargo check --workspace
cargo test --workspace
```

如果您更改了原有行为，请在同一个拉取请求中添加或更新相关的测试。

## 代码风格

- 遵循被修改 crate 中已有的模式，而不是引入新的代码风格。
- 使用 `rustfmt` 格式化代码。
- 确保您修改的工作区目标在 `clippy` 检查中没有警告。
- 倾向于集中且明确的代码变更，避免顺带进行不相关的大规模重构。

## 拉取请求 (Pull Requests)

- 基于 `main` 分支创建您的分支。
- 确保每个拉取请求的范围仅限于一个清晰的更改。
- 解释修改动机、实现摘要以及您运行过的验证步骤。
- 在请求审查之前，确保所有本地检查均已通过。
- 如果审查反馈改变了代码行为，请重新运行相关的验证命令。
