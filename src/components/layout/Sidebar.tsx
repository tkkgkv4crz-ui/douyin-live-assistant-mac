import { useStore } from '../../store/useStore'
import { LayoutDashboard, MessageSquare, Gift, Video, Bot, Settings } from 'lucide-react'
import type { Page } from '../../store/useStore'

const menuItems: { page: Page; icon: React.ElementType; label: string }[] = [
  { page: 'dashboard', icon: LayoutDashboard, label: '数据面板' },
  { page: 'danmaku', icon: MessageSquare, label: '弹幕' },
  { page: 'gift', icon: Gift, label: '礼物' },
  { page: 'room', icon: Video, label: '直播间' },
  { page: 'autoreply', icon: Bot, label: '自动回复' },
  { page: 'settings', icon: Settings, label: '设置' },
]

export default function Sidebar() {
  const currentPage = useStore((s) => s.currentPage)
  const setPage = useStore((s) => s.setCurrentPage)

  return (
    <nav className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-1 select-none">
      <div className="mb-4 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FE2C55' }}>
        <Video className="w-5 h-5 text-white" />
      </div>
      {menuItems.map(({ page, icon: Icon, label }) => (
        <button
          key={page}
          onClick={() => setPage(page)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
            currentPage === page
              ? 'text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          style={currentPage === page ? { background: '#FE2C55' } : {}}
          title={label}
        >
          <Icon className="w-5 h-5" />
          <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {label}
          </span>
        </button>
      ))}
    </nav>
  )
}
