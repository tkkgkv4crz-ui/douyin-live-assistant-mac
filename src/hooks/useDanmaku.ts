import { useCallback, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { extractRoomId } from '../utils/helpers'

export function useDanmaku() {
  const isConnected = useStore((s) => s.isDanmakuConnected)
  const setConnected = useStore((s) => s.setDanmakuConnected)
  const addDanmaku = useStore((s) => s.addDanmaku)
  const addGift = useStore((s) => s.addGift)
  const addLog = useStore((s) => s.addLog)
  const connectedRef = useRef(isConnected)
  connectedRef.current = isConnected

  useEffect(() => {
    const api = window.electronAPI
    if (!api) return
    const c1 = api.onDanmaku((msg) => addDanmaku(msg as any))
    const c2 = api.onGift((msg) => addGift(msg as any))
    const c3 = api.onRoomStats((stats) => {
      useStore.getState().updateStats(stats)
      useStore.getState().addOnlinePoint(stats.onlineCount)
    })
    return () => { c1(); c2(); c3() }
  }, [addDanmaku, addGift])

  const connect = useCallback((roomIdOrUrl: string) => {
    const api = window.electronAPI
    if (!api?.connectDanmaku) return
    const roomId = extractRoomId(roomIdOrUrl)
    if (!roomId) { addLog('无法识别直播间ID', 'error'); return }
    api.connectDanmaku(roomId).then(() => setConnected(true)).catch(() => setConnected(false))
  }, [setConnected, addLog])

  const disconnect = useCallback(() => {
    window.electronAPI?.disconnectDanmaku?.()
    setConnected(false)
  }, [setConnected])

  const sendDanmaku = useCallback((text: string) => {
    if (!text.trim()) return
    window.electronAPI?.sendDanmaku?.(text.trim())
  }, [])

  useEffect(() => {
    return () => { if (connectedRef.current) window.electronAPI?.disconnectDanmaku?.() }
  }, [])

  return { isConnected, connect, disconnect, sendDanmaku }
}
