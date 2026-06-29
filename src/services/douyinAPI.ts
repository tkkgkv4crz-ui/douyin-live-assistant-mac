import https from 'node:https'
import { DOUYIN_LIVE_URL, HTTP_TIMEOUT, REQUEST_HEADERS } from '../utils/constants'
import type { RoomInfo } from '../types'

export class DouyinAPI {
  private cookies: string = ''

  async getRoomIdFromUrl(url: string): Promise<string> {
    if (url.includes('v.douyin.com') || url.includes('vm.tiktok.com')) {
      return this.extractRoomIdFromShortUrl(url)
    }
    const match = url.match(/room_id=(\d+)/) ?? url.match(/\/(\d+)/)
    if (match?.[1]) return match[1]
    throw new Error(`无法从链接中解析房间ID: ${url}`)
  }

  async getRoomInfo(roomId: string): Promise<RoomInfo> {
    const html = await this.fetchRoomPage(roomId)
    return this.parseRoomInfo(html, roomId)
  }

  private async fetchRoomPage(roomId: string): Promise<string> {
    const url = `${DOUYIN_LIVE_URL}/${roomId}`
    return new Promise((resolve, reject) => {
      const req = https.get(url, {
        headers: { ...REQUEST_HEADERS, ...(this.cookies ? { Cookie: this.cookies } : {}) },
        timeout: HTTP_TIMEOUT,
      }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const location = res.headers.location
          if (location) { this.followRedirect(location, resolve, reject); return }
        }
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`)); return
        }
        const chunks: Buffer[] = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
      })
      req.on('error', (err) => reject(err))
      req.on('timeout', () => { req.destroy(); reject(new Error('超时')) })
    })
  }

  private followRedirect(url: string, resolve: (v: string) => void, reject: (e: Error) => void): void {
    https.get(url, { headers: REQUEST_HEADERS, timeout: HTTP_TIMEOUT }, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    }).on('error', (err) => reject(err))
  }

  private parseRoomInfo(html: string, fallbackRoomId: string): RoomInfo {
    const renderData = this.extractRenderData(html)
    if (renderData) {
      const info = this.parseFromRenderData(renderData, fallbackRoomId)
      if (info) return info
    }
    const hydratedMatch = html.match(/window\._SSR_HYDRATED_DATA\s*=\s*({.+?});?<\/script>/s)
    if (hydratedMatch?.[1]) {
      const info = this.parseFromHydratedData(JSON.parse(hydratedMatch[1]), fallbackRoomId)
      if (info) return info
    }
    return this.parseFromHTML(html, fallbackRoomId)
  }

  private extractRenderData(html: string): Record<string, any> | null {
    const match = html.match(/<script\s+id="RENDER_DATA"[^>]*>(.+?)<\/script>/s)
    if (!match?.[1]) return null
    try { return JSON.parse(decodeURIComponent(match[1])) } catch { return null }
  }

  private parseFromRenderData(data: any, fallback: string): RoomInfo | null {
    try {
      const room = data?.app?.initialState?.roomStore?.roomInfo?.room
      const anchor = data?.app?.initialState?.roomStore?.roomInfo?.anchor
      if (!room) return null
      return {
        roomId: room.id_str ?? room.id ?? fallback,
        title: room.title ?? '未知直播间',
        owner: {
          id: anchor?.sec_uid ?? '',
          name: anchor?.nickname ?? '未知主播',
          avatar: anchor?.avatar_thumb?.url_list?.[0] ?? '',
        },
        onlineCount: room.room_view_stats?.display_value ?? room.user_count ?? 0,
        likeCount: room.like_count ?? 0,
        status: room.status?.toString() === '2' ? 'live' : 'offline',
        cover: room.cover?.url_list?.[0] ?? '',
      }
    } catch { return null }
  }

  private parseFromHydratedData(data: any, fallback: string): RoomInfo | null {
    try {
      const roomInfo = data?.roomStore?.roomInfo
      if (!roomInfo) return null
      const room = roomInfo.room ?? roomInfo
      const anchor = roomInfo.anchor ?? room.owner
      return {
        roomId: room.id_str ?? room.room_id_str ?? fallback,
        title: room.title ?? '未知直播间',
        owner: {
          id: anchor?.sec_uid ?? '',
          name: anchor?.nickname ?? '未知主播',
          avatar: anchor?.avatar_thumb?.url_list?.[0] ?? '',
        },
        onlineCount: room.room_view_stats ?? room.user_count ?? 0,
        likeCount: room.like_count ?? 0,
        status: room.status?.toString() === '2' ? 'live' : 'offline',
        cover: room.cover?.url_list?.[0] ?? '',
      }
    } catch { return null }
  }

  private parseFromHTML(html: string, fallback: string): RoomInfo {
    const titleMatch = html.match(/<title>(.+?)<\/title>/)
    const title = titleMatch?.[1]?.replace(/\s*-\s*抖音$/, '') ?? '未知直播间'
    const onlineMatch = html.match(/"display_value":\s*(\d+)/)
    const onlineCount = onlineMatch ? parseInt(onlineMatch[1], 10) : 0
    const statusMatch = html.match(/"status":\s*(\d)/)
    const status = statusMatch?.[1] === '2' ? 'live' : 'offline'
    return {
      roomId: fallback, title,
      owner: { id: '', name: title.split(/[-|]/)[0]?.trim() ?? '未知主播', avatar: '' },
      onlineCount, likeCount: 0, status, cover: '',
    }
  }

  private async extractRoomIdFromShortUrl(shortUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = https.get(shortUrl, { headers: REQUEST_HEADERS, timeout: HTTP_TIMEOUT }, (res) => {
        const location = res.headers.location
        if (location && (res.statusCode === 301 || res.statusCode === 302)) {
          const match = location.match(/room_id=(\d+)/) ?? location.match(/\/(\d+)/)
          if (match?.[1]) { resolve(match[1]); return }
        }
        reject(new Error('短链接解析失败'))
      })
      req.on('error', reject)
      req.on('timeout', () => { req.destroy(); reject(new Error('超时')) })
    })
  }
}

export const douyinAPI = new DouyinAPI()
