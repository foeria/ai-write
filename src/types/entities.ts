/**
 * 统一的数据类型定义
 * 与后端 SQLite 数据库字段保持一致，使用 camelCase
 */

// ============ 核心实体类型 ============

/** 小说 */
export interface Novel {
  id: string
  title: string
  description?: string
  genre?: string          // 分类/题材
  category?: string       // 作品分类（细分）
  tags?: string           // 标签
  author?: string         // 作者
  status?: 'draft' | 'writing' | 'completed' | 'paused' // 状态
  targetWords?: number     // 目标字数
  contentRating?: string  // 内容分级
  coverImage?: string     // 封面图（base64 或路径）
  wordCount: number       // 字数统计
  createdAt: number        // 时间戳
  updatedAt: number        // 时间戳

  // 大纲和世界观（JSON 字符串）
  outline?: string
  worldBuilding?: string

  // 创作设定
  theme?: string           // 主题
  style?: string           // 写作风格
  tone?: string            // 整体基调
  era?: string             // 时代背景
  location?: string        // 地点设定
  worldType?: string       // 世界类型
  coreHook?: string        // 核心梗概
  mainTags?: string        // 主标签
  subTags?: string         // 辅标签
  targetAudience?: string  // 目标读者

  // 主角设定
  protagonistName?: string  // 主角名称
  protagonistAge?: string   // 主角年龄
  protagonistBackground?: string // 主角背景
  protagonistGoal?: string  // 主角目标

  // 世界观基础
  worldArchitecture?: string // 世界观架构
  powerSystem?: string       // 力量体系
  goldenFinger?: string     // 金手指

  // 系列设定
  isPartOfSeries?: boolean   // 是否系列作品
  seriesName?: string        // 系列名称
  bookNumber?: number         // 本书册数
  totalBooks?: number        // 总册数

  // ============ 兼容旧版字段（可选）============
  chapterCount?: number
}

/** 章节 */
export interface Chapter {
  id: string
  novelId: string
  volumeId?: string       // 所属卷 ID
  title: string
  content?: string        // Markdown 内容
  outline?: string       // 章节细纲
  orderIndex: number      // 排序索引
  wordCount: number       // 字数
  createdAt: number
  updatedAt: number
}

/** 角色 */
export interface Character {
  id: string
  name: string
  gender?: string         // male, female, other
  age?: string
  appearance?: string     // 外貌描述
  personality?: string    // 性格描述
  background?: string     // 背景故事
  novelId?: string        // 所属小说
  createdAt: number
  updatedAt: number
  status?: 'enabled' | 'disabled' // 启用/未启用状态

  // ============ 兼容旧版字段（可选）============
  role?: string           // protagonist, supporting, antagonist, minor
  abilities?: string[]    // 法术/技能
  relationships?: string[] // 关系
  tags?: string[]         // 标签
  avatar?: string         // 头像
  nickname?: string       // 昵称
}

/** 知识条目 */
export interface Knowledge {
  id: string
  title: string
  category?: string       // 分类
  content?: string        // 内容
  tags?: string           // 标签（逗号分隔）
  novelId?: string
  createdAt: number
  updatedAt: number
}

/** 写作进度 */
export interface WritingProgress {
  id: string
  novelId: string
  currentChapterId?: string
  totalChapters: number
  completedChapters: number
  dailyWordCount: number
  lastWrittenAt?: number
}

// ============ 简化类型（用于创建/更新）============

/** 创建小说（无需传入时间戳） */
export type CreateNovel = Omit<Novel, 'createdAt' | 'updatedAt'>

/** 更新小说 */
export type UpdateNovel = Partial<CreateNovel>

/** 创建章节 */
export type CreateChapter = Omit<Chapter, 'createdAt' | 'updatedAt'>

/** 更新章节 */
export type UpdateChapter = Partial<CreateChapter>

/** 创建角色 */
export type CreateCharacter = Omit<Character, 'createdAt' | 'updatedAt'>

/** 更新角色 */
export type UpdateCharacter = Partial<CreateCharacter>

/** 创建知识条目 */
export type CreateKnowledge = Omit<Knowledge, 'createdAt' | 'updatedAt'>

/** 更新知识条目 */
export type UpdateKnowledge = Partial<CreateKnowledge>

// ============ 列表查询类型 ============

/** 分页参数 */
export interface PaginationParams {
  page?: number
  limit?: number
}

/** 列表响应 */
export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

/** 小说列表查询 */
export interface NovelListParams extends PaginationParams {
  status?: string
}

/** 章节列表查询 */
export interface ChapterListParams extends PaginationParams {}

/** 角色列表查询 */
export interface CharacterListParams extends PaginationParams {
  novelId?: string
  keyword?: string
}

/** 知识列表查询 */
export interface KnowledgeListParams extends PaginationParams {
  novelId?: string
  category?: string
  keyword?: string
}

/** 词条 */
export interface GlossaryEntry {
  id: string
  title: string
  category?: string
  definition?: string
  description?: string
  tags?: string[]
  relatedItems?: string[]
  source?: string
  novelId?: string
  createdAt: number
  updatedAt: number
}

/** 提示词 */
export interface Prompt {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  isFavorite: boolean
  usageCount: number
  isFeatured: boolean
  isBuiltin: boolean
  createdAt: number
  updatedAt: number
}
