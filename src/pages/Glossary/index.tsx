import { useState, useEffect } from 'react'
import {
  Card,
  Typography,
  Empty,
  Button,
  Input,
  Select,
  Space,
  Row,
  Col,
  Tag,
  message,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  BookOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { useGlossaryStore, type GlossaryItem } from '@/store/useGlossaryStore'
import { useAppStore } from '@/store/useAppStore'
import { useNovelStore, type Novel } from '@/store/useNovelStore'
import { novelRepo } from '@/api/repository'
import GlossaryCard from './components/GlossaryCard'
import GlossaryEditorModal from './components/GlossaryEditorModal'
import GlossaryAIModal from './components/GlossaryAIModal'

const { Title, Text } = Typography

function Glossary() {
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  const currentNovel = useNovelStore((state) => state.currentNovel)
  const {
    items,
    categories,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    loadEntries,
    addItem,
    updateItem,
    deleteItem,
    isLoading,
  } = useGlossaryStore()

  // 小说筛选状态
  const [novelList, setNovelList] = useState<Novel[]>([])
  const [selectedNovelId, setSelectedNovelId] = useState<string | undefined>(undefined)

  // AI Modal状态
  const [aiModalOpen, setAIModalOpen] = useState(false)

  // 加载小说列表
  useEffect(() => {
    const loadNovels = async () => {
      try {
        const novels = await novelRepo.getAll()
        setNovelList(novels)
      } catch (error) {
        console.error('Failed to load novels:', error)
      }
    }
    loadNovels()
  }, [])

  // 加载词条数据
  useEffect(() => {
    loadEntries(selectedNovelId || currentNovel?.id)
  }, [loadEntries, selectedNovelId, currentNovel?.id])

  const [editorModalOpen, setEditorModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GlossaryItem | null>(null)
  const [messageApi, contextHolder] = message.useMessage()

  // 背景色
  const bgColor = isDark ? '#1a1612' : '#f5f3f0'
  const cardBgColor = isDark ? '#252220' : '#ffffff'
  const textColor = isDark ? '#e8e0d5' : '#3d3830'
  const secondaryTextColor = isDark ? '#a99d92' : '#6b635a'
  const borderColor = isDark ? '#4a4238' : '#e8e0d5'

  // 获取词条的显示名称和定义（兼容 Entry 和 GlossaryItem）
  const getItemName = (item: GlossaryItem) => item.title || ''
  const getItemDefinition = (item: GlossaryItem) => item.definition || item.description || ''
  const getItemTags = (item: GlossaryItem) => item.tags || []

  // 筛选词条（添加按小说筛选）
  const filteredItems = items.filter((item) => {
    const matchesCategory = !selectedCategory || selectedCategory === 'all'
      ? true
      : item.category === selectedCategory
    // 按小说筛选
    const matchesNovel = !selectedNovelId
      ? true
      : item.novelId === selectedNovelId
    const name = getItemName(item).toLowerCase()
    const definition = getItemDefinition(item).toLowerCase()
    const tags = getItemTags(item).join(' ').toLowerCase()
    const matchesSearch = !searchQuery
      ? true
      : name.includes(searchQuery.toLowerCase()) ||
        definition.includes(searchQuery.toLowerCase()) ||
        tags.includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && matchesNovel
  })

  // 处理相关词条点击
  const handleRelatedClick = (relatedName: string) => {
    // 查找匹配的词条
    const relatedItem = items.find(
      (item) =>
        getItemName(item).toLowerCase() === relatedName.toLowerCase() ||
        (item.relatedItems || []).some(
          (rel) => rel.toLowerCase() === relatedName.toLowerCase()
        )
    )
    if (relatedItem) {
      // 找到则打开编辑
      setEditingItem(relatedItem)
      setEditorModalOpen(true)
    } else {
      // 未找到则提示并设置搜索词
      setSearchQuery(relatedName)
      messageApi.info(`未找到词条"${relatedName}"，已设置为搜索关键词`)
    }
  }

  // 处理AI生成词条保存
  const handleAICreate = async (values: Omit<GlossaryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addItem({
        ...values,
        novelId: selectedNovelId || currentNovel?.id,
      })
      messageApi.success('AI词条创建成功')
      setAIModalOpen(false)
    } catch (error) {
      messageApi.error('创建失败')
    }
  }

  const handleCreate = async (values: Omit<GlossaryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addItem({
        ...values,
        novelId: currentNovel?.id,
      })
      messageApi.success('词条创建成功')
      setEditorModalOpen(false)
    } catch (error) {
      messageApi.error('创建失败')
    }
  }

  const handleEdit = (item: GlossaryItem) => {
    setEditingItem(item)
    setEditorModalOpen(true)
  }

  const handleUpdate = async (id: string, updates: Partial<GlossaryItem>) => {
    try {
      await updateItem(id, updates)
      messageApi.success('词条更新成功')
      setEditingItem(null)
      setEditorModalOpen(false)
    } catch (error) {
      messageApi.error('更新失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id)
      messageApi.success('词条删除成功')
    } catch (error) {
      messageApi.error('删除失败')
    }
  }

  // 分类统计
  const categoryStats = categories
    .filter((c) => c.id !== 'all')
    .map((c) => ({
      ...c,
      count: items.filter((i) => i.category === c.id).length,
    }))

  return (
    <>
      {contextHolder}
      <div style={{ padding: 8, background: bgColor, minHeight: '100%' }}>
        {/* 顶部栏 */}
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0, color: textColor }}>
              <BookOutlined style={{ marginRight: 8 }} />
              词条库
            </Title>
            <Text type="secondary" style={{ color: secondaryTextColor }}>
              共 {items.length} 个词条
            </Text>
          </div>
          <Space>
            {/* 小说筛选下拉框 */}
            <Select
              placeholder="选择小说"
              allowClear
              showSearch
              style={{ width: 180 }}
              value={selectedNovelId}
              onChange={(val) => setSelectedNovelId(val)}
              options={[
                { label: '全部小说', value: undefined },
                ...novelList.map((n) => ({ label: n.title, value: n.id })),
              ]}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
            <Select
              placeholder="选择分类"
              allowClear
              style={{ width: 140 }}
              value={selectedCategory === 'all' ? undefined : selectedCategory}
              onChange={(val) => setSelectedCategory(val || null)}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
            <Input
              placeholder="搜索词条..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 200 }}
            />
            {/* AI生成按钮 */}
            <Button
              icon={<StarOutlined />}
              onClick={() => {
                setEditingItem(null)
                setAIModalOpen(true)
              }}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: '#fff',
              }}
            >
              AI生成
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingItem(null)
                setEditorModalOpen(true)
              }}
              className="btn-gradient"
            >
              创建词条
            </Button>
          </Space>
        </div>

        {/* 分类标签栏 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            {categoryStats.map((cat) => (
              <Tag
                key={cat.id}
                color={selectedCategory === cat.id ? cat.color : undefined}
                style={{
                  cursor: 'pointer',
                  padding: '4px 12px',
                  fontSize: 13,
                  border: selectedCategory === cat.id ? 'none' : `1px solid ${borderColor}`,
                  background: selectedCategory === cat.id ? cat.color : isDark ? '#252220' : '#ffffff',
                  color: selectedCategory === cat.id ? '#fff' : secondaryTextColor,
                }}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              >
                {cat.name} ({cat.count})
              </Tag>
            ))}
          </Space>
        </div>

        {/* 词条列表 */}
        <Card
          variant="borderless"
          style={{
            background: cardBgColor,
            borderColor: borderColor,
          }}
        >
          <Spin spinning={isLoading}>
          {filteredItems.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredItems.map((item) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                  <GlossaryCard
                    item={item}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDelete(item.id)}
                    onRelatedClick={handleRelatedClick}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="还没有创建词条" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingItem(null)
                    setEditorModalOpen(true)
                  }}
                >
                  创建第一个词条
                </Button>
                <Button
                  icon={<StarOutlined />}
                  onClick={() => {
                    setEditingItem(null)
                    setAIModalOpen(true)
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    color: '#fff',
                  }}
                >
                  AI生成词条
                </Button>
              </Space>
            </Empty>
          )}
          </Spin>
        </Card>

        {/* 编辑词条弹窗 */}
        <GlossaryEditorModal
          open={editorModalOpen}
          categories={categories}
          editItem={editingItem}
          onCancel={() => {
            setEditorModalOpen(false)
            setEditingItem(null)
          }}
          onSave={handleCreate}
          onUpdate={handleUpdate}
        />

        {/* AI生成词条弹窗 */}
        <GlossaryAIModal
          open={aiModalOpen}
          categories={categories}
          existingItems={items}
          onCancel={() => setAIModalOpen(false)}
          onSave={handleAICreate}
        />
      </div>
    </>
  )
}

export default Glossary
