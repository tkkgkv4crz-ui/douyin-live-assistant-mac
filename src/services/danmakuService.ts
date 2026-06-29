import { EventEmitter } from 'node:events'
import WebSocket from 'ws'
import zlib from 'node:zlib'
import https from 'node:https'
import { promisify } from 'node:util'
import {
  WS_SERVER, HEARTBEAT_INTERVAL, RECONNECT_BASE_DELAY, MAX_RECONNECT_DELAY,
  MAX_RECONNECT_COUNT, WS_CONNECT_TIMEOUT, DOUYIN_LIVE_URL, REQUEST_HEADERS,
  HTTP_TIMEOUT, METHOD_CHAT, METHOD_GIFT, METHOD_LIKE, METHOD_MEMBER,
  METHOD_SOCIAL, METHOD_ROOM_STATS,
} from '../utils/constants'
import type { DanmakuMessage, RoomStats, AutoReplyRule, WSHandshakeParams } from '../types'
import { generateShortId, randomPick } from '../utils/formatters'

const gunzip = promisify(zlib.gunzip)

export class DanmakuService extends EventEmitter {
  private ws: WebSocket | null = null
  private reconnectCount = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private isConnected = false
  private currentRoomId: string | null = null
  private rules: AutoReplyRule[] = []
  private handshakeParams: WSHandshakeParams | null = null
  private cookies: string = ''
  private deviceId: string = ''
  private seqId: number = 0

  async connect(roomId: string): Promise<void> {
    if (this.isConnected) {
      if (this.currentRoomId === roomId) return
      this.disconnect()
    }
    try {
      this.emit('log', `正在连接直播间 ${roomId}...`)
      const params = await this.getRoomInfoAndSignature(roomId)
      this.handshakeParams = params
      this.currentRoomId = roomId
      await this.setupWebSocket(this.buildWebSocketUrl(params), params)
      this.reconnectCount = 0
      this.emit('log', `直播间 ${roomId} 连接成功`)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      this.emit('error', error)
      if (this.reconnectCount < MAX_RECONNECT_COUNT) this.scheduleReconnect()
      throw error
    }
  }

  disconnect(): void {
    this.clearTimers()
    if (this.ws) {
      this.ws.terminate()
      this.ws = null
    }
    this.isConnected = false
    this.currentRoomId = null
    this.emit('disconnected')
  }

  setRules(rules: AutoReplyRule[]): void { this.rules = rules }

  async sendMessage(text: string): Promise<void> {
    // 抖音官方发送弹幕需要登录态，这里预留接口
    this.emit('log', `发送弹幕: ${text}`)
  }

  private async getRoomInfoAndSignature(roomId: string): Promise<WSHandshakeParams> {
    const html = await this.fetchRoomPage(roomId)
    const signature = this.extractSignature(html)
    const userId = this.extractUserId(html) || this.generateDeviceId()
    const internalRoomId = this.extractInternalRoomId(html) || roomId
    return { signature, userId, deviceId: this.deviceId, internalRoomId, cookies: this.cookies }
  }

