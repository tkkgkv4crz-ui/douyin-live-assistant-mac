/**
 * Electron 主进程入口
 */
import { app, ipcMain, Menu } from 'electron'
import { join } from 'node:path'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import {
  createMainWindow,
  showMainWindow,
  getMainWindow,
  destroyMainWindow,
} from './windows/mainWindow'
import {
  showDanmakuWindow,
  closeDanmakuWindow,
  sendToDanmakuWindow,
} from './windows/danmakuWindow'
import { DanmakuService } from '../src/services/danmakuService'
import { douyinAPI } from '../src/services/douyinAPI'
import type { DanmakuMessage, RoomStats, AppSettings, OBSActionParams } from '../src/types'

const APP_NAME = '抖音直播助手'
const danmakuService = new DanmakuService()
let obsClient: unknown = null

function getSettingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

// 单实例锁
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

app.on('second-instance', () => showMainWindow())

app.whenReady().then(() => {
  createMainWindow()
  setupMacOSMenu()
  registerIPCHandlers()
  registerDanmakuEventForwarding()

  app.on('activate', () => {
    if (getMainWindow() === null) {
      createMainWindow()
    } else {
      showMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  danmakuService.disconnect()
  ipcMain.removeAllListeners()
})

function setupMacOSMenu(): void {
  if (process.platform !== 'darwin') return
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: APP_NAME,
      submenu: [
        { label: `关于 ${APP_NAME}`, role: 'about' },
        { type: 'separator' },
        {
          label: '偏好设置...',
          accelerator: 'Cmd+,',
          click: () => getMainWindow()?.webContents.send('menu-open-settings'),
        },
        { type: 'separator' },
        { label: '隐藏', role: 'hide' },
        { label: '隐藏其他', role: 'hideOthers' },
        { label: '显示全部', role: 'unhide' },
        { type: 'separator' },
        { label: `退出 ${APP_NAME}`, role: 'quit' },
      ],
    },
    {
      label: '文件',
      submenu: [
        {
          label: '关闭窗口',
          accelerator: 'Cmd+W',
          click: () => getMainWindow()?.hide(),
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', role: 'undo' },
        { label: '重做', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', role: 'cut' },
        { label: '复制', role: 'copy' },
        { label: '粘贴', role: 'paste' },
        { label: '全选', role: 'selectAll' },
      ],
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', role: 'reload' },
        { label: '强制重新加载', role: 'forceReload' },
        { label: '开发者工具', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '实际大小', role: 'resetZoom' },
        { label: '放大', role: 'zoomIn' },
        { label: '缩小', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', role: 'togglefullscreen' },
      ],
    },
    {
      label: '窗口',
      submenu: [
        { label: '最小化', role: 'minimize' },
        { label: '缩放', role: 'zoom' },
        { type: 'separator' },
        { label: '前置全部窗口', role: 'front' },
      ],
    },
    {
      label: '帮助',
      submenu: [{ label: `${APP_NAME} 帮助`, click: () => {} }],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function registerIPCHandlers(): void {
  ipcMain.handle('connect-danmaku', async (_event, roomId: string) => {
    if (!roomId?.trim()) throw new Error('直播间ID不能为空')
    await danmakuService.connect(roomId.trim())
  })

  ipcMain.handle('disconnect-danmaku', async () => danmakuService.disconnect())

  ipcMain.handle('send-danmaku', async (_event, text: string) => {
    if (!text?.trim()) throw new Error('弹幕内容不能为空')
    await danmakuService.sendMessage(text.trim())
  })

  ipcMain.handle('get-room-info', async (_event, roomId: string) => {
    if (!roomId?.trim()) throw new Error('直播间ID不能为空')
    return douyinAPI.getRoomInfo(roomId.trim())
  })

  ipcMain.handle('open-float-window', async () => showDanmakuWindow())
  ipcMain.handle('close-float-window', async () => closeDanmakuWindow())

  ipcMain.handle('speak', async (_event, text: string) => {
    if (!text?.trim()) return
    if (process.platform === 'darwin') {
      const { execFile } = await import('node:child_process')
      return new Promise<void>((resolve) => {
        execFile('say', [text.trim()], { timeout: 30000 }, () => resolve())
      })
    }
  })

  ipcMain.handle('control-obs', async (_event, action: string, params?: OBSActionParams) => {
    if (!obsClient) {
      const { OBSWebSocket } = await import('obs-websocket-js')
      obsClient = new OBSWebSocket()
    }
    const obs = obsClient as any
    switch (action) {
      case 'connect': {
        await obs.connect(`ws://${params?.host ?? 'localhost'}:${params?.port ?? 4455}`,
          params?.password ?? '', { rpcVersion: 1 })
        return { connected: true }
      }
      case 'disconnect': {
        await obs.disconnect()
        return { connected: false }
      }
      case 'startStream': {
        await obs.call('StartStream')
        return { streaming: true }
      }
      case 'stopStream': {
        await obs.call('StopStream')
        return { streaming: false }
      }
      case 'switchScene': {
        await obs.call('SetCurrentProgramScene', { sceneName: params?.sceneName })
        return { currentScene: params?.sceneName }
      }
      case 'getStatus': {
        const [streamStatus, recordStatus] = await Promise.all([
          obs.call('GetStreamStatus').catch(() => ({ outputActive: false })),
          obs.call('GetRecordStatus').catch(() => ({ outputActive: false })),
        ])
        return {
          connected: true,
          streaming: streamStatus.outputActive ?? false,
          recording: recordStatus.outputActive ?? false,
        }
      }
      default:
        throw new Error(`未知的 OBS 控制动作: ${action}`)
    }
  })

  ipcMain.handle('save-settings', async (_event, settings: Partial<AppSettings>) => {
    const settingsPath = getSettingsPath()
    const dir = join(settingsPath, '..')
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })
    let existing: Partial<AppSettings> = {}
    if (existsSync(settingsPath)) {
      existing = JSON.parse(await readFile(settingsPath, 'utf-8'))
    }
    await writeFile(settingsPath, JSON.stringify({ ...existing, ...settings }, null, 2), 'utf-8')
  })

  ipcMain.handle('load-settings', async (): Promise<AppSettings | null> => {
    const settingsPath = getSettingsPath()
    if (!existsSync(settingsPath)) return null
    return JSON.parse(await readFile(settingsPath, 'utf-8'))
  })

  ipcMain.handle('get-app-version', async () => app.getVersion())
}

function registerDanmakuEventForwarding(): void {
  danmakuService.on('danmaku', (msg: DanmakuMessage) => broadcast('on-danmaku', msg))
  danmakuService.on('gift', (msg: DanmakuMessage) => broadcast('on-gift', msg))
  danmakuService.on('like', (msg: DanmakuMessage) => broadcast('on-like', msg))
  danmakuService.on('member', (msg: DanmakuMessage) => broadcast('on-member', msg))
  danmakuService.on('stats', (stats: RoomStats) => broadcast('on-room-stats', stats))
  danmakuService.on('log', (log: string) => broadcast('on-log', log))
}

function broadcast<T>(channel: string, data: T): void {
  const win = getMainWindow()
  if (win && !win.isDestroyed()) win.webContents.send(channel, data)
  sendToDanmakuWindow(channel, data)
}
