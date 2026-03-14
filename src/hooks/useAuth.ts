import { useCallback } from 'react'
import { useUserStore } from '@/store/useUserStore'

/**
 * 认证相关Hook
 */
export function useAuth() {
  const { userInfo, token, isLoading, error, login, register, logout, clearError } =
    useUserStore()

  const isAuthenticated = !!token

  const handleLogin = useCallback(
    async (params: { email: string; password: string }) => {
      return login(params)
    },
    [login]
  )

  const handleRegister = useCallback(
    async (params: { email: string; password: string; nickname: string; code: string }) => {
      return register(params)
    },
    [register]
  )

  return {
    userInfo,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout,
    clearError,
  }
}
