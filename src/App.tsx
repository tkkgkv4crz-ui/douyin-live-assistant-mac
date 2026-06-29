import { useEffect } from 'react'
import { useStore } from './store/useStore'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import MainContent from './components/layout/MainContent'

export default function App() {
  const theme = useStore((s) => s.theme)
  const addDanmaku = useStore((s) => s.addDanmaku)
  const addGift = useStore((s) => s.addGift)
  const updateStats = useStore((s) => s.updateStats)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const api = window.electronAPI
    if (!api) return
    const c1 = api.onDanmaku((msg: any) => addDanmaku(msg))
    const c2 = api.onGift((msg: any) => addGift(msg))
    const c3 = api.onRoomStats((stats: any) => updateStats(stats))
    return () => { c1(); c2(); c3() }
  }, [addDanmaku, addGift, updateStats])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <MainContent />
      </div>
    </div>
  )
}
