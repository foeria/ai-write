/**
 * 统一数据访问层 (Repository Pattern)
 * 自动选择数据源：
 * - Tauri 环境 → SQLite 本地存储
 * - 非 Tauri 环境 → localStorage 本地存储
 *
 * 统一的类型定义，与后端 SQLite 保持一致
 */
import { invoke, isTauri } from '@tauri-apps/api/core'
import {
  localNovelRepo,
  localChapterRepo,
  localCharacterRepo,
  localKnowledgeRepo,
  localGlossaryRepo,
  localPromptRepo
} from './localStorage'
import type {
  Novel, Chapter, Character, Knowledge,
  CreateNovel, UpdateNovel,
  CreateChapter, UpdateChapter,
  CreateCharacter, UpdateCharacter,
  CreateKnowledge, UpdateKnowledge,
  GlossaryEntry,
  Prompt
} from '@/types/entities'

// 环境检测（使用 Tauri 2.x 官方 API）
// window.__TAURI__ 在 Tauri 2.x 已移除，必须使用 isTauri() 函数

// ============ 启动诊断 ============
;(function diagnoseTauriEnv() {
  const tauriDetected = isTauri()
  console.log(
    `%c[Repository] 环境检测: isTauri()=${tauriDetected}`,
    tauriDetected ? 'color:green;font-weight:bold' : 'color:red;font-weight:bold'
  )
  console.log('[Repository] window.__TAURI__:', (window as any).__TAURI__)
  console.log('[Repository] window.__TAURI_INTERNALS__:', (window as any).__TAURI_INTERNALS__)
  if (!tauriDetected) {
    console.warn('[Repository] ⚠️ 未检测到 Tauri 环境，所有数据将保存到 localStorage！')
  } else {
    // 测试 SQLite 是否正常工作
    invoke<Novel[]>('novel_get_all').then(r => {
      console.log(`%c[Repository] ✅ SQLite 连接正常，现有小说: ${r.length} 篇`, 'color:green;font-weight:bold')
    }).catch(e => {
      console.error('[Repository] ❌ SQLite 连接测试失败:', e)
    })
  }
})()

// ============ 工具函数 ============

/** 生成唯一 ID */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/** 时间戳转换 */
export const toTimestamp = (date?: string | Date): number => {
  if (!date) return Date.now()
  return new Date(date).getTime()
}

// ============ 小说仓库 ============

