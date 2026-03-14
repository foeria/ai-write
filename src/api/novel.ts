// 小说相关API接口
import client from './client'
import type { Novel, Chapter, OutlineNode } from '@/store/useNovelStore'

// 小说列表请求
export interface NovelListParams {
  page?: number
  limit?: number
  status?: string
}

// 小说列表响应
export interface NovelListResponse {
  data: Novel[]
  total: number
  page: number
  limit: number
}

// 创建小说请求
export interface CreateNovelParams {
  title: string
  description: string
  cover?: string
}

// 更新小说请求
export interface UpdateNovelParams {
  title?: string
  description?: string
  cover?: string
  status?: 'draft' | 'writing' | 'completed'
}

// 章节列表请求
export interface ChapterListParams {
  page?: number
  limit?: number
}

// 章节列表响应
export interface ChapterListResponse {
  data: Chapter[]
  total: number
}

// 创建章节请求
export interface CreateChapterParams {
  title: string
  content?: string
  order?: number
}

// 更新章节请求
export interface UpdateChapterParams {
  title?: string
  content?: string
  status?: 'draft' | 'edited' | 'ai-assisted'
}

// 获取小说列表
export const getNovelList = async (params?: NovelListParams): Promise<NovelListResponse> => {
  const response = await client.get<NovelListResponse>('/novels', { params })
  return response.data
}

// 获取小说详情
export const getNovelDetail = async (id: string): Promise<Novel> => {
  const response = await client.get<Novel>(`/novels/${id}`)
  return response.data
}

// 创建小说
export const createNovel = async (data: CreateNovelParams): Promise<Novel> => {
  const response = await client.post<Novel>('/novels', data)
  return response.data
}

// 更新小说
export const updateNovel = async (id: string, data: UpdateNovelParams): Promise<Novel> => {
  const response = await client.put<Novel>(`/novels/${id}`, data)
  return response.data
}

// 删除小说
export const deleteNovel = async (id: string): Promise<void> => {
  await client.delete(`/novels/${id}`)
}

// 获取章节列表
export const getChapterList = async (novelId: string, params?: ChapterListParams): Promise<ChapterListResponse> => {
  const response = await client.get<ChapterListResponse>(`/novels/${novelId}/chapters`, { params })
  return response.data
}

// 获取章节详情
export const getChapterDetail = async (novelId: string, chapterId: string): Promise<Chapter> => {
  const response = await client.get<Chapter>(`/novels/${novelId}/chapters/${chapterId}`)
  return response.data
}

// 创建章节
export const createChapter = async (novelId: string, data: CreateChapterParams): Promise<Chapter> => {
  const response = await client.post<Chapter>(`/novels/${novelId}/chapters`, data)
  return response.data
}

// 更新章节
export const updateChapter = async (novelId: string, chapterId: string, data: UpdateChapterParams): Promise<Chapter> => {
  const response = await client.put<Chapter>(`/novels/${novelId}/chapters/${chapterId}`, data)
  return response.data
}

// 删除章节
export const deleteChapter = async (novelId: string, chapterId: string): Promise<void> => {
  await client.delete(`/novels/${novelId}/chapters/${chapterId}`)
}

// 获取大纲
export const getOutline = async (novelId: string): Promise<OutlineNode[]> => {
  const response = await client.get<OutlineNode[]>(`/novels/${novelId}/outline`)
  return response.data
}

// 更新大纲
export const updateOutline = async (novelId: string, outline: OutlineNode[]): Promise<OutlineNode[]> => {
  const response = await client.put<OutlineNode[]>(`/novels/${novelId}/outline`, { outline })
  return response.data
}
