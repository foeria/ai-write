/**
 * localStorage → SQLite 数据迁移
 * 仅在 Tauri 环境下、且 SQLite 为空时执行一次
 */
import { invoke, isTauri } from '@tauri-apps/api/core'

const MIGRATION_KEY = 'aiwrite_migrated_to_sqlite_v1'

function getLocalData<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(`aiwrite_${key}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function migrateLocalStorageToSQLite(): Promise<void> {
  if (!isTauri()) return
  if (localStorage.getItem(MIGRATION_KEY) === 'true') return

  console.log('%c[Migration] 开始 localStorage → SQLite 迁移...', 'color:orange;font-weight:bold')

  try {
    // 1. 先检查 SQLite 中是否已有数据
    const existingNovels = await invoke<any[]>('novel_get_all')
    if (existingNovels.length > 0) {
      console.log(`[Migration] SQLite 已有 ${existingNovels.length} 篇小说，跳过迁移`)
      localStorage.setItem(MIGRATION_KEY, 'true')
      return
    }

    // 2. 读取 localStorage 数据
    const novels = getLocalData<any>('novels')
    const chapters = getLocalData<any>('chapters')
    const characters = getLocalData<any>('characters')
    const knowledge = getLocalData<any>('knowledge')
    const glossary = getLocalData<any>('glossary')
    const prompts = getLocalData<any>('prompts')

    const total = novels.length + chapters.length + characters.length
      + knowledge.length + glossary.length + prompts.length

    if (total === 0) {
      console.log('[Migration] localStorage 无数据，无需迁移')
      localStorage.setItem(MIGRATION_KEY, 'true')
      return
    }

    console.log(`[Migration] 发现数据：小说 ${novels.length}，章节 ${chapters.length}，人物 ${characters.length}，知识库 ${knowledge.length}，词条 ${glossary.length}，提示词 ${prompts.length}`)

    let successCount = 0
    let errorCount = 0

    // 3. 先迁移小说（其他表依赖 novel_id）
    for (const novel of novels) {
      try {
        const n = {
          id: novel.id,
          title: novel.title || '未命名',
          description: novel.description ?? null,
          genre: novel.genre ?? null,
          category: novel.category ?? null,
          tags: novel.tags ?? null,
          author: novel.author ?? null,
          status: novel.status ?? 'draft',
          targetWords: novel.targetWords ?? novel.target_words ?? 300000,
          contentRating: novel.contentRating ?? novel.content_rating ?? 'general',
          coverImage: novel.coverImage ?? novel.cover_image ?? null,
          outline: novel.outline ?? null,
          worldBuilding: novel.worldBuilding ?? novel.world_building ?? null,
          theme: novel.theme ?? null,
          style: novel.style ?? null,
          tone: novel.tone ?? null,
          era: novel.era ?? null,
          location: novel.location ?? null,
          worldType: novel.worldType ?? novel.world_type ?? null,
          coreHook: novel.coreHook ?? novel.core_hook ?? null,
          mainTags: novel.mainTags ?? novel.main_tags ?? null,
          subTags: novel.subTags ?? novel.sub_tags ?? null,
          targetAudience: novel.targetAudience ?? novel.target_audience ?? null,
          protagonistName: novel.protagonistName ?? novel.protagonist_name ?? null,
          protagonistAge: novel.protagonistAge ?? novel.protagonist_age ?? null,
          protagonistBackground: novel.protagonistBackground ?? novel.protagonist_background ?? null,
          protagonistGoal: novel.protagonistGoal ?? novel.protagonist_goal ?? null,
          worldArchitecture: novel.worldArchitecture ?? novel.world_architecture ?? null,
          powerSystem: novel.powerSystem ?? novel.power_system ?? null,
          goldenFinger: novel.goldenFinger ?? novel.golden_finger ?? null,
          isPartOfSeries: novel.isPartOfSeries ?? novel.is_part_of_series ?? false,
          seriesName: novel.seriesName ?? novel.series_name ?? null,
          bookNumber: novel.bookNumber ?? novel.book_number ?? 1,
          totalBooks: novel.totalBooks ?? novel.total_books ?? 1,
          wordCount: novel.wordCount ?? novel.word_count ?? 0,
          createdAt: novel.createdAt ?? novel.created_at ?? Date.now(),
          updatedAt: novel.updatedAt ?? novel.updated_at ?? Date.now(),
        }
        await invoke('novel_create', { novel: n })
        successCount++
      } catch (e) {
        console.error(`[Migration] 小说 "${novel.title}" 迁移失败:`, e)
        errorCount++
      }
    }

    // 4. 迁移章节
    for (const chapter of chapters) {
      try {
        const c = {
          id: chapter.id,
          novelId: chapter.novelId ?? chapter.novel_id,
          volumeId: chapter.volumeId ?? chapter.volume_id ?? null,
          title: chapter.title || '未命名章节',
          content: chapter.content ?? null,
          outline: chapter.outline ?? null,
          orderIndex: chapter.orderIndex ?? chapter.order_index ?? 0,
          wordCount: chapter.wordCount ?? chapter.word_count ?? 0,
          createdAt: chapter.createdAt ?? chapter.created_at ?? Date.now(),
          updatedAt: chapter.updatedAt ?? chapter.updated_at ?? Date.now(),
        }
        await invoke('chapter_create', { chapter: c })
        successCount++
      } catch (e) {
        console.warn(`[Migration] 章节 "${chapter.title}" 迁移失败:`, e)
        errorCount++
      }
    }

    // 5. 迁移人物
    for (const char of characters) {
      try {
        const c = {
          id: char.id,
          name: char.name || '未命名人物',
          gender: char.gender ?? null,
          age: char.age ?? null,
          appearance: char.appearance ?? null,
          personality: char.personality ?? null,
          background: char.background ?? null,
          novelId: char.novelId ?? char.novel_id ?? null,
          createdAt: char.createdAt ?? char.created_at ?? Date.now(),
          updatedAt: char.updatedAt ?? char.updated_at ?? Date.now(),
        }
        await invoke('character_create', { character: c })
        successCount++
      } catch (e) {
        console.warn(`[Migration] 人物 "${char.name}" 迁移失败:`, e)
        errorCount++
      }
    }

    // 6. 迁移知识库
    for (const item of knowledge) {
      try {
        const k = {
          id: item.id,
          title: item.title || '未命名',
          category: item.category ?? null,
          content: item.content ?? null,
          tags: item.tags ?? null,
          novelId: item.novelId ?? item.novel_id ?? null,
          createdAt: item.createdAt ?? item.created_at ?? Date.now(),
          updatedAt: item.updatedAt ?? item.updated_at ?? Date.now(),
        }
        await invoke('knowledge_create', { knowledge: k })
        successCount++
      } catch (e) {
        console.warn(`[Migration] 知识库 "${item.title}" 迁移失败:`, e)
        errorCount++
      }
    }

    // 7. 迁移词条（localStorage 用 title/definition，SQLite 用 name/description）
    for (const entry of glossary) {
      try {
        const e = {
          id: entry.id,
          name: entry.title ?? entry.name ?? '未命名',
          category: entry.category ?? null,
          description: entry.definition ?? entry.description ?? null,
          novelId: entry.novelId ?? entry.novel_id ?? null,
          createdAt: entry.createdAt ?? entry.created_at ?? Date.now(),
          updatedAt: entry.updatedAt ?? entry.updated_at ?? Date.now(),
        }
        await invoke('entry_create', { entry: e })
        successCount++
      } catch (e) {
        console.warn(`[Migration] 词条迁移失败:`, e)
        errorCount++
      }
    }

    // 8. 迁移提示词
    for (const prompt of prompts) {
      try {
        const p = {
          id: prompt.id,
          title: prompt.title || '未命名提示词',
          content: prompt.content || '',
          category: prompt.category ?? null,
          tags: Array.isArray(prompt.tags) ? prompt.tags.join(',') : (prompt.tags ?? null),
          isFavorite: typeof prompt.isFavorite === 'boolean' ? (prompt.isFavorite ? 1 : 0) : (prompt.isFavorite ?? 0),
          usageCount: prompt.usageCount ?? 0,
          isFeatured: typeof prompt.isFeatured === 'boolean' ? (prompt.isFeatured ? 1 : 0) : (prompt.isFeatured ?? 0),
          isBuiltin: typeof prompt.isBuiltin === 'boolean' ? (prompt.isBuiltin ? 1 : 0) : (prompt.isBuiltin ?? 0),
          createdAt: prompt.createdAt ?? Date.now(),
          updatedAt: prompt.updatedAt ?? Date.now(),
        }
        await invoke('prompt_create', { prompt: p })
        successCount++
      } catch (e) {
        console.warn(`[Migration] 提示词 "${prompt.title}" 迁移失败:`, e)
        errorCount++
      }
    }

    console.log(
      `%c[Migration] 迁移完成：成功 ${successCount} 条，失败 ${errorCount} 条`,
      'color:green;font-weight:bold'
    )

    // 标记迁移完成（即使有部分失败）
    localStorage.setItem(MIGRATION_KEY, 'true')

  } catch (e) {
    console.error('[Migration] 迁移过程出现严重错误:', e)
    // 不标记完成，下次还会重试
  }
}
