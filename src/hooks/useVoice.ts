import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { voiceService } from '../services/voiceService'

export function useVoice() {
  const settings = useStore((s) => s.settings)
  const danmakuList = useStore((s) => s.danmakuList)
  const giftList = useStore((s) => s.giftList)
  const lastDanmakuId = useRef('')
  const lastGiftId = useRef('')

  useEffect(() => {
    voiceService.setEnabled(settings.voiceEnabled)
    voiceService.setRate(settings.voiceRate)
    voiceService.setVolume(settings.voiceVolume)
    voiceService.setPitch(settings.voicePitch)
  }, [settings.voiceEnabled, settings.voiceRate, settings.voiceVolume, settings.voicePitch])

  useEffect(() => {
    if (!settings.voiceEnabled || !settings.voiceDanmaku || danmakuList.length === 0) return
    const last = danmakuList[danmakuList.length - 1]
    if (last.id === lastDanmakuId.current) return
    lastDanmakuId.current = last.id
    if (last.type === 'chat') voiceService.speak(`${last.user.name}说：${last.content}`)
  }, [danmakuList, settings.voiceEnabled, settings.voiceDanmaku])

  useEffect(() => {
    if (!settings.voiceEnabled || !settings.voiceGift || giftList.length === 0) return
    const last = giftList[giftList.length - 1]
    if (last.id === lastGiftId.current) return
    lastGiftId.current = last.id
    voiceService.speak(`${last.user.name}送出${last.gift.name}`)
  }, [giftList, settings.voiceEnabled, settings.voiceGift])

  return voiceService
}
