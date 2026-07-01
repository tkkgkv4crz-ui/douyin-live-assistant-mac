/** 弹幕消息类型 */
export type DanmakuType = 'chat' | 'gift' | 'like' | 'member' | 'social'

/** 直播间状态 */
export type RoomStatus = 'live' | 'offline'

/** UI 主题 */
export type Theme = 'light' | 'dark'

/** OBS 控制动作 */
export type OBSAction = 'connect' | 'disconnect' | 'startStream' | 'stopStream' | 'switchScene' | 'toggleMute' | 'getStatus'

/** OBS 控制参数 */
export interface OBSActionParams {
  sceneName?: string
  sourceName?: string
  host?: string
  port?: number
  password?: string
}

/** 弹幕消息 */
export interface DanmakuMessage {
  id: string
  type: DanmakuType
  user: {
    id: string
    name: string
    avatar: string
    level?: number
    fanLevel?: number
  }
  content: string
  gift?: {
    name: string
    count: number
    price: number
  }
  timestamp: number
}

/** 礼物消息 */
export interface GiftMessage {
  id: string
  type: 'gift'
  user: {
    id: string
    name: string
    avatar: string
  }
  gift: {
    name: string
    count: number
    price: number
    totalPrice: number
  }
  timestamp: number
}

/** 直播间信息 */
export interface RoomInfo {
  roomId: string
  title: string
  owner: {
    id: string
    name: string
    avatar: string
  }
  onlineCount: number
  likeCount: number
  status: RoomStatus
  cover: string
  streamUrl?: string
}

/** 房间统计 */
export interface RoomStats {
  onlineCount: number
  likeCount: number
  totalDanmaku: number
  totalGift: number
  totalGiftValue: number
  newFollowers: number
}

/** 自动回复规则 */
export interface AutoReplyRule {
  id: string
  keyword: string
  responses: string[]
  isRegex: boolean
  enabled: boolean
  cooldown: number
  lastTriggered?: number
}

/** 应用设置 */
export interface AppSettings {
  voiceEnabled: boolean
  voiceRate: number
  voiceVolume: number
  voicePitch: number
  voiceDanmaku: boolean
  voiceGift: boolean
  voiceMember: boolean
  obsHost: string
  obsPort: number
  obsPassword: string
  autoReconnect: boolean
  maxDanmakuCount: number
  theme: Theme
  floatWindowOpacity: number
  danmakuFontSize: number
  filterKeywords: string[]
  highlightKeywords: string[]
}

/** 直播间 */
export interface Room {
  id: string
  roomId: string
  name: string
  url?: string
  isActive: boolean
  info?: RoomInfo
}

/** OBS 状态 */
export interface OBSStatus {
  connected: boolean
  streaming: boolean
  recording: boolean
  currentScene?: string
  scenes?: string[]
}

/** WebSocket 握手参数 */
export interface WSHandshakeParams {
  signature: string
  userId: string
  deviceId: string
  internalRoomId: string
  cookies: string
}
