# 抖音直播助手 - macOS 构建 Makefile

.PHONY: install dev build dist clean

# 默认目标
all: install build

# 安装依赖
install:
	@echo "📦 安装依赖..."
	npm install --legacy-peer-deps

# 开发模式启动
dev:
	@echo "🚀 启动开发模式..."
	npx electron-vite dev

# 构建代码
build:
	@echo "🔨 构建..."
	npx tsc --noEmit -p tsconfig.node.json --composite false && npx electron-vite build

# 打包为 dmg
dist-mac: build
	@echo "📦 打包为 macOS 应用..."
	npx electron-builder --mac

# 清理
clean:
	@echo "🧹 清理..."
	rm -rf node_modules out release dist

# 帮助
help:
	@echo "抖音直播助手 - 构建命令"
	@echo ""
	@echo "  make install    安装依赖"
	@echo "  make dev        开发模式启动"
	@echo "  make build      构建代码"
	@echo "  make dist-mac   打包为 .dmg"
	@echo "  make clean      清理构建文件"
