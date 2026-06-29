// WebSocket 服务器
export const WS_SERVER = 'wss://webcast3-ws-web-lf.bytedance.com'
export const HEARTBEAT_INTERVAL = 10000
export const RECONNECT_BASE_DELAY = 1000
export const MAX_RECONNECT_DELAY = 30000
export const MAX_RECONNECT_COUNT = 10
export const WS_CONNECT_TIMEOUT = 10000

// HTTP
export const DOUYIN_LIVE_URL = 'https://live.douyin.com'
export const HTTP_TIMEOUT = 10000

// 请求头
export const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Referer': 'https://live.douyin.com/',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
}

// 消息类型
export const METHOD_CHAT = 'WebcastChatMessage'
export const METHOD_GIFT = 'WebcastGiftMessage'
export const METHOD_LIKE = 'WebcastLikeMessage'
export const METHOD_MEMBER = 'WebcastMemberMessage'
export const METHOD_SOCIAL = 'WebcastSocialMessage'
export const METHOD_ROOM_STATS = 'WebcastRoomStatsMessage'

// UI 默认值
export const MAX_DANMAKU_DEFAULT = 500
export const DANMAKU_FONT_SIZE_DEFAULT = 14
export const FLOAT_WINDOW_OPACITY_DEFAULT = 0.85
export const ONLINE_HISTORY_MAX_POINTS = 60
