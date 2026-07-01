# 抖音直播助手 for macOS

一款基于 Electron + React + TypeScript 的 macOS 抖音直播助手软件，提供实时弹幕获取、数据看板、自动回复、语音播报、OBS 推流控制等功能。

## 功能特性

- **实时弹幕获取** — 通过 WebSocket 直连抖音弹幕服务器，毫秒级延迟
- **直播间数据看板** — 在线人数、点赞数、弹幕数量、礼物收入实时统计
- **礼物记录** — 完整记录收到的礼物，支持价值统计
- **在线趋势图** — SVG 折线图展示 60 分钟在线人数变化
- **自动回复系统** — 关键词触发自动回复，支持正则表达式和冷却时间
- **语音播报** — TTS 语音播报弹幕、礼物、进场消息（支持语速/音量/音调调节）
- **弹幕浮窗** — 可置顶显示的弹幕浮窗，直播时不遮挡画面
- **OBS 推流控制** — 集成 OBS WebSocket，支持开始/停止推流、切换场景
- **多直播间管理** — 同时管理多个直播间，快速切换
- **暗色模式** — 支持浅色/深色主题切换
- **数据导出** — 支持导出直播数据

## 技术栈

- **Electron 28** — 跨平台桌面应用框架
- **React 18** — UI 框架
- **TypeScript 5** — 类型安全
- **Tailwind CSS 3.4** — 原子化 CSS 框架
- **Zustand** — 轻量级状态管理
- **Vite 5** — 构建工具
- **electron-vite** — Electron + Vite 集成
- **WebSocket + Protobuf** — 抖音弹幕协议
- **Web Speech API** — TTS 语音播报
- **obs-websocket-js** — OBS 控制

## 项目结构

```
.
├── electron/                    # Electron 主进程
│   ├── main.ts                  # 主进程入口
│   ├── preload.ts               # 预加载脚本（安全 Bridge）
│   └── windows/                 # 窗口管理
│       ├── mainWindow.ts        # 主窗口
│       └── danmakuWindow.ts     # 弹幕浮窗
├── src/                         # React 前端
│   ├── App.tsx                  # 根组件
│   ├── main.tsx                 # 渲染进程入口
│   ├── index.css                # 全局样式
│   ├── store/                   # Zustand 状态管理
│   │   └── useStore.ts
│   ├── components/              # UI 组件
│   │   ├── layout/              # 布局组件
│   │   │   ├── Sidebar.tsx      # 侧边导航
│   │   │   ├── Header.tsx       # 顶部栏
│   │   │   └── MainContent.tsx  # 主内容区
│   │   ├── dashboard/           # 数据面板
│   │   │   ├── StatCards.tsx    # 统计卡片
│   │   │   ├── OnlineChart.tsx  # 在线人数趋势
│   │   │   └── GiftLog.tsx      # 礼物记录
│   │   ├── danmaku/             # 弹幕相关
│   │   │   ├── DanmakuPanel.tsx # 弹幕面板
│   │   │   └── DanmakuItem.tsx  # 单条弹幕
│   │   ├── room/                # 直播间管理
│   │   │   ├── RoomList.tsx     # 直播间列表
│   │   │   ├── RoomAddModal.tsx # 添加直播间弹窗
│   │   │   └── RoomInfo.tsx     # 直播间信息
│   │   ├── autoreply/           # 自动回复
│   │   │   ├── RuleEditor.tsx   # 规则编辑器
│   │   │   └── RuleList.tsx     # 规则列表
│   │   └── settings/            # 设置
│   │       ├── GeneralSettings.tsx
│   │       └── VoiceSettings.tsx
│   ├── services/                # 核心服务
│   │   ├── danmakuService.ts    # 弹幕引擎
│   │   ├── douyinAPI.ts         # 抖音 API 封装
│   │   ├── voiceService.ts      # TTS 语音服务
│   │   └── obsService.ts        # OBS 控制
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useDanmaku.ts        # 弹幕连接管理
│   │   ├── useVoice.ts          # 语音播报
│   │   ├── useOBS.ts            # OBS 控制
│   │   └── useStorage.ts        # 本地存储
│   ├── types/                   # TypeScript 类型
│   │   ├── index.ts
│   │   └── electron.d.ts
│   └── utils/                   # 工具函数
│       ├── constants.ts
│       ├── formatters.ts
│       └── helpers.ts
├── package.json
├── electron.vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 安装和运行

### 环境要求

- macOS 12+ (Monterey 或更新版本)
- Node.js 18+
- npm 9+ 或 pnpm 8+

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
# 构建所有代码
npm run build

# 打包为 macOS 应用（免签名）
npm run dist:mac
```

打包完成后，应用位于 `release/` 目录下：
- `抖音直播助手-x.x.x.dmg` — DMG 安装包
- `抖音直播助手-x.x.x-mac.zip` — ZIP 压缩包

### macOS 免签名安装

由于应用未签名，首次运行时需要在**系统设置 → 隐私与安全性**中点击**"仍要打开"**，或在终端执行：

```bash
# 允许安装任何来源的应用（如果尚未开启）
sudo spctl --master-disable

# 或针对单个应用xattr -cr /Applications/抖音直播助手.app
```

## 使用指南

### 首次使用

1. 启动应用后，在「直播间」页面点击「添加直播间」
2. 输入抖音直播间链接（如 `https://live.douyin.com/123456789`）或房间 ID
3. 点击「连接」按钮开始获取弹幕
4. 切换到「弹幕」页面查看实时弹幕

### 自动回复设置

1. 进入「自动回复」页面
2. 点击「添加规则」
3. 设置关键词（支持正则表达式）和回复内容（每行一条，随机选择）
4. 设置冷却时间（避免刷屏）
5. 启用规则

### OBS 集成

1. 在 OBS 中启用 WebSocket 服务器（工具 → WebSocket 服务器设置）
2. 在「设置」→「OBS 设置」中输入 OBS 的 IP、端口和密码
3. 连接后即可在应用中控制推流/停止推流、切换场景

### 语音播报

1. 进入「设置」→「语音设置」
2. 开启语音播报开关
3. 选择要播报的内容类型（弹幕/礼物/进场）
4. 调节语速、音量、音调

## 核心原理

### 弹幕获取

抖音直播弹幕系统采用 **WebSocket + Protobuf** 的传输方案：

1. 通过 HTTP 请求直播间页面获取 `signature` 签名参数
2. 使用 `signature` + `room_id` + `user_unique_id` 建立 WebSocket 连接
3. 发送握手消息和心跳包（每10秒）维持连接
4. 接收 Protobuf 编码的消息，解析后提取弹幕/礼物/点赞等数据
5. 通过 IPC 通道将数据发送到渲染进程展示

### 支持的弹幕消息类型

| 消息类型 | 说明 |
|---------|------|
| `WebcastChatMessage` | 弹幕消息 |
| `WebcastGiftMessage` | 礼物消息 |
| `WebcastLikeMessage` | 点赞消息 |
| `WebcastMemberMessage` | 观众进场 |
| `WebcastSocialMessage` | 关注消息 |

## 免责声明

本软件仅供学习和研究使用。使用本软件时请遵守抖音平台的相关协议和法律法规。开发者不对因使用本软件而产生的任何直接或间接后果负责。

## 许可证

MIT License
