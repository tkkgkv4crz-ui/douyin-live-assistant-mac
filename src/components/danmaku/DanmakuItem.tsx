import { User, Gift, Heart, UserPlus } from 'lucide-react'
import { formatTime } from '../../utils/formatters'
import type { DanmakuMessage } from '../../types'

const typeConfig = {
  chat: { icon: null, color: '', label: '' },
  gift: { icon: Gift, color: 'text-amber-500', label: '礼物' },
  like: { icon: Heart, color: 'text-red-500', label: '点赞' },
  member: { icon: UserPlus, color: 'text-green-500', label: '进场' },
  social: { icon: User, color: 'text-blue-500', label: '关注' },
}

export default function DanmakuItem({ message }: { message: DanmakuMessage }) {
  const config = typeConfig[message.type]
  const Icon = config.icon

  return (
    <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {message.user.avatar ? (
          <img src={message.user.avatar} alt="" className="w-full h-full object-cover" />
        ) : Icon ? (
          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
        ) : (
          <User className="w-3.5 h-3.5 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-red-500 truncate">{message.user.name}</span>
          {message.user.level && (
            <span className="text-[10px] px-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">Lv.{message.user.level}</span>
          )}
          <span className="text-[10px] text-gray-400 ml-auto">{formatTime(message.timestamp)}</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 break-words">
          {message.type === 'gift' && message.gift ? (
            <span className="text-amber-600 dark:text-amber-400">
              送出 {message.gift.name} x{message.gift.count}
            </span>
          ) : (
            message.content
          )}
        </p>
      </div>
    </div>
  )
}
