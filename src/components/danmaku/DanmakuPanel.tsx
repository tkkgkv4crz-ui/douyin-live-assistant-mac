import { useState, useRef, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { Send, Trash2 } from 'lucide-react'
import DanmakuItem from './DanmakuItem'

export default function DanmakuPanel() {
  const danmakuList = useStore((s) => s.danmakuList)
  const clearDanmaku = useStore((s) => s.clearDanmaku)
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<'all' | 'chat' | 'gift' | 'member'>('all')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [danmakuList.length])

  const filtered = danmakuList.filter((d) => filter === 'all' || d.type === filter)

  const handleSend = () => {
    if (!input.trim()) return
    window.electronAPI?.sendDanmaku?.(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1">
          {(['all', 'chat', 'gift', 'member'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === key ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
              style={filter === key ? { background: '#FE2C55' } : {}}
            >
              {key === 'all' ? '全部' : key === 'chat' ? '弹幕' : key === 'gift' ? '礼物' : '进场'}
            </button>
          ))}
        </div>
        <button onClick={clearDanmaku} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="清空">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 pr-1">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">暂无弹幕</div>
        )}
        {filtered.map((msg) => (
          <DanmakuItem key={msg.id} message={msg} />
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="发送弹幕..."
          className="input-field flex-1 text-sm"
        />
        <button onClick={handleSend} className="btn-primary px-3">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
