#!/bin/bash
# ============================================
# 抖音直播助手 - macOS 一键启动脚本
# ============================================

set -e

echo "🎥 抖音直播助手启动器"
echo "======================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    echo "👉 请安装 Node.js 18+: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低: $(node -v)"
    echo "👉 请升级到 Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi
echo "✅ npm $(npm -v)"

# 安装依赖
echo ""
echo "📦 安装依赖中..."
if [ ! -d "node_modules" ]; then
    npm install --legacy-peer-deps
else
    echo "✅ 依赖已安装，跳过"
fi

# 开发模式启动
echo ""
echo "🚀 启动抖音直播助手..."
echo "======================"
npm run dev
