/**
 * LocalStorage 本地存储服务
 * 作为 Tauri SQLite 的 fallback，在浏览器环境中使用
 */

import type { Novel, Chapter, Character, Knowledge, GlossaryEntry, Prompt } from '@/types/entities'

// 重新导出类型供外部使用
export type { Novel, Chapter, Character, Knowledge, GlossaryEntry, Prompt }

// ============ 通用存储函数 ============

function getStorageKey(type: string): string {
  return `aiwrite_${type}`
}

function getAll<T>(type: string): T[] {
  try {
    const data = localStorage.getItem(getStorageKey(type))
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function setAll<T>(type: string, items: T[]): void {
  localStorage.setItem(getStorageKey(type), JSON.stringify(items))
}

function getById<T extends { id: string }>(type: string, id: string): T | null {
  const items = getAll<T>(type)
  return items.find(item => item.id === id) || null
}

function create<T extends { id: string }>(type: string, item: T): T {
  const items = getAll<T>(type)
  items.unshift(item)
  setAll(type, items)
  return item
}

function update<T extends { id: string }>(type: string, id: string, updates: Partial<T>): T | null {
  const items = getAll<T>(type)
  const index = items.findIndex(item => item.id === id)
  if (index === -1) return null

  items[index] = { ...items[index], ...updates }
  setAll(type, items)
  return items[index]
}

function remove(type: string, id: string): boolean {
  const items = getAll<{ id: string }>(type)
  const index = items.findIndex(item => item.id === id)
  if (index === -1) return false

  items.splice(index, 1)
  setAll(type, items)
  return true
}

// ============ 仓库实现 ============

export const localNovelRepo = {
  getAll: () => getAll<Novel>('novels'),

  getById: (id: string) => getById<Novel>('novels', id),

  create: (data: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => {
    const novel: Novel = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      wordCount: data.wordCount ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    return create('novels', novel)
  },

  update: (id: string, data: Partial<Novel>) => {
    return update('novels', id, { ...data, updatedAt: Date.now() })
  },

  delete: (id: string) => remove('novels', id)
}

export const localChapterRepo = {
  getByNovelId: (novelId: string) => {
    const chapters = getAll<Chapter>('chapters')
    return chapters.filter(c => c.novelId === novelId).sort((a, b) => a.orderIndex - b.orderIndex)
  },

  getById: (id: string) => getById<Chapter>('chapters', id),

  create: (novelId: string, data: Omit<Chapter, 'id' | 'novelId' | 'createdAt' | 'updatedAt'>) => {
    const chapters = getAll<Chapter>('chapters').filter(c => c.novelId === novelId)
    const maxOrder = chapters.length > 0 ? Math.max(...chapters.map(c => c.orderIndex)) : -1

    const chapter: Chapter = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      novelId,
      orderIndex: data.orderIndex ?? maxOrder + 1,
      wordCount: data.wordCount ?? 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    return create('chapters', chapter)
  },

  update: (id: string, data: Partial<Chapter>) => {
    return update('chapters', id, { ...data, updatedAt: Date.now() })
  },

  delete: (id: string) => remove('chapters', id)
}

export const localCharacterRepo = {
  getAll: (novelId?: string) => {
    const characters = getAll<Character>('characters')
    if (novelId) {
      return characters.filter(c => c.novelId === novelId)
    }
    return characters
  },

  getById: (id: string) => getById<Character>('characters', id),

  create: (data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => {
    const character: Character = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    return create('characters', character)
  },

  update: (id: string, data: Partial<Character>) => {
    return update('characters', id, { ...data, updatedAt: Date.now() })
  },

  delete: (id: string) => remove('characters', id)
}

export const localKnowledgeRepo = {
  getAll: (novelId?: string) => {
    const items = getAll<Knowledge>('knowledge')
    if (novelId) {
      return items.filter(k => k.novelId === novelId)
    }
    return items
  },

  getById: (id: string) => getById<Knowledge>('knowledge', id),

  create: (data: Omit<Knowledge, 'id' | 'createdAt' | 'updatedAt'>) => {
    const item: Knowledge = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    return create('knowledge', item)
  },

  update: (id: string, data: Partial<Knowledge>) => {
    return update('knowledge', id, { ...data, updatedAt: Date.now() })
  },

  delete: (id: string) => remove('knowledge', id),

  search: (query: string, novelId?: string) => {
    const items = getAll<Knowledge>('knowledge')
    const lowerQuery = query.toLowerCase()
    return items.filter(k => {
      const matchQuery = !query ||
        k.title.toLowerCase().includes(lowerQuery) ||
        (k.content && k.content.toLowerCase().includes(lowerQuery))
      const matchNovel = !novelId || k.novelId === novelId
      return matchQuery && matchNovel
    })
  }
}

export const localGlossaryRepo = {
  getAll: (novelId?: string) => {
    const items = getAll<GlossaryEntry>('glossary')
    if (novelId) {
      return items.filter(g => g.novelId === novelId)
    }
    return items
  },

  getById: (id: string) => getById<GlossaryEntry>('glossary', id),

  create: (data: Omit<GlossaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const item: GlossaryEntry = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    return create('glossary', item)
  },

  update: (id: string, data: Partial<GlossaryEntry>) => {
    return update('glossary', id, { ...data, updatedAt: Date.now() })
  },

  delete: (id: string) => remove('glossary', id),

  search: (query: string, novelId?: string) => {
    const items = getAll<GlossaryEntry>('glossary')
    const lowerQuery = query.toLowerCase()
    return items.filter(g => {
      const matchQuery = !query ||
        g.title.toLowerCase().includes(lowerQuery) ||
        (g.definition && g.definition.toLowerCase().includes(lowerQuery))
      const matchNovel = !novelId || g.novelId === novelId
      return matchQuery && matchNovel
    })
  }
}

export const localPromptRepo = {
  getAll: (category?: string) => {
    const prompts = getAll<Prompt>('prompts')
    if (category) {
      return prompts.filter(p => p.category === category)
    }
    return prompts
  },

  getById: (id: string) => getById<Prompt>('prompts', id),

  create: (data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const prompt: Prompt = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isFavorite: data.isFavorite ?? false,
      usageCount: data.usageCount ?? 0,
      isFeatured: data.isFeatured ?? false,
      isBuiltin: data.isBuiltin ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    return create('prompts', prompt)
  },

  update: (id: string, data: Partial<Prompt>) => {
    return update('prompts', id, { ...data, updatedAt: Date.now() })
  },

  delete: (id: string) => remove('prompts', id),

  search: (keyword: string, category?: string) => {
    const prompts = getAll<Prompt>('prompts')
    const lowerKeyword = keyword.toLowerCase()
    return prompts.filter(p => {
      const matchKeyword = !keyword ||
        p.title.toLowerCase().includes(lowerKeyword) ||
        p.content.toLowerCase().includes(lowerKeyword)
      const matchCategory = !category || p.category === category
      return matchKeyword && matchCategory
    })
  }
}
