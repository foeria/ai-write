import { useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'

/**
 * 主题管理Hook
 */
export function useTheme() {
  const { config, toggleTheme } = useAppStore()
  const { theme, fontSize } = config

  const toggle = useCallback(() => {
    toggleTheme()
  }, [toggleTheme])

  return {
    isDark: theme === 'dark',
    fontSize,
    toggleTheme: toggle,
  }
}
