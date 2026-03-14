// 通用类型定义
// 优先使用 entities.ts 中的统一类型定义

// 分页参数
export interface PaginationParams {
  page?: number
  limit?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

// 基础响应
export interface BaseResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 文件类型
export interface FileInfo {
  id: string
  name: string
  size: number
  type: string
  url: string
  createdAt: string
}

// 标签类型
export interface Tag {
  id: string
  name: string
  color?: string
}

// 重新导出统一实体类型
export * from './entities'
export * from './novel'
