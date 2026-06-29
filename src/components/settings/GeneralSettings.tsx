import { useStore } from '../../store/useStore'
import { Sun, Moon, Trash2 } from 'lucide-react'

export default function GeneralSettings() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const clearDanmaku = useStore((s) => s.clearDanmaku)

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-lg font-semibold">通用设置</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <div>
              <p className="font-medium text-sm">主题</p>
              <p className="text-xs text-gray-500">{settings.theme === 'dark' ? '深色模式' : '浅色模式'}</p>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className={`relative w-12 h-6 rounded-full transition-colors ${settings.theme === 'dark' ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-600'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-3">
          <label className="block text-sm font-medium">弹幕保留数量</label>
          <input
            type="range"
            min={100}
            max={2000}
            step={100}
            value={settings.maxDanmakuCount}
            onChange={(e) => updateSettings({ maxDanmakuCount: parseInt(e.target.value) })}
            className="w-full accent-red-500"
          />
          <div className="text-xs text-gray-500 text-right">{settings.maxDanmakuCount} 条</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-3">
          <label className="block text-sm font-medium">弹幕字体大小</label>
          <input
            type="range"
            min={10}
            max={24}
            step={1}
            value={settings.danmakuFontSize}
            onChange={(e) => updateSettings({ danmakuFontSize: parseInt(e.target.value) })}
            className="w-full accent-red-500"
          />
          <div className="text-xs text-gray-500 text-right">{settings.danmakuFontSize}px</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <button onClick={clearDanmaku} className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm">
            <Trash2 className="w-4 h-4" />
            清空弹幕数据
          </button>
        </div>
      </div>
    </div>
  )
}
