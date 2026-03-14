// 用户相关类型

export interface UserInfo {
  id: string
  email: string
  nickname: string
  avatar?: string
  quota: number
  createdAt: string
}

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  email: string
  password: string
  nickname: string
  code: string
}

export interface AuthResponse {
  token: string
  user: UserInfo
}