  private async fetchRoomPage(roomId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = https.get(`${DOUYIN_LIVE_URL}/${roomId}`, {
        headers: { ...REQUEST_HEADERS, ...(this.cookies ? { Cookie: this.cookies } : {}) },
        timeout: HTTP_TIMEOUT,
      }, (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
      })
      req.on('error', reject)
      req.on('timeout', () => { req.destroy(); reject(new Error('超时')) })
    })
  }

  private extractSignature(html: string): string {
    const match = html.match(/"signature":\s*"([^"]+)"/) || html.match(/signature=([^&"]+)/)
    return match?.[1] ?? ''
  }

  private extractUserId(html: string): string | null {
    const match = html.match(/"user_unique_id":\s*"(\d+)"/) || html.match(/"uid":\s*"(\d+)"/)
    return match?.[1] ?? null
  }

  private extractInternalRoomId(html: string): string | null {
    const match = html.match(/"room_id":\s*(\d+)/) || html.match(/"web_rid":\s*"(\d+)"/)
    return match?.[1] ?? null
  }

  private generateDeviceId(): string {
    if (!this.deviceId) {
      this.deviceId = Math.random().toString(36).slice(2) + Date.now().toString(36)
    }
    return this.deviceId
  }

  private buildWebSocketUrl(params: WSHandshakeParams): string {
    const url = new URL('/webcast/im/push/v2/', WS_SERVER)
    url.searchParams.set('app_name', 'douyin_web')
    url.searchParams.set('version_code', '180800')
    url.searchParams.set('webcast_sdk_version', '1.0.15')
    url.searchParams.set('compress', 'gzip')
    url.searchParams.set('device_platform', 'web')
    url.searchParams.set('cookie_enabled', 'true')
    url.searchParams.set('screen_width', '1920')
    url.searchParams.set('screen_height', '1080')
    url.searchParams.set('browser_language', 'zh-CN')
    url.searchParams.set('browser_platform', 'MacIntel')
    url.searchParams.set('browser_online', 'true')
    url.searchParams.set('tz_name', 'Asia/Shanghai')
    url.searchParams.set('cursor', 't-' + Date.now())
    url.searchParams.set('internal_ext', 'fetch_time:' + Date.now())
    url.searchParams.set('room_id', params.internalRoomId)
    url.searchParams.set('signature', params.signature)
    url.searchParams.set('user_unique_id', params.userId)
    return url.toString()
  }

  private async setupWebSocket(url: string, params: WSHandshakeParams): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url, { headers: { ...REQUEST_HEADERS, Cookie: params.cookies } })
      const timeout = setTimeout(() => { ws.terminate(); reject(new Error('连接超时')) }, WS_CONNECT_TIMEOUT)

      ws.on('open', () => {
        clearTimeout(timeout)
        this.ws = ws
        this.isConnected = true
        this.emit('connected')
        this.startHeartbeat()
        resolve()
      })

      ws.on('message', (data: Buffer) => this.handleBinaryMessage(data))

      ws.on('close', () => {
        if (this.isConnected) {
          this.isConnected = false
          this.emit('disconnected')
          if (this.reconnectCount < MAX_RECONNECT_COUNT) this.scheduleReconnect()
        }
      })

      ws.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
    })
  }

  private async handleBinaryMessage(data: Buffer): Promise<void> {
    try {
      // 解析 Protobuf PushFrame
      const frame = this.parsePushFrame(data)
      if (!frame || frame.payload.length === 0) return

      // gzip 解压
      const payload = frame.payloadEncoding === 'gzip'
        ? await gunzip(frame.payload)
        : frame.payload

      // 解析 Response
      const response = this.parseResponse(payload)
      if (!response?.messagesList) return

      // 处理消息列表
      for (const msg of response.messagesList) {
        this.handleMessage(msg.method, msg.payload)
      }

      // 发送 ACK
      if (response.needsAck && this.ws?.readyState === WebSocket.OPEN) {
        this.sendAck(frame.seqId, response.internalExt)
      }
    } catch (err) {
      this.emit('error', err instanceof Error ? err : new Error(String(err)))
    }
  }

  private parsePushFrame(data: Buffer): any {
    try {
      // 简化的 Protobuf PushFrame 解析
      // 实际的 Protobuf schema 较复杂，这里使用关键字段提取
      let offset = 0
      const readVarint = (): number => {
        let val = 0, shift = 0, byte
        do { byte = data[offset++]; val |= (byte & 0x7f) << shift; shift += 7 } while (byte & 0x80)
        return val
      }
      const readBytes = (len: number): Buffer => { const b = data.slice(offset, offset + len); offset += len; return b }

      const frame: any = {}
      while (offset < data.length) {
        const tag = readVarint()
        const fieldNum = tag >> 3
        const wireType = tag & 7

        if (wireType === 0) { // varint
          const val = readVarint()
          if (fieldNum === 1) frame.seqId = val
          else if (fieldNum === 2) frame.logId = val
        } else if (wireType === 2) { // length-delimited
          const len = readVarint()
          const bytes = readBytes(len)
          if (fieldNum === 5) frame.payload = bytes
          else if (fieldNum === 4) frame.payloadType = bytes.toString('utf-8')
          else if (fieldNum === 3) frame.payloadEncoding = bytes.toString('utf-8')
        } else {
          break
        }
      }
      return frame
    } catch { return null }
  }

  private parseResponse(data: Buffer): any {
    try {
      // 简化的 Response 解析
      // 提取 messages 列表
      const messages: any[] = []
      let offset = 0

      const readVarint = (): number => {
        if (offset >= data.length) return 0
        let val = 0, shift = 0, byte
        do { byte = data[offset++]; val |= (byte & 0x7f) << shift; shift += 7 } while (byte & 0x80 && offset < data.length)
        return val
      }
      const readBytes = (len: number): Buffer => { const b = data.slice(offset, offset + len); offset += len; return b }

      while (offset < data.length) {
        const tag = readVarint()
        const fieldNum = tag >> 3
        const wireType = tag & 7

        if (wireType === 2 && fieldNum === 1) { // messages
          const msgLen = readVarint()
          const msgData = readBytes(msgLen)
          const msg = this.parseMessage(msgData)
          if (msg) messages.push(msg)
        } else if (wireType === 0) {
          readVarint()
        } else if (wireType === 2) {
          const len = readVarint()
          offset += len
        } else {
          break
        }
      }

      return { messagesList: messages, needsAck: false }
    } catch { return null }
  }

  private parseMessage(data: Buffer): any {
    try {
      let offset = 0
      const readVarint = (): number => {
        if (offset >= data.length) return 0
        let val = 0, shift = 0, byte
        do { byte = data[offset++]; val |= (byte & 0x7f) << shift; shift += 7 } while (byte & 0x80 && offset < data.length)
        return val
      }
      const readBytes = (len: number): Buffer => { const b = data.slice(offset, offset + len); offset += len; return b }

      const msg: any = {}
      while (offset < data.length) {
        const tag = readVarint()
        const fieldNum = tag >> 3
        const wireType = tag & 7

        if (wireType === 2) {
          const len = readVarint()
          const bytes = readBytes(len)
          if (fieldNum === 1) msg.method = bytes.toString('utf-8')
          else if (fieldNum === 2) msg.payload = bytes
          else if (fieldNum === 3) msg.msgId = bytes.readUInt32BE(0)
        } else if (wireType === 0) {
          readVarint()
        } else {
          break
        }
      }
      return msg
    } catch { return null }
  }

  private handleMessage(method: string, payload: Buffer): void {
    try {
      const payloadStr = payload.toString('utf-8')
      const data = JSON.parse(payloadStr)

      switch (method) {
        case METHOD_CHAT: this.handleChatMessage(data); break
        case METHOD_GIFT: this.handleGiftMessage(data); break
        case METHOD_LIKE: this.handleLikeMessage(data); break
        case METHOD_MEMBER: this.handleMemberMessage(data); break
        case METHOD_SOCIAL: this.handleSocialMessage(data); break
        case METHOD_ROOM_STATS: this.handleRoomStats(data); break
      }
    } catch {
      // 二进制 payload 解析失败时静默处理
    }
  }

  private handleChatMessage(data: any): void {
    const msg: DanmakuMessage = {
      id: `${Date.now()}-${generateShortId()}`,
      type: 'chat',
      user: {
        id: data.user?.id ?? data.user_id ?? '',
        name: data.user?.nickName ?? data.user_name ?? '未知用户',
        avatar: data.user?.AvatarThumb?.urlList?.[0] ?? '',
        level: data.user?.userAttr?.grade ?? 0,
        fanLevel: data.user?.fanTicket?.fanLevel ?? 0,
      },
      content: data.content ?? '',
      timestamp: Date.now(),
    }
    this.emit('danmaku', msg)
    this.checkAutoReply(msg)
  }

  private handleGiftMessage(data: any): void {
    const msg: DanmakuMessage = {
      id: `${Date.now()}-${generateShortId()}`,
      type: 'gift',
      user: {
        id: data.user?.id ?? '',
        name: data.user?.nickName ?? '未知用户',
        avatar: data.user?.AvatarThumb?.urlList?.[0] ?? '',
      },
      content: `${data.user?.nickName ?? ''} 送出 ${data.gift?.name ?? '礼物'} x${data.gift?.count ?? 1}`,
      gift: {
        name: data.gift?.name ?? '未知礼物',
        count: data.gift?.count ?? 1,
        price: data.gift?.diamondCount ?? 0,
      },
      timestamp: Date.now(),
    }
    this.emit('gift', msg)
  }

  private handleLikeMessage(data: any): void {
    const msg: DanmakuMessage = {
      id: `${Date.now()}-${generateShortId()}`,
      type: 'like',
      user: {
        id: data.user?.id ?? '',
        name: data.user?.nickName ?? '未知用户',
        avatar: data.user?.AvatarThumb?.urlList?.[0] ?? '',
      },
      content: '点赞',
      timestamp: Date.now(),
    }
    this.emit('like', msg)
  }

  private handleMemberMessage(data: any): void {
    const msg: DanmakuMessage = {
      id: `${Date.now()}-${generateShortId()}`,
      type: 'member',
      user: {
        id: data.user?.id ?? '',
        name: data.user?.nickName ?? '未知用户',
        avatar: data.user?.AvatarThumb?.urlList?.[0] ?? '',
      },
      content: '进入直播间',
      timestamp: Date.now(),
    }
    this.emit('member', msg)
  }

  private handleSocialMessage(data: any): void {
    const msg: DanmakuMessage = {
      id: `${Date.now()}-${generateShortId()}`,
      type: 'social',
      user: {
        id: data.user?.id ?? '',
        name: data.user?.nickName ?? '未知用户',
        avatar: data.user?.AvatarThumb?.urlList?.[0] ?? '',
      },
      content: '关注了主播',
      timestamp: Date.now(),
    }
    this.emit('social', msg)
  }

  private handleRoomStats(data: any): void {
    const stats: RoomStats = {
      onlineCount: data.onlineUserCount ?? data.userCount ?? 0,
      likeCount: data.likeCount ?? 0,
      totalDanmaku: data.commentCount ?? 0,
      totalGift: data.giftCount ?? 0,
      totalGiftValue: data.totalGiftValue ?? 0,
      newFollowers: data.followCount ?? 0,
    }
    this.emit('stats', stats)
  }

  private checkAutoReply(msg: DanmakuMessage): void {
    for (const rule of this.rules) {
      if (!rule.enabled) continue
      const now = Date.now()
      if (rule.lastTriggered && (now - rule.lastTriggered) < rule.cooldown * 1000) continue

      const matched = rule.isRegex
        ? new RegExp(rule.keyword).test(msg.content)
        : msg.content.includes(rule.keyword)

      if (matched && rule.responses.length > 0) {
        rule.lastTriggered = now
        const response = randomPick(rule.responses)
        this.sendMessage(response).catch(() => {})
        break
      }
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(Buffer.from([0x3a, 0x02, 0x08, 0x01])) // Ping
      }
    }, HEARTBEAT_INTERVAL)
  }

  private clearTimers(): void {
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null }
    if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    this.reconnectCount++
    const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectCount - 1), MAX_RECONNECT_DELAY)
    this.emit('log', `${this.reconnectCount}秒后重连...`)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (this.currentRoomId) this.connect(this.currentRoomId).catch(() => {})
    }, delay)
  }

  private sendAck(seqId: number, internalExt: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    // 简化的 ACK 消息
    const ackPayload = JSON.stringify({ cursor: internalExt })
    this.ws.send(Buffer.from(ackPayload))
  }
}
