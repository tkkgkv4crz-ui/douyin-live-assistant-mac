import { useState } from 'react'
import { X } from 'lucide-react'
import { generateId } from '../../utils/formatters'
import type { AutoReplyRule } from '../../types'

interface Props {
  rule?: AutoReplyRule
  onSave: (rule: AutoReplyRule) => void
  onClose: () => void
}

export default function RuleEditor({ rule, onSave, onClose }: Props) {
  const [keyword, setKeyword] = useState(rule?.keyword ?? '')
  const [responses, setResponses] = useState(rule?.responses.join('\n') ?? '')
  const [isRegex, setIsRegex] = useState(rule?.isRegex ?? false)
  const [cooldown, setCooldown] = useState(rule?.cooldown ?? 5)

  const handleSave = () => {
    if (!keyword.trim() || !responses.trim()) return
    onSave({
      id: rule?.id ?? generateId(),
      keyword: keyword.trim(),
      responses: responses.split('\n').filter((r) => r.trim()),
      isRegex,
      enabled: rule?.enabled ?? true,
      cooldown,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-[480px] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{rule ? '编辑规则' : '添加规则'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">关键词</label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="输入触发关键词" className="input-field w-full" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="regex" checked={isRegex} onChange={(e) => setIsRegex(e.target.checked)} className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
            <label htmlFor="regex" className="text-sm">使用正则表达式</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              回复内容 <span className="text-gray-400">（每行一条，随机选择）</span>
            </label>
            <textarea value={responses} onChange={(e) => setResponses(e.target.value)} placeholder="回复1\n回复2\n回复3" rows={4} className="input-field w-full resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">冷却时间（秒）</label>
            <input type="number" value={cooldown} onChange={(e) => setCooldown(Math.max(1, parseInt(e.target.value) || 1))} min={1} className="input-field w-24" />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="btn-secondary text-sm">取消</button>
          <button onClick={handleSave} disabled={!keyword.trim() || !responses.trim()} className="btn-primary text-sm disabled:opacity-50">
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
