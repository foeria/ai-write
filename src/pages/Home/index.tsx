import { useState, useCallback, useEffect } from 'react'
import { Card, Row, Col, Button, Empty, Typography, Space, Modal, message, Select, Input } from 'antd'
import { PlusOutlined, EditOutlined, EyeOutlined, BookOutlined, QuestionCircleOutlined, FileTextOutlined, CloseOutlined, SearchOutlined, FilterOutlined, CompassOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/useUserStore'
import { useNovelStore, type Novel } from '@/store/useNovelStore'
import { useAppStore } from '@/store/useAppStore'
import { novelRepo } from '@/api/repository'
import NovelCard from './components/NovelCard'
import CreateNovelModal, { type NovelFormData } from './components/CreateNovelModal'
import ImportGuideModal from './components/ImportGuideModal'
import NovelGuideModal from './components/NovelGuideModal'

const { Text, Title } = Typography
const { Search } = Input

// 扩展的Novel接口
interface ExtendedNovel extends Novel {
  cover?: string
  category?: string
  genre?: string
  tags?: string
  targetWords?: number
  status?: string
}

// 筛选条件
interface FilterParams {
  category: string
  status: string
  keyword: string
}

function Home() {
  const navigate = useNavigate()
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  const { userInfo } = useUserStore()
  const { setCurrentNovel } = useNovelStore()

  // 状态
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [guideModalOpen, setGuideModalOpen] = useState(false)
  const [novels, setNovels] = useState<ExtendedNovel[]>([])
  const [allNovels, setAllNovels] = useState<ExtendedNovel[]>([])
  const [editingNovel, setEditingNovel] = useState<NovelFormData | null>(null)
  const [loading, setLoading] = useState(false)

  // 筛选状态
  const [filters, setFilters] = useState<FilterParams>({
    category: '',
    status: '',
    keyword: '',
  })

  // 加载小说列表
  const loadNovels = useCallback(async () => {
    setLoading(true)
    try {
      const data = await novelRepo.getAll()
      const mappedNovels: ExtendedNovel[] = data.map(n => ({
        ...n,
        status: n.status || 'draft',
        category: n.category || n.genre || '',
        genre: n.genre || n.category || '',
      }))
      setAllNovels(mappedNovels)
      setNovels(mappedNovels)
    } catch (error) {
      console.error('Failed to load novels:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始化加载
  useEffect(() => {
    loadNovels()
  }, [loadNovels])

  // 筛选小说
  const filterNovels = useCallback((filterParams: FilterParams) => {
    setFilters(filterParams)
    let filtered = [...allNovels]

    // 分类筛选 - 使用 category 字段
    if (filterParams.category) {
      filtered = filtered.filter(n => n.category === filterParams.category)
    }

    // 状态筛选
    if (filterParams.status) {
      filtered = filtered.filter(n => n.status === filterParams.status)
    }

    // 关键词筛选
    if (filterParams.keyword) {
      const keyword = filterParams.keyword.toLowerCase()
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(keyword) ||
        n.description?.toLowerCase().includes(keyword) ||
        n.tags?.toLowerCase().includes(keyword)
      )
    }

    setNovels(filtered)
  }, [allNovels])

  // 处理筛选变化
  const handleCategoryChange = useCallback((value: string) => {
    filterNovels({ ...filters, category: value })
  }, [filters, filterNovels])

  const handleStatusChange = useCallback((value: string) => {
    filterNovels({ ...filters, status: value })
  }, [filters, filterNovels])

  const handleKeywordSearch = useCallback((value: string) => {
    filterNovels({ ...filters, keyword: value })
  }, [filters, filterNovels])

  // 主题颜色
  const bgColor = isDark ? '#1a1612' : '#f5f3f0'
  const cardBgColor = isDark ? '#252220' : '#ffffff'
  const textColor = isDark ? '#e8e0d5' : '#3d3830'
  const secondaryTextColor = isDark ? '#a99d92' : '#6b635a'
  const borderColor = isDark ? '#4a4238' : '#e8e0d5'

  // 创建新小说
  const handleCreateNovel = useCallback(async (values: NovelFormData, cover: string | null) => {
    try {
      const targetWordsValue = values.targetWords ? values.targetWords * 10000 : 300000
      const created = await novelRepo.create({
        id: '',
        title: values.title || '',
        description: values.description || '',
        genre: values.category,
        category: values.category,
        tags: values.tags,
        author: values.author,
        status: values.publishStatus || 'draft',
        targetWords: targetWordsValue,
        contentRating: values.contentRating,
        coverImage: cover || undefined,
        wordCount: 0,
        // 创作设定
        theme: values.theme,
        style: values.style,
        tone: values.tone,
        // 背景设定
        era: values.era,
        location: values.location,
        worldType: values.worldType,
        // 大纲基础
        coreHook: values.coreHook,
        mainTags: values.mainTags,
        subTags: values.subTags,
        targetAudience: values.targetAudience,
        // 主角设定
        protagonistName: values.protagonistName,
        protagonistAge: values.protagonistAge,
        protagonistBackground: values.protagonistBackground,
        protagonistGoal: values.protagonistGoal,
        // 世界观基础
        worldArchitecture: values.worldArchitecture,
        powerSystem: values.powerSystem,
        goldenFinger: values.goldenFinger,
        // 系列设定
        isPartOfSeries: values.isPartOfSeries,
        seriesName: values.seriesName,
        bookNumber: values.bookNumber,
        totalBooks: values.totalBooks,
      } as any)

      const newNovel: ExtendedNovel = {
        ...created,
        status: values.publishStatus || 'draft',
        category: values.category || '',
        genre: values.genre || values.category || '',
        tags: values.tags,
        targetWords: targetWordsValue,
      }

      setAllNovels(prev => [newNovel, ...prev])
      filterNovels(filters)
      setCreateModalOpen(false)
      message.success('小说创建成功')
    } catch (error) {
      console.error('Failed to create novel:', error)
      message.error('创建小说失败')
    }
  }, [filters, filterNovels])

  // 编辑小说
  const handleEditNovel = useCallback((novel: ExtendedNovel) => {
    setEditingNovel({
      title: novel.title,
      description: novel.description,
      category: novel.category || novel.genre,
      genre: novel.genre || novel.category,
      tags: novel.tags,
      targetWords: novel.targetWords ? Math.floor(novel.targetWords / 10000) : 30,
      cover: novel.coverImage,
      author: novel.author,
      publishStatus: novel.status,
      contentRating: novel.contentRating,
      theme: novel.theme,
      style: novel.style,
      tone: novel.tone,
      era: novel.era,
      location: novel.location,
      worldType: novel.worldType,
      coreHook: novel.coreHook,
      mainTags: novel.mainTags,
      subTags: novel.subTags,
      targetAudience: novel.targetAudience,
      protagonistName: novel.protagonistName,
      protagonistAge: novel.protagonistAge,
      protagonistBackground: novel.protagonistBackground,
      protagonistGoal: novel.protagonistGoal,
      worldArchitecture: novel.worldArchitecture,
      powerSystem: novel.powerSystem,
      goldenFinger: novel.goldenFinger,
      isPartOfSeries: novel.isPartOfSeries,
      seriesName: novel.seriesName,
      bookNumber: novel.bookNumber,
      totalBooks: novel.totalBooks,
    })
    setCreateModalOpen(true)
  }, [])

  // 更新小说
  const handleUpdateNovel = useCallback(async (values: NovelFormData, cover: string | null) => {
    if (!editingNovel) return

    const novelToUpdate = allNovels.find(n => n.title === editingNovel.title || n.id === editingNovel.title)
    if (!novelToUpdate) return

    const targetWordsValue = values.targetWords ? values.targetWords * 10000 : 300000

    try {
      await novelRepo.update(novelToUpdate.id, {
        title: values.title || '',
        description: values.description || '',
        genre: values.category,
        category: values.category,
        tags: values.tags,
        author: values.author,
        status: values.publishStatus,
        targetWords: targetWordsValue,
        contentRating: values.contentRating,
        coverImage: cover || undefined,
        // 创作设定
        theme: values.theme,
        style: values.style,
        tone: values.tone,
        // 背景设定
        era: values.era,
        location: values.location,
        worldType: values.worldType,
        // 大纲基础
        coreHook: values.coreHook,
        mainTags: values.mainTags,
        subTags: values.subTags,
        targetAudience: values.targetAudience,
        // 主角设定
        protagonistName: values.protagonistName,
        protagonistAge: values.protagonistAge,
        protagonistBackground: values.protagonistBackground,
        protagonistGoal: values.protagonistGoal,
        // 世界观基础
        worldArchitecture: values.worldArchitecture,
        powerSystem: values.powerSystem,
        goldenFinger: values.goldenFinger,
        // 系列设定
        isPartOfSeries: values.isPartOfSeries,
        seriesName: values.seriesName,
        bookNumber: values.bookNumber,
        totalBooks: values.totalBooks,
      } as any)

      const updatedNovels = allNovels.map(n =>
        n.id === novelToUpdate.id
          ? {
              ...n,
              title: values.title || '',
              description: values.description || '',
              category: values.category || '',
              genre: values.genre || values.category || '',
              tags: values.tags,
              targetWords: targetWordsValue,
              coverImage: cover,
              status: values.publishStatus,
              author: values.author,
              contentRating: values.contentRating,
              theme: values.theme,
              style: values.style,
              tone: values.tone,
              era: values.era,
              location: values.location,
              worldType: values.worldType,
              coreHook: values.coreHook,
              mainTags: values.mainTags,
              subTags: values.subTags,
              targetAudience: values.targetAudience,
              protagonistName: values.protagonistName,
              protagonistAge: values.protagonistAge,
              protagonistBackground: values.protagonistBackground,
              protagonistGoal: values.protagonistGoal,
              worldArchitecture: values.worldArchitecture,
              powerSystem: values.powerSystem,
              goldenFinger: values.goldenFinger,
              isPartOfSeries: values.isPartOfSeries,
              seriesName: values.seriesName,
              bookNumber: values.bookNumber,
              totalBooks: values.totalBooks,
            }
          : n
      )

      setAllNovels(updatedNovels)
      filterNovels(filters)
      setCreateModalOpen(false)
      setEditingNovel(null)
      message.success('小说更新成功')
    } catch (error) {
      console.error('Failed to update novel:', error)
      message.error('更新小说失败')
    }
  }, [editingNovel, allNovels, filters, filterNovels])

  // 打开小说
  const handleOpenNovel = useCallback((novel: ExtendedNovel) => {
    setCurrentNovel(novel as Novel)
    navigate(`/novel/workspace/${novel.id}`)
  }, [setCurrentNovel, navigate])

  // 删除小说
  const handleDeleteNovel = useCallback((id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这本小说吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await novelRepo.delete(id)
          const updatedNovels = allNovels.filter((n) => n.id !== id)
          setAllNovels(updatedNovels)
          filterNovels(filters)
          message.success('小说已删除')
        } catch (error) {
          console.error('Failed to delete novel:', error)
          message.error('删除小说失败')
        }
      },
    })
  }, [allNovels, filters, filterNovels])

  // 下载小说
  const handleDownloadNovel = useCallback((novel: ExtendedNovel) => {
    const dataStr = JSON.stringify(novel, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${novel.title}.json`
    link.click()
    URL.revokeObjectURL(url)
    message.success('小说已下载')
  }, [])

  // 关闭创建/编辑模态框
  const handleCloseCreateModal = useCallback(() => {
    setCreateModalOpen(false)
    setEditingNovel(null)
  }, [])

  return (
    <div style={{ padding: 8, background: bgColor, minHeight: '100%' }}>
      {/* 欢迎区域 */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, color: textColor }}>
            {userInfo?.nickname || '创作者'}，开始今天的创作吧
          </Title>
          <Text type="secondary" style={{ color: secondaryTextColor }}>
            当前有 {novels.length} 个创作项目
            {filters.category || filters.status || filters.keyword
              ? '（已筛选）'
              : ''}
          </Text>
        </div>
        <Space>
          <Button icon={<CompassOutlined />} onClick={() => setGuideModalOpen(true)}>
            开书指南
          </Button>
          <Button icon={<QuestionCircleOutlined />} onClick={() => setImportModalOpen(true)}>
            导入指南
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setCreateModalOpen(true)}
            className="btn-gradient"
          >
            新建小说
          </Button>
        </Space>
      </div>

      {/* 筛选区域 */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          background: cardBgColor,
          borderRadius: 8,
          border: `1px solid ${borderColor}`,
        }}
      >
        <Space wrap size="middle">
          <Search
            placeholder="搜索小说标题、描述..."
            allowClear
            onSearch={handleKeywordSearch}
            style={{ width: 240 }}
            prefix={<SearchOutlined style={{ color: secondaryTextColor }} />}
          />
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 140 }}
            value={filters.category || undefined}
            onChange={handleCategoryChange}
            options={[
              { value: '奇幻', label: '奇幻' },
              { value: '科幻', label: '科幻' },
              { value: '都市', label: '都市' },
              { value: '武侠', label: '武侠' },
              { value: '历史', label: '历史' },
              { value: '悬疑', label: '悬疑' },
              { value: '言情', label: '言情' },
              { value: '玄幻', label: '玄幻' },
              { value: '军事', label: '军事' },
              { value: '游戏', label: '游戏' },
            ]}
          />
          <Select
            placeholder="选择状态"
            allowClear
            style={{ width: 120 }}
            value={filters.status || undefined}
            onChange={handleStatusChange}
            options={[
              { value: 'draft', label: '草稿' },
              { value: 'writing', label: '写作中' },
              { value: 'completed', label: '已完成' },
              { value: 'paused', label: '暂停' },
            ]}
          />
          {(filters.category || filters.status || filters.keyword) && (
            <Button
              type="link"
              onClick={() => filterNovels({ category: '', status: '', keyword: '' })}
              style={{ padding: '4px 8px' }}
            >
              清除筛选
            </Button>
          )}
        </Space>
      </div>

      {/* 统计卡片 - 使用 allNovels 显示全部统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card
            variant="borderless"
            style={{ background: cardBgColor, borderColor: borderColor }}
          >
            <div style={{ textAlign: 'center' }}>
              <BookOutlined style={{ fontSize: 32, color: '#c9a959' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong style={{ color: textColor }}>{allNovels.length}</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12, color: secondaryTextColor }}>
                  创作项目
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            variant="borderless"
            style={{ background: cardBgColor, borderColor: borderColor }}
          >
            <div style={{ textAlign: 'center' }}>
              <EditOutlined style={{ fontSize: 32, color: '#8b6914' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong style={{ color: textColor }}>
                  {novels.filter((n) => n.status === 'writing').length}
                </Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12, color: secondaryTextColor }}>
                  进行中
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            variant="borderless"
            style={{ background: cardBgColor, borderColor: borderColor }}
          >
            <div style={{ textAlign: 'center' }}>
              <EyeOutlined style={{ fontSize: 32, color: '#a07818' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong style={{ color: textColor }}>
                  {novels.reduce((acc, n) => acc + n.chapterCount, 0)}
                </Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12, color: secondaryTextColor }}>
                  章节总数
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            variant="borderless"
            style={{ background: cardBgColor, borderColor: borderColor }}
          >
            <div style={{ textAlign: 'center' }}>
              <EditOutlined style={{ fontSize: 32, color: '#c9a959' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong style={{ color: textColor }}>
                  {novels.reduce((acc, n) => acc + n.wordCount, 0).toLocaleString()}
                </Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12, color: secondaryTextColor }}>
                  字数统计
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 小说列表 */}
      <Title level={4} style={{ marginBottom: 16, color: textColor }}>
        我的作品
      </Title>

      {novels.length > 0 ? (
        <Row gutter={[16, 16]}>
          {novels.map((novel) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={novel.id}>
              <NovelCard
                novel={novel}
                onOpen={() => handleOpenNovel(novel)}
                onEdit={() => handleEditNovel(novel)}
                onDelete={() => handleDeleteNovel(novel.id)}
                onDownload={() => handleDownloadNovel(novel)}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Card variant="borderless" style={{ background: cardBgColor, borderColor: borderColor }}>
          <Empty description="还没有创作作品" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              创建第一部作品
            </Button>
          </Empty>
        </Card>
      )}

      {/* 新建/编辑小说弹窗 */}
      <CreateNovelModal
        open={createModalOpen}
        onCancel={handleCloseCreateModal}
        onCreate={editingNovel ? handleUpdateNovel : handleCreateNovel}
        editingNovel={editingNovel}
      />

      {/* 导入指南弹窗 */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#c9a959' }} />
            <span>导入指南</span>
          </Space>
        }
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={null}
        width={600}
        closeIcon={<CloseOutlined style={{ fontSize: 18 }} />}
      >
        <ImportGuideModal onClose={() => setImportModalOpen(false)} />
      </Modal>

      {/* 开书指南弹窗 */}
      <Modal
        title={
          <Space>
            <CompassOutlined style={{ color: '#c9a959' }} />
            <span>开书指南</span>
          </Space>
        }
        open={guideModalOpen}
        onCancel={() => setGuideModalOpen(false)}
        footer={null}
        width={800}
        closeIcon={<CloseOutlined style={{ fontSize: 18 }} />}
      >
        <NovelGuideModal
          onClose={() => setGuideModalOpen(false)}
          onComplete={(guideData) => {
            // 使用指南数据创建小说
            setGuideModalOpen(false)
            setEditingNovel(guideData)
            setCreateModalOpen(true)
          }}
        />
      </Modal>
    </div>
  )
}

export default Home
