/** 格式化数字（10000 -> 1万） */
export function formatNumber(num: number): string {
  if (num >= 100000000) return (num / 100000000).toFixed(1).replace(/\.0$/, '') + '亿'
  if (num >= 10000) return (num / 10000).toFixed(1).replace(/\.0$/, '') + '万'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return num.toString()
}

/** 格式化时间戳为 HH:mm:ss */
export function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleTimeString('zh-CN', { hour12: false })
}

/** 格式化日期时间 */
export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleString('zh-CN', { hour12: false })
}

/** 格式化时长（秒 -> HH:mm:ss） */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

/** 格式化礼物价值（分 -> 元） */
export function formatGiftValue(value: number): string {
  return '¥' + (value / 100).toFixed(2)
}

/** 防抖 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

/** 节流 */
export function throttle<T extends (...args: any[]) => void>(fn: T, interval: number): T {
  let last = 0
  return ((...args: any[]) => {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn(...args)
    }
  }) as T
}

/** 生成唯一ID */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

/** 生成短ID */
export function generateShortId(): string {
  return Math.random().toString(36).slice(2, 8)
}

/** 随机选择数组中的一个元素 */
export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** 限制数值范围 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

/** 安全 JSON 解析 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try { return JSON.parse(str) } catch { return fallback }
}