export const novelRepo = {
  /** 获取所有小说 */
  async getAll(): Promise<Novel[]> {
    const inTauri = isTauri()
    console.log(`[novelRepo.getAll] isTauri=${inTauri}`)
    if (inTauri) {
      try {
        const result = await invoke<Novel[]>('novel_get_all')
        console.log(`[novelRepo.getAll] ✅ SQLite 成功，返回 ${result.length} 条`)
        return result
      } catch (e) {
        console.error('[novelRepo.getAll] ❌ Tauri invoke 失败:', e)
      }
    }
    console.log('[novelRepo.getAll] → 使用 localStorage')
    return localNovelRepo.getAll()
  },

  /** 根据 ID 获取小说 */
  async getById(id: string): Promise<Novel | null> {
    if (isTauri()) {
      try {
        return await invoke<Novel | null>('novel_get_by_id', { id })
      } catch (e) {
        console.error('[novelRepo.getById] ❌ Tauri invoke 失败:', e)
      }
    }
    return localNovelRepo.getById(id)
  },

  /** 创建小说 */
  async create(data: CreateNovel): Promise<Novel> {
    const novel: Novel = {
      ...data,
      id: generateId(),
      wordCount: data.wordCount ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const inTauri = isTauri()
    console.log(`[novelRepo.create] isTauri=${inTauri}，标题: ${novel.title}`)
    if (inTauri) {
      try {
        const result = await invoke<Novel>('novel_create', { novel })
        console.log('[novelRepo.create] ✅ SQLite 写入成功:', result.id)
        return result
      } catch (e) {
        console.error('[novelRepo.create] ❌ Tauri invoke 失败:', e)
      }
    }
    console.log('[novelRepo.create] → 使用 localStorage')
    return localNovelRepo.create(data)
  },

  /** 更新小说 */
  async update(id: string, data: UpdateNovel): Promise<Novel> {
    const existing = await this.getById(id)
    if (!existing) throw new Error('Novel not found')

    const updated: Novel = {
      ...existing,
      ...data,
      updatedAt: Date.now()
    }

    const inTauri = isTauri()
    console.log(`[novelRepo.update] isTauri=${inTauri}，id: ${id}`)
    if (inTauri) {
      try {
        const result = await invoke<Novel>('novel_update', { novel: updated })
        console.log('[novelRepo.update] ✅ SQLite 更新成功')
        return result
      } catch (e) {
        console.error('[novelRepo.update] ❌ Tauri invoke 失败:', e)
      }
    }
    console.log('[novelRepo.update] → 使用 localStorage')
    return localNovelRepo.update(id, data) || existing
  },

  /** 删除小说 */
  async delete(id: string): Promise<void> {
    if (isTauri()) {
      try {
        return await invoke('novel_delete', { id })
      } catch (e) {
        console.error('[novelRepo.delete] ❌ Tauri invoke 失败:', e)
      }
    }
    localNovelRepo.delete(id)
  },

  /** 更新小说大纲 */
  async updateOutline(id: string, outline: string): Promise<Novel> {
    return this.update(id, { outline })
  },

  /** 更新小说世界观 */
  async updateWorldBuilding(id: string, worldBuilding: string): Promise<Novel> {
    return this.update(id, { worldBuilding })
  }
}

// ============ 章节仓库 ============

export const chapterRepo = {
  /** 获取小说的所有章节 */
  async getByNovelId(novelId: string): Promise<Chapter[]> {
    if (isTauri()) {
      try {
        return await invoke<Chapter[]>('chapter_get_by_novel', { novelId })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localChapterRepo.getByNovelId(novelId)
  },

  /** 根据 ID 获取章节 */
  async getById(id: string): Promise<Chapter | null> {
    if (isTauri()) {
      try {
        return await invoke<Chapter | null>('chapter_get_by_id', { id })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localChapterRepo.getById(id)
  },

  /** 创建章节 */
  async create(novelId: string, data: CreateChapter): Promise<Chapter> {
    const chapters = await this.getByNovelId(novelId)
    const maxOrder = chapters.length > 0
      ? Math.max(...chapters.map(c => c.orderIndex))
      : -1

    const chapter: Chapter = {
      ...data,
      id: generateId(),
      novelId,
      orderIndex: data.orderIndex ?? maxOrder + 1,
      wordCount: data.wordCount ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    if (isTauri()) {
      try {
        return await invoke<Chapter>('chapter_create', { chapter })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localChapterRepo.create(novelId, data)
  },

  /** 更新章节 */
  async update(id: string, data: UpdateChapter): Promise<Chapter> {
    const existing = await this.getById(id)
    if (!existing) throw new Error('Chapter not found')

    // 计算字数
    let wordCount = existing.wordCount
    if (data.content !== undefined) {
      wordCount = data.content.replace(/[#*`~\[\]]/g, '').length
    }

    const updated: Chapter = {
      ...existing,
      ...data,
      wordCount,
      updatedAt: Date.now()
    }

    if (isTauri()) {
      try {
        return await invoke<Chapter>('chapter_update', { chapter: updated })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localChapterRepo.update(id, data) || existing
  },

  /** 删除章节 */
  async delete(id: string): Promise<void> {
    if (isTauri()) {
      try {
        return await invoke('chapter_delete', { id })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    localChapterRepo.delete(id)
  },

  /** 批量更新章节顺序 */
  async reorder(novelId: string, orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.update(orderedIds[i], { orderIndex: i })
    }
  },

  /** 更新章节细纲 */
  async updateOutline(id: string, outline: string): Promise<Chapter> {
    return this.update(id, { outline })
  }
}

// ============ 角色仓库 ============

export const characterRepo = {
  /** 获取所有角色（可选按小说筛选） */
  async getAll(novelId?: string): Promise<Character[]> {
    if (isTauri()) {
      try {
        return await invoke<Character[]>('character_get_all', { novelId: novelId || null })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localCharacterRepo.getAll(novelId)
  },

  /** 根据 ID 获取角色 */
  async getById(id: string): Promise<Character | null> {
    if (isTauri()) {
      try {
        return await invoke<Character | null>('character_get_by_id', { id })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localCharacterRepo.getById(id)
  },

  /** 创建角色 */
  async create(data: CreateCharacter): Promise<Character> {
    const character: Character = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    if (isTauri()) {
      try {
        return await invoke<Character>('character_create', { character })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localCharacterRepo.create(data)
  },

  /** 更新角色 */
  async update(id: string, data: UpdateCharacter): Promise<Character> {
    const existing = await this.getById(id)
    if (!existing) throw new Error('Character not found')

    const updated: Character = {
      ...existing,
      ...data,
      updatedAt: Date.now()
    }

    if (isTauri()) {
      try {
        return await invoke<Character>('character_update', { character: updated })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localCharacterRepo.update(id, data) || existing
  },

  /** 删除角色 */
  async delete(id: string): Promise<void> {
    if (isTauri()) {
      try {
        return await invoke('character_delete', { id })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    localCharacterRepo.delete(id)
  }
}

// ============ 知识库仓库 ============

export const knowledgeRepo = {
  /** 获取所有知识（可选按小说筛选） */
  async getAll(novelId?: string): Promise<Knowledge[]> {
    if (isTauri()) {
      try {
        return await invoke<Knowledge[]>('knowledge_get_all', { novelId: novelId || null })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localKnowledgeRepo.getAll(novelId)
  },

  /** 根据 ID 获取知识 */
  async getById(id: string): Promise<Knowledge | null> {
    if (isTauri()) {
      try {
        return await invoke<Knowledge | null>('knowledge_get_by_id', { id })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localKnowledgeRepo.getById(id)
  },

  /** 创建知识 */
  async create(data: CreateKnowledge): Promise<Knowledge> {
    const knowledge: Knowledge = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    if (isTauri()) {
      try {
        return await invoke<Knowledge>('knowledge_create', { knowledge })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localKnowledgeRepo.create(data)
  },

  /** 更新知识 */
  async update(id: string, data: UpdateKnowledge): Promise<Knowledge> {
    const existing = await this.getById(id)
    if (!existing) throw new Error('Knowledge not found')

    const updated: Knowledge = {
      ...existing,
      ...data,
      updatedAt: Date.now()
    }

    if (isTauri()) {
      try {
        return await invoke<Knowledge>('knowledge_update', { knowledge: updated })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localKnowledgeRepo.update(id, data) || existing
  },

  /** 删除知识 */
  async delete(id: string): Promise<void> {
    if (isTauri()) {
      try {
        return await invoke('knowledge_delete', { id })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    localKnowledgeRepo.delete(id)
  },

  /** 搜索知识 */
  async search(query: string, novelId?: string): Promise<Knowledge[]> {
    if (isTauri()) {
      try {
        return await invoke<Knowledge[]>('knowledge_search', { query, novelId: novelId || null })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localKnowledgeRepo.search(query, novelId)
  }
}

// ============ 词条仓库 ============

export const glossaryRepo = {
  /** 从 Rust Entry 转换为 TypeScript GlossaryEntry（字段名映射） */
  _fromRust(entry: any): GlossaryEntry {
    return {
      id: entry.id,
      title: entry.name || entry.title || '',
      category: entry.category || undefined,
      definition: entry.description || undefined,
      novelId: entry.novelId || undefined,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }
  },

  /** 将 TypeScript GlossaryEntry 转换为 Rust Entry 格式 */
  _toRust(entry: Partial<GlossaryEntry> & { id: string; createdAt: number; updatedAt: number }): any {
    return {
      id: entry.id,
      name: entry.title || '',
      category: entry.category || null,
      description: entry.definition || null,
      novelId: entry.novelId || null,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }
  },

  /** 获取所有词条（可选按小说筛选） */
  async getAll(novelId?: string): Promise<GlossaryEntry[]> {
    if (isTauri()) {
      try {
        const entries = await invoke<any[]>('entry_get_all', { novelId: novelId || null })
        return entries.map(e => this._fromRust(e))
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localGlossaryRepo.getAll(novelId)
  },

  /** 根据 ID 获取词条 */
  async getById(id: string): Promise<GlossaryEntry | null> {
    if (isTauri()) {
      try {
        const entries = await invoke<any[]>('entry_get_all', { novelId: null })
        const found = entries.find((e: any) => e.id === id)
        return found ? this._fromRust(found) : null
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localGlossaryRepo.getById(id)
  },

  /** 创建词条 */
  async create(data: Omit<GlossaryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<GlossaryEntry> {
    if (isTauri()) {
      try {
        const rustEntry = this._toRust({ ...data, id: generateId(), createdAt: Date.now(), updatedAt: Date.now() })
        const result = await invoke<any>('entry_create', { entry: rustEntry })
        return this._fromRust(result)
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localGlossaryRepo.create(data)
  },

  /** 更新词条 */
  async update(id: string, data: Partial<GlossaryEntry>): Promise<GlossaryEntry> {
    const existing = await this.getById(id)
    if (!existing) throw new Error('Glossary entry not found')

    if (isTauri()) {
      try {
        const merged = { ...existing, ...data, updatedAt: Date.now() }
        const rustEntry = this._toRust(merged as any)
        const result = await invoke<any>('entry_update', { entry: rustEntry })
        return this._fromRust(result)
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localGlossaryRepo.update(id, data) || existing
  },

  /** 删除词条 */
  async delete(id: string): Promise<void> {
    if (isTauri()) {
      try {
        return await invoke('entry_delete', { id })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    localGlossaryRepo.delete(id)
  },

  /** 搜索词条 */
  async search(query: string, novelId?: string): Promise<GlossaryEntry[]> {
    if (isTauri()) {
      try {
        const entries = await invoke<any[]>('entry_get_all', { novelId: novelId || null })
        const lowerQuery = query.toLowerCase()
        return entries
          .filter((e: any) =>
            (e.name && e.name.toLowerCase().includes(lowerQuery)) ||
            (e.description && e.description.toLowerCase().includes(lowerQuery))
          )
          .map(e => this._fromRust(e))
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localGlossaryRepo.search(query, novelId)
  }
}

// ============ 提示词仓库 ============

export const promptRepo = {
  /** 将 Rust Prompt 转换为 TypeScript Prompt（i32→bool, string→string[]） */
  _fromRust(p: any): Prompt {
    return {
      ...p,
      isFavorite: Boolean(p.isFavorite),
      isFeatured: Boolean(p.isFeatured),
      isBuiltin: Boolean(p.isBuiltin),
      tags: p.tags ? (typeof p.tags === 'string' ? p.tags.split(',').filter(Boolean) : p.tags) : [],
    }
  },

  /** 将 TypeScript Prompt 转换为 Rust Prompt（bool→i32, string[]→string） */
  _toRust(p: Partial<Prompt> & { id: string; createdAt: number; updatedAt: number }): any {
    return {
      ...p,
      isFavorite: p.isFavorite ? 1 : 0,
      isFeatured: p.isFeatured ? 1 : 0,
      isBuiltin: p.isBuiltin ? 1 : 0,
      tags: Array.isArray(p.tags) ? p.tags.join(',') : (p.tags || ''),
      usageCount: p.usageCount ?? 0,
    }
  },

  /** 获取所有提示词 */
  async getAll(category?: string, sortBy?: string): Promise<Prompt[]> {
    if (isTauri()) {
      try {
        const prompts = await invoke<any[]>('prompt_get_all', { category: category || null, sortBy: sortBy || null })
        return prompts.map(p => this._fromRust(p))
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localPromptRepo.getAll(category)
  },

  /** 根据 ID 获取提示词 */
  async getById(id: string): Promise<Prompt | null> {
    if (isTauri()) {
      try {
        const p = await invoke<any | null>('prompt_get_by_id', { id })
        return p ? this._fromRust(p) : null
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localPromptRepo.getById(id)
  },

  /** 创建提示词 */
  async create(data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prompt> {
    if (isTauri()) {
      try {
        const rustPrompt = this._toRust({ ...data, id: generateId(), createdAt: Date.now(), updatedAt: Date.now() })
        const result = await invoke<any>('prompt_create', { prompt: rustPrompt })
        return this._fromRust(result)
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localPromptRepo.create(data)
  },

  /** 更新提示词 */
  async update(id: string, data: Partial<Prompt>): Promise<Prompt> {
    const existing = await this.getById(id)
    if (!existing) throw new Error('Prompt not found')

    if (isTauri()) {
      try {
        const merged = { ...existing, ...data, updatedAt: Date.now() }
        const rustPrompt = this._toRust(merged as any)
        const result = await invoke<any>('prompt_update', { prompt: rustPrompt })
        return this._fromRust(result)
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    return localPromptRepo.update(id, data) || existing
  },

  /** 删除提示词 */
  async delete(id: string): Promise<void> {
    if (isTauri()) {
      try {
        return await invoke('prompt_delete', { id })
      } catch (e) {
        console.warn('Tauri call failed, using localStorage:', e)
      }
    }
    localPromptRepo.delete(id)
  }
}

// ============ 兼容旧版导出（SQLite Store 使用）============

// 类型导出
export { type Novel, type Chapter, type Character, type Knowledge } from './localStorage'
export type { GlossaryEntry, Prompt } from '@/types/entities'

// 小说操作兼容导出
export const getAllNovels = () => novelRepo.getAll()
export const getNovelById = (id: string) => novelRepo.getById(id)
export const createNovel = (data: any) => novelRepo.create(data)
export const updateNovel = (data: any) => novelRepo.update(data.id, data)
export const deleteNovel = (id: string) => novelRepo.delete(id)

// 章节操作兼容导出
export const getChaptersByNovelId = (novelId: string) => chapterRepo.getByNovelId(novelId)
export const getChapterById = (id: string) => chapterRepo.getById(id)
export const createChapter = (data: any) => chapterRepo.create(data.novelId, data)
export const updateChapter = (data: any) => chapterRepo.update(data.id, data)
export const deleteChapter = (id: string) => chapterRepo.delete(id)

// 角色操作兼容导出
export const getAllCharacters = (novelId?: string) => characterRepo.getAll(novelId)
export const getCharacterById = (id: string) => characterRepo.getById(id)
export const createCharacter = (data: any) => characterRepo.create(data)
export const updateCharacter = (data: any) => characterRepo.update(data.id, data)
export const deleteCharacter = (id: string) => characterRepo.delete(id)

// 知识库操作兼容导出
export const getAllKnowledge = (novelId?: string) => knowledgeRepo.getAll(novelId)
export const getKnowledgeById = (id: string) => knowledgeRepo.getById(id)
export const createKnowledge = (data: any) => knowledgeRepo.create(data)
export const updateKnowledge = (data: any) => knowledgeRepo.update(data.id, data)
export const deleteKnowledge = (id: string) => knowledgeRepo.delete(id)
export const searchKnowledge = (query: string, novelId?: string) => knowledgeRepo.search(query, novelId)

// 词条操作兼容导出
export const getAllGlossaryEntries = (novelId?: string) => glossaryRepo.getAll(novelId)
export const getGlossaryEntryById = (id: string) => glossaryRepo.getById(id)
export const createGlossaryEntry = (data: any) => glossaryRepo.create(data)
export const updateGlossaryEntry = (data: any) => glossaryRepo.update(data.id, data)
export const deleteGlossaryEntry = (id: string) => glossaryRepo.delete(id)
export const searchGlossaryEntries = (query: string, novelId?: string) => glossaryRepo.search(query, novelId)

// Book 类型（占位符）
export interface Book {
  id: string
  title: string
  author?: string
  coverImage?: string
  createdAt: number
  updatedAt: number
}

export interface BookChapter {
  id: string
  bookId: string
  title: string
  content?: string
  orderIndex: number
  createdAt: number
  updatedAt: number
}

export interface BookCategory {
  id: string
  bookId: string
  name: string
  color?: string
  createdAt: number
  updatedAt: number
}

export interface BookBookmark {
  id: string
  bookId: string
  chapterId: string
  position: number
  note?: string
  createdAt: number
}

export interface BookNote {
  id: string
  bookId: string
  chapterId?: string
  content: string
  createdAt: number
  updatedAt: number
}

export interface BookSettings {
  id: string
  bookId: string
  fontSize: number
  theme: string
}

// Book 操作兼容导出（空实现）
export const getAllBooks = async () => []
export const getBookById = async (id: string) => null
export const createBook = async (data: any) => ({ ...data, id: generateId(), createdAt: Date.now(), updatedAt: Date.now() })
export const updateBook = async (data: any) => data
export const deleteBook = async (id: string) => {}
export const searchBooks = async (query: string) => []
export const updateBookReadingProgress = async (id: string, data: any) => {}
export const getBookChaptersByBookId = async (bookId: string) => []
export const createBookCategory = async (data: any) => data
export const getAllBookCategories = async (bookId?: string) => []
export const updateBookCategory = async (data: any) => data
export const deleteBookCategory = async (id: string) => {}
export const createBookBookmark = async (data: any) => data
export const getBookmarksByBookId = async (bookId: string) => []
export const deleteBookBookmark = async (id: string) => {}
export const createBookNote = async (data: any) => data
export const getBookNotesByBookId = async (bookId: string) => []
export const updateBookNote = async (data: any) => data
export const deleteBookNote = async (id: string) => {}
export const getBookSettings = async (bookId: string) => ({ bookId, fontSize: 16, theme: 'light' })
export const updateBookSettings = async (data: any) => data

// ============ 卷仓库（Volume）============

export interface Volume {
  id: string
  novelId: string
  title: string
  orderIndex: number
  createdAt: number
  updatedAt: number
}

export const volumeRepo = {
  async getByNovelId(novelId: string): Promise<Volume[]> {
    if (isTauri()) {
      try {
        return await invoke<Volume[]>('volume_get_by_novel', { novelId })
      } catch (e) {
        console.warn('Tauri volume_get_by_novel failed:', e)
      }
    }
    return []
  },
  async create(novelId: string, title: string): Promise<Volume> {
    const volume: Volume = { id: generateId(), novelId, title, orderIndex: 0, createdAt: Date.now(), updatedAt: Date.now() }
    if (isTauri()) {
      try {
        return await invoke<Volume>('volume_create', { volume })
      } catch (e) {
        console.warn('Tauri volume_create failed:', e)
      }
    }
    return volume
  },
  async update(id: string, data: Partial<Volume>): Promise<Volume> {
    const existing = (await this.getByNovelId(data.novelId || '')).find(v => v.id === id)
    const updated = { ...existing, ...data, id, updatedAt: Date.now() } as Volume
    if (isTauri()) {
      try {
        return await invoke<Volume>('volume_update', { volume: updated })
      } catch (e) {
        console.warn('Tauri volume_update failed:', e)
      }
    }
    return updated
  },
  async delete(id: string): Promise<void> {
    if (isTauri()) {
      try {
        return await invoke('volume_delete', { id })
      } catch (e) {
        console.warn('Tauri volume_delete failed:', e)
      }
    }
  }
}

// ============ 情节卡仓库（PlotCard）============

export interface PlotCard {
  id: string
  novelId: string
  description?: string
  mood?: string
  importance?: string
  goal?: string
  orderIndex: number
  createdAt: number
  updatedAt: number
}

export const plotCardRepo = {
  async getByNovelId(novelId: string): Promise<PlotCard[]> {
    if (isTauri()) {
      try {
        return await invoke<PlotCard[]>('plot_card_get_by_novel', { novelId })
      } catch (e) {
        console.warn('Tauri plot_card_get_by_novel failed:', e)
      }
    }
    return []
  },
  async create(data: Partial<PlotCard>): Promise<PlotCard> {
    const plotCard: PlotCard = {
      id: generateId(),
      novelId: data.novelId || '',
      description: data.description,
      mood: data.mood,
      importance: data.importance,
      goal: data.goal,
      orderIndex: data.orderIndex ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    if (isTauri()) {
      try {
        return await invoke<PlotCard>('plot_card_create', { plotCard })
      } catch (e) {
        console.warn('Tauri plot_card_create failed:', e)
      }
    }
    return plotCard
  },
  async update(id: string, data: Partial<PlotCard>): Promise<PlotCard> {
    const updated = { ...data, id, updatedAt: Date.now() } as PlotCard
    if (isTauri()) {
      try {
        return await invoke<PlotCard>('plot_card_update', { plotCard: updated })
      } catch (e) {
        console.warn('Tauri plot_card_update failed:', e)
      }
    }
    return updated
  },
  async delete(id: string): Promise<void> {
    if (isTauri()) {
      try {
        return await invoke('plot_card_delete', { id })
      } catch (e) {
        console.warn('Tauri plot_card_delete failed:', e)
      }
    }
  }
}
