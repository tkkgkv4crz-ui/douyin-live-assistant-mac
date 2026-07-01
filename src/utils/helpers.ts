/** 深拷贝 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/** 防抖 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/** 节流 */
export function throttle<T extends (...args: any[]) => void>(fn: T, interval: number): (...args: Parameters<T>) => void {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn(...args)
    }
  }
}

/** 生成唯一ID */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

/** 格式化数字（1.2万/1.5亿） */
export function formatNumber(num: number): string {
  if (num >= 1e8) return (num / 1e8).toFixed(1).replace(/\.0$/, '') + '亿'
  if (num >= 1e4) return (num / 1e4).toFixed(1).replace(/\.0$/, '') + '万'
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'k'
  return num.toString()
}

/** 格式化时间 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour12: false })
}

/** 格式化时长 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

/** 从URL/输入提取直播间ID */
export function extractRoomId(input: string): string | null {
  if (!input) return null
  if (/^\d+$/.test(input)) return input
  const match = input.match(/room_id=(\d+)/) || input.match(/live\.douyin\.com\/(\d+)/)
  if (match) return match[1]
  return null
}

/** 判断是否为URL */
export function isUrl(str: string): boolean {
  return /^https?:\/\//.test(str)
}

/** 延迟 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 限制数值范围 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

/** 安全JSON解析 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try { return JSON.parse(str) as T } catch { return fallback }
}

/** 随机选择 */
export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
