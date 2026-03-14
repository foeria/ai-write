import { useState, useEffect, useMemo } from 'react'
import {
  Card,
  Typography,
  Empty,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Row,
  Col,
  message,
  Tooltip,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  SettingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { useKnowledgeSQLiteStore, type KnowledgeItem } from '@/store/sqliteStore'
import { useKnowledgeStore, type Category } from '@/store/useKnowledgeStore'
import { useAppStore } from '@/store/useAppStore'
import KnowledgeEditorModal from './components/KnowledgeEditorModal'
import CategoryManager from './components/CategoryManager'

// 视图模式类型
type ViewMode = 'card' | 'list'

// 生成随机ID
const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36)

// 防抖搜索钩子
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay, setDebouncedValue])
  return debouncedValue
}

const { Title, Text } = Typography

function Knowledge() {
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  // 使用 SQLite store 进行数据操作
  const {
    knowledgeList,
    fetchKnowledge,
    searchKnowledge,
    addKnowledge,
    modifyKnowledge,
    removeKnowledge,
    searchQuery,
    setSearchQuery,
  } = useKnowledgeSQLiteStore()
  // 使用 localStorage store 获取分类（分类在前端管理）
  const { categories, selectedCategory, setSelectedCategory, setCategories } = useKnowledgeStore()

  const [editorModalOpen, setEditorModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const [viewMode, setViewMode] = useState<ViewMode>('card')

  // 分类管理函数
  const handleAddCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
    }
    setCategories([...categories, newCategory])
  }

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    const updated = categories.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    )
    setCategories(updated)
  }

  const handleDeleteCategory = (id: string) => {
    const filtered = categories.filter((c) => c.id !== id)
    setCategories(filtered)
    // 如果当前选中的分类被删除，重置选择
    if (selectedCategory === id) {
      setSelectedCategory(null)
    }
  }

  // 初始化加载数据
  useEffect(() => {
    fetchKnowledge()
  }, [fetchKnowledge])

  // 背景色
  const bgColor = isDark ? '#1a1612' : '#f5f3f0'
  const cardBgColor = isDark ? '#252220' : '#ffffff'
  const textColor = isDark ? '#e8e0d5' : '#3d3830'
  const secondaryTextColor = isDark ? '#a99d92' : '#6b635a'
  const borderColor = isDark ? '#4a4238' : '#e8e0d5'

  // 防抖搜索值
  const debouncedSearch = useDebounce(searchQuery, 300)

  // 触发搜索
  useEffect(() => {
    if (debouncedSearch) {
      searchKnowledge(debouncedSearch)
    } else {
      fetchKnowledge()
    }
  }, [debouncedSearch, searchKnowledge, fetchKnowledge])

  // 根据分类过滤
  const filteredItems = selectedCategory && selectedCategory !== 'all'
    ? knowledgeList.filter((item) => item.category === selectedCategory)
    : knowledgeList

  const handleCreate = async (values: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newItem = await addKnowledge(values)
      messageApi.success('知识添加成功')
      setEditorModalOpen(false)
      return newItem
    } catch {
      messageApi.error('添加知识失败')
      throw new Error('添加知识失败')
    }
  }

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item)
    setEditorModalOpen(true)
  }

  const handleUpdate = async (id: string, updates: Partial<KnowledgeItem>) => {
    try {
      const existingItem = knowledgeList.find((k) => k.id === id)
      if (existingItem) {
        await modifyKnowledge({
          ...existingItem,
          ...updates,
        })
        messageApi.success('知识更新成功')
      }
      setEditingItem(null)
      setEditorModalOpen(false)
    } catch {
      messageApi.error('更新知识失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await removeKnowledge(id)
      messageApi.success('知识删除成功')
    } catch {
      messageApi.error('删除知识失败')
    }
  }

  // 分类统计 - 基于全部数据统计
  const categoryStats = useMemo(() => {
    return categories
      .filter((c) => c.id !== 'all')
      .map((c) => ({
        ...c,
        count: knowledgeList.filter((i) => i.category === c.id).length,
      }))
  }, [categories, knowledgeList])

  // 判断是否有搜索关键词
  const hasSearchQuery = searchQuery.trim().length > 0
  // 判断是否选择了分类
  const hasSelectedCategory = selectedCategory && selectedCategory !== 'all'
  // 判断是否有数据
  const hasData = knowledgeList.length > 0
  // 判断过滤后是否有数据
  const hasFilteredData = filteredItems.length > 0

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
              <FileTextOutlined style={{ marginRight: 8 }} />
              知识库
            </Title>
            <Text type="secondary" style={{ color: secondaryTextColor }}>
              共 {knowledgeList.length} 条知识
            </Text>
          </div>
          <Space>
            <Select
              placeholder="选择分类"
              allowClear
              style={{ width: 150 }}
              value={selectedCategory === 'all' ? undefined : selectedCategory}
              onChange={(val) => setSelectedCategory(val || null)}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
            <Input
              placeholder="搜索知识..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 200 }}
              allowClear
              onClear={() => {
                setSearchQuery('')
                fetchKnowledge()
              }}
            />
            <Tooltip title="管理分类">
              <Button
                icon={<SettingOutlined />}
                onClick={() => setCategoryManagerOpen(true)}
              />
            </Tooltip>
            <Tooltip title={viewMode === 'card' ? '列表视图' : '卡片视图'}>
              <Button
                icon={viewMode === 'card' ? <UnorderedListOutlined /> : <AppstoreOutlined />}
                onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingItem(null)
                setEditorModalOpen(true)
              }}
              className="btn-gradient"
            >
              添加知识
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

        {/* 知识列表 */}
        <Card
          variant="borderless"
          style={{
            background: cardBgColor,
            borderColor: borderColor,
            flex: 1,
          }}
        >
          {hasFilteredData ? (
            viewMode === 'card' ? (
              <Row gutter={[16, 16]}>
                {filteredItems.map((item) => {
                  const category = categories.find((c) => c.id === item.category)
                  return (
                    <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                      <Card
                        hoverable
                        className="card-hover"
                        style={{
                          height: '100%',
                          background: isDark ? '#2a2622' : '#fafafa',
                          borderColor: isDark ? '#3a3530' : '#f0f0f0',
                        }}
                        actions={[
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            key="edit"
                            onClick={() => handleEdit(item)}
                          >
                            编辑
                          </Button>,
                          <Popconfirm
                            title="删除知识"
                            description="确定要删除这条知识吗？"
                            onConfirm={() => handleDelete(item.id)}
                            okText="确定"
                            cancelText="取消"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              key="delete"
                            >
                              删除
                            </Button>
                          </Popconfirm>,
                        ]}
                      >
                        <Card.Meta
                          title={
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                              <span
                                style={{
                                  flex: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  color: textColor,
                                }}
                              >
                                {item.title}
                              </span>
                              {category && (
                                <Tag color={category.color}>{category.name}</Tag>
                              )}
                            </Space>
                          }
                          description={
                            <Text
                              type="secondary"
                              ellipsis
                              style={{
                                display: 'block',
                                height: 44,
                                color: secondaryTextColor,
                              }}
                            >
                              {item.content}
                            </Text>
                          }
                        />
                        {item.tags.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <Space wrap size={2}>
                              {item.tags.slice(0, 3).map((tag) => (
                                <Tag
                                  key={tag}
                                  style={{
                                    background: isDark ? '#3a3530' : '#f5f3f0',
                                    border: 'none',
                                    fontSize: 11,
                                  }}
                                >
                                  {tag}
                                </Tag>
                              ))}
                            </Space>
                          </div>
                        )}
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            ) : (
              /* 列表视图 */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredItems.map((item) => {
                  const category = categories.find((c) => c.id === item.category)
                  return (
                    <Card
                      key={item.id}
                      hoverable
                      className="card-hover"
                      size="small"
                      style={{
                        background: isDark ? '#2a2622' : '#fafafa',
                        borderColor: isDark ? '#3a3530' : '#f0f0f0',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 16,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Space align="center">
                            <FileTextOutlined style={{ color: secondaryTextColor }} />
                            <span
                              style={{
                                color: textColor,
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.title}
                            </span>
                            {category && (
                              <Tag color={category.color} style={{ margin: 0 }}>
                                {category.name}
                              </Tag>
                            )}
                          </Space>
                        </div>
                        <Text
                          type="secondary"
                          ellipsis
                          style={{
                            flex: 2,
                            color: secondaryTextColor,
                            margin: '0 16px',
                          }}
                        >
                          {item.content}
                        </Text>
                        <Space>
                          {item.tags.length > 0 && (
                            <Space size={2}>
                              {item.tags.slice(0, 2).map((tag) => (
                                <Tag
                                  key={tag}
                                  style={{
                                    background: isDark ? '#3a3530' : '#f5f3f0',
                                    border: 'none',
                                    fontSize: 11,
                                    margin: 0,
                                  }}
                                >
                                  {tag}
                                </Tag>
                              ))}
                            </Space>
                          )}
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(item)}
                          >
                            编辑
                          </Button>
                          <Popconfirm
                            title="删除知识"
                            description="确定要删除这条知识吗？"
                            onConfirm={() => handleDelete(item.id)}
                            okText="确定"
                            cancelText="取消"
                            okButtonProps={{ danger: true }}
                          >
                            <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                              删除
                            </Button>
                          </Popconfirm>
                        </Space>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )
          ) : (
            /* 空状态显示 - 区分无数据和搜索无结果 */
            <Empty
              description={
                hasSearchQuery || hasSelectedCategory ? (
                  <span style={{ color: secondaryTextColor }}>
                    没有找到匹配的知识
                    {hasSearchQuery && ` "${searchQuery}"`}
                  </span>
                ) : (
                  '还没有创建知识'
                )
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {!hasSearchQuery && !hasSelectedCategory && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingItem(null)
                    setEditorModalOpen(true)
                  }}
                >
                  创建第一个知识
                </Button>
              )}
            </Empty>
          )}
        </Card>

        {/* 编辑知识弹窗 */}
        <KnowledgeEditorModal
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

        {/* 分类管理弹窗 */}
        <CategoryManager
          open={categoryManagerOpen}
          categories={categories}
          onClose={() => setCategoryManagerOpen(false)}
          onAdd={handleAddCategory}
          onUpdate={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      </div>
    </>
  )
}

export default Knowledge
