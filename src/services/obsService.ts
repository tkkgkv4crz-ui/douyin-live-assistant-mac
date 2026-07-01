import { EventEmitter } from 'node:events'
import OBSWebSocket from 'obs-websocket-js'
import type { OBSStatus } from '../types'

export class OBSService extends EventEmitter {
  private obs: OBSWebSocket | null = null
  private isConnected = false
  private reconnectTimer: NodeJS.Timeout | null = null

  async connect(host: string, port: number, password: string): Promise<void> {
    if (this.obs) await this.disconnect()
    this.obs = new OBSWebSocket()
    await this.obs.connect(`ws://${host}:${port}`, password, { rpcVersion: 1 })
    this.isConnected = true
    this.emit('connected')
    this.emit('status-change', await this.getStatus())
  }

  async disconnect(): Promise<void> {
    this.clearReconnect()
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null }
    if (this.obs) {
      try { await this.obs.disconnect() } catch {}
      this.obs = null
    }
    this.isConnected = false
    this.emit('disconnected')
  }

  async startStreaming(): Promise<void> {
    if (!this.obs) throw new Error('未连接OBS')
    await this.obs.call('StartStream')
    this.emit('status-change', await this.getStatus())
  }

  async stopStreaming(): Promise<void> {
    if (!this.obs) throw new Error('未连接OBS')
    await this.obs.call('StopStream')
    this.emit('status-change', await this.getStatus())
  }

  async switchScene(sceneName: string): Promise<void> {
    if (!this.obs) throw new Error('未连接OBS')
    await this.obs.call('SetCurrentProgramScene', { sceneName })
  }

  async toggleMute(sourceName: string): Promise<void> {
    if (!this.obs) throw new Error('未连接OBS')
    const resp = await this.obs.call('GetInputMute', { inputName: sourceName }) as any
    await this.obs.call('SetInputMute', { inputName: sourceName, inputMuted: !resp.inputMuted })
  }

  async getStatus(): Promise<OBSStatus> {
    if (!this.obs || !this.isConnected) {
      return { connected: false, streaming: false, recording: false }
    }
    try {
      const [streamStatus, recordStatus] = await Promise.all([
        this.obs.call('GetStreamStatus').catch(() => ({ outputActive: false })),
        this.obs.call('GetRecordStatus').catch(() => ({ outputActive: false })),
      ])
      return {
        connected: true,
        streaming: (streamStatus as any).outputActive ?? false,
        recording: (recordStatus as any).outputActive ?? false,
      }
    } catch {
      return { connected: true, streaming: false, recording: false }
    }
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null }
  }
}

export const obsService = new OBSService()
