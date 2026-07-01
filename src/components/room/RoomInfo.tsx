import { useStore } from '../../store/useStore'
import { Radio, Users, Heart, Clock } from 'lucide-react'
import { formatNumber, formatDuration } from '../../utils/formatters'
import { useEffect, useState } from 'react'

export default function RoomInfo() {
  const currentRoom = useStore((s) => s.currentRoom)
  const stats = useStore((s) => s.stats)
  const isConnected = useStore((s) => s.isDanmakuConnected)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isConnected) { setElapsed(0); return }
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(timer)
  }, [isConnected])

  if (!currentRoom) return null

  return (
    <div className="stat-card">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          {currentRoom.info?.owner.avatar ? (
            <img src={currentRoom.info.owner.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <Radio className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{currentRoom.name}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatNumber(stats.onlineCount)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatNumber(stats.likeCount)}
            </span>
            {isConnected && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(elapsed)}
              </span>
            )}
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
        }`}>
          {isConnected ? '直播中' : '未连接'}
        </div>
      </div>
    </div>
  )
}
