// 角色相关API接口
import client from './client'

// 角色类型
export interface Character {
  id: string
  name: string
  nickname?: string
  avatar?: string
  gender?: 'male' | 'female' | 'other'
  age?: string
  personality?: string
  appearance?: string
  background?: string
  abilities?: string[]
  relationships?: Array<{ id: string; type: string; targetId: string }>
  tags?: string[]
  novelId?: string
  createdAt: string
  updatedAt: string
}

// 角色列表请求
export interface CharacterListParams {
  page?: number
  limit?: number
  novelId?: string
  keyword?: string
}

// 角色列表响应
export interface CharacterListResponse {
  data: Character[]
  total: number
}

// 创建角色请求
export interface CreateCharacterParams {
  name: string
  nickname?: string
  avatar?: string
  gender?: string
  age?: string
  personality?: string
  appearance?: string
  background?: string
  abilities?: string[]
  tags?: string[]
  novelId?: string
}

// AI生成角色请求
export interface GenerateCharacterParams {
  prompt: string
  genre?: string
}

// AI生成角色响应
export interface GenerateCharacterResponse {
  character: Partial<Character>
}

// 获取角色列表
export const getCharacterList = async (params?: CharacterListParams): Promise<CharacterListResponse> => {
  const response = await client.get<CharacterListResponse>('/characters', { params })
  return response.data
}

// 获取角色详情
export const getCharacterDetail = async (id: string): Promise<Character> => {
  const response = await client.get<Character>(`/characters/${id}`)
  return response.data
}

// 创建角色
export const createCharacter = async (data: CreateCharacterParams): Promise<Character> => {
  const response = await client.post<Character>('/characters', data)
  return response.data
}

// 更新角色
export const updateCharacter = async (id: string, data: Partial<CreateCharacterParams>): Promise<Character> => {
  const response = await client.put<Character>(`/characters/${id}`, data)
  return response.data
}

// 删除角色
export const deleteCharacter = async (id: string): Promise<void> => {
  await client.delete(`/characters/${id}`)
}

// AI生成角色
export const generateCharacter = async (params: GenerateCharacterParams): Promise<GenerateCharacterResponse> => {
  const response = await client.post<GenerateCharacterResponse>('/characters/generate', params)
  return response.data
}

// 批量导入角色
export const importCharacters = async (characters: CreateCharacterParams[]): Promise<Character[]> => {
  const response = await client.post<Character[]>('/characters/import', { characters })
  return response.data
}

// 导出角色
export const exportCharacters = async (ids?: string[]): Promise<Blob> => {
  const response = await client.get('/characters/export', {
    params: { ids },
    responseType: 'blob',
  })
  return response.data
}
