import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, Typography, Button, Space, Slider, Tooltip, message, Drawer, List, Input, Empty, Popconfirm, Select, Divider } from 'antd'
import {
  MenuOutlined,
  LeftOutlined,
  RightOutlined,
  SettingOutlined,
  BookOutlined,
  FileTextOutlined,
  SearchOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'
import { useBookStore } from '@/store/sqliteStore'
import { useParams } from 'react-router-dom'

const { Title, Text, Paragraph } = Typography

// Theme configurations
const themes = {
  light: {
    bg: '#ffffff',
    text: '#3d3830',
    secondary: '#6b635a',
    border: '#e8e0d5',
  },
  dark: {
    bg: '#1a1612',
    text: '#e8e0d5',
    secondary: '#a99d92',
    border: '#4a4238',
  },
  sepia: {
    bg: '#f5f0e6',
    text: '#5c4b37',
    secondary: '#8b7355',
    border: '#d4c4a8',
  },
}

function BookReader() {
  const { bookId } = useParams<{ bookId: string }>()
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  const [messageApi, contextHolder] = message.useMessage()

  // Book store
  const {
    currentBook,
    chapters,
    currentChapter,
    bookmarks,
    notes,
    settings,
    fetchBook,
    fetchChapters,
    setCurrentChapter,
    updateReadingProgress,
    fetchBookmarks,
    addBookmark,
    removeBookmark,
    fetchNotes,
    addNote,
    modifyNote,
    removeNote,
    fetchSettings,
    modifySettings,
  } = useBookStore()

  // Local state
  const [leftPanelVisible, setLeftPanelVisible] = useState(true)
  const [rightPanelVisible, setRightPanelVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<'toc' | 'bookmark' | 'note'>('toc')
  const [settingVisible, setSettingVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Theme colors
  const appTheme = isDark ? themes.dark : themes.light
  const readerTheme = settings?.theme && themes[settings.theme as keyof typeof themes]
    ? themes[settings.theme as keyof typeof themes]
    : appTheme

  const bgColor = readerTheme.bg
  const textColor = readerTheme.text
  const borderColor = readerTheme.border

  // Font settings
  const fontSize = settings?.font_size || 18
  const lineHeight = settings?.line_height || 1.8

  // Load book data on mount
  useEffect(() => {
    if (bookId) {
      fetchBook(bookId)
      fetchChapters(bookId)
      fetchBookmarks(bookId)
      fetchNotes(bookId)
      fetchSettings()
    }
  }, [bookId, fetchBook, fetchChapters, fetchBookmarks, fetchNotes, fetchSettings])

  // Set current chapter
  useEffect(() => {
    if (chapters.length > 0 && currentBook) {
      const chapterIndex = Math.min(currentBook.current_chapter, chapters.length - 1)
      setCurrentChapter(chapters[chapterIndex])
    }
  }, [chapters, currentBook, setCurrentChapter])

  // Save reading progress periodically
  useEffect(() => {
    if (!currentChapter || !bookId) return

    const saveProgress = () => {
      const chapterIndex = chapters.findIndex(c => c.id === currentChapter.id)
      if (chapterIndex >= 0) {
        updateReadingProgress(bookId, chapterIndex, 0)
      }
    }

    const interval = setInterval(saveProgress, 30000) // Save every 30 seconds
    return () => clearInterval(interval)
  }, [currentChapter, bookId, chapters, updateReadingProgress])

  // Navigate to previous chapter
  const handlePrevChapter = useCallback(() => {
    if (!currentChapter || chapters.length === 0) return
    const currentIndex = chapters.findIndex(c => c.id === currentChapter.id)
    if (currentIndex > 0) {
      const prevChapter = chapters[currentIndex - 1]
      setCurrentChapter(prevChapter)
      if (bookId) {
        updateReadingProgress(bookId, currentIndex - 1, 0)
      }
    }
  }, [currentChapter, chapters, setCurrentChapter, bookId, updateReadingProgress])

  // Navigate to next chapter
  const handleNextChapter = useCallback(() => {
    if (!currentChapter || chapters.length === 0) return
    const currentIndex = chapters.findIndex(c => c.id === currentChapter.id)
    if (currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1]
      setCurrentChapter(nextChapter)
      if (bookId) {
        updateReadingProgress(bookId, currentIndex + 1, 0)
      }
    }
  }, [currentChapter, chapters, setCurrentChapter, bookId, updateReadingProgress])

  // Navigate to specific chapter
  const handleGoToChapter = useCallback((chapterId: string) => {
    const chapter = chapters.find(c => c.id === chapterId)
    if (chapter) {
      setCurrentChapter(chapter)
      const index = chapters.findIndex(c => c.id === chapterId)
      if (bookId) {
        updateReadingProgress(bookId, index, 0)
      }
    }
  }, [chapters, setCurrentChapter, bookId, updateReadingProgress])

  // Add bookmark
  const handleAddBookmark = useCallback(async () => {
    if (!currentChapter || !bookId) return
    try {
      await addBookmark({
        book_id: bookId,
        chapter_id: currentChapter.id,
        position: 0,
        title: currentChapter.title,
      })
      messageApi.success('书签添加成功')
    } catch (error) {
      messageApi.error('添加失败，请重试')
    }
  }, [currentChapter, bookId, addBookmark, messageApi])

  // Delete bookmark
  const handleDeleteBookmark = useCallback(async (id: string) => {
    try {
      await removeBookmark(id)
      messageApi.success('书签删除成功')
    } catch (error) {
      messageApi.error('删除失败，请重试')
    }
  }, [removeBookmark, messageApi])

  // Add note
  const handleAddNote = useCallback(async () => {
    if (!currentChapter || !bookId || !noteContent.trim()) return
    try {
      await addNote({
        book_id: bookId,
        chapter_id: currentChapter.id,
        content: noteContent,
        highlighted_text: '',
        page_position: 0,
      })
      setNoteContent('')
      messageApi.success('笔记保存成功')
      fetchNotes(bookId)
    } catch (error) {
      messageApi.error('保存失败，请重试')
    }
  }, [currentChapter, bookId, noteContent, addNote, fetchNotes, messageApi])

  // Update note
  const handleUpdateNote = useCallback(async (noteId: string) => {
    if (!noteContent.trim()) return
    try {
      const note = notes.find(n => n.id === noteId)
      if (note) {
        await modifyNote({ ...note, content: noteContent })
        setNoteContent('')
        setEditingNote(null)
        messageApi.success('笔记更新成功')
        if (bookId) fetchNotes(bookId)
      }
    } catch (error) {
      messageApi.error('更新失败，请重试')
    }
  }, [noteContent, notes, modifyNote, fetchNotes, bookId, messageApi])

  // Delete note
  const handleDeleteNote = useCallback(async (id: string) => {
    try {
      await removeNote(id)
      messageApi.success('笔记删除成功')
    } catch (error) {
      messageApi.error('删除失败，请重试')
    }
  }, [removeNote, messageApi])

  // Update settings
  const handleUpdateSettings = useCallback(async (key: string, value: any) => {
    if (!settings) return
    try {
      await modifySettings({ ...settings, [key]: value })
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }, [settings, modifySettings])

  // Search in content
  const handleSearch = useCallback(() => {
    if (!searchText.trim() || !contentRef.current) return
    const content = contentRef.current

    // Simple search - scroll to first match
    const text = content.innerText.toLowerCase()
    const searchLower = searchText.toLowerCase()
    const index = text.indexOf(searchLower)

    if (index >= 0) {
      // Scroll to match
      const element = content.children[Math.floor(index / 100)] // Approximate
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else {
      messageApi.info('未找到匹配内容')
    }
  }, [searchText, messageApi])

  // Check if current chapter is bookmarked
  const isBookmarked = currentChapter
    ? bookmarks.some(b => b.chapter_id === currentChapter.id)
    : false

  // Calculate current chapter index
  const currentChapterIndex = currentChapter
    ? chapters.findIndex(c => c.id === currentChapter.id)
    : -1
  const hasPrev = currentChapterIndex > 0
  const hasNext = currentChapterIndex < chapters.length - 1

  return (
    <>
      {contextHolder}
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: bgColor }}>
        {/* Header */}
        <div
          style={{
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderBottom: `1px solid ${borderColor}`,
            background: isDark ? '#252220' : '#fafafa',
          }}
        >
          <Space>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setLeftPanelVisible(!leftPanelVisible)}
            />
            <Text strong style={{ color: textColor }}>
              {currentBook?.title || '加载中...'}
            </Text>
          </Space>

          <Space>
            <Input
              placeholder="搜索内容..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
            />
            <Tooltip title={isBookmarked ? '已添加书签' : '添加书签'}>
              <Button
                type="text"
                icon={<BookOutlined />}
                onClick={handleAddBookmark}
                style={{ color: isBookmarked ? '#c9a959' : undefined }}
              />
            </Tooltip>
            <Tooltip title="笔记">
              <Button
                type="text"
                icon={<FileTextOutlined />}
                onClick={() => {
                  setRightPanelVisible(true)
                  setActiveTab('note')
                }}
              />
            </Tooltip>
            <Tooltip title="阅读设置">
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => setSettingVisible(true)}
              />
            </Tooltip>
          </Space>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left panel - TOC/Bookmarks */}
          <div
            style={{
              width: leftPanelVisible ? 280 : 0,
              overflow: 'hidden',
              transition: 'width 0.3s',
              borderRight: `1px solid ${borderColor}`,
              background: bgColor,
            }}
          >
            <div style={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${borderColor}` }}>
                <Button
                  type="text"
                  style={{
                    flex: 1,
                    borderRadius: 0,
                    background: activeTab === 'toc' ? (isDark ? '#3a3530' : '#f0ede8') : 'transparent',
                  }}
                  onClick={() => setActiveTab('toc')}
                >
                  目录
                </Button>
                <Button
                  type="text"
                  style={{
                    flex: 1,
                    borderRadius: 0,
                    background: activeTab === 'bookmark' ? (isDark ? '#3a3530' : '#f0ede8') : 'transparent',
                  }}
                  onClick={() => setActiveTab('bookmark')}
                >
                  书签
                </Button>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                {activeTab === 'toc' && (
                  <List
                    dataSource={chapters}
                    renderItem={(chapter, index) => (
                      <List.Item
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          background: currentChapter?.id === chapter.id ? (isDark ? '#3a3530' : '#f0ede8') : 'transparent',
                        }}
                        onClick={() => handleGoToChapter(chapter.id)}
                      >
                        <Text
                          ellipsis
                          style={{
                            color: currentChapter?.id === chapter.id ? '#c9a959' : textColor,
                          }}
                        >
                          {index + 1}. {chapter.title}
                        </Text>
                      </List.Item>
                    )}
                  />
                )}

                {activeTab === 'bookmark' && (
                  bookmarks.length > 0 ? (
                    <List
                      dataSource={bookmarks}
                      renderItem={(bookmark) => (
                        <List.Item
                          style={{ padding: '12px 16px' }}
                          actions={[
                            <Popconfirm
                              key="delete"
                              title="确定删除此书签吗？"
                              onConfirm={() => handleDeleteBookmark(bookmark.id)}
                            >
                              <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                            </Popconfirm>
                          ]}
                        >
                          <div
                            style={{ cursor: 'pointer', flex: 1 }}
                            onClick={() => handleGoToChapter(bookmark.chapter_id!)}
                          >
                            <Text strong style={{ color: textColor }}>{bookmark.title}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {new Date(bookmark.created_at).toLocaleDateString()}
                            </Text>
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="暂无书签" style={{ marginTop: 40 }} />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Reading area */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '40px 60px',
              maxWidth: 900,
              margin: '0 auto',
            }}
            ref={contentRef}
          >
            {currentChapter ? (
              <>
                <Title level={3} style={{ textAlign: 'center', color: textColor, marginBottom: 32 }}>
                  {currentChapter.title}
                </Title>
                <Paragraph
                  style={{
                    fontSize,
                    lineHeight,
                    color: textColor,
                    textIndent: '2em',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {currentChapter.content}
                </Paragraph>

                {/* Navigation */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 40,
                    paddingTop: 20,
                    borderTop: `1px solid ${borderColor}`,
                  }}
                >
                  <Button
                    type="primary"
                    disabled={!hasPrev}
                    onClick={handlePrevChapter}
                    icon={<LeftOutlined />}
                  >
                    上一章
                  </Button>
                  <Text type="secondary">
                    {currentChapterIndex + 1} / {chapters.length}
                  </Text>
                  <Button
                    type="primary"
                    disabled={!hasNext}
                    onClick={handleNextChapter}
                  >
                    下一章
                    <RightOutlined />
                  </Button>
                </div>
              </>
            ) : (
              <Empty description="请选择章节" />
            )}
          </div>
        </div>

        {/* Right panel - Notes */}
        <Drawer
          title="笔记"
          placement="right"
          width={360}
          open={rightPanelVisible}
          onClose={() => setRightPanelVisible(false)}
        >
          {/* Add note */}
          <div style={{ marginBottom: 16 }}>
            <Input.TextArea
              placeholder="添加笔记..."
              rows={3}
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
            />
            <Button
              type="primary"
              block
              style={{ marginTop: 8 }}
              onClick={editingNote ? () => handleUpdateNote(editingNote) : handleAddNote}
              disabled={!noteContent.trim()}
            >
              {editingNote ? '更新笔记' : '保存笔记'}
            </Button>
            {editingNote && (
              <Button
                block
                style={{ marginTop: 8 }}
                onClick={() => {
                  setEditingNote(null)
                  setNoteContent('')
                }}
              >
                取消
              </Button>
            )}
          </div>

          <Divider />

          {/* Notes list */}
          <List
            dataSource={notes}
            renderItem={(note) => (
              <Card
                size="small"
                style={{ marginBottom: 8 }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Text strong style={{ color: textColor }}>{note.content}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {chapters.find(c => c.id === note.chapter_id)?.title || ''}
                  </Text>
                  <Space>
                    <Button
                      type="text"
                      size="small"
                      onClick={() => {
                        setEditingNote(note.id)
                        setNoteContent(note.content || '')
                      }}
                    >
                      编辑
                    </Button>
                    <Popconfirm
                      title="确定删除此笔记吗？"
                      onConfirm={() => handleDeleteNote(note.id)}
                    >
                      <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                </div>
              </Card>
            )}
          />
        </Drawer>

        {/* Settings panel */}
        <Drawer
          title="阅读设置"
          placement="right"
          width={320}
          open={settingVisible}
          onClose={() => setSettingVisible(false)}
        >
          {/* Theme */}
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ color: textColor }}>主题</Text>
            <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
              {Object.entries(themes).map(([key, theme]) => (
                <div
                  key={key}
                  onClick={() => handleUpdateSettings('theme', key)}
                  style={{
                    width: 60,
                    height: 40,
                    borderRadius: 4,
                    background: theme.bg,
                    border: settings?.theme === key ? `2px solid #c9a959` : `1px solid ${borderColor}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, color: theme.text }}>
                    {key === 'light' ? '明亮' : key === 'dark' ? '暗黑' : '护眼'}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ color: textColor }}>字号: {fontSize}px</Text>
            <Slider
              min={12}
              max={32}
              value={fontSize}
              onChange={(value) => handleUpdateSettings('font_size', value)}
              style={{ marginTop: 12 }}
            />
          </div>

          {/* Line height */}
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ color: textColor }}>行距: {lineHeight}</Text>
            <Slider
              min={1.2}
              max={2.5}
              step={0.1}
              value={lineHeight}
              onChange={(value) => handleUpdateSettings('line_height', value)}
              style={{ marginTop: 12 }}
            />
          </div>

          {/* Font family */}
          <div>
            <Text strong style={{ color: textColor }}>字体</Text>
            <Select
              value={settings?.font_family || 'system-ui'}
              onChange={(value) => handleUpdateSettings('font_family', value)}
              style={{ width: '100%', marginTop: 12 }}
              options={[
                { value: 'system-ui', label: '系统默认' },
                { value: 'serif', label: '衬线体' },
                { value: 'sans-serif', label: '无衬线体' },
              ]}
            />
          </div>
        </Drawer>
      </div>
    </>
  )
}

export default BookReader
