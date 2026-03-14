/**
 * Tauri SQLite 本地存储服务
 * 用于替代或补充远程 API，实现离线本地数据持久化
 */
import { invoke } from '@tauri-apps/api/core';

// 类型定义
export interface Novel {
  id: string;
  title: string;
  description?: string;
  genre?: string;
  cover_image?: string;
  word_count: number;
  created_at: number;
  updated_at: number;
}

export interface Chapter {
  id: string;
  novel_id: string;
  title: string;
  content?: string;
  order_index: number;
  word_count: number;
  created_at: number;
  updated_at: number;
}

export interface Character {
  id: string;
  name: string;
  gender?: string;
  age?: string;
  appearance?: string;
  personality?: string;
  background?: string;
  novel_id?: string;
  created_at: number;
  updated_at: number;
}

export interface Knowledge {
  id: string;
  title: string;
  category?: string;
  content?: string;
  tags?: string;
  novel_id?: string;
  created_at: number;
  updated_at: number;
}

// ============ 小说操作 ============

/**
 * 创建小说
 */
export async function createNovel(novel: Omit<Novel, 'created_at' | 'updated_at'>): Promise<Novel> {
  try {
    const result = await invoke<Novel>('novel_create', { novel });
    return result;
  } catch (error) {
    console.error('Failed to create novel:', error);
    throw error;
  }
}

/**
 * 获取所有小说
 */
export async function getAllNovels(): Promise<Novel[]> {
  try {
    const result = await invoke<Novel[]>('novel_get_all');
    return result;
  } catch (error) {
    console.error('Failed to get all novels:', error);
    throw error;
  }
}

/**
 * 根据ID获取小说
 */
export async function getNovelById(id: string): Promise<Novel | null> {
  try {
    const result = await invoke<Novel | null>('novel_get_by_id', { id });
    return result;
  } catch (error) {
    console.error('Failed to get novel by id:', error);
    throw error;
  }
}

/**
 * 更新小说
 */
export async function updateNovel(novel: Novel): Promise<Novel> {
  try {
    const result = await invoke<Novel>('novel_update', { novel });
    return result;
  } catch (error) {
    console.error('Failed to update novel:', error);
    throw error;
  }
}

/**
 * 删除小说
 */
export async function deleteNovel(id: string): Promise<void> {
  try {
    await invoke('novel_delete', { id });
  } catch (error) {
    console.error('Failed to delete novel:', error);
    throw error;
  }
}

// ============ 章节操作 ============

/**
 * 创建章节
 */
export async function createChapter(chapter: Omit<Chapter, 'created_at' | 'updated_at'>): Promise<Chapter> {
  try {
    const result = await invoke<Chapter>('chapter_create', { chapter });
    return result;
  } catch (error) {
    console.error('Failed to create chapter:', error);
    throw error;
  }
}

/**
 * 获取小说的所有章节
 */
export async function getChaptersByNovelId(novelId: string): Promise<Chapter[]> {
  try {
    const result = await invoke<Chapter[]>('chapter_get_by_novel', { novelId });
    return result;
  } catch (error) {
    console.error('Failed to get chapters by novel id:', error);
    throw error;
  }
}

/**
 * 根据ID获取章节
 */
export async function getChapterById(id: string): Promise<Chapter | null> {
  try {
    const result = await invoke<Chapter | null>('chapter_get_by_id', { id });
    return result;
  } catch (error) {
    console.error('Failed to get chapter by id:', error);
    throw error;
  }
}

/**
 * 更新章节
 */
export async function updateChapter(chapter: Chapter): Promise<Chapter> {
  try {
    const result = await invoke<Chapter>('chapter_update', { chapter });
    return result;
  } catch (error) {
    console.error('Failed to update chapter:', error);
    throw error;
  }
}

/**
 * 删除章节
 */
export async function deleteChapter(id: string): Promise<void> {
  try {
    await invoke('chapter_delete', { id });
  } catch (error) {
    console.error('Failed to delete chapter:', error);
    throw error;
  }
}

// ============ 人物操作 ============

/**
 * 创建人物
 */
export async function createCharacter(character: Omit<Character, 'created_at' | 'updated_at'>): Promise<Character> {
  try {
    const result = await invoke<Character>('character_create', { character });
    return result;
  } catch (error) {
    console.error('Failed to create character:', error);
    throw error;
  }
}

/**
 * 获取所有人物（可选按小说筛选）
 */
export async function getAllCharacters(novelId?: string): Promise<Character[]> {
  try {
    const result = await invoke<Character[]>('character_get_all', { novelId });
    return result;
  } catch (error) {
    console.error('Failed to get all characters:', error);
    throw error;
  }
}

