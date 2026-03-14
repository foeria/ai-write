import { create } from 'zustand'
import { knowledgeRepo } from '@/api/repository'
import type { Knowledge } from '@/types/entities'

// 分类类型
export interface Category {
  id: string
  name: string
  icon?: string
  color?: string
}

// 知识库状态
interface KnowledgeState {
  // 数据
  items: Knowledge[]
  categories: Category[]
  selectedCategory: string | null
  searchQuery: string

  // 状态
  isLoading: boolean
  error: string | null

  // Actions - 数据加载
  loadKnowledge: (novelId?: string) => Promise<void>
  searchKnowledge: (query: string, novelId?: string) => Promise<void>

  // Actions - CRUD
  addKnowledge: (data: Partial<Knowledge>) => Promise<Knowledge>
  updateKnowledge: (id: string, data: Partial<Knowledge>) => Promise<void>
  deleteKnowledge: (id: string) => Promise<void>

  // Actions - 状态管理
  setCategories: (categories: Category[]) => void
  setSelectedCategory: (categoryId: string | null) => void
  setSearchQuery: (query: string) => void
  clearError: () => void
}

// 默认分类
const defaultCategories: Category[] = [
  { id: 'all', name: '全部' },
  { id: 'worldview', name: '世界观', color: '#667eea' },
  { id: 'character', name: '角色', color: '#764ba2' },
  { id: 'plot', name: '剧情', color: '#f093fb' },
  { id: 'setting', name: '设定', color: '#4facfe' },
]

export const useKnowledgeStore = create<KnowledgeState>()((set, get) => ({
  // 初始数据
  items: [],
  categories: defaultCategories,
  selectedCategory: null,
  searchQuery: '',

  // 状态
  isLoading: false,
  error: null,

  // 数据加载
  loadKnowledge: async (novelId) => {
    set({ isLoading: true, error: null })
    try {
      const items = await knowledgeRepo.getAll(novelId)
      set({ items })
    } catch (error) {
      console.warn('Failed to load knowledge:', error)
      set({ items: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  searchKnowledge: async (query, novelId) => {
    if (!query.trim()) {
      return get().loadKnowledge(novelId)
    }
    set({ isLoading: true, error: null })
    try {
      const items = await knowledgeRepo.search(query, novelId)
      set({ items })
    } catch (error) {
      console.warn('Failed to search knowledge:', error)
      set({ error: String(error) })
    } finally {
      set({ isLoading: false })
    }
  },

  // CRUD 操作
  addKnowledge: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const item = await knowledgeRepo.create({
        id: '',
        title: data.title || '新知识条目',
        content: data.content,
        category: data.category,
        tags: data.tags,
        novelId: data.novelId,
        createdAt: 0,
        updatedAt: 0,
      } as any)

      set({ items: [item, ...get().items] })
      return item
    } catch (error) {
      set({ error: String(error) })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateKnowledge: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const item = await knowledgeRepo.update(id, data)
      const items = get().items.map(k => k.id === id ? item : k)
      set({ items })
    } catch (error) {
      set({ error: String(error) })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  deleteKnowledge: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await knowledgeRepo.delete(id)
      const items = get().items.filter(k => k.id !== id)
      set({ items })
    } catch (error) {
      set({ error: String(error) })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  // 状态管理
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearError: () => set({ error: null }),
}))
