import { contextBridge, ipcRenderer } from 'electron'
import type { DanmakuMessage, RoomStats, RoomInfo, AppSettings, OBSStatus } from '../src/types'

export type CleanupFunction = () => void
export type OBSAction = 'connect' | 'disconnect' | 'startStream' | 'stopStream' | 'switchScene' | 'toggleMute' | 'getStatus'
export interface OBSActionParams { sceneName?: string; sourceName?: string; host?: string; port?: number; password?: string }

const IPC = {
  CONNECT_DANMAKU: 'connect-danmaku', DISCONNECT_DANMAKU: 'disconnect-danmaku',
  SEND_DANMAKU: 'send-danmaku', GET_ROOM_INFO: 'get-room-info',
  ON_DANMAKU: 'on-danmaku', ON_GIFT: 'on-gift', ON_LIKE: 'on-like',
  ON_MEMBER: 'on-member', ON_ROOM_STATS: 'on-room-stats',
  OPEN_FLOAT_WINDOW: 'open-float-window', CLOSE_FLOAT_WINDOW: 'close-float-window',
  SPEAK: 'speak', CONTROL_OBS: 'control-obs',
  SAVE_SETTINGS: 'save-settings', LOAD_SETTINGS: 'load-settings',
  ON_LOG: 'on-log', GET_APP_VERSION: 'get-app-version',
} as const

function listen<T>(channel: string, cb: (data: T) => void): CleanupFunction {
  const handler = (_: Electron.IpcRendererEvent, data: T) => cb(data)
  ipcRenderer.on(channel, handler)
  return () => ipcRenderer.removeListener(channel, handler)
}
function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return ipcRenderer.invoke(channel, ...args)
}

export interface ElectronAPI {
  connectDanmaku(roomId: string): Promise<void>
  disconnectDanmaku(): Promise<void>
  onDanmaku(cb: (msg: DanmakuMessage) => void): CleanupFunction
  onGift(cb: (msg: DanmakuMessage) => void): CleanupFunction
  onLike(cb: (msg: DanmakuMessage) => void): CleanupFunction
  onMember(cb: (msg: DanmakuMessage) => void): CleanupFunction
  onRoomStats(cb: (stats: RoomStats) => void): CleanupFunction
  sendDanmaku(text: string): Promise<void>
  getRoomInfo(roomId: string): Promise<RoomInfo>
  openFloatWindow(): Promise<void>
  closeFloatWindow(): Promise<void>
  speak(text: string): Promise<void>
  controlOBS(action: OBSAction, params?: OBSActionParams): Promise<OBSStatus | void>
  saveSettings(settings: Partial<AppSettings>): Promise<void>
  loadSettings(): Promise<AppSettings | null>
  onLog(cb: (log: string) => void): CleanupFunction
  getVersion(): Promise<string>
}

const api: ElectronAPI = {
  connectDanmaku: (roomId) => invoke(IPC.CONNECT_DANMAKU, roomId),
  disconnectDanmaku: () => invoke(IPC.DISCONNECT_DANMAKU),
  onDanmaku: (cb) => listen(IPC.ON_DANMAKU, cb),
  onGift: (cb) => listen(IPC.ON_GIFT, cb),
  onLike: (cb) => listen(IPC.ON_LIKE, cb),
  onMember: (cb) => listen(IPC.ON_MEMBER, cb),
  onRoomStats: (cb) => listen(IPC.ON_ROOM_STATS, cb),
  sendDanmaku: (text) => invoke(IPC.SEND_DANMAKU, text),
  getRoomInfo: (roomId) => invoke(IPC.GET_ROOM_INFO, roomId),
  openFloatWindow: () => invoke(IPC.OPEN_FLOAT_WINDOW),
  closeFloatWindow: () => invoke(IPC.CLOSE_FLOAT_WINDOW),
  speak: (text) => invoke(IPC.SPEAK, text),
  controlOBS: (action, params) => invoke(IPC.CONTROL_OBS, action, params),
  saveSettings: (settings) => invoke(IPC.SAVE_SETTINGS, settings),
  loadSettings: () => invoke(IPC.LOAD_SETTINGS),
  onLog: (cb) => listen(IPC.ON_LOG, cb),
  getVersion: () => invoke(IPC.GET_APP_VERSION),
}

contextBridge.exposeInMainWorld('electronAPI', api)

declare global { interface Window { electronAPI: ElectronAPI } }