/**
 * 更新人物
 */
export async function updateCharacter(character: Character): Promise<Character> {
  try {
    const result = await invoke<Character>('character_update', { character });
    return result;
  } catch (error) {
    console.error('Failed to update character:', error);
    throw error;
  }
}

/**
 * 删除人物
 */
export async function deleteCharacter(id: string): Promise<void> {
  try {
    await invoke('character_delete', { id });
  } catch (error) {
    console.error('Failed to delete character:', error);
    throw error;
  }
}

// ============ 知识库操作 ============

/**
 * 创建知识条目
 */
export async function createKnowledge(knowledge: Omit<Knowledge, 'created_at' | 'updated_at'>): Promise<Knowledge> {
  try {
    const result = await invoke<Knowledge>('knowledge_create', { knowledge });
    return result;
  } catch (error) {
    console.error('Failed to create knowledge:', error);
    throw error;
  }
}

/**
 * 获取所有知识条目（可选按小说筛选）
 */
export async function getAllKnowledge(novelId?: string): Promise<Knowledge[]> {
  try {
    const result = await invoke<Knowledge[]>('knowledge_get_all', { novelId });
    return result;
  } catch (error) {
    console.error('Failed to get all knowledge:', error);
    throw error;
  }
}

/**
 * 更新知识条目
 */
export async function updateKnowledge(knowledge: Knowledge): Promise<Knowledge> {
  try {
    const result = await invoke<Knowledge>('knowledge_update', { knowledge });
    return result;
  } catch (error) {
    console.error('Failed to update knowledge:', error);
    throw error;
  }
}

/**
 * 删除知识条目
 */
export async function deleteKnowledge(id: string): Promise<void> {
  try {
    await invoke('knowledge_delete', { id });
  } catch (error) {
    console.error('Failed to delete knowledge:', error);
    throw error;
  }
}

/**
 * 搜索知识条目
 */
export async function searchKnowledge(query: string, novelId?: string): Promise<Knowledge[]> {
  try {
    const result = await invoke<Knowledge[]>('knowledge_search', { query, novelId });
    return result;
  } catch (error) {
    console.error('Failed to search knowledge:', error);
    throw error;
  }
}

// ============ 工具函数 ============

