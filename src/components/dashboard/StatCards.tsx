import { useStore } from '../../store/useStore'
import { Users, Heart, MessageSquare, Gift } from 'lucide-react'
import { formatNumber } from '../../utils/formatters'

export default function StatCards() {
  const stats = useStore((s) => s.stats)

  const cards = [
    { label: '在线人数', value: stats.onlineCount, icon: Users, color: 'text-blue-500' },
    { label: '本场点赞', value: stats.likeCount, icon: Heart, color: 'text-red-500' },
    { label: '弹幕数量', value: stats.totalDanmaku, icon: MessageSquare, color: 'text-green-500' },
    { label: '礼物收入', value: stats.totalGiftValue, icon: Gift, color: 'text-amber-500' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div className="text-2xl font-bold">{formatNumber(value)}</div>
        </div>
      ))}
    </div>
  )
}
