import { useStore } from '../../store/useStore'
import { TrendingUp } from 'lucide-react'
import { memo } from 'react'

const OnlineChart = memo(function OnlineChart() {
  const history = useStore((s) => s.onlineHistory)

  if (history.length < 2) {
    return (
      <div className="stat-card h-48 flex items-center justify-center text-gray-400 text-sm">
        <TrendingUp className="w-4 h-4 mr-2" />
        数据采集中...
      </div>
    )
  }

  const maxCount = Math.max(...history.map((h) => h.count), 1)
  const points = history.map((h, i) => {
    const x = (i / (history.length - 1)) * 100
    const y = 100 - (h.count / maxCount) * 80 - 10
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="stat-card">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">在线人数趋势</h3>
      <svg viewBox="0 0 100 100" className="w-full h-40" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FE2C55" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FE2C55" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,100 ${points} 100,100`}
          fill="url(#areaGrad)"
        />
        <polyline
          points={points}
          fill="none"
          stroke="#FE2C55"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{history[0]?.time}</span>
        <span>{history[history.length - 1]?.time}</span>
      </div>
    </div>
  )
})

export default OnlineChart
