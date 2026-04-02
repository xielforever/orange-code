# 🍊 orange-code

> **orange-code** 是一个为个人开发者量身定制的代码脚手架与命令行工具（CLI），旨在提升日常开发效率，自动化繁琐任务，并提供一套统一的开发体验。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)]()

## ✨ 核心特性

- **🚀 快速启动**：一键生成项目模板，告别重复的配置工作。
- **🛠 常用工具集**：内置多种日常开发所需的实用小工具（如格式转换、代码检查、批量重命名等）。
- **⚙️ 高度可配置**：支持自定义配置文件，根据个人习惯灵活调整行为。
- **🔌 插件化架构**：轻松扩展自定义命令和功能，满足不断增长的开发需求。

## 📦 安装指南

### 全局安装

确保你已经安装了对应的运行环境（如 Node.js / Python / Go / Rust 等，根据实际使用的语言调整）。

```bash
# 示例：如果是基于 npm 的工具
npm install -g orange-code

# 示例：如果是基于 Python 的工具
pip install orange-code
```

### 源码运行与开发

如果你希望在本地进行开发或调试：

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/orange-code.git
cd orange-code

# 2. 安装依赖
npm install  # 或 yarn install / pip install -r requirements.txt 等

# 3. 本地链接以便全局使用 (Node.js 示例)
npm link

# 4. 运行工具
orange-code --help
```

## 💻 使用说明

安装完成后，可以在终端中使用 `orange-code` 或简写别名（如配置了别名 `oc`）来执行命令：

### 查看帮助文档

```bash
orange-code --help
```

### 常用命令示例

```bash
# 1. 初始化一个新项目
orange-code init my-new-project

# 2. 生成特定的代码组件
orange-code generate component Header

# 3. 运行项目检查/分析
orange-code analyze ./src
```

*(请根据你实际开发的命令替换上述示例)*

## ⚙️ 配置文件

`orange-code` 支持在用户根目录（或项目根目录）读取配置文件 `.orangerc`（或 `.orangerc.json`），以便覆盖默认行为：

```json
{
  "templateDir": "~/my-templates",
  "defaultAuthor": "Your Name",
  "features": {
    "autoFormat": true
  }
}
```

## 🤝 贡献指南

这是个人使用的 CLI 项目，但也欢迎提出任何建议和改进！
1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。
