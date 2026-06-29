import type { DanmakuMessage, RoomStats, RoomInfo, AppSettings } from './index'

export type CleanupFunction = () => void
export type OBSAction = 'connect' | 'disconnect' | 'startStream' | 'stopStream' | 'switchScene' | 'toggleMute' | 'getStatus'

export interface OBSActionParams {
  sceneName?: string
  sourceName?: string
  host?: string
  port?: number
  password?: string
}

export interface OBSStatus {
  connected: boolean
  streaming: boolean
  recording: boolean
  currentScene?: string
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

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
