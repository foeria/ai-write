// 知识库相关API接口
import client from './client'

// 知识项类型
export interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  novelId?: string
  createdAt: string
  updatedAt: string
}

// 分类类型
export interface Category {
  id: string
  name: string
  icon?: string
  color?: string
  parentId?: string
}

// 知识列表请求
export interface KnowledgeListParams {
  page?: number
  limit?: number
  category?: string
  keyword?: string
  novelId?: string
}

// 知识列表响应
export interface KnowledgeListResponse {
  data: KnowledgeItem[]
  total: number
}

// 创建知识请求
export interface CreateKnowledgeParams {
  title: string
  content: string
  category: string
  tags?: string[]
  novelId?: string
}

// 分类列表响应
export interface CategoryListResponse {
  data: Category[]
}

// 获取知识列表
export const getKnowledgeList = async (params?: KnowledgeListParams): Promise<KnowledgeListResponse> => {
  const response = await client.get<KnowledgeListResponse>('/knowledge', { params })
  return response.data
}

// 获取知识详情
export const getKnowledgeDetail = async (id: string): Promise<KnowledgeItem> => {
  const response = await client.get<KnowledgeItem>(`/knowledge/${id}`)
  return response.data
}

// 创建知识
export const createKnowledge = async (data: CreateKnowledgeParams): Promise<KnowledgeItem> => {
  const response = await client.post<KnowledgeItem>('/knowledge', data)
  return response.data
}

// 更新知识
export const updateKnowledge = async (id: string, data: Partial<CreateKnowledgeParams>): Promise<KnowledgeItem> => {
  const response = await client.put<KnowledgeItem>(`/knowledge/${id}`, data)
  return response.data
}

// 删除知识
export const deleteKnowledge = async (id: string): Promise<void> => {
  await client.delete(`/knowledge/${id}`)
}

// 获取分类列表
export const getCategoryList = async (): Promise<CategoryListResponse> => {
  const response = await client.get<CategoryListResponse>('/knowledge/categories')
  return response.data
}

// 创建分类
export const createCategory = async (data: Omit<Category, 'id'>): Promise<Category> => {
  const response = await client.post<Category>('/knowledge/categories', data)
  return response.data
}

// 删除分类
export const deleteCategory = async (id: string): Promise<void> => {
  await client.delete(`/knowledge/categories/${id}`)
}

// 批量导入知识
export const importKnowledge = async (items: CreateKnowledgeParams[]): Promise<KnowledgeItem[]> => {
  const response = await client.post<KnowledgeItem[]>('/knowledge/import', { items })
  return response.data
}

// 导出知识
export const exportKnowledge = async (ids?: string[], format?: 'json' | 'markdown'): Promise<Blob> => {
  const response = await client.get('/knowledge/export', {
    params: { ids, format },
    responseType: 'blob',
  })
  return response.data
}
