import { create } from 'zustand'
import { characterRepo } from '@/api/repository'
import type { Character } from '@/types/entities'

// 重新导出类型供外部使用
export type { Character }

// 角色状态
interface CharacterState {
  // 数据
  characters: Character[]
  selectedCharacterId: string | null
  searchQuery: string
  filterRole: string | null
  filterNovelId: string | null
  filterStatus: 'enabled' | 'disabled' | null  // 启用/未启用筛选

  // 状态
  isLoading: boolean
  error: string | null

  // Actions - 数据加载
  loadCharacters: (novelId?: string) => Promise<void>
  loadAllCharacters: () => Promise<void>

  // Actions - CRUD
  addCharacter: (data: Partial<Character>) => Promise<Character>
  updateCharacter: (id: string, data: Partial<Character>) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>

  // Actions - 状态管理
  setSelectedCharacterId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setFilterRole: (role: string | null) => void
  setFilterNovelId: (novelId: string | null) => void
  setFilterStatus: (status: 'enabled' | 'disabled' | null) => void
  clearError: () => void
}

// 模拟初始数据（仅用于开发环境展示）
const mockCharacters: Character[] = [
  {
    id: 'demo-1',
    name: '林逸飞',
    gender: 'male',
    age: '25',
    role: 'protagonist',
    status: 'enabled',
    appearance: '剑眉星目，身姿挺拔',
    personality: '沉稳内敛，正直坚毅',
    background: '青云宗内门弟子',
    tags: ['主角', '剑修'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'demo-2',
    name: '苏月瑶',
    gender: 'female',
    age: '22',
    role: 'supporting',
    status: 'enabled',
    appearance: '眉如远黛，眼若秋水',
    personality: '聪慧果断，外冷内热',
    background: '天机阁阁主之女',
    tags: ['女主', '聪慧'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

export const useCharacterStore = create<CharacterState>()((set, get) => ({
  // 初始数据
  characters: [],
  selectedCharacterId: null,
  searchQuery: '',
  filterRole: null,
  filterNovelId: null,
  filterStatus: null,

  // 状态
  isLoading: false,
  error: null,

  // 数据加载
  loadCharacters: async (novelId) => {
    set({ isLoading: true, error: null })
    try {
      const characters = await characterRepo.getAll(novelId)
      // 如果没有数据，使用演示数据
      set({ characters: characters.length > 0 ? characters : mockCharacters })
    } catch (error) {
      console.warn('Failed to load characters, using demo data:', error)
      set({ characters: mockCharacters })
    } finally {
      set({ isLoading: false })
    }
  },

  loadAllCharacters: async () => {
    await get().loadCharacters(undefined)
  },

  // CRUD 操作
  addCharacter: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const character = await characterRepo.create({
        id: '',
        name: data.name || '新角色',
        gender: data.gender,
        age: data.age,
        appearance: data.appearance,
        personality: data.personality,
        background: data.background,
        novelId: data.novelId,
        status: data.status || 'enabled',
        createdAt: 0,
        updatedAt: 0,
      } as any)

      set({ characters: [character, ...get().characters] })
      return character
    } catch (error) {
      set({ error: String(error) })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateCharacter: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const character = await characterRepo.update(id, data)
      const characters = get().characters.map(c =>
        c.id === id ? character : c
      )
      set({ characters })
    } catch (error) {
      set({ error: String(error) })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  deleteCharacter: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await characterRepo.delete(id)
      const characters = get().characters.filter(c => c.id !== id)
      set({ characters })
    } catch (error) {
      set({ error: String(error) })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  // 状态管理
  setSelectedCharacterId: (id) => set({ selectedCharacterId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterRole: (role) => set({ filterRole: role }),
  setFilterNovelId: (novelId) => set({ filterNovelId: novelId }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  clearError: () => set({ error: null }),
}))
