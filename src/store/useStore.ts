import { create } from 'zustand'
import type { DanmakuMessage, GiftMessage, Room, RoomInfo, RoomStats, AutoReplyRule, AppSettings, OBSStatus, Theme } from '../types'

export type Page = 'dashboard' | 'danmaku' | 'gift' | 'room' | 'autoreply' | 'settings'

interface LogEntry { id: string; level: 'info' | 'warn' | 'error'; message: string; timestamp: number }

const defaultSettings: AppSettings = {
  voiceEnabled: false, voiceRate: 1.0, voiceVolume: 1.0, voicePitch: 1.0,
  voiceDanmaku: false, voiceGift: true, voiceMember: false,
  obsHost: 'localhost', obsPort: 4455, obsPassword: '',
  autoReconnect: true, maxDanmakuCount: 500, theme: 'light' as Theme,
  floatWindowOpacity: 0.85, danmakuFontSize: 14,
  filterKeywords: [], highlightKeywords: [],
}

const defaultStats: RoomStats = {
  onlineCount: 0, likeCount: 0, totalDanmaku: 0,
  totalGift: 0, totalGiftValue: 0, newFollowers: 0,
}

let idCounter = 0
const genId = () => `log-${++idCounter}-${Date.now()}`

interface AppState {
  currentPage: Page
  setCurrentPage: (p: Page) => void

  theme: Theme
  setTheme: (t: Theme) => void

  rooms: Room[]
  currentRoom: Room | null
  addRoom: (r: Room) => void
  removeRoom: (id: string) => void
  setCurrentRoom: (r: Room | null) => void
  updateRoomInfo: (id: string, info: Partial<RoomInfo>) => void

  danmakuList: DanmakuMessage[]
  giftList: GiftMessage[]
  addDanmaku: (m: DanmakuMessage) => void
  addGift: (m: GiftMessage) => void
  clearDanmaku: () => void

  stats: RoomStats
  updateStats: (s: Partial<RoomStats>) => void
  resetStats: () => void

  onlineHistory: { time: string; count: number }[]
  addOnlinePoint: (count: number) => void

  autoReplyRules: AutoReplyRule[]
  addRule: (r: AutoReplyRule) => void
  removeRule: (id: string) => void
  toggleRule: (id: string) => void
  updateRule: (id: string, r: Partial<AutoReplyRule>) => void

  settings: AppSettings
  updateSettings: (s: Partial<AppSettings>) => void
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>

  obsStatus: OBSStatus
  setOBSStatus: (s: Partial<OBSStatus>) => void

  isDanmakuConnected: boolean
  setDanmakuConnected: (v: boolean) => void

  logs: LogEntry[]
  addLog: (message: string, level?: LogEntry['level']) => void
}

export const useStore = create<AppState>((set, get) => ({
  currentPage: 'dashboard',
  setCurrentPage: (p) => set({ currentPage: p }),

  theme: 'light',
  setTheme: (t) => set({ theme: t }),

  rooms: [],
  currentRoom: null,
  addRoom: (r) => set((s) => ({ rooms: [...s.rooms, r], currentRoom: s.currentRoom ?? r })),
  removeRoom: (id) => set((s) => ({
    rooms: s.rooms.filter((r) => r.id !== id),
    currentRoom: s.currentRoom?.id === id ? (s.rooms.find((r) => r.id !== id) ?? null) : s.currentRoom,
  })),
  setCurrentRoom: (r) => set({ currentRoom: r }),
  updateRoomInfo: (id, info) => set((s) => ({
    rooms: s.rooms.map((r) => r.id === id ? { ...r, info: { ...r.info, ...info } as RoomInfo } : r),
  })),

  danmakuList: [],
  giftList: [],
  addDanmaku: (m) => set((s) => {
    const list = [...s.danmakuList, m]
    if (list.length > s.settings.maxDanmakuCount) list.shift()
    return { danmakuList: list }
  }),
  addGift: (m) => set((s) => {
    const list = [...s.giftList, m]
    if (list.length > 200) list.shift()
    return { giftList: list }
  }),
  clearDanmaku: () => set({ danmakuList: [], giftList: [] }),

  stats: { ...defaultStats },
  updateStats: (s) => set((state) => ({ stats: { ...state.stats, ...s } })),
  resetStats: () => set({ stats: { ...defaultStats } }),

  onlineHistory: [],
  addOnlinePoint: (count) => set((s) => {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const list = [...s.onlineHistory, { time, count }]
    if (list.length > 60) list.shift()
    return { onlineHistory: list }
  }),

  autoReplyRules: [],
  addRule: (r) => set((s) => ({ autoReplyRules: [...s.autoReplyRules, r] })),
  removeRule: (id) => set((s) => ({ autoReplyRules: s.autoReplyRules.filter((r) => r.id !== id) })),
  toggleRule: (id) => set((s) => ({
    autoReplyRules: s.autoReplyRules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r),
  })),
  updateRule: (id, r) => set((s) => ({
    autoReplyRules: s.autoReplyRules.map((rule) => rule.id === id ? { ...rule, ...r } : rule),
  })),

  settings: { ...defaultSettings },
  updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
  loadSettings: async () => {
    try {
      const saved = await window.electronAPI?.loadSettings?.()
      if (saved) set({ settings: { ...defaultSettings, ...saved } })
    } catch {}
  },
  saveSettings: async () => {
    try { await window.electronAPI?.saveSettings?.(get().settings) } catch {}
  },

  obsStatus: { connected: false, streaming: false, recording: false },
  setOBSStatus: (s) => set((state) => ({ obsStatus: { ...state.obsStatus, ...s } })),

  isDanmakuConnected: false,
  setDanmakuConnected: (v) => set({ isDanmakuConnected: v }),

  logs: [],
  addLog: (message, level = 'info') => set((s) => {
    const entry: LogEntry = { id: genId(), level, message, timestamp: Date.now() }
    const list = [...s.logs, entry]
    if (list.length > 200) list.shift()
    return { logs: list }
  }),
}))
