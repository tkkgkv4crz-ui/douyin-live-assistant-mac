import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { X, Loader2 } from 'lucide-react'
import { extractRoomId } from '../../utils/helpers'
import { generateId } from '../../utils/formatters'

interface Props { onClose: () => void }

export default function RoomAddModal({ onClose }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const addRoom = useStore((s) => s.addRoom)

  const handleSubmit = async () => {
    const roomId = extractRoomId(input.trim())
    if (!roomId) return
    setLoading(true)
    try {
      let info = null
      try {
        info = await window.electronAPI?.getRoomInfo?.(roomId)
      } catch {}
      addRoom({
        id: generateId(),
        roomId,
        name: info?.title ?? `直播间 ${roomId}`,
        url: input.trim().startsWith('http') ? input.trim() : `https://live.douyin.com/${roomId}`,
        isActive: false,
        info: info ?? undefined,
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">添加直播间</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="输入直播间链接或ID"
          className="input-field w-full mb-4"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary text-sm">取消</button>
          <button onClick={handleSubmit} disabled={loading || !input.trim()} className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            添加
          </button>
        </div>
      </div>
    </div>
  )
}
