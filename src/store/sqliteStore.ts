/**
 * SQLite 本地存储 Zustand Store
 * 结合 Zustand 和 SQLite 实现响应式本地数据管理
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Novel,
  Chapter,
  Character,
  createNovel,
  getAllNovels,
  getNovelById,
  updateNovel,
  deleteNovel,
  createChapter,
  getChaptersByNovelId,
  updateChapter,
  deleteChapter,
  createCharacter,
  getAllCharacters,
  updateCharacter,
  deleteCharacter,
  createKnowledge,
  getAllKnowledge,
  updateKnowledge,
  deleteKnowledge,
  searchKnowledge,
  generateId,
  Book,
  BookChapter,
  BookCategory,
  BookBookmark,
  BookNote,
  BookSettings,
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks,
  updateBookReadingProgress,
  getBookChaptersByBookId,
  createBookCategory,
  getAllBookCategories,
  updateBookCategory,
  deleteBookCategory,
  createBookBookmark,
  getBookmarksByBookId,
  deleteBookBookmark,
  createBookNote,
  getBookNotesByBookId,
  updateBookNote,
  deleteBookNote,
  getBookSettings,
  updateBookSettings,
} from '@/api/repository';

// ============ 小说 Store ============

interface NovelStore {
  novels: Novel[];
  currentNovel: Novel | null;
  loading: boolean;
  error: string | null;

  // 异步操作
  fetchNovels: () => Promise<void>;
  fetchNovel: (id: string) => Promise<void>;
  addNovel: (data: Omit<Novel, 'id' | 'created_at' | 'updated_at' | 'word_count'>) => Promise<Novel>;
  modifyNovel: (novel: Novel) => Promise<Novel>;
  removeNovel: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useNovelStore = create<NovelStore>()(
  devtools(
    (set) => ({
      novels: [],
      currentNovel: null,
      loading: false,
      error: null,

      fetchNovels: async () => {
        set({ loading: true, error: null });
        try {
          const novels = await getAllNovels();
          set({ novels, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      fetchNovel: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const novel = await getNovelById(id);
          set({ currentNovel: novel, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      addNovel: async (data) => {
        set({ loading: true, error: null });
        try {
          const newNovel = await createNovel({
            ...data,
            id: generateId(),
            word_count: 0,
          });
          set((state) => ({
            novels: [newNovel, ...state.novels],
            loading: false,
          }));
          return newNovel;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      modifyNovel: async (novel) => {
        set({ loading: true, error: null });
        try {
          const updated = await updateNovel(novel);
          set((state) => ({
            novels: state.novels.map((n) => (n.id === updated.id ? updated : n)),
            currentNovel: state.currentNovel?.id === updated.id ? updated : state.currentNovel,
            loading: false,
          }));
          return updated;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      removeNovel: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await deleteNovel(id);
          set((state) => ({
            novels: state.novels.filter((n) => n.id !== id),
            currentNovel: state.currentNovel?.id === id ? null : state.currentNovel,
            loading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'novel-store' }
  )
);

// ============ 章节 Store ============

interface ChapterStore {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  loading: boolean;
  error: string | null;

  fetchChapters: (novelId: string) => Promise<void>;
  addChapter: (data: Omit<Chapter, 'id' | 'created_at' | 'updated_at' | 'word_count'>) => Promise<Chapter>;
  modifyChapter: (chapter: Chapter) => Promise<Chapter>;
  removeChapter: (id: string) => Promise<void>;
  setCurrentChapter: (chapter: Chapter | null) => void;
  clearError: () => void;
}

export const useChapterStore = create<ChapterStore>()(
  devtools(
    (set) => ({
      chapters: [],
      currentChapter: null,
      loading: false,
      error: null,

      fetchChapters: async (novelId: string) => {
        set({ loading: true, error: null });
        try {
          const chapters = await getChaptersByNovelId(novelId);
          set({ chapters, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      addChapter: async (data) => {
        set({ loading: true, error: null });
        try {
          const newChapter = await createChapter({
            ...data,
            id: generateId(),
            word_count: 0,
          });
          set((state) => ({
            chapters: [...state.chapters, newChapter].sort((a, b) => a.order_index - b.order_index),
            loading: false,
          }));
          return newChapter;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      modifyChapter: async (chapter) => {
        set({ loading: true, error: null });
        try {
          const updated = await updateChapter(chapter);
          set((state) => ({
            chapters: state.chapters.map((c) => (c.id === updated.id ? updated : c)),
            currentChapter: state.currentChapter?.id === updated.id ? updated : state.currentChapter,
            loading: false,
          }));
          return updated;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      removeChapter: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await deleteChapter(id);
          set((state) => ({
            chapters: state.chapters.filter((c) => c.id !== id),
            currentChapter: state.currentChapter?.id === id ? null : state.currentChapter,
            loading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
      clearError: () => set({ error: null }),
    }),
    { name: 'chapter-store' }
  )
);

// ============ 人物 Store ============

interface CharacterStore {
  characters: Character[];
  loading: boolean;
  error: string | null;

  fetchCharacters: (novelId?: string) => Promise<void>;
  addCharacter: (data: Omit<Character, 'id' | 'created_at' | 'updated_at'>) => Promise<Character>;
  modifyCharacter: (character: Character) => Promise<Character>;
  removeCharacter: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCharacterStore = create<CharacterStore>()(
  devtools(
    (set) => ({
      characters: [],
      loading: false,
      error: null,

      fetchCharacters: async (novelId?: string) => {
        set({ loading: true, error: null });
        try {
          const characters = await getAllCharacters(novelId);
          set({ characters, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      addCharacter: async (data) => {
        set({ loading: true, error: null });
        try {
          const newCharacter = await createCharacter({
            ...data,
            id: generateId(),
          });
          set((state) => ({
            characters: [...state.characters, newCharacter],
            loading: false,
          }));
          return newCharacter;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      modifyCharacter: async (character) => {
        set({ loading: true, error: null });
        try {
          const updated = await updateCharacter(character);
          set((state) => ({
            characters: state.characters.map((c) => (c.id === updated.id ? updated : c)),
            loading: false,
          }));
          return updated;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      removeCharacter: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await deleteCharacter(id);
          set((state) => ({
            characters: state.characters.filter((c) => c.id !== id),
            loading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'character-store' }
  )
);

// ============ 知识库 Store ============

// SQLite Knowledge 类型（与后端一致）
export interface SQLiteKnowledge {
  id: string;
  title: string;
  category?: string;
  content?: string;
  tags?: string;
  novel_id?: string;
  created_at: number;
  updated_at: number;
}

// 前端 KnowledgeItem 类型（与 useKnowledgeStore 一致）
export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  novelId?: string;
}

// SQLite 与前端类型转换（兼容 localStorage 和 Tauri 两种格式）
function sqliteToKnowledgeItem(sql: any): KnowledgeItem {
  return {
    id: sql.id,
    title: sql.title,
    content: sql.content || '',
    category: sql.category || 'uncategorized',
    // 兼容两种格式：SQLite 是逗号分隔字符串，localStorage 是数组
    tags: Array.isArray(sql.tags) ? sql.tags : (sql.tags ? sql.tags.split(',').filter(Boolean) : []),
    // 兼容 created_at 和 createdAt
    createdAt: sql.created_at ? new Date(sql.created_at).toISOString() : (sql.createdAt ? new Date(sql.createdAt).toISOString() : new Date().toISOString()),
    updatedAt: sql.updated_at ? new Date(sql.updated_at).toISOString() : (sql.updatedAt ? new Date(sql.updatedAt).toISOString() : new Date().toISOString()),
    novelId: sql.novel_id || sql.novelId,
  };
}

function knowledgeItemToSQLite(item: Partial<KnowledgeItem>): any {
  const result: any = {
    title: item.title,
    content: item.content,
    category: item.category,
    // 兼容两种格式：SQLite 需要字符串，localStorage 需要数组
    tags: Array.isArray(item.tags) ? item.tags.join(',') : item.tags,
    novelId: item.novelId,
  };
  if (item.id) {
    result.id = item.id;
  }
  return result;
}

interface KnowledgeStore {
  knowledgeList: KnowledgeItem[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;

  fetchKnowledge: (novelId?: string) => Promise<void>;
  searchKnowledge: (query: string) => Promise<void>;
  addKnowledge: (data: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<KnowledgeItem>;
  modifyKnowledge: (knowledge: KnowledgeItem) => Promise<KnowledgeItem>;
  removeKnowledge: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  clearError: () => void;
}

export const useKnowledgeSQLiteStore = create<KnowledgeStore>()(
  devtools(
    (set) => ({
      knowledgeList: [],
      loading: false,
      error: null,
      searchQuery: '',
      selectedCategory: null,

      fetchKnowledge: async (novelId?: string) => {
        set({ loading: true, error: null });
        try {
          const list = await getAllKnowledge(novelId);
          set({
            knowledgeList: list.map(sqliteToKnowledgeItem),
            loading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      searchKnowledge: async (query: string) => {
        set({ loading: true, error: null, searchQuery: query });
        try {
          const list = await searchKnowledge(query);
          set({
            knowledgeList: list.map(sqliteToKnowledgeItem),
            loading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      addKnowledge: async (data) => {
        set({ loading: true, error: null });
        try {
          const newKnowledge = await createKnowledge({
            title: data.title,
            content: data.content,
            category: data.category,
            tags: data.tags?.join(',') || '',
            novelId: data.novelId,
          });
          const item = sqliteToKnowledgeItem(newKnowledge);
          set((state) => ({
            knowledgeList: [item, ...state.knowledgeList],
            loading: false,
          }));
          return item;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      modifyKnowledge: async (knowledge) => {
        set({ loading: true, error: null });
        try {
          const updated = await updateKnowledge(knowledge.id, {
            title: knowledge.title,
            content: knowledge.content,
            category: knowledge.category,
            tags: knowledge.tags?.join(',') || '',
            novelId: knowledge.novelId,
          });
          const item = sqliteToKnowledgeItem(updated);
          set((state) => ({
            knowledgeList: state.knowledgeList.map((k) => (k.id === item.id ? item : k)),
            loading: false,
          }));
          return item;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      removeKnowledge: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await deleteKnowledge(id);
          set((state) => ({
            knowledgeList: state.knowledgeList.filter((k) => k.id !== id),
            loading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      clearError: () => set({ error: null }),
    }),
    { name: 'knowledge-sqlite-store' }
  )
);

// ============ 书籍 Store ============

interface BookStore {
  books: Book[];
  currentBook: Book | null;
  chapters: BookChapter[];
  currentChapter: BookChapter | null;
  categories: BookCategory[];
  bookmarks: BookBookmark[];
  notes: BookNote[];
  settings: BookSettings | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;

  fetchBooks: () => Promise<void>;
  fetchBook: (id: string) => Promise<void>;
  addBook: (data: Omit<Book, 'id' | 'created_at' | 'updated_at'>) => Promise<Book>;
  modifyBook: (book: Book) => Promise<Book>;
  removeBook: (id: string) => Promise<void>;
  searchBooks: (query: string, categoryId?: string) => Promise<void>;
  updateReadingProgress: (id: string, currentChapter: number, currentPosition: number) => Promise<void>;

  fetchChapters: (bookId: string) => Promise<void>;
  setCurrentChapter: (chapter: BookChapter | null) => void;

  fetchCategories: () => Promise<void>;
  addCategory: (data: Omit<BookCategory, 'id' | 'created_at' | 'updated_at'>) => Promise<BookCategory>;
  modifyCategory: (category: BookCategory) => Promise<BookCategory>;
  removeCategory: (id: string) => Promise<void>;

  fetchBookmarks: (bookId: string) => Promise<void>;
  addBookmark: (data: Omit<BookBookmark, 'id' | 'created_at'>) => Promise<BookBookmark>;
  removeBookmark: (id: string) => Promise<void>;

  fetchNotes: (bookId: string) => Promise<void>;
  addNote: (data: Omit<BookNote, 'id' | 'created_at' | 'updated_at'>) => Promise<BookNote>;
  modifyNote: (note: BookNote) => Promise<BookNote>;
  removeNote: (id: string) => Promise<void>;

  fetchSettings: () => Promise<void>;
  modifySettings: (settings: BookSettings) => Promise<BookSettings>;

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  clearError: () => void;
}

export const useBookStore = create<BookStore>()(
  devtools(
    (set, get) => ({
      books: [],
      currentBook: null,
      chapters: [],
      currentChapter: null,
      categories: [],
      bookmarks: [],
      notes: [],
      settings: null,
      loading: false,
      error: null,
      searchQuery: '',
      selectedCategory: null,

      fetchBooks: async () => {
        set({ loading: true, error: null });
        try {
          const books = await getAllBooks();
          set({ books, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      fetchBook: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const book = await getBookById(id);
          set({ currentBook: book, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      addBook: async (data) => {
        set({ loading: true, error: null });
        try {
          const newBook = await createBook({
            ...data,
            id: generateId(),
          });
          set((state) => ({
            books: [newBook, ...state.books],
            loading: false,
          }));
          return newBook;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      modifyBook: async (book) => {
        set({ loading: true, error: null });
        try {
          const updated = await updateBook(book);
          set((state) => ({
            books: state.books.map((b) => (b.id === updated.id ? updated : b)),
            currentBook: state.currentBook?.id === updated.id ? updated : state.currentBook,
            loading: false,
          }));
          return updated;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      removeBook: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await deleteBook(id);
          set((state) => ({
            books: state.books.filter((b) => b.id !== id),
            currentBook: state.currentBook?.id === id ? null : state.currentBook,
            loading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      searchBooks: async (query: string, categoryId?: string) => {
        set({ loading: true, error: null, searchQuery: query });
        try {
          const books = await searchBooks(query, categoryId);
          set({ books, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      updateReadingProgress: async (id: string, currentChapter: number, currentPosition: number) => {
        try {
          await updateBookReadingProgress(id, currentChapter, currentPosition);
          const state = get();
          const updatedBooks = state.books.map((b) =>
            b.id === id ? { ...b, current_chapter: currentChapter, current_position: currentPosition, last_read_at: Date.now() } : b
          );
          const updatedCurrentBook = state.currentBook?.id === id
            ? { ...state.currentBook, current_chapter: currentChapter, current_position: currentPosition, last_read_at: Date.now() }
            : state.currentBook;
          set({ books: updatedBooks, currentBook: updatedCurrentBook });
        } catch (error) {
          console.error('Failed to update reading progress:', error);
        }
      },

      fetchChapters: async (bookId: string) => {
        set({ loading: true, error: null });
        try {
          const chapters = await getBookChaptersByBookId(bookId);
          set({ chapters, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      setCurrentChapter: (chapter) => set({ currentChapter: chapter }),

      fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
          const categories = await getAllBookCategories();
          set({ categories, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      addCategory: async (data) => {
        set({ loading: true, error: null });
        try {
          const newCategory = await createBookCategory({
            ...data,
            id: generateId(),
          });
          set((state) => ({
            categories: [...state.categories, newCategory],
            loading: false,
          }));
          return newCategory;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      modifyCategory: async (category) => {
        set({ loading: true, error: null });
        try {
          const updated = await updateBookCategory(category);
          set((state) => ({
            categories: state.categories.map((c) => (c.id === updated.id ? updated : c)),
            loading: false,
          }));
          return updated;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      removeCategory: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await deleteBookCategory(id);
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
            loading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      fetchBookmarks: async (bookId: string) => {
        set({ loading: true, error: null });
        try {
          const bookmarks = await getBookmarksByBookId(bookId);
          set({ bookmarks, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      addBookmark: async (data) => {
        set({ loading: true, error: null });
        try {
          const newBookmark = await createBookBookmark({
            ...data,
            id: generateId(),
          });
          set((state) => ({
            bookmarks: [newBookmark, ...state.bookmarks],
            loading: false,
          }));
          return newBookmark;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      removeBookmark: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await deleteBookBookmark(id);
          set((state) => ({
            bookmarks: state.bookmarks.filter((b) => b.id !== id),
            loading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      fetchNotes: async (bookId: string) => {
        set({ loading: true, error: null });
        try {
          const notes = await getBookNotesByBookId(bookId);
          set({ notes, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      addNote: async (data) => {
        set({ loading: true, error: null });
        try {
          const newNote = await createBookNote({
            ...data,
            id: generateId(),
          });
          set((state) => ({
            notes: [newNote, ...state.notes],
            loading: false,
          }));
          return newNote;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      modifyNote: async (note) => {
        set({ loading: true, error: null });
        try {
          const updated = await updateBookNote(note);
          set((state) => ({
            notes: state.notes.map((n) => (n.id === updated.id ? updated : n)),
            loading: false,
          }));
          return updated;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      removeNote: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await deleteBookNote(id);
          set((state) => ({
            notes: state.notes.filter((n) => n.id !== id),
            loading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      fetchSettings: async () => {
        set({ loading: true, error: null });
        try {
          const settings = await getBookSettings();
          set({ settings, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      modifySettings: async (settings) => {
        set({ loading: true, error: null });
        try {
          const updated = await updateBookSettings(settings);
          set({ settings: updated, loading: false });
          return updated;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      clearError: () => set({ error: null }),
    }),
    { name: 'book-store' }
  )
);
