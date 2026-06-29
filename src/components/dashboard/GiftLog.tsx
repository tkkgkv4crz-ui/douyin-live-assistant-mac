import { useStore } from '../../store/useStore'
import { Gift } from 'lucide-react'
import { formatTime, formatGiftValue } from '../../utils/formatters'

export default function GiftLog() {
  const giftList = useStore((s) => s.giftList)

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Gift className="w-5 h-5 text-amber-500" />
        礼物记录
      </h2>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left">时间</th>
              <th className="px-3 py-2 text-left">用户</th>
              <th className="px-3 py-2 text-left">礼物</th>
              <th className="px-3 py-2 text-right">数量</th>
              <th className="px-3 py-2 text-right">价值</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {giftList.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-400">暂无礼物</td></tr>
            )}
            {[...giftList].reverse().map((gift) => (
              <tr key={gift.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-3 py-2 text-xs text-gray-500">{formatTime(gift.timestamp)}</td>
                <td className="px-3 py-2 font-medium">{gift.user.name}</td>
                <td className="px-3 py-2 text-amber-600 dark:text-amber-400">{gift.gift.name}</td>
                <td className="px-3 py-2 text-right">x{gift.gift.count}</td>
                <td className="px-3 py-2 text-right text-gray-500">{formatGiftValue(gift.gift.price * gift.gift.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
