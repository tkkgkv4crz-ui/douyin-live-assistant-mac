import { useStore } from '../../store/useStore'
import { Radio, Users, ExternalLink } from 'lucide-react'

export default function Header() {
  const currentRoom = useStore((s) => s.currentRoom)
  const isConnected = useStore((s) => s.isDanmakuConnected)
  const stats = useStore((s) => s.stats)

  return (
    <header className="h-14 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
        <h1 className="font-semibold text-sm truncate max-w-[300px]">
          {currentRoom?.name ?? '抖音直播助手'}
        </h1>
        {currentRoom?.url && (
          <a href={currentRoom.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        {isConnected && (
          <>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {stats.onlineCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-green-500" />
              直播中
            </span>
          </>
        )}
      </div>
    </header>
  )
}
