import { Suspense, lazy } from 'react'
import { useStore } from '../../store/useStore'

const Dashboard = lazy(() => import('../dashboard/StatCards'))
const DanmakuPanel = lazy(() => import('../danmaku/DanmakuPanel'))
const GiftLog = lazy(() => import('../dashboard/GiftLog'))
const RoomList = lazy(() => import('../room/RoomList'))
const RuleList = lazy(() => import('../autoreply/RuleList'))
const GeneralSettings = lazy(() => import('../settings/GeneralSettings'))

export default function MainContent() {
  const page = useStore((s) => s.currentPage)

  return (
    <main className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">加载中...</div>}>
        {page === 'dashboard' && <Dashboard />}
        {page === 'danmaku' && <DanmakuPanel />}
        {page === 'gift' && <GiftLog />}
        {page === 'room' && <RoomList />}
        {page === 'autoreply' && <RuleList />}
        {page === 'settings' && <GeneralSettings />}
      </Suspense>
    </main>
  )
}
