import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export function useStorage() {
  const loadSettings = useStore((s) => s.loadSettings)

  useEffect(() => {
    loadSettings()
  }, [loadSettings])
}
