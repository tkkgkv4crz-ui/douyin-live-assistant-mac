import { useStore } from '../../store/useStore'
import { Volume2, MessageSquare, Gift, UserPlus } from 'lucide-react'

export default function VoiceSettings() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)

  const toggle = (key: keyof typeof settings) => update({ [key]: !settings[key] })

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-lg font-semibold">语音播报</h2>

      <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5" />
            <div>
              <p className="font-medium text-sm">启用语音播报</p>
              <p className="text-xs text-gray-500">使用系统 TTS 引擎播报消息</p>
            </div>
          </div>
          <button
            onClick={() => toggle('voiceEnabled')}
            className={`relative w-12 h-6 rounded-full transition-colors ${settings.voiceEnabled ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-600'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {settings.voiceEnabled && (
        <>
          <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-4">
            <div>
              <label className="text-sm font-medium">语速: {settings.voiceRate.toFixed(1)}</label>
              <input type="range" min={0.5} max={2} step={0.1} value={settings.voiceRate} onChange={(e) => update({ voiceRate: parseFloat(e.target.value) })} className="w-full accent-red-500" />
            </div>
            <div>
              <label className="text-sm font-medium">音量: {Math.round(settings.voiceVolume * 100)}%</label>
              <input type="range" min={0} max={1} step={0.05} value={settings.voiceVolume} onChange={(e) => update({ voiceVolume: parseFloat(e.target.value) })} className="w-full accent-red-500" />
            </div>
            <div>
              <label className="text-sm font-medium">音调: {settings.voicePitch.toFixed(1)}</label>
              <input type="range" min={0.5} max={2} step={0.1} value={settings.voicePitch} onChange={(e) => update({ voicePitch: parseFloat(e.target.value) })} className="w-full accent-red-500" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-3">
            <p className="text-sm font-medium">播报内容</p>
            {[
              { key: 'voiceDanmaku' as const, icon: MessageSquare, label: '弹幕消息' },
              { key: 'voiceGift' as const, icon: Gift, label: '礼物' },
              { key: 'voiceMember' as const, icon: UserPlus, label: '进场' },
            ].map(({ key, icon: Icon, label }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Icon className="w-4 h-4 text-gray-500" />
                  {label}
                </div>
                <input type="checkbox" checked={settings[key] as boolean} onChange={() => toggle(key)} className="rounded text-red-600 focus:ring-red-500" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
