/**
 * 前端专用类型（与后端对齐但包含前端特性）
 */

// 扩展 Novel 类型（添加前端状态字段）
import type { Novel as BaseNovel } from './entities'

export interface Novel extends BaseNovel {
  status?: 'draft' | 'writing' | 'completed'
  chapterCount?: number
}

// 扩展 Chapter 类型
import type { Chapter as BaseChapter } from './entities'

export interface Chapter extends BaseChapter {
  status?: 'draft' | 'edited' | 'ai-assisted'
}

// 大纲节点类型
export interface OutlineNode {
  id: string
  title: string
  content?: string
  children: OutlineNode[]
  expanded?: boolean
}
