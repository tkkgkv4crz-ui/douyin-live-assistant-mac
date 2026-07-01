# macOS 抖音直播助手 - 使用指南

## 系统要求

- macOS 12+ (Monterey 或更新版本)
- Node.js 18+ 和 npm 9+
- 允许安装"任何来源"的应用

## 首次设置

### 1. 开启"任何来源"应用安装

打开终端，执行：

```bash
sudo spctl --master-disable
```

### 2. 安装 Node.js

```bash
# 安装 Homebrew（如果没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node
```

## 启动软件（3步）

```bash
cd douyin-live-assistant-mac
chmod +x start.sh
./start.sh
```

## 打包为 .dmg

```bash
npm run dist:mac
```

打包完成后在 `release/` 目录下找到 `抖音直播助手-1.0.0.dmg`，双击安装。

## 首次打开

如果提示"无法验证开发者"：

```bash
xattr -cr /Applications/抖音直播助手.app
```

或去 **系统设置 → 隐私与安全性 → 点击"仍要打开"**。
