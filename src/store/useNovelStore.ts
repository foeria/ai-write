import { create } from 'zustand'
import { novelRepo, chapterRepo } from '@/api/repository'
import type { Novel, Chapter, OutlineNode } from '@/types/novel'

// 重新导出类型供外部使用
export type { Novel, Chapter, OutlineNode }

// 小说编辑器状态
interface NovelEditorState {
  // 当前编辑的小说
  currentNovel: Novel | null
  currentChapter: Chapter | null
  chapters: Chapter[]
  outline: OutlineNode[]

  // 编辑状态
  isSaving: boolean
  isLoading: boolean
  hasUnsavedChanges: boolean

  // Actions
  setCurrentNovel: (novel: Novel | null) => void
  setCurrentChapter: (chapter: Chapter | null) => void
  setChapters: (chapters: Chapter[]) => void
  setOutline: (outline: OutlineNode[]) => void

  // 数据操作
  loadNovel: (id: string) => Promise<void>
  loadChapters: (novelId: string) => Promise<void>
  createNovel: (data: Partial<Novel>) => Promise<Novel>
  updateNovel: (id: string, data: Partial<Novel>) => Promise<void>
  deleteNovel: (id: string) => Promise<void>

  createChapter: (novelId: string, data: Partial<Chapter>) => Promise<Chapter>
  updateChapter: (id: string, data: Partial<Chapter>) => Promise<void>
  deleteChapter: (id: string) => Promise<void>

  updateOutline: (id: string, outline: object) => Promise<void>
  updateWorldBuilding: (id: string, worldBuilding: object) => Promise<void>

  setSaving: (isSaving: boolean) => void
  setLoading: (isLoading: boolean) => void
  setUnsavedChanges: (hasChanges: boolean) => void
  reset: () => void
}

export const useNovelStore = create<NovelEditorState>((set, get) => ({
  // 初始状态
  currentNovel: null,
  currentChapter: null,
  chapters: [],
  outline: [],

  isSaving: false,
  isLoading: false,
  hasUnsavedChanges: false,

  // Setters
  setCurrentNovel: (novel) => set({ currentNovel: novel }),
  setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
  setChapters: (chapters) => set({ chapters }),
  setOutline: (outline) => set({ outline }),

  // 数据操作
  loadNovel: async (id) => {
    set({ isLoading: true })
    try {
      const novel = await novelRepo.getById(id)
      set({ currentNovel: novel })
    } finally {
      set({ isLoading: false })
    }
  },

  loadChapters: async (novelId) => {
    set({ isLoading: true })
    try {
      const chapters = await chapterRepo.getByNovelId(novelId)
      set({ chapters })
    } finally {
      set({ isLoading: false })
    }
  },

  createNovel: async (data) => {
    set({ isSaving: true })
    try {
      const novel = await novelRepo.create({
        id: '',
        title: data.title || '未命名小说',
        description: data.description,
        genre: data.genre,
        coverImage: data.coverImage,
        wordCount: 0,
        createdAt: 0,
        updatedAt: 0,
        ...data
      } as any)
      set({ currentNovel: novel })
      return novel
    } finally {
      set({ isSaving: false })
    }
  },

  updateNovel: async (id, data) => {
    set({ isSaving: true })
    try {
      const novel = await novelRepo.update(id, data)
      set({ currentNovel: novel, hasUnsavedChanges: false })
    } finally {
      set({ isSaving: false })
    }
  },

  deleteNovel: async (id) => {
    set({ isSaving: true })
    try {
      await novelRepo.delete(id)
      get().reset()
    } finally {
      set({ isSaving: false })
    }
  },

  createChapter: async (novelId, data) => {
    set({ isSaving: true })
    try {
      const chapter = await chapterRepo.create(novelId, {
        id: '',
        novelId,
        title: data.title || '新章节',
        content: data.content,
        orderIndex: data.orderIndex ?? 0,
        wordCount: 0,
        createdAt: 0,
        updatedAt: 0,
        ...data
      } as any)
      const chapters = [...get().chapters, chapter]
      set({ chapters })
      return chapter
    } finally {
      set({ isSaving: false })
    }
  },

  updateChapter: async (id, data) => {
    set({ isSaving: true, hasUnsavedChanges: true })
    try {
      const chapter = await chapterRepo.update(id, data)
      const chapters = get().chapters.map(c => c.id === id ? chapter : c)
      set({ chapters, currentChapter: chapter })
    } finally {
      set({ isSaving: false })
    }
  },

  deleteChapter: async (id) => {
    set({ isSaving: true })
    try {
      await chapterRepo.delete(id)
      const chapters = get().chapters.filter(c => c.id !== id)
      set({ chapters })
    } finally {
      set({ isSaving: false })
    }
  },

  updateOutline: async (id, outline) => {
    set({ isSaving: true })
    try {
      const outlineJson = JSON.stringify(outline)
      const novel = await novelRepo.updateOutline(id, outlineJson)
      set({ currentNovel: novel, hasUnsavedChanges: false })
    } finally {
      set({ isSaving: false })
    }
  },

  updateWorldBuilding: async (id, worldBuilding) => {
    set({ isSaving: true })
    try {
      const worldBuildingJson = JSON.stringify(worldBuilding)
      const novel = await novelRepo.updateWorldBuilding(id, worldBuildingJson)
      set({ currentNovel: novel, hasUnsavedChanges: false })
    } finally {
      set({ isSaving: false })
    }
  },

  // 状态操作
  setSaving: (isSaving) => set({ isSaving }),
  setLoading: (isLoading) => set({ isLoading }),
  setUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),

  reset: () =>
    set({
      currentNovel: null,
      currentChapter: null,
      chapters: [],
      outline: [],
      isSaving: false,
      isLoading: false,
      hasUnsavedChanges: false,
    }),
}))
