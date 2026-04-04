# 开发环境搭建指南

本项目需要以下工具链：
- **Rust**：用于构建后端服务
- **Node.js**：用于构建前端和 Electron 应用
- **Git**：用于版本控制

---

## Windows

### 1. 安装 Git

下载并安装 Git：https://git-scm.com/download/win

安装时使用默认配置即可。

### 2. 安装 Rust

访问 https://rustup.rs/ 下载并运行 `rustup-init.exe`

安装完成后，打开新的 PowerShell 或终端，验证安装：
```powershell
rustc --version
cargo --version
```

### 3. 安装 Node.js

访问 https://nodejs.org/ 下载并安装 **LTS 版本（推荐 v20.x）**

安装完成后，打开新的 PowerShell 或终端，验证安装：
```powershell
node --version
npm --version
```

### 4. 安装 Windows 构建工具（可选）

如果编译 Rust 时遇到问题，可能需要安装 Visual Studio Build Tools：

下载并安装：https://visualstudio.microsoft.com/visual-cpp-build-tools/

安装时选择"使用 C++ 的桌面开发"工作负载。

---

## macOS

### 1. 安装 Homebrew（推荐）

如果还没有安装 Homebrew，先安装：
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. 安装 Git

```bash
brew install git
```

验证安装：
```bash
git --version
```

### 3. 安装 Rust

访问 https://rustup.rs/ 或使用 Homebrew：
```bash
brew install rust
```

验证安装：
```bash
rustc --version
cargo --version
```

### 4. 安装 Node.js

使用 Homebrew 安装：
```bash
brew install node@20
```

或者从官网下载：https://nodejs.org/

验证安装：
```bash
node --version
npm --version
```

### 5. 安装 Xcode Command Line Tools

```bash
xcode-select --install
```

---

## Linux (Ubuntu/Debian)

### 1. 安装 Git

```bash
sudo apt update
sudo apt install -y git
```

验证安装：
```bash
git --version
```

### 2. 安装 Rust

访问 https://rustup.rs/ 或使用以下命令：
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

安装完成后，重新加载环境变量：
```bash
source $HOME/.cargo/env
```

验证安装：
```bash
rustc --version
cargo --version
```

### 3. 安装 Node.js

使用 NodeSource 仓库安装 Node.js 20：
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

验证安装：
```bash
node --version
npm --version
```

### 4. 安装系统依赖（必需）

编译 Rust 和 Electron 需要以下系统依赖：
```bash
sudo apt install -y \
  libasound2-dev \
  libssl-dev \
  libudev-dev \
  pkg-config \
  build-essential
```

---

## 验证开发环境

安装完所有工具链后，克隆项目并验证：

```bash
# 克隆项目
git clone https://github.com/xielforever/orange-code.git
cd orange-code

# 安装 Rust 依赖并构建
cd rust
cargo build --release

# 安装 Node.js 依赖并构建
cd ../client
npm install
npm run build
```

---

## 常见问题

### Windows: `rustc` 或 `cargo` 命令未找到

确保重新打开了终端，或者运行：
```powershell
refreshenv
```

### macOS: 权限问题

如果遇到权限问题，尝试：
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ~/.cargo
```

### Linux: 编译错误

确保安装了所有必需的系统依赖（见上文 Linux 部分第 4 步）。

---

## 下一步

开发环境搭建完成后，请参考 [README.md](./README.md) 了解如何运行和构建项目。