/**
 * 测试连接
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await invoke<string>('greet', { name: 'World' });
    console.log('Tauri connection test:', result);
    return true;
  } catch (error) {
    console.error('Tauri connection failed:', error);
    return false;
  }
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============ 书籍相关类型 ============

export interface Book {
  id: string;
  title: string;
  author?: string;
  cover_image?: string;
  file_path?: string;
  file_type?: string;
  category_id?: string;
  description?: string;
  total_chapters: number;
  current_chapter: number;
  current_position: number;
  word_count: number;
  is_pinned: number;
  created_at: number;
  updated_at: number;
  last_read_at?: number;
}

export interface BookChapter {
  id: string;
  book_id: string;
  title: string;
  content?: string;
  order_index: number;
  word_count: number;
  created_at: number;
  updated_at: number;
}

export interface BookCategory {
  id: string;
  name: string;
  color?: string;
  created_at: number;
  updated_at: number;
}

export interface BookBookmark {
  id: string;
  book_id: string;
  chapter_id?: string;
  position: number;
  title?: string;
  note?: string;
  created_at: number;
}

export interface BookNote {
  id: string;
  book_id: string;
  chapter_id?: string;
  content?: string;
  highlighted_text?: string;
  page_position: number;
  created_at: number;
  updated_at: number;
}

export interface BookSettings {
  id: string;
  font_size: number;
  line_height: number;
  theme?: string;
  font_family?: string;
  created_at: number;
  updated_at: number;
}

// ============ 书籍操作 ============

export async function createBook(book: Omit<Book, 'created_at' | 'updated_at'>): Promise<Book> {
  try {
    const result = await invoke<Book>('book_create', { book });
    return result;
  } catch (error) {
    console.error('Failed to create book:', error);
    throw error;
  }
}

export async function getAllBooks(): Promise<Book[]> {
  try {
    const result = await invoke<Book[]>('book_get_all');
    return result;
  } catch (error) {
    console.error('Failed to get all books:', error);
    throw error;
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const result = await invoke<Book | null>('book_get_by_id', { id });
    return result;
  } catch (error) {
    console.error('Failed to get book by id:', error);
    throw error;
  }
}

export async function updateBook(book: Book): Promise<Book> {
  try {
    const result = await invoke<Book>('book_update', { book });
    return result;
  } catch (error) {
    console.error('Failed to update book:', error);
    throw error;
  }
}

export async function deleteBook(id: string): Promise<void> {
  try {
    await invoke('book_delete', { id });
  } catch (error) {
    console.error('Failed to delete book:', error);
    throw error;
  }
}

export async function searchBooks(query: string, categoryId?: string): Promise<Book[]> {
  try {
    const result = await invoke<Book[]>('book_search', { query, categoryId });
    return result;
  } catch (error) {
    console.error('Failed to search books:', error);
    throw error;
  }
}

export async function updateBookReadingProgress(id: string, currentChapter: number, currentPosition: number): Promise<void> {
  try {
    await invoke('book_update_reading_progress', { id, currentChapter, currentPosition });
  } catch (error) {
    console.error('Failed to update reading progress:', error);
    throw error;
  }
}

// ============ 书籍章节操作 ============

export async function createBookChapter(chapter: Omit<BookChapter, 'created_at' | 'updated_at'>): Promise<BookChapter> {
  try {
    const result = await invoke<BookChapter>('book_chapter_create', { chapter });
    return result;
  } catch (error) {
    console.error('Failed to create book chapter:', error);
    throw error;
  }
}

export async function getBookChaptersByBookId(bookId: string): Promise<BookChapter[]> {
  try {
    const result = await invoke<BookChapter[]>('book_chapters_get_by_book', { bookId });
    return result;
  } catch (error) {
    console.error('Failed to get book chapters:', error);
    throw error;
  }
}

export async function getBookChapterById(id: string): Promise<BookChapter | null> {
  try {
    const result = await invoke<BookChapter | null>('book_chapter_get_by_id', { id });
    return result;
  } catch (error) {
    console.error('Failed to get book chapter by id:', error);
    throw error;
  }
}

export async function updateBookChapter(chapter: BookChapter): Promise<BookChapter> {
  try {
    const result = await invoke<BookChapter>('book_chapter_update', { chapter });
    return result;
  } catch (error) {
    console.error('Failed to update book chapter:', error);
    throw error;
  }
}

export async function deleteBookChapter(id: string): Promise<void> {
  try {
    await invoke('book_chapter_delete', { id });
  } catch (error) {
    console.error('Failed to delete book chapter:', error);
    throw error;
  }
}

// ============ 书籍分类操作 ============

export async function createBookCategory(category: Omit<BookCategory, 'created_at' | 'updated_at'>): Promise<BookCategory> {
  try {
    const result = await invoke<BookCategory>('book_category_create', { category });
    return result;
  } catch (error) {
    console.error('Failed to create book category:', error);
    throw error;
  }
}

export async function getAllBookCategories(): Promise<BookCategory[]> {
  try {
    const result = await invoke<BookCategory[]>('book_category_get_all');
    return result;
  } catch (error) {
    console.error('Failed to get all book categories:', error);
    throw error;
  }
}

export async function updateBookCategory(category: BookCategory): Promise<BookCategory> {
  try {
    const result = await invoke<BookCategory>('book_category_update', { category });
    return result;
  } catch (error) {
    console.error('Failed to update book category:', error);
    throw error;
  }
}

export async function deleteBookCategory(id: string): Promise<void> {
  try {
    await invoke('book_category_delete', { id });
  } catch (error) {
    console.error('Failed to delete book category:', error);
    throw error;
  }
}

// ============ 书签操作 ============

export async function createBookBookmark(bookmark: Omit<BookBookmark, 'created_at'>): Promise<BookBookmark> {
  try {
    const result = await invoke<BookBookmark>('book_bookmark_create', { bookmark });
    return result;
  } catch (error) {
    console.error('Failed to create bookmark:', error);
    throw error;
  }
}

export async function getBookmarksByBookId(bookId: string): Promise<BookBookmark[]> {
  try {
    const result = await invoke<BookBookmark[]>('book_bookmarks_get_by_book', { bookId });
    return result;
  } catch (error) {
    console.error('Failed to get bookmarks:', error);
    throw error;
  }
}

export async function deleteBookBookmark(id: string): Promise<void> {
  try {
    await invoke('book_bookmark_delete', { id });
  } catch (error) {
    console.error('Failed to delete bookmark:', error);
    throw error;
  }
}

// ============ 书籍笔记操作 ============

export async function createBookNote(note: Omit<BookNote, 'created_at' | 'updated_at'>): Promise<BookNote> {
  try {
    const result = await invoke<BookNote>('book_note_create', { note });
    return result;
  } catch (error) {
    console.error('Failed to create book note:', error);
    throw error;
  }
}

export async function getBookNotesByBookId(bookId: string): Promise<BookNote[]> {
  try {
    const result = await invoke<BookNote[]>('book_notes_get_by_book', { bookId });
    return result;
  } catch (error) {
    console.error('Failed to get book notes:', error);
    throw error;
  }
}

export async function updateBookNote(note: BookNote): Promise<BookNote> {
  try {
    const result = await invoke<BookNote>('book_note_update', { note });
    return result;
  } catch (error) {
    console.error('Failed to update book note:', error);
    throw error;
  }
}

export async function deleteBookNote(id: string): Promise<void> {
  try {
    await invoke('book_note_delete', { id });
  } catch (error) {
    console.error('Failed to delete book note:', error);
    throw error;
  }
}

// ============ 书籍设置操作 ============

export async function getBookSettings(): Promise<BookSettings> {
  try {
    const result = await invoke<BookSettings>('book_settings_get');
    return result;
  } catch (error) {
    console.error('Failed to get book settings:', error);
    throw error;
  }
}

export async function updateBookSettings(settings: BookSettings): Promise<BookSettings> {
  try {
    const result = await invoke<BookSettings>('book_settings_update', { settings });
    return result;
  } catch (error) {
    console.error('Failed to update book settings:', error);
    throw error;
  }
}

// ============ 文件读取操作 ============

export async function readTextFile(path: string): Promise<string> {
  try {
    const result = await invoke<string>('read_text_file', { path });
    return result;
  } catch (error) {
    console.error('Failed to read text file:', error);
    throw error;
  }
}

// ============ 提示词类型定义 ============

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string;
  is_favorite: number;
  usage_count: number;
  is_featured: number;
  is_builtin: number;
  created_at: number;
  updated_at: number;
}

// ============ 提示词操作 ============

/**
 * 创建提示词
 */
