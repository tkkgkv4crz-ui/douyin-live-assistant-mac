import { useCallback } from 'react'
import { useStore } from '../store/useStore'
import { obsService } from '../services/obsService'

export function useOBS() {
  const status = useStore((s) => s.obsStatus)
  const setStatus = useStore((s) => s.setOBSStatus)

  const connect = useCallback(async (host: string, port: number, password: string) => {
    try {
      await obsService.connect(host, port, password)
      const s = await obsService.getStatus()
      setStatus(s)
    } catch (e: any) {
      setStatus({ connected: false, streaming: false, recording: false })
      throw e
    }
  }, [setStatus])

  const disconnect = useCallback(async () => {
    await obsService.disconnect()
    setStatus({ connected: false, streaming: false, recording: false })
  }, [setStatus])

  const toggleStream = useCallback(async () => {
    if (status.streaming) {
      await obsService.stopStreaming()
    } else {
      await obsService.startStreaming()
    }
    const s = await obsService.getStatus()
    setStatus(s)
  }, [status.streaming, setStatus])

  return { status, connect, disconnect, toggleStream }
}
