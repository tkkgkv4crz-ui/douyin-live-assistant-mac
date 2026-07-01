import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { Plus, Pencil, Trash2, Power } from 'lucide-react'
import RuleEditor from './RuleEditor'
import type { AutoReplyRule } from '../../types'

export default function RuleList() {
  const rules = useStore((s) => s.autoReplyRules)
  const addRule = useStore((s) => s.addRule)
  const removeRule = useStore((s) => s.removeRule)
  const toggleRule = useStore((s) => s.toggleRule)
  const [editing, setEditing] = useState<AutoReplyRule | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">自动回复</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus className="w-4 h-4" /> 添加规则
        </button>
      </div>

      <div className="space-y-2">
        {rules.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>暂无自动回复规则</p>
          </div>
        )}
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 rounded-xl border transition-all ${
              rule.enabled
                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{rule.isRegex ? `/${rule.keyword}/` : rule.keyword}</span>
                  <span className="text-xs text-gray-500">{rule.responses.length} 条回复</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">冷却: {rule.cooldown}秒</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleRule(rule.id)} className={`p-1.5 rounded-lg transition-colors ${rule.enabled ? 'text-green-500 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}>
                  <Power className="w-4 h-4" />
                </button>
                <button onClick={() => setEditing(rule)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => removeRule(rule.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <RuleEditor onSave={addRule} onClose={() => setShowAdd(false)} />}
      {editing && <RuleEditor rule={editing} onSave={(r) => { useStore.getState().updateRule(editing.id, r); setEditing(null) }} onClose={() => setEditing(null)} />}
    </div>
  )
}
