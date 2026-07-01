import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { Plus, Trash2, Radio, ExternalLink } from 'lucide-react'
import RoomAddModal from './RoomAddModal'
import { useDanmaku } from '../../hooks/useDanmaku'

export default function RoomList() {
  const rooms = useStore((s) => s.rooms)
  const currentRoom = useStore((s) => s.currentRoom)
  const removeRoom = useStore((s) => s.removeRoom)
  const setCurrentRoom = useStore((s) => s.setCurrentRoom)
  const [showAdd, setShowAdd] = useState(false)
  const { connect, disconnect, isConnected } = useDanmaku()

  const handleConnect = (room: typeof rooms[0]) => {
    setCurrentRoom(room)
    connect(room.roomId)
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">直播间管理</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus className="w-4 h-4" /> 添加
        </button>
      </div>

      <div className="grid gap-3">
        {rooms.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Radio className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>暂无直播间，点击添加</p>
          </div>
        )}
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`p-4 rounded-xl border transition-all ${
              currentRoom?.id === room.id
                ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{room.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">ID: {room.roomId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentRoom?.id === room.id && isConnected ? (
                  <button onClick={disconnect} className="px-3 py-1.5 text-xs rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                    断开
                  </button>
                ) : (
                  <button onClick={() => handleConnect(room)} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    连接
                  </button>
                )}
                {room.url && (
                  <a href={room.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button onClick={() => removeRoom(room.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <RoomAddModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
