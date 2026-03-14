import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const TIMEOUT = 120000 // 120秒超时

// 创建Axios实例
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从状态管理获取Token
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    console.error('[API] Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
client.interceptors.response.use(
  (response) => {
    // 成功响应
    const { data } = response
    return data
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    // 错误处理
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || '请求失败'

    console.error(`[API Error] ${error.config?.url}:`, message)

    // 401未授权 - 清除token并跳转登录
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      // 如果不在登录页，跳转登录
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/'
      }
    }

    // 创建自定义错误对象
    const apiError = new Error(message) as AxiosError<{ message?: string; error?: string }>
    apiError.response = error.response
    apiError.config = error.config
    apiError.isAxiosError = true
    apiError.toJSON = () => ({
      message,
      status: error.response?.status,
      url: error.config?.url,
    })

    return Promise.reject(apiError)
  }
)

// 封装请求方法
export const request = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    client.get<T, T>(url, config),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    client.post<T, T>(url, data, config),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    client.put<T, T>(url, data, config),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    client.patch<T, T>(url, data, config),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    client.delete<T, T>(url, config),
}

export default client
