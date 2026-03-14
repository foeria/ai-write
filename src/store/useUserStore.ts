import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 用户信息类型
export interface UserInfo {
  id: string
  email: string
  nickname: string
  avatar?: string
  quota: number
  createdAt: string
}

// 登录请求
export interface LoginParams {
  email: string
  password: string
}

// 注册请求
export interface RegisterParams {
  email: string
  password: string
  nickname: string
  code: string
}

// 用户状态
interface UserState {
  // 用户信息
  userInfo: UserInfo | null
  token: string | null

  // 加载状态
  isLoading: boolean
  error: string | null

  // Actions
  setUserInfo: (user: UserInfo | null) => void
  setToken: (token: string | null) => void

  // 登录/注册
  login: (params: LoginParams) => Promise<void>
  register: (params: RegisterParams) => Promise<void>
  logout: () => void

  // 清除错误
  clearError: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // 初始状态
      userInfo: null,
      token: null,
      isLoading: false,
      error: null,

      // Setters
      setUserInfo: (user) => set({ userInfo: user }),
      setToken: (token) => set({ token }),

      // 登录
      login: async (params) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: 调用真实API
          // const response = await request.post('/user/login', params)
          // const { token: newToken, userInfo } = response.data

          // 模拟登录
          const mockUser: UserInfo = {
            id: '1',
            email: params.email,
            nickname: '测试用户',
            quota: 10000,
            createdAt: new Date().toISOString(),
          }
          const mockToken = 'mock-jwt-token'

          set({
            userInfo: mockUser,
            token: mockToken,
            isLoading: false,
          })

          localStorage.setItem('token', mockToken)
          localStorage.setItem('userInfo', JSON.stringify(mockUser))
        } catch (error) {
          const message = error instanceof Error ? error.message : '登录失败'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // 注册
      register: async (_params) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: 调用真实API
          // const response = await request.post('/user/register', params)

          set({ isLoading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : '注册失败'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // 登出
      logout: () => {
        set({ userInfo: null, token: null, error: null })
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        window.location.href = '/'
      },

      // 清除错误
      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userInfo: state.userInfo,
        token: state.token,
      }),
    }
  )
)
