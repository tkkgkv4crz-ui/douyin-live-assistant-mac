/**
 * TTS 语音播报服务
 * 使用 Web Speech API 的 SpeechSynthesis 接口
 */
export class VoiceService {
  private queue: string[] = []
  private isSpeaking = false
  private enabled = true
  private rate = 1.0
  private volume = 1.0
  private pitch = 1.0
  private maxQueueLength = 20

  setEnabled(v: boolean) { this.enabled = v }
  setRate(v: number) { this.rate = v }
  setVolume(v: number) { this.volume = v }
  setPitch(v: number) { this.pitch = v }

  speak(text: string): void {
    if (!this.enabled || !text?.trim()) return
    const cleaned = this.cleanText(text)
    if (!cleaned) return

    if (this.queue.length >= this.maxQueueLength) {
      this.queue.shift()
    }
    this.queue.push(cleaned)
    this.processQueue()
  }

  stop(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    this.queue = []
    this.isSpeaking = false
  }

  private cleanText(text: string): string {
    return text
      .replace(/https?:\/\/\S+/g, '[链接]')
      .replace(/<[^>]+>/g, '')
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s,.!?;:，。！？；：]/g, '')
      .slice(0, 50)
      .trim()
  }

  private processQueue(): void {
    if (this.isSpeaking || this.queue.length === 0) return
    const text = this.queue.shift()
    if (!text) return

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.isSpeaking = false
      return
    }

    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'zh-CN'
    utter.rate = this.rate
    utter.volume = this.volume
    utter.pitch = this.pitch

    utter.onend = () => {
      this.isSpeaking = false
      this.processQueue()
    }
    utter.onerror = () => {
      this.isSpeaking = false
      this.processQueue()
    }

    this.isSpeaking = true
    window.speechSynthesis.speak(utter)
  }
}

export const voiceService = new VoiceService()