export async function createPrompt(prompt: Omit<Prompt, 'created_at' | 'updated_at'>): Promise<Prompt> {
  try {
    const result = await invoke<Prompt>('prompt_create', { prompt });
    return result;
  } catch (error) {
    console.error('Failed to create prompt:', error);
    throw error;
  }
}

/**
 * 获取所有提示词
 */
export async function getAllPrompts(category?: string, sortBy?: string): Promise<Prompt[]> {
  try {
    const result = await invoke<Prompt[]>('prompt_get_all', { category, sortBy });
    return result;
  } catch (error) {
    console.error('Failed to get all prompts:', error);
    throw error;
  }
}

/**
 * 根据ID获取提示词
 */
export async function getPromptById(id: string): Promise<Prompt | null> {
  try {
    const result = await invoke<Prompt | null>('prompt_get_by_id', { id });
    return result;
  } catch (error) {
    console.error('Failed to get prompt by id:', error);
    throw error;
  }
}

/**
 * 更新提示词
 */
export async function updatePrompt(prompt: Prompt): Promise<Prompt> {
  try {
    const result = await invoke<Prompt>('prompt_update', { prompt });
    return result;
  } catch (error) {
    console.error('Failed to update prompt:', error);
    throw error;
  }
}

/**
 * 删除提示词
 */
export async function deletePrompt(id: string): Promise<void> {
  try {
    await invoke('prompt_delete', { id });
  } catch (error) {
    console.error('Failed to delete prompt:', error);
    throw error;
  }
}

/**
 * 增加提示词使用次数
 */
export async function incrementPromptUsage(id: string): Promise<void> {
  try {
    await invoke('prompt_increment_usage', { id });
  } catch (error) {
    console.error('Failed to increment prompt usage:', error);
  }
}

/**
 * 切换提示词收藏状态
 */
export async function togglePromptFavorite(id: string): Promise<boolean> {
  try {
    const result = await invoke<boolean>('prompt_toggle_favorite', { id });
    return result;
  } catch (error) {
    console.error('Failed to toggle prompt favorite:', error);
    throw error;
  }
}

/**
 * 获取收藏的提示词列表
 */
export async function getPromptFavorites(): Promise<Prompt[]> {
  try {
    const result = await invoke<Prompt[]>('prompt_get_favorites');
    return result;
  } catch (error) {
    console.error('Failed to get prompt favorites:', error);
    throw error;
  }
}

/**
 * 搜索提示词
 */
export async function searchPrompts(keyword: string, category?: string): Promise<Prompt[]> {
  try {
    const result = await invoke<Prompt[]>('prompt_search', { keyword, category });
    return result;
  } catch (error) {
    console.error('Failed to search prompts:', error);
    throw error;
  }
}

/**
 * 生成唯一ID
 */
export function generatePromptId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
