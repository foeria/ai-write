import { useState, useCallback, useEffect, useRef } from 'react'
import { Button, message, Space, Typography, Empty, Input, Dropdown, Modal, Select, Tooltip, Form, Checkbox } from 'antd'
import {
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  BoldOutlined,
  ItalicOutlined,
  CopyOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
  PlusOutlined,
  MoreOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  ExpandOutlined,
  CompressOutlined,
  BulbOutlined,
  TeamOutlined,
  BookOutlined,
  DatabaseOutlined,
  ScissorOutlined,
  SearchOutlined,
  OrderedListOutlined,
  AppstoreOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useParams, useNavigate } from 'react-router-dom'
import { useNovelStore } from '@/store/useNovelStore'
import type { Chapter } from '@/store/useNovelStore'
import { useAppStore } from '@/store/useAppStore'
import { chapterRepo, plotCardRepo, knowledgeRepo, characterRepo, novelRepo, volumeRepo, type PlotCard as PlotCardType } from '@/api/repository'
import type { Character, Knowledge } from '@/types/entities'
import OutlineManagerFull from './components/OutlineManagerFull'
import GenerateResultModal from './components/GenerateResultModal'
import CharacterGenerateModal from './components/CharacterGenerateModal'
import EntryAIModal from './components/EntryAIModal'
import InspirationPanel from './components/InspirationPanel'
import PlotCardsPanel, { type PlotCardData } from './components/PlotCardsPanel'
import { expandText, polishText, chatComplete } from '@/api/ai'

const { Text } = Typography

// 卷类型
interface Volume {
  id: string
  title: string
  orderIndex: number
  chapters: Chapter[]
  expanded: boolean
}

// 搜索结果类型
interface SearchResult {
  chapterId: string
  chapterTitle: string
  content: string
  matchIndex: number
}

// 右侧面板类型
type RightPanelType = 'aiWriting' | 'expandText' | 'polishText' | 'inspiration' | 'characters' | 'entries' | 'knowledge' | 'plotCards' | null

