import { BrowserWindow } from 'electron'
import { join } from 'node:path'

let danmakuWindow: BrowserWindow | null = null

export function createDanmakuWindow(): BrowserWindow {
  if (danmakuWindow && !danmakuWindow.isDestroyed()) return danmakuWindow

  danmakuWindow = new BrowserWindow({
    width: 400,
    height: 600,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundThrottling: false,
    webPreferences: {
      preload: join(__dirname, '../../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  danmakuWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  if (process.env.NODE_ENV === 'development') {
    danmakuWindow.loadURL('http://localhost:5173/#/float')
  }

  danmakuWindow.on('closed', () => { danmakuWindow = null })
  return danmakuWindow
}

export function showDanmakuWindow(): void {
  const win = createDanmakuWindow()
  win.show()
}

export function closeDanmakuWindow(): void {
  danmakuWindow?.close()
  danmakuWindow = null
}

export function getDanmakuWindow(): BrowserWindow | null { return danmakuWindow }

export function sendToDanmakuWindow(channel: string, data: unknown): void {
  if (danmakuWindow && !danmakuWindow.isDestroyed()) {
    danmakuWindow.webContents.send(channel, data)
  }
}
