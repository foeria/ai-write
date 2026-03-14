import { create } from 'zustand'
import { glossaryRepo } from '@/api/repository'
import type { GlossaryEntry } from '@/types/entities'

// ============ 兼容旧版类型 ============
export type GlossaryItem = GlossaryEntry

export interface GlossaryCategory {
  id: string
  name: string
  icon?: string
  color?: string
}

// 分类类型
export interface Category {
  id: string
  name: string
  icon?: string
  color?: string
}

// 词条库状态
interface GlossaryState {
  // 数据
  items: GlossaryEntry[]
  categories: Category[]
  selectedCategory: string | null
  searchQuery: string

  // 状态
  isLoading: boolean
  error: string | null

  // Actions - 数据加载
  loadEntries: (novelId?: string) => Promise<void>
  searchEntries: (query: string, novelId?: string) => Promise<void>

  // Actions - CRUD
  addGlossaryEntry: (data: Partial<GlossaryEntry>) => Promise<GlossaryEntry>
  updateGlossaryEntry: (id: string, data: Partial<GlossaryEntry>) => Promise<void>
  deleteGlossaryEntry: (id: string) => Promise<void>

  // 兼容旧版方法名
  addItem: (data: Partial<GlossaryEntry>) => Promise<GlossaryEntry>
  updateItem: (id: string, data: Partial<GlossaryEntry>) => Promise<void>
  deleteItem: (id: string) => Promise<void>

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
  { id: 'realm', name: '境界', color: '#764ba2' },
  { id: 'technique', name: '功法', color: '#f093fb' },
  { id: 'item', name: '道具', color: '#4facfe' },
  { id: 'place', name: '地点', color: '#00f2fe' },
  { id: 'faction', name: '势力', color: '#fa709a' },
]

export const useGlossaryStore = create<GlossaryState>()((set, get) => ({
  // 初始数据
  items: [],
  categories: defaultCategories,
  selectedCategory: null,
  searchQuery: '',

  // 状态
  isLoading: false,
  error: null,

  // 数据加载
  loadEntries: async (novelId) => {
    set({ isLoading: true, error: null })
    try {
      const items = await glossaryRepo.getAll(novelId)
      set({ items })
    } catch (error) {
      console.warn('Failed to load entries:', error)
      set({ items: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  searchEntries: async (query, novelId) => {
    if (!query.trim()) {
      return get().loadEntries(novelId)
    }
    set({ isLoading: true, error: null })
    try {
      const items = await glossaryRepo.getAll(novelId)
      // 客户端过滤
      const filtered = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.definition?.toLowerCase().includes(query.toLowerCase())
      )
      set({ items: filtered })
    } catch (error) {
      console.warn('Failed to search entries:', error)
      set({ error: String(error) })
    } finally {
      set({ isLoading: false })
    }
  },

  // CRUD 操作
  addGlossaryEntry: async (data) => {
    set({ isLoading: true, error: null })
    try {
      // 兼容 GlossaryItem 和 GlossaryEntry 格式
      const entryData = {
        title: data.title || (data as any).name || '新词条',
        category: data.category,
        definition: data.definition || (data as any).description,
        novelId: data.novelId,
        tags: data.tags,
        relatedItems: data.relatedItems,
        source: data.source,
      }

      const item = await glossaryRepo.create(entryData)

      set({ items: [item, ...get().items] })
      return item
    } catch (error) {
      set({ error: String(error) })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateGlossaryEntry: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      // 兼容 GlossaryItem 和 GlossaryEntry 格式
      const updateData = {
        ...data,
        title: data.title || (data as any).name,
        definition: data.definition || (data as any).description,
      }

      const item = await glossaryRepo.update(id, updateData)
      const items = get().items.map((e) => (e.id === id ? item : e))
      set({ items })
    } catch (error) {
      set({ error: String(error) })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  deleteGlossaryEntry: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await glossaryRepo.delete(id)
      const items = get().items.filter((e) => e.id !== id)
      set({ items })
    } catch (error) {
      set({ error: String(error) })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  // 兼容旧版方法
  addItem: async (data) => get().addGlossaryEntry(data),
  updateItem: async (id, data) => get().updateGlossaryEntry(id, data),
  deleteItem: async (id) => get().deleteGlossaryEntry(id),

  // 状态管理
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearError: () => set({ error: null }),
}))
