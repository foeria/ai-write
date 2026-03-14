// 用户相关API接口
import client from './client'
import type { UserInfo } from '@/types/user'

// 登录请求
export interface LoginParams {
  email: string
  password: string
}

// 登录响应
export interface LoginResponse {
  token: string
  user: UserInfo
}

// 注册请求
export interface RegisterParams {
  email: string
  password: string
  nickname: string
  code: string
}

// 注册响应
export interface RegisterResponse {
  success: boolean
  message: string
}

// 发送验证码请求
export interface SendCodeParams {
  email: string
  type: 'register' | 'reset-password'
}

// 发送验证码响应
export interface SendCodeResponse {
  success: boolean
  message: string
}

// 重置密码请求
export interface ResetPasswordParams {
  email: string
  code: string
  password: string
}

// 重置密码响应
export interface ResetPasswordResponse {
  success: boolean
  message: string
}

// 登录
export const login = async (params: LoginParams): Promise<LoginResponse> => {
  const response = await client.post<LoginResponse>('/user/login', params)
  return response.data
}

// 注册
export const register = async (params: RegisterParams): Promise<RegisterResponse> => {
  const response = await client.post<RegisterResponse>('/user/register', params)
  return response.data
}

// 发送验证码
export const sendCode = async (params: SendCodeParams): Promise<SendCodeResponse> => {
  const response = await client.post<SendCodeResponse>('/user/send-code', params)
  return response.data
}

// 重置密码
export const resetPassword = async (params: ResetPasswordParams): Promise<ResetPasswordResponse> => {
  const response = await client.post<ResetPasswordResponse>('/user/reset-password', params)
  return response.data
}

// 获取用户信息
export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await client.get<UserInfo>('/user/profile')
  return response.data
}

// 更新用户信息
export const updateUserInfo = async (data: Partial<UserInfo>): Promise<UserInfo> => {
  const response = await client.put<UserInfo>('/user/profile', data)
  return response.data
}

// 登出
export const logout = async (): Promise<void> => {
  await client.post('/user/logout')
}