function NovelWorkspace() {
  const { novelId } = useParams()
  const navigate = useNavigate()
  const isDark = useAppStore((state) => state.config.theme === 'dark')

  const {
    currentChapter,
    setCurrentChapter,
    updateChapter,
  } = useNovelStore()

  // 状态
  const [activePanel, setActivePanel] = useState<RightPanelType>(null)
  const [volumes, setVolumes] = useState<Volume[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'volume' | 'chapter'; id: string; title: string } | null>(null)
  const [fontSize, setFontSize] = useState('16px')
  const [fontFamily, setFontFamily] = useState("'Microsoft YaHei', sans-serif")
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [outlineModalOpen, setOutlineModalOpen] = useState(false)

  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // AI功能相关状态
  const [expandLoading, setExpandLoading] = useState(false)
  const [polishLoading, setPolishLoading] = useState(false)
  const [inspirationLoading, setInspirationLoading] = useState(false)
  const [inspirationResult, setInspirationResult] = useState('')

  // 章节细纲相关状态
  const [chapterOutline, setChapterOutline] = useState('')

  // Quill 编辑器引用
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quillRef = useRef<any>(null)

  // 数据加载状态
  const [isLoading, setIsLoading] = useState(true)
  const [currentNovelTitle, setCurrentNovelTitle] = useState('')

  // AI面板相关状态
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [generateResult, setGenerateResult] = useState('')
  const [generateLoading] = useState(false)
  const [characterGenerateModalOpen, setCharacterGenerateModalOpen] = useState(false)
  const [entryAIModalOpen, setEntryAIModalOpen] = useState(false)
  const [expandTextValue, setExpandTextValue] = useState('')
  const [plotCards, setPlotCards] = useState<PlotCardData[]>([])

  // 知识库和角色数据
  const [characters, setCharacters] = useState<Character[]>([])
  const [knowledges, setKnowledges] = useState<Knowledge[]>([])

  // 自动保存
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [lastSavedContent, setLastSavedContent] = useState<string>('')

  // 当前小说 ID
  const currentNovelId = novelId || ''

  // 主题颜色
  const theme = isDark ? {
    bg: '#1a1612',
    bgSecondary: '#252220',
    bgTertiary: '#3a3530',
    text: '#e8e0d5',
    textSecondary: '#a99d92',
    border: '#4a4238',
    primary: '#c9a959',
    gradient: 'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)',
  } : {
    bg: '#f5f3f0',
    bgSecondary: '#ffffff',
    bgTertiary: '#f0ede8',
    text: '#3d3830',
    textSecondary: '#6b6358',
    border: '#e8e0d5',
    primary: '#c9a959',
    gradient: 'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)',
  }

  // 工具栏按钮配置
  const toolbarButtons = [
    { key: 'aiWriting', label: 'AI写作', icon: <ThunderboltOutlined /> },
    { key: 'expandText', label: '扩写', icon: <ExpandOutlined /> },
    { key: 'polishText', label: '润色', icon: <CompressOutlined /> },
    { key: 'inspiration', label: '灵感', icon: <BulbOutlined /> },
    { key: 'plotCards', label: '剧情卡片', icon: <AppstoreOutlined /> },
    { key: 'characters', label: '人物', icon: <TeamOutlined /> },
    { key: 'entries', label: '词条', icon: <BookOutlined /> },
    { key: 'knowledge', label: '知识库', icon: <DatabaseOutlined /> },
  ]

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      if (!novelId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // 加载小说信息
        const novel = await novelRepo.getById(novelId)
        if (novel) {
          setCurrentNovelTitle(novel.title)
        }

        // 加载卷列表
        const volumesData = await volumeRepo.getByNovelId(novelId)

        // 加载章节列表
        const chapters = await chapterRepo.getByNovelId(novelId)

        // 按卷分组章节
        const volumeMap = new Map<string, Chapter[]>()
        const noVolumeChapters: Chapter[] = []

        chapters.forEach((c) => {
          const chapterData = {
            id: c.id,
            novelId: c.novelId,
            volumeId: c.volumeId,
            title: c.title,
            content: c.content || '',
            outline: c.outline || '',
            orderIndex: c.orderIndex,
            wordCount: c.wordCount,
            createdAt: new Date(c.createdAt).toISOString(),
            updatedAt: new Date(c.updatedAt).toISOString(),
          }

          if (c.volumeId && volumeMap.has(c.volumeId)) {
            volumeMap.get(c.volumeId)!.push(chapterData)
          } else if (c.volumeId) {
            volumeMap.set(c.volumeId, [chapterData])
          } else {
            noVolumeChapters.push(chapterData)
          }
        })

        // 构建卷结构
        const loadedVolumes: Volume[] = volumesData.map(v => ({
          id: v.id,
          title: v.title,
          orderIndex: v.orderIndex,
          expanded: true,
          chapters: volumeMap.get(v.id) || [],
        }))

        // 如果有未分卷的章节，创建默认卷
        if (noVolumeChapters.length > 0) {
          loadedVolumes.push({
            id: 'default',
            title: '正文',
            orderIndex: -1,
            expanded: true,
            chapters: noVolumeChapters,
          })
        }

        // 如果没有任何卷和章节，创建默认卷
        if (loadedVolumes.length === 0) {
          loadedVolumes.push({
            id: 'default',
            title: '正文',
            orderIndex: 0,
            expanded: true,
            chapters: [],
          })
        }

        setVolumes(loadedVolumes)

        // 加载剧情卡片
        const cards = await plotCardRepo.getByNovelId(novelId)
        setPlotCards(cards.map((card: PlotCardType) => ({
          id: card.id,
          title: card.goal || '未命名剧情点',
          content: card.description || '',
          importance: card.importance === 'A' ? 'high' : card.importance === 'B' ? 'medium' : 'low',
          mood: card.mood || '',
          sceneGoal: card.goal || '',
          createdAt: new Date(card.createdAt).toISOString(),
        })))

        // 加载角色
        const chars = await characterRepo.getAll(novelId)
        setCharacters(chars)

        // 加载知识库
        const knowledgesData = await knowledgeRepo.getAll(novelId)
        setKnowledges(knowledgesData)

      } catch (error) {
        console.error('加载数据失败:', error)
        message.error('加载数据失败')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [novelId])

  // 当 currentChapter 变化时，同步章节细纲
  useEffect(() => {
    if (currentChapter) {
      setChapterOutline((currentChapter as any).outline || '')
    } else {
      setChapterOutline('')
    }
  }, [currentChapter?.id])

  // 自动保存功能
  useEffect(() => {
    if (!currentChapter || !currentChapter.id) return

    const currentContent = currentChapter.content || ''

    // 检查是否有未保存的更改
    if (currentContent !== lastSavedContent && currentContent.length > 0) {
      // 清除之前的定时器
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      // 设置新的自动保存定时器（3秒后自动保存）
      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          await chapterRepo.update(currentChapter.id, { content: currentContent })
          setLastSavedContent(currentContent)
          message.success('已自动保存')
        } catch (error) {
          console.error('自动保存失败:', error)
        }
      }, 3000)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [currentChapter?.content, currentChapter?.id])

  // 组件卸载时保存当前内容
  useEffect(() => {
    return () => {
      if (currentChapter && currentChapter.id && currentChapter.content !== lastSavedContent) {
        // 同步保存
        chapterRepo.update(currentChapter.id, { content: currentChapter.content || '' }).catch(console.error)
      }
    }
  }, [])

  // 计算总字数
  const totalWords = volumes.reduce((acc, v) =>
    acc + v.chapters.reduce((cAcc, c) => cAcc + c.wordCount, 0), 0
  )

  // 处理保存
  const handleSave = useCallback(async () => {
    if (!currentChapter || !currentChapter.id) {
      message.warning('请先选择章节')
      return
    }

    try {
      await chapterRepo.update(currentChapter.id, {
        content: currentChapter.content || '',
        title: currentChapter.title,
      })
      setLastSavedContent(currentChapter.content || '')
      message.success('保存成功')
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败')
    }
  }, [currentChapter])

  // 本地更新章节（用于编辑器输入）
  const updateCurrentChapter = useCallback((updates: Partial<Chapter>) => {
    if (!currentChapter) return

    const updatedChapter = { ...currentChapter, ...updates }
    setCurrentChapter(updatedChapter)

    // 同时更新 volumes 中的章节
    setVolumes(volumes.map(v => ({
      ...v,
      chapters: v.chapters.map(c => c.id === updatedChapter.id ? updatedChapter : c)
    })))
  }, [currentChapter, volumes])

  // 切换卷展开/收起
  const toggleVolume = (volumeId: string) => {
    setVolumes(volumes.map(v =>
      v.id === volumeId ? { ...v, expanded: !v.expanded } : v
    ))
  }

  // 添加卷（持久化到数据库）
  const handleAddVolume = async () => {
    if (!novelId) return

    try {
      // 创建默认卷标题
      const volumeTitle = `新卷 ${volumes.length + 1}`

      // 保存到数据库
      const newVolume = await volumeRepo.create(novelId, volumeTitle)

      const volumeData: Volume = {
        id: newVolume.id,
        title: newVolume.title,
        orderIndex: newVolume.orderIndex,
        expanded: true,
        chapters: [],
      }
      setVolumes([...volumes, volumeData])
      message.success('已添加新卷')
    } catch (error) {
      console.error('添加卷失败:', error)
      message.error('添加卷失败')
    }
  }

  // 添加章节
  const handleAddChapter = async (volumeId: string) => {
    const volume = volumes.find(v => v.id === volumeId)
    if (!volume || !novelId) return

    try {
      // 使用 repository 创建章节
      const newChapter = await chapterRepo.create(novelId, {
        title: `第 ${volume.chapters.length + 1} 章`,
        content: '',
        outline: '',
        orderIndex: volume.chapters.length,
        volumeId: volumeId !== 'default' ? volumeId : undefined,
      })

      const chapterData: Chapter = {
        id: newChapter.id,
        novelId: newChapter.novelId,
        volumeId: newChapter.volumeId,
        title: newChapter.title,
        content: newChapter.content || '',
        outline: newChapter.outline || '',
        orderIndex: newChapter.orderIndex,
        wordCount: newChapter.wordCount,
        createdAt: new Date(newChapter.createdAt).toISOString(),
        updatedAt: new Date(newChapter.updatedAt).toISOString(),
      }

      setVolumes(volumes.map(v =>
        v.id === volumeId
          ? { ...v, chapters: [...v.chapters, chapterData], expanded: true }
          : v
      ))
      setCurrentChapter(chapterData)
      setLastSavedContent('')
      setChapterOutline('')
      message.success('已添加章节')
    } catch (error) {
      console.error('添加章节失败:', error)
      message.error('添加章节失败')
    }
  }

  // 选择章节
  const handleSelectChapter = (chapter: Chapter) => {
    setCurrentChapter(chapter)
    setChapterOutline((chapter as any).outline || '')
  }

  // 获取 Quill 编辑器实例
  const getQuillInstance = () => {
    if (quillRef.current) {
      return quillRef.current.getEditor()
    }
    return null
  }

  // 撤销
  const handleUndo = () => {
    const quill = getQuillInstance()
    if (quill) {
      quill.history.undo()
    }
  }

  // 重做
  const handleRedo = () => {
    const quill = getQuillInstance()
    if (quill) {
      quill.history.redo()
    }
  }

  // 加粗
  const handleBold = () => {
    const quill = getQuillInstance()
    if (quill) {
      quill.format('bold', !quill.getFormat().bold)
    }
  }

  // 斜体
  const handleItalic = () => {
    const quill = getQuillInstance()
    if (quill) {
      quill.format('italic', !quill.getFormat().italic)
    }
  }

  // 插入分章符
  const handleInsertDivider = () => {
    const quill = getQuillInstance()
    if (quill) {
      const range = quill.getSelection()
      if (range) {
        // 插入分章符（使用特殊标记）
        quill.insertText(range.index, '\n\n=== 章节分隔符 ===\n\n')
      } else {
        quill.insertText(quill.getLength(), '\n\n=== 章节分隔符 ===\n\n')
      }
    }
  }

  // 复制全文
  const handleCopyContent = async () => {
    if (!currentChapter?.content) {
      message.warning('没有内容可复制')
      return
    }

    try {
      // 从 HTML 内容中提取纯文本
      const quill = getQuillInstance()
      const text = quill ? quill.getText() : (currentChapter.content || '')
      await navigator.clipboard.writeText(text)
      message.success('已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
      message.error('复制失败')
    }
  }

  // 全文搜索
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      message.warning('请输入搜索内容')
      return
    }

    if (!novelId) return

    setSearchLoading(true)
    try {
      // 获取所有章节内容进行搜索
      const chapters = await chapterRepo.getByNovelId(novelId)
      const results: SearchResult[] = []

      chapters.forEach(chapter => {
        if (chapter.content) {
          // 将 HTML 转换为纯文本进行搜索
          const textContent = chapter.content.replace(/<[^>]*>/g, '')
          const lowerContent = textContent.toLowerCase()
          const lowerQuery = searchQuery.toLowerCase()
          const matchIndex = lowerContent.indexOf(lowerQuery)

          if (matchIndex !== -1) {
            // 获取匹配内容的前后文
            const start = Math.max(0, matchIndex - 30)
            const end = Math.min(textContent.length, matchIndex + searchQuery.length + 30)
            const context = (start > 0 ? '...' : '') +
              textContent.substring(start, matchIndex) +
              '【' + textContent.substring(matchIndex, matchIndex + searchQuery.length) + '】' +
              textContent.substring(matchIndex + searchQuery.length, end) +
              (end < textContent.length ? '...' : '')

            results.push({
              chapterId: chapter.id,
              chapterTitle: chapter.title,
              content: context,
              matchIndex,
            })
          }
        }
      })

      setSearchResults(results)
      if (results.length === 0) {
        message.info('未找到匹配内容')
      }
    } catch (error) {
      console.error('搜索失败:', error)
      message.error('搜索失败')
    } finally {
      setSearchLoading(false)
    }
  }

  // 点击搜索结果跳转到章节
  const handleJumpToChapter = (chapterId: string) => {
    const chapter = volumes
      .flatMap(v => v.chapters)
      .find(c => c.id === chapterId)

    if (chapter) {
      setCurrentChapter(chapter)
      setSearchModalOpen(false)
      setSearchQuery('')
      setSearchResults([])
    }
  }

  // 扩写功能
  const handleExpandText = async () => {
    if (!expandTextValue.trim()) {
      message.warning('请输入扩写内容')
      return
    }

    if (!currentChapter) {
      message.warning('请先选择章节')
      return
    }

    setExpandLoading(true)
    try {
      const result = await expandText(expandTextValue, 'detail')
      setGenerateResult(result)
      setGenerateModalOpen(true)
    } catch (error) {
      console.error('扩写失败:', error)
      message.error('扩写失败')
    } finally {
      setExpandLoading(false)
    }
  }

  // 润色功能
  const handlePolishText = async () => {
    if (!currentChapter?.content) {
      message.warning('请先选择有内容的章节')
      return
    }

    setPolishLoading(true)
    try {
      // 从 HTML 中提取纯文本
      const quill = getQuillInstance()
      const text = quill ? quill.getText().trim() : (currentChapter.content.replace(/<[^>]*>/g, '') || '')

      const result = await polishText(text, 'literary')
      setGenerateResult(result)
      setGenerateModalOpen(true)
    } catch (error) {
      console.error('润色失败:', error)
      message.error('润色失败')
    } finally {
      setPolishLoading(false)
    }
  }

  // 灵感功能
  const handleInspiration = async () => {
    setInspirationLoading(true)
    try {
      const context = currentChapter
        ? `当前章节：${currentChapter.title}\n内容：${(currentChapter.content || '').substring(0, 500)}`
        : ''

      const result = await chatComplete(
        `请为我的小说提供一些情节发展灵感。需要有趣、创新的情节构思。${context ? `\n\n上下文：${context}` : ''}`
      )
      setInspirationResult(result)
      setGenerateResult(result)
      setGenerateModalOpen(true)
    } catch (error) {
      console.error('灵感生成失败:', error)
      message.error('灵感生成失败')
    } finally {
      setInspirationLoading(false)
    }
  }

  // 保存章节细纲
  const handleSaveOutline = async () => {
    if (!currentChapter?.id) return

    try {
      await chapterRepo.update(currentChapter.id, { outline: chapterOutline })
      message.success('细纲已保存')

      // 更新本地状态
      setVolumes(volumes.map(v => ({
        ...v,
        chapters: v.chapters.map(c =>
          c.id === currentChapter.id
            ? { ...c, outline: chapterOutline }
            : c
        )
      })))
    } catch (error) {
      console.error('保存细纲失败:', error)
      message.error('保存细纲失败')
    }
  }

  // 删除确认
  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      if (deleteTarget.type === 'volume') {
        // 删除卷（只删除本地卷结构，章节仍保留在第一个卷中）
        setVolumes(volumes.filter(v => v.id !== deleteTarget.id))
        if (currentChapter && volumes.find(v => v.id === deleteTarget.id)?.chapters.some(c => c.id === currentChapter.id)) {
          setCurrentChapter(null)
        }
      } else {
        // 删除章节 - 使用 repository
        await chapterRepo.delete(deleteTarget.id)

        setVolumes(volumes.map(v => ({
          ...v,
          chapters: v.chapters.filter(c => c.id !== deleteTarget.id)
        })))
        if (currentChapter?.id === deleteTarget.id) {
          setCurrentChapter(null)
        }
      }
      message.success('已删除')
    } catch (error) {
      console.error('删除失败:', error)
      message.error('删除失败')
    }

    setDeleteModalOpen(false)
    setDeleteTarget(null)
  }

  // 打开删除确认弹窗
  const openDeleteModal = (type: 'volume' | 'chapter', id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteTarget({ type, id, title })
    setDeleteModalOpen(true)
  }

  // 切换右侧面板
  const togglePanel = (panel: RightPanelType) => {
    setActivePanel(prev => prev === panel ? null : panel)
  }

  // 渲染右侧面板内容
  const renderRightPanel = () => {
    switch (activePanel) {
      case 'aiWriting':
        return (
          <div className="panel-content">
            <div className="panel-header">
              <Text strong style={{ color: theme.text, fontSize: 16 }}>AI写作</Text>
            </div>
            <div className="panel-body">
              <div className="form-item">
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>AI模型</Text>
                <Select
                  size="small"
                  defaultValue="gpt-4"
                  style={{ width: '100%', marginTop: 4 }}
                  options={[
                    { label: 'GPT-4', value: 'gpt-4' },
                    { label: 'Claude 3', value: 'claude-3' },
                    { label: 'DeepSeek', value: 'deepseek' },
                  ]}
                />
              </div>
              <div className="form-item">
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>剧情点</Text>
                <Button
                  size="small"
                  type="dashed"
                  block
                  style={{ marginTop: 4 }}
                  onClick={() => togglePanel('plotCards')}
                >
                  管理剧情卡片 ({plotCards.length})
                </Button>
              </div>
              <div className="form-item">
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>提示词模式</Text>
                <Select
                  size="small"
                  defaultValue="template"
                  style={{ width: '100%', marginTop: 4 }}
                  options={[
                    { label: '提示词模板', value: 'template' },
                    { label: '自定义提示词', value: 'custom' },
                  ]}
                />
              </div>
              <Button type="primary" block style={{ background: theme.gradient, border: 'none', marginTop: 16 }}>
                开始生成
              </Button>
            </div>
          </div>
        )
      case 'expandText':
        return (
          <div className="panel-content">
            <div className="panel-header">
              <Text strong style={{ color: theme.text, fontSize: 16 }}>扩写</Text>
            </div>
            <div className="panel-body">
              <div className="form-item">
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>扩写内容</Text>
                <Input.TextArea
                  rows={4}
                  placeholder="输入需要扩写的内容..."
                  style={{ marginTop: 4, background: theme.bg, borderColor: theme.border }}
                  value={expandTextValue}
                  onChange={(e) => setExpandTextValue(e.target.value)}
                />
              </div>
              <div className="form-item">
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>扩写类型</Text>
                <Form.Item style={{ marginBottom: 4 }}><Checkbox>增加剧情</Checkbox></Form.Item>
                <Form.Item style={{ marginBottom: 4 }}><Checkbox>对话扩展</Checkbox></Form.Item>
                <Form.Item style={{ marginBottom: 0 }}><Checkbox>增加描写</Checkbox></Form.Item>
              </div>
              <div className="form-item">
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>目标字数</Text>
                <Select
                  size="small"
                  defaultValue="500"
                  style={{ width: '100%', marginTop: 4 }}
                  options={[
                    { label: '增加200字', value: '200' },
                    { label: '增加500字', value: '500' },
                    { label: '增加1000字', value: '1000' },
                    { label: '增加2000字', value: '2000' },
                  ]}
                />
              </div>
              <Button
                type="primary"
                block
                style={{ background: theme.gradient, border: 'none', marginTop: 16 }}
                loading={expandLoading}
                onClick={handleExpandText}
              >
                开始扩写
              </Button>
            </div>
          </div>
        )
      case 'polishText':
        return (
          <div className="panel-content">
            <div className="panel-header">
              <Text strong style={{ color: theme.text, fontSize: 16 }}>润色</Text>
            </div>
            <div className="panel-body">
              <div className="form-item">
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>润色选项</Text>
                <Form.Item style={{ marginBottom: 4 }}><Checkbox defaultChecked>优化表达</Checkbox></Form.Item>
                <Form.Item style={{ marginBottom: 4 }}><Checkbox defaultChecked>丰富细节</Checkbox></Form.Item>
                <Form.Item style={{ marginBottom: 4 }}><Checkbox>简化冗余</Checkbox></Form.Item>
                <Form.Item style={{ marginBottom: 4 }}><Checkbox>增强对话</Checkbox></Form.Item>
                <Form.Item style={{ marginBottom: 0 }}><Checkbox>调整节奏</Checkbox></Form.Item>
              </div>
              <div className="form-item">
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>输出格式</Text>
                <Select
                  size="small"
                  defaultValue="replace"
                  style={{ width: '100%', marginTop: 4 }}
                  options={[
                    { label: '直接替换', value: 'replace' },
                    { label: '对比显示', value: 'compare' },
                    { label: '修改建议', value: 'suggest' },
                  ]}
                />
              </div>
              <div className="form-item">
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>润色要求</Text>
                <Input.TextArea
                  rows={2}
                  placeholder="如有特殊要求，请输入..."
                  style={{ marginTop: 4, background: theme.bg, borderColor: theme.border }}
                />
              </div>
              <Button
                type="primary"
                block
                style={{ background: theme.gradient, border: 'none', marginTop: 16 }}
                loading={polishLoading}
                onClick={handlePolishText}
              >
                开始润色
              </Button>
            </div>
          </div>
        )
      case 'inspiration':
        return (
          <InspirationPanel
            isDark={isDark}
            theme={theme}
            onGenerateInspiration={handleInspiration}
            isLoading={inspirationLoading}
          />
        )
      case 'plotCards':
        return (
          <PlotCardsPanel
            isDark={isDark}
            theme={theme}
            cards={plotCards}
            onAddCard={async (card) => {
              if (!novelId) return
              try {
                const importanceMap = { high: 'A', medium: 'B', low: 'C' }
                const newCard = await plotCardRepo.create({
                  novelId,
                  description: card.content,
                  mood: card.mood,
                  goal: card.title,
                  importance: importanceMap[card.importance] as 'A' | 'B' | 'C',
                })
                setPlotCards([...plotCards, {
                  ...card,
                  id: newCard.id,
                  createdAt: new Date(newCard.createdAt).toISOString(),
                }])
              } catch (error) {
                console.error('添加剧情卡片失败:', error)
                message.error('添加失败')
              }
            }}
            onUpdateCard={async (id, card) => {
              try {
                const importanceMap = { high: 'A', medium: 'B', low: 'C' }
                await plotCardRepo.update(id, {
                  description: card.content,
                  mood: card.mood,
                  goal: card.title,
                  importance: card.importance ? importanceMap[card.importance] as 'A' | 'B' | 'C' : undefined,
                })
                setPlotCards(plotCards.map(c => c.id === id ? { ...c, ...card } : c))
              } catch (error) {
                console.error('更新剧情卡片失败:', error)
                message.error('更新失败')
              }
            }}
            onDeleteCard={async (id) => {
              try {
                await plotCardRepo.delete(id)
                setPlotCards(plotCards.filter(c => c.id !== id))
              } catch (error) {
                console.error('删除剧情卡片失败:', error)
                message.error('删除失败')
              }
            }}
          />
        )
      case 'characters':
        return (
          <div className="panel-content">
            <div className="panel-header">
              <Text strong style={{ color: theme.text, fontSize: 16 }}>人物</Text>
              <Space>
                <Button
                  size="small"
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ background: theme.gradient, border: 'none' }}
                  onClick={() => setCharacterGenerateModalOpen(true)}
                >
                  AI生成
                </Button>
              </Space>
            </div>
            <div style={{ marginTop: 12 }}>
              {characters.length === 0 ? (
                <Empty description="暂无人物" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  <Button type="link" size="small" onClick={() => setCharacterGenerateModalOpen(true)}>添加人物</Button>
                </Empty>
              ) : (
                <div className="characters-list">
                  {characters.map(char => (
                    <div
                      key={char.id}
                      style={{
                        padding: '12px',
                        marginBottom: 8,
                        background: theme.bg,
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <Text strong style={{ color: theme.text }}>{char.name}</Text>
                      {char.role && (
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                          {char.role === 'protagonist' ? '主角' :
                           char.role === 'supporting' ? '配角' :
                           char.role === 'antagonist' ? '反派' : '龙套'}
                        </Text>
                      )}
                      {char.description && (
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                          {char.description}
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      case 'entries':
        return (
          <div className="panel-content">
            <div className="panel-header">
              <Text strong style={{ color: theme.text, fontSize: 16 }}>词条</Text>
              <Space>
                <Button
                  size="small"
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ background: theme.gradient, border: 'none' }}
                  onClick={() => setEntryAIModalOpen(true)}
                >
                  AI生成
                </Button>
              </Space>
            </div>
            <div style={{ marginTop: 12 }}>
              <Empty description="暂无词条" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button type="link" size="small">添加词条</Button>
              </Empty>
            </div>
          </div>
        )
      case 'knowledge':
        return (
          <div className="panel-content">
            <div className="panel-header">
              <Text strong style={{ color: theme.text, fontSize: 16 }}>知识库</Text>
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                style={{ background: theme.gradient, border: 'none' }}
                onClick={async () => {
                  if (!novelId) return
                  try {
                    const newKnowledge = await knowledgeRepo.create({
                      title: '新知识条目',
                      novelId,
                    })
                    setKnowledges([...knowledges, newKnowledge])
                    message.success('已创建知识条目')
                  } catch (error) {
                    console.error('创建知识条目失败:', error)
                    message.error('创建失败')
                  }
                }}
              >
                新建
              </Button>
            </div>
            <div style={{ marginTop: 12 }}>
              {knowledges.length === 0 ? (
                <Empty description="暂无知识库" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <div className="knowledge-list">
                  {knowledges.map(k => (
                    <div
                      key={k.id}
                      style={{
                        padding: '12px',
                        marginBottom: 8,
                        background: theme.bg,
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <Text strong style={{ color: theme.text }}>{k.title}</Text>
                      {k.category && (
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                          {k.category}
                        </Text>
                      )}
                      {k.content && (
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                          {k.content.substring(0, 50)}...
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="workspace" style={{ background: theme.bg }}>
      {/* 顶部栏 */}
      <div className="top-bar" style={{ background: theme.bgSecondary, borderBottom: `1px solid ${theme.border}` }}>
        <div className="novel-info">
          <Button type="text" onClick={() => navigate('/')} style={{ color: theme.textSecondary }}>
            返回
          </Button>
          <span className="novel-title" style={{ color: theme.text }}>
            {isLoading ? <LoadingOutlined /> : currentNovelTitle || '未命名小说'}
          </span>
          <span className="chapter-count" style={{ color: theme.textSecondary }}>
            {volumes.length} 卷 / {totalWords.toLocaleString()} 字
          </span>
        </div>
        <div className="top-actions">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={!currentChapter}
            style={{ background: theme.gradient, border: 'none' }}
          >
            保存
          </Button>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="main-content" style={{ overflow: 'hidden' }}>
        {/* 左侧卷/章节管理面板 */}
        <div className="chapter-sidebar" style={{ background: theme.bgSecondary, borderRight: `1px solid ${theme.border}`, overflow: 'hidden' }}>
          <div className="sidebar-header">
            <Text strong style={{ color: theme.text }}>目录</Text>
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddVolume} style={{ background: theme.gradient, border: 'none' }}>
              新建
            </Button>
          </div>

          <div className="volume-list">
            {volumes.map(volume => (
              <div key={volume.id} className="volume-item">
                {/* 卷标题 */}
                <div className="volume-header" onClick={() => toggleVolume(volume.id)}>
                  <span style={{ color: theme.primary, marginRight: 4 }}>
                    {volume.expanded ? <FolderOpenOutlined /> : <FolderOutlined />}
                  </span>
                  <span className="volume-title" style={{ color: theme.text, flex: 1 }}>
                    {volume.title}
                  </span>
                  <Dropdown
                    menu={{
                      items: [
                        { key: 'addChapter', icon: <FileTextOutlined />, label: '添加章节', onClick: () => handleAddChapter(volume.id) },
                        { type: 'divider' },
                        { key: 'delete', icon: <DeleteOutlined />, label: '删除卷', danger: true, onClick: (e: any) => openDeleteModal('volume', volume.id, volume.title, e.domEvent as React.MouseEvent) },
                      ]
                    }}
                    trigger={['click']}
                  >
                    <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e: React.MouseEvent) => e.stopPropagation()} style={{ color: theme.textSecondary }} />
                  </Dropdown>
                </div>

                {/* 卷下的章节列表 */}
                {volume.expanded && (
                  <div className="chapter-list">
                    {volume.chapters.map(chapter => (
                      <div
                        key={chapter.id}
                        className={`chapter-item ${currentChapter?.id === chapter.id ? 'active' : ''}`}
                        onClick={() => handleSelectChapter(chapter)}
                        style={{
                          background: currentChapter?.id === chapter.id ? 'rgba(201, 169, 89, 0.15)' : 'transparent',
                          borderLeft: currentChapter?.id === chapter.id ? `3px solid ${theme.primary}` : '3px solid transparent',
                        }}
                      >
                        <span style={{ color: currentChapter?.id === chapter.id ? theme.primary : theme.textSecondary, marginRight: 4 }}>
                          <FileTextOutlined />
                        </span>
                        <span
                          className="chapter-title"
                          style={{
                            color: currentChapter?.id === chapter.id ? theme.primary : theme.text,
                            fontWeight: currentChapter?.id === chapter.id ? 600 : 400,
                          }}
                        >
                          {chapter.title}
                        </span>
                        <span className="chapter-words" style={{ color: theme.textSecondary, fontSize: 10 }}>
                          {chapter.wordCount}字
                        </span>
                      </div>
                    ))}

                    {volume.chapters.length === 0 && (
                      <div className="empty-chapters" style={{ padding: '8px 12px', color: theme.textSecondary, fontSize: 12 }}>
                        暂无章节
                        <Button
                          type="link"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={(e) => { e.stopPropagation(); handleAddChapter(volume.id); }}
                          style={{ padding: 0, marginLeft: 8 }}
                        >
                          添加
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {volumes.length === 0 && (
              <Empty description="暂无卷" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 40 }}>
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddVolume} style={{ background: theme.gradient, border: 'none' }}>
                  创建第一卷
                </Button>
              </Empty>
            )}
          </div>
        </div>

        {/* 中央编辑器 */}
        <div className="editor-area" style={{ background: theme.bg, minWidth: 0 }}>
          {/* 章节标题 */}
          <div className="chapter-title-area">
            <input
              type="text"
              className="chapter-title-input"
              placeholder="输入章节标题..."
              value={currentChapter?.title || ''}
              onChange={(e) => currentChapter && updateCurrentChapter({ title: e.target.value })}
              style={{
                background: 'transparent',
                color: theme.text,
                borderBottom: `1px solid ${theme.border}`,
              }}
            />
          </div>

          {/* 工具栏 */}
          <div className="editor-toolbar" style={{ background: theme.bgSecondary, borderBottom: `1px solid ${theme.border}` }}>
            <Space size={2}>
              <Select
                value={fontSize}
                onChange={setFontSize}
                style={{ width: 70 }}
                size="small"
                options={[
                  { label: '小', value: '14px' },
                  { label: '中', value: '16px' },
                  { label: '大', value: '18px' },
                  { label: '特大', value: '22px' },
                ]}
              />
              <Select
                value={fontFamily}
                onChange={setFontFamily}
                style={{ width: 100 }}
                size="small"
                options={[
                  { label: '微软雅黑', value: "'Microsoft YaHei', sans-serif" },
                  { label: '宋体', value: "'SimSun', serif" },
                  { label: '楷体', value: "'KaiTi', serif" },
                  { label: '黑体', value: "'SimHei', sans-serif" },
                ]}
              />
              <span className="divider" style={{ width: 1, height: 20, background: theme.border, margin: '0 8px' }} />

              {/* AI工具 */}
              {toolbarButtons.map(btn => (
                <Tooltip key={btn.key} title={btn.label}>
                  <Button
                    type="text"
                    icon={btn.icon}
                    size="small"
                    onClick={() => togglePanel(btn.key as RightPanelType)}
                    style={{
                      color: activePanel === btn.key ? theme.primary : theme.textSecondary,
                      background: activePanel === btn.key ? 'rgba(201, 169, 89, 0.15)' : 'transparent',
                    }}
                  />
                </Tooltip>
              ))}

              <span className="divider" style={{ width: 1, height: 20, background: theme.border, margin: '0 8px' }} />

              <Tooltip title="总纲">
                <Button
                  type="text"
                  icon={<OrderedListOutlined />}
                  size="small"
                  onClick={() => setOutlineModalOpen(true)}
                  style={{ color: theme.textSecondary }}
                >
                  总纲
                </Button>
              </Tooltip>

              <span className="divider" style={{ width: 1, height: 20, background: theme.border, margin: '0 8px' }} />

              <Tooltip title="撤销">
                <Button type="text" icon={<UndoOutlined />} size="small" onClick={handleUndo} style={{ color: theme.textSecondary }} />
              </Tooltip>
              <Tooltip title="重做">
                <Button type="text" icon={<RedoOutlined />} size="small" onClick={handleRedo} style={{ color: theme.textSecondary }} />
              </Tooltip>
              <span className="divider" style={{ width: 1, height: 20, background: theme.border, margin: '0 8px' }} />
              <Tooltip title="加粗">
                <Button type="text" icon={<BoldOutlined />} size="small" onClick={handleBold} style={{ color: theme.textSecondary }} />
              </Tooltip>
              <Tooltip title="斜体">
                <Button type="text" icon={<ItalicOutlined />} size="small" onClick={handleItalic} style={{ color: theme.textSecondary }} />
              </Tooltip>
              <span className="divider" style={{ width: 1, height: 20, background: theme.border, margin: '0 8px' }} />
              <Tooltip title="插入分章符">
                <Button type="text" icon={<ScissorOutlined />} size="small" onClick={handleInsertDivider} style={{ color: theme.textSecondary }} />
              </Tooltip>
              <Tooltip title="全文搜索">
                <Button type="text" icon={<SearchOutlined />} size="small" onClick={() => setSearchModalOpen(true)} style={{ color: theme.textSecondary }} />
              </Tooltip>
              <Tooltip title="复制全文">
                <Button type="text" icon={<CopyOutlined />} size="small" onClick={handleCopyContent} style={{ color: theme.textSecondary }} />
              </Tooltip>
            </Space>

            <Space size={4}>
              <span className="word-count" style={{ color: theme.textSecondary, fontSize: 12 }}>
                {currentChapter?.wordCount || 0} 字
              </span>
            </Space>
          </div>

          {/* 编辑区域 */}
          <div className="editor-content" style={{ background: theme.bg }}>
            {currentChapter ? (
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={currentChapter.content}
                onChange={(content) => currentChapter && updateChapter(currentChapter.id, { content })}
                style={{ height: 'calc(100% - 120px)', fontSize, fontFamily }}
                modules={{ toolbar: false }}
                formats={[]}
              />
            ) : (
              <div className="empty-editor" style={{ color: theme.textSecondary }}>
                请从左侧选择或创建章节
              </div>
            )}

            {/* 章节细纲区域 */}
            {currentChapter && (
              <div className="chapter-outline-area" style={{
                padding: '16px 60px',
                borderTop: `1px solid ${theme.border}`,
                background: theme.bgSecondary,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Text strong style={{ color: theme.text, fontSize: 14 }}>章节细纲</Text>
                  <Button
                    type="link"
                    size="small"
                    onClick={handleSaveOutline}
                    style={{ color: theme.primary, padding: 0 }}
                  >
                    保存
                  </Button>
                </div>
                <Input.TextArea
                  rows={2}
                  placeholder="输入本章细纲..."
                  value={chapterOutline}
                  onChange={(e) => setChapterOutline(e.target.value)}
                  style={{
                    background: theme.bg,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 右侧动态面板 */}
        <div className="right-sidebar" style={{ background: theme.bgSecondary, borderLeft: `1px solid ${theme.border}`, overflow: 'hidden' }}>
          {renderRightPanel()}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <Modal
        title="确认删除"
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={confirmDelete}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除「{deleteTarget?.title}」{deleteTarget?.type === 'volume' ? '卷' : '章节'}吗？{deleteTarget?.type === 'volume' ? '卷下的所有章节也会被删除。' : ''}</p>
      </Modal>

      {/* 全文搜索弹窗 */}
      <Modal
        title="全文搜索"
        open={searchModalOpen}
        onCancel={() => { setSearchModalOpen(false); setSearchQuery(''); setSearchResults([]); }}
        footer={null}
        width={600}
      >
        <Input.Search
          placeholder="输入搜索内容..."
          enterButton="搜索"
          size="large"
          style={{ marginBottom: 16 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          loading={searchLoading}
        />
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => handleJumpToChapter(result.chapterId)}
                style={{
                  padding: '12px',
                  marginBottom: 8,
                  background: theme.bg,
                  borderRadius: 8,
                  border: `1px solid ${theme.border}`,
                  cursor: 'pointer',
                }}
              >
                <Text strong style={{ color: theme.primary }}>{result.chapterTitle}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, display: 'block', marginTop: 4 }}>
                  {result.content}
                </Text>
              </div>
            ))
          ) : searchQuery && !searchLoading ? (
            <div style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', padding: 20 }}>
              未找到匹配内容
            </div>
          ) : (
            <div style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', padding: 20 }}>
              输入关键词搜索所有章节内容
            </div>
          )}
        </div>
      </Modal>

      {/* 总纲弹窗 */}
      <OutlineManagerFull
        open={outlineModalOpen}
        onClose={() => setOutlineModalOpen(false)}
      />

      {/* AI生成结果弹窗 */}
      <GenerateResultModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        resultContent={generateResult}
        isLoading={generateLoading}
        onApply={(content) => {
          if (currentChapter) {
            updateChapter(currentChapter.id, {
              content: currentChapter.content + content
            })
            message.success('已应用到编辑器')
          }
        }}
      />

      {/* AI生成角色弹窗 */}
      <CharacterGenerateModal
        open={characterGenerateModalOpen}
        onClose={() => setCharacterGenerateModalOpen(false)}
        onGenerate={(character) => {
          message.success(`生成角色成功: ${character.name}`)
        }}
        chapters={volumes.flatMap(v => v.chapters)}
      />

      {/* AI生成词条弹窗 */}
      <EntryAIModal
        open={entryAIModalOpen}
        onClose={() => setEntryAIModalOpen(false)}
        onGenerate={(entry) => {
          message.success(`生成词条成功: ${entry.name}`)
        }}
      />

      {/* 全局样式 */}
      <style>{`
        .workspace {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }

        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          flex-shrink: 0;
        }

        .novel-info { display: flex; align-items: center; gap: 16px; }
        .novel-title { font-size: 16px; font-weight: 600; }
        .chapter-count { font-size: 13px; }

        .main-content {
          display: flex;
          flex: 1;
          overflow: hidden;
          width: 100%;
        }

        /* 左侧卷/章节面板 */
        .chapter-sidebar {
          width: 240px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid;
        }

        .volume-list {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 8px;
        }

        .volume-item { margin-bottom: 4px; }

        .volume-header {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .volume-header:hover { background: rgba(201, 169, 89, 0.08); }

        .volume-title {
          font-size: 13px;
          font-weight: 500;
          flex: 1;
        }

        .chapter-list { padding-left: 20px; }

        .chapter-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .chapter-item:hover { background: rgba(201, 169, 89, 0.05); }

        .chapter-title {
          flex: 1;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .chapter-words { flex-shrink: 0; }

        /* 中央编辑器 */
        .editor-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chapter-title-area {
          padding: 20px 60px 0;
          flex-shrink: 0;
        }

        .chapter-title-input {
          width: 100%;
          font-size: 28px;
          font-weight: 600;
          padding: 12px 0;
          border: none;
          outline: none;
        }

        .chapter-title-input::placeholder { color: #a99d92; }

        .editor-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 60px;
          flex-shrink: 0;
        }

        .editor-toolbar .ant-btn:hover {
          color: ${theme.primary} !important;
        }

        .editor-content {
          flex: 1;
          overflow: hidden;
          padding: 0 60px 40px;
        }

        .empty-editor {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-size: 16px;
        }

        .ql-container { font-family: 'Microsoft YaHei', sans-serif; }
        .ql-editor { padding: 30px 0 !important; line-height: 1.8 !important; }
        .ql-editor.ql-blank::before { color: #a99d92 !important; font-style: normal !important; left: 0 !important; }

        /* 右侧面板 */
        .right-sidebar {
          width: 320px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .panel-content {
          padding: 16px;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .panel-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-item {
          margin-bottom: 8px;
        }

        @media (max-width: 1200px) {
          .right-sidebar { width: 280px; }
        }

        @media (max-width: 992px) {
          .right-sidebar { width: 260px; }
          .chapter-sidebar { width: 220px; }
        }

        @media (max-width: 768px) {
          .chapter-sidebar {
            position: absolute;
            z-index: 100;
            height: 100%;
          }
          .chapter-title-area, .editor-toolbar, .editor-content {
            padding-left: 32px !important;
            padding-right: 32px !important;
          }
        }

        @media (max-width: 576px) {
          .right-sidebar { display: none; }
          .chapter-title-area, .editor-toolbar, .editor-content {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
          .top-bar { padding: 12px 16px; }
        }
      `}</style>
    </div>
  )
}

export default NovelWorkspace
