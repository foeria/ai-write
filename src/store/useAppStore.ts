import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 应用配置类型
export interface AppConfig {
  theme: 'dark' | 'light'
  sidebarCollapsed: boolean
  fontSize: number
}

// 应用状态
interface AppState {
  // 配置
  config: AppConfig

  // 全局状态
  isInitialized: boolean
  sidebarCollapsed: boolean

  // Actions
  toggleTheme: () => void
  toggleSidebar: () => void
  setFontSize: (size: number) => void
  setInitialized: (value: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始配置
      config: {
        theme: 'dark',
        sidebarCollapsed: false,
        fontSize: 14,
      },

      // 状态
      isInitialized: false,
      sidebarCollapsed: false,

      // Actions
      toggleTheme: () => {
        const current = get().config.theme
        const newTheme = current === 'dark' ? 'light' : 'dark'
        set((state) => ({
          config: { ...state.config, theme: newTheme },
        }))
      },

      toggleSidebar: () => {
        const collapsed = !get().sidebarCollapsed
        set({ sidebarCollapsed: collapsed })
      },

      setFontSize: (size) => {
        set((state) => ({
          config: { ...state.config, fontSize: size },
        }))
      },

      setInitialized: (value) => {
        set({ isInitialized: value })
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        config: state.config,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
