import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Typography,
  Empty,
  Button,
  Input,
  Space,
  Row,
  Col,
  Tag,
  message,
  Modal,
  Segmented,
  Form,
  Select,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  CopyOutlined,
  StarOutlined,
  ThunderboltOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'
import {
  Prompt,
  getAllPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  togglePromptFavorite,
  searchPrompts,
  generatePromptId,
  incrementPromptUsage,
} from '@/api/sqlite'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

// 扩展分类列表
const categories = [
  { id: 'all', name: '全部', color: '#c9a959' },
  { id: 'writing', name: '写作生成', color: '#c9a959' },
  { id: 'polish', name: '文本润色', color: '#8b6914' },
  { id: 'expand', name: '扩写', color: '#667eea' },
  { id: 'translate', name: '翻译', color: '#764ba2' },
  { id: 'summary', name: '摘要', color: '#f093fb' },
  { id: 'outline', name: '大纲', color: '#f5576c' },
  { id: 'character', name: '人物', color: '#4facfe' },
  { id: 'dialogue', name: '对话', color: '#43e97b' },
  { id: 'description', name: '描写', color: '#fa709a' },
  { id: 'creative', name: '创意', color: '#fe5196' },
]

// 排序类型
type SortType = 'popular' | 'new' | 'featured' | 'mine'

// 模拟初始数据（用于首次运行）
const initialPrompts: Omit<Prompt, 'created_at' | 'updated_at'>[] = [
  {
    id: 'builtin-1',
    title: '小说开头生成',
    content: '请为一个{genre}类型的故事生成一个引人入胜的开头。要求：1. 开头要有悬念或冲突 2. 人物描写生动 3. 环境氛围营造到位 4. 字数控制在500字左右',
    category: 'writing',
    tags: '开头,生成,小说',
    is_favorite: 0,
    usage_count: 156,
    is_featured: 1,
    is_builtin: 1,
  },
  {
    id: 'builtin-2',
    title: '角色对话润色',
    content: '请将以下对话进行润色，使其更加自然生动，符合角色性格。原始对话：{dialogue}，角色设定：{character_info}',
    category: 'polish',
    tags: '对话,润色,角色',
    is_favorite: 0,
    usage_count: 98,
    is_featured: 0,
    is_builtin: 1,
  },
  {
    id: 'builtin-3',
    title: '场景描写扩展',
    content: '请对以下场景进行扩展描写，增加感官细节。原始场景：{scene}，请从以下角度扩展：视觉描写、听觉描写、嗅觉描写、情感氛围',
    category: 'expand',
    tags: '场景,扩展,描写',
    is_favorite: 0,
    usage_count: 87,
    is_featured: 1,
    is_builtin: 1,
  },
  {
    id: 'builtin-4',
    title: '英文翻译助手',
    content: '请将以下中文文本翻译成流畅的英文，注意保持原文风格和语气：{text}',
    category: 'translate',
    tags: '翻译,英文,中英',
    is_favorite: 0,
    usage_count: 234,
    is_featured: 0,
    is_builtin: 1,
  },
  {
    id: 'builtin-5',
    title: '文章摘要生成',
    content: '请为以下文章生成一个简洁的摘要，包含核心观点和关键信息，字数控制在100字以内：{article}',
    category: 'summary',
    tags: '摘要,总结,概括',
    is_favorite: 0,
    usage_count: 67,
    is_featured: 0,
    is_builtin: 1,
  },
  {
    id: 'builtin-6',
    title: '高潮情节设计',
    content: '请为一个{genre}类型的{length}故事设计一个激动人心的高潮情节。要求：1. 冲突达到顶点 2. 人物做出关键抉择 3. 情感冲击强烈 4. 为结局做好铺垫',
    category: 'writing',
    tags: '高潮,情节,设计',
    is_favorite: 0,
    usage_count: 145,
    is_featured: 1,
    is_builtin: 1,
  },
  {
    id: 'builtin-7',
    title: '文案风格转换',
    content: '请将以下文案从{source_style}风格转换成{target_style}风格，保持核心信息不变：{content}',
    category: 'polish',
    tags: '文案,风格,转换',
    is_favorite: 0,
    usage_count: 56,
    is_featured: 0,
    is_builtin: 1,
  },
  {
    id: 'builtin-8',
    title: '背景世界观扩展',
    content: '请为以下故事背景补充详细的世界观设定，包括：1. 历史渊源 2. 势力分布 3. 文化习俗 4. 特殊规则 5. 重要地点描述。原始设定：{setting}',
    category: 'expand',
    tags: '世界观,背景,设定',
    is_favorite: 0,
    usage_count: 89,
    is_featured: 0,
    is_builtin: 1,
  },
]

function Prompts() {
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortType, setSortType] = useState<SortType>('popular')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | null>(null)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()

  // 背景色
  const bgColor = isDark ? '#1a1612' : '#f5f3f0'
  const cardBgColor = isDark ? '#252220' : '#ffffff'
  const textColor = isDark ? '#e8e0d5' : '#3d3830'
  const secondaryTextColor = isDark ? '#a99d92' : '#6b635a'
  const borderColor = isDark ? '#4a4238' : '#e8e0d5'

  // 加载提示词数据
  const loadPrompts = useCallback(async () => {
    try {
      let data: Prompt[]

      if (searchQuery) {
        const category = selectedCategory === 'all' ? undefined : selectedCategory
        data = await searchPrompts(searchQuery, category)
      } else if (sortType === 'mine') {
        // 我的提示词 - 只显示非内置的
        const allData = await getAllPrompts(
          selectedCategory === 'all' ? undefined : selectedCategory,
          'new'
        )
        data = allData.filter(p => p.is_builtin === 0)
      } else {
        const category = selectedCategory === 'all' ? undefined : selectedCategory
        data = await getAllPrompts(category, sortType)
      }

      setPrompts(data)

      // 如果是空数组，初始化内置提示词
      if (data.length === 0 && !searchQuery) {
        for (const prompt of initialPrompts) {
          try {
            await createPrompt(prompt)
          } catch (e) {
            // 忽略创建错误（可能已存在）
          }
        }
        // 重新加载
        const newData = await getAllPrompts(undefined, 'popular')
        setPrompts(newData)
      }
    } catch (error) {
      console.error('Failed to load prompts:', error)
      messageApi.error('加载提示词失败')
    }
  }, [selectedCategory, sortType, searchQuery, messageApi])

  useEffect(() => {
    loadPrompts()
  }, [loadPrompts])

  // 筛选并排序提示词
  const filteredPrompts = prompts.filter((prompt) => {
    if (searchQuery) return true // 搜索时后端已过滤
    if (selectedCategory === 'all') return true
    return prompt.category === selectedCategory
  })

  const handleCopy = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      messageApi.success('已复制到剪贴板')
      // 增加使用次数
      try {
        await incrementPromptUsage(prompt.id)
      } catch (e) {
        // 忽略
      }
    } catch (error) {
      messageApi.error('复制失败')
    }
  }

  const handleFavorite = async (id: string) => {
    try {
      const newFavorite = await togglePromptFavorite(id)
      setPrompts(prompts.map(p =>
        p.id === id ? { ...p, is_favorite: newFavorite ? 1 : 0 } : p
      ))
      if (viewingPrompt?.id === id) {
        setViewingPrompt({ ...viewingPrompt, is_favorite: newFavorite ? 1 : 0 })
      }
      messageApi.success(newFavorite ? '已收藏' : '已取消收藏')
    } catch (error) {
      messageApi.error('操作失败')
    }
  }

  const handleViewDetail = (prompt: Prompt) => {
    setViewingPrompt(prompt)
    setDetailOpen(true)
  }

  const handleEdit = (prompt: Prompt, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingPrompt(prompt)
    form.setFieldsValue({
      title: prompt.title,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.tags?.split(',').filter(Boolean) || [],
      is_featured: prompt.is_featured === 1,
    })
    setEditorOpen(true)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个提示词吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deletePrompt(id)
          messageApi.success('删除成功')
          loadPrompts()
        } catch (error) {
          messageApi.error('删除失败')
        }
      },
    })
  }

  const handleEditorSubmit = async () => {
    try {
      const values = await form.validateFields()
      const tags = Array.isArray(values.tags) ? values.tags.join(',') : values.tags

      if (editingPrompt) {
        // 编辑模式
        await updatePrompt({
          ...editingPrompt,
          title: values.title,
          content: values.content,
          category: values.category,
          tags,
          is_featured: values.is_featured ? 1 : 0,
        })
        messageApi.success('更新成功')
        setEditorOpen(false)
        setEditingPrompt(null)
        form.resetFields()
        loadPrompts()
      } else {
        // 创建模式
        const newPrompt: Omit<Prompt, 'created_at' | 'updated_at'> = {
          id: generatePromptId(),
          title: values.title,
          content: values.content,
          category: values.category,
          tags,
          is_favorite: 0,
          usage_count: 0,
          is_featured: values.is_featured ? 1 : 0,
          is_builtin: 0,
        }
        await createPrompt(newPrompt)
        messageApi.success('创建成功')
        setEditorOpen(false)
        form.resetFields()
        loadPrompts()
      }
    } catch (error) {
      console.error('Failed to save prompt:', error)
      messageApi.error('保存失败')
    }
  }

  const openCreateModal = () => {
    setEditingPrompt(null)
    form.resetFields()
    form.setFieldsValue({
      category: 'writing',
      tags: [],
      is_featured: false,
    })
    setEditorOpen(true)
  }

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
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0, color: textColor }}>
              <ThunderboltOutlined style={{ marginRight: 8 }} />
              提示词库
            </Title>
            <Text type="secondary" style={{ color: secondaryTextColor }}>
              共 {filteredPrompts.length} 个提示词模板
            </Text>
          </div>
          <Space wrap>
            <Input
              placeholder="搜索提示词..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Segmented
              value={sortType}
              onChange={(val) => setSortType(val as SortType)}
              options={[
                { value: 'popular', icon: <SortDescendingOutlined />, label: '最热' },
                { value: 'new', icon: <SortAscendingOutlined />, label: '最新' },
                { value: 'featured', label: '精选' },
                { value: 'mine', label: '我的' },
              ]}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              className="btn-gradient"
            >
              添加提示词
            </Button>
          </Space>
        </div>

        {/* 分类标签筛选 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            {categories.map((category) => (
              <Tag.CheckableTag
                key={category.id}
                checked={selectedCategory === category.id}
                onChange={() => setSelectedCategory(category.id)}
                style={{
                  background: selectedCategory === category.id
                    ? (category.color || '#c9a959')
                    : isDark ? '#2a2622' : '#fafafa',
                  color: selectedCategory === category.id
                    ? '#fff'
                    : textColor,
                  borderColor: category.color || borderColor,
                  padding: '4px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {category.name}
              </Tag.CheckableTag>
            ))}
          </Space>
        </div>

        {/* 提示词列表 */}
        <Card
          variant="borderless"
          style={{
            background: cardBgColor,
            borderColor: borderColor,
          }}
        >
          {filteredPrompts.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredPrompts.map((prompt) => {
                const category = categories.find((c) => c.id === prompt.category)
                const tagsArray = prompt.tags?.split(',').filter(Boolean) || []
                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={prompt.id}>
                    <Card
                      hoverable
                      style={{
                        height: '100%',
                        background: isDark ? '#2a2622' : '#fafafa',
                        borderColor: isDark ? '#3a3530' : '#f0f0f0',
                      }}
                      onClick={() => handleViewDetail(prompt)}
                      actions={[
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          key="view"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewDetail(prompt)
                          }}
                        >
                          详情
                        </Button>,
                        <Button
                          type="text"
                          icon={<CopyOutlined />}
                          key="copy"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopy(prompt)
                          }}
                        >
                          复制
                        </Button>,
                        <Button
                          type="text"
                          icon={prompt.is_favorite ? <StarOutlined style={{ color: '#faad14' }} /> : <StarOutlined />}
                          key="favorite"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFavorite(prompt.id)
                          }}
                        >
                          {prompt.is_favorite ? '取消' : '收藏'}
                        </Button>,
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
                              {prompt.title}
                            </span>
                            {category && (
                              <Tag color={category.color} style={{ margin: 0 }}>
                                {category.name}
                              </Tag>
                            )}
                          </Space>
                        }
                        description={
                          <div>
                            <Paragraph
                              type="secondary"
                              ellipsis={{ rows: 3 }}
                              style={{
                                marginBottom: 8,
                                fontSize: 12,
                                color: secondaryTextColor,
                                fontFamily: 'monospace',
                              }}
                            >
                              {prompt.content}
                            </Paragraph>
                            <Space wrap>
                              {tagsArray.slice(0, 3).map((tag) => (
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
                            <Text
                              type="secondary"
                              style={{
                                display: 'block',
                                marginTop: 8,
                                fontSize: 11,
                                color: isDark ? '#a99d92' : '#6b635a',
                              }}
                            >
                              使用次数: {prompt.usage_count}
                              {prompt.is_builtin === 1 && <Tag color="blue" style={{ marginLeft: 4 }}>内置</Tag>}
                            </Text>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                )
              })}
            </Row>
          ) : (
            <Empty description="还没有提示词" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                添加第一个提示词
              </Button>
            </Empty>
          )}
        </Card>

        {/* 详情弹窗 */}
        <Modal
          title={
            viewingPrompt ? (
              <Space>
                <ThunderboltOutlined style={{ color: '#c9a959' }} />
                <span>{viewingPrompt.title}</span>
                {viewingPrompt.is_builtin === 1 && <Tag color="blue">内置</Tag>}
              </Space>
            ) : null
          }
          open={detailOpen}
          onCancel={() => {
            setDetailOpen(false)
            setViewingPrompt(null)
          }}
          footer={[
            viewingPrompt?.is_builtin === 0 && (
              <Button
                key="edit"
                icon={<EditOutlined />}
                onClick={() => viewingPrompt && handleEdit(viewingPrompt)}
              >
                编辑
              </Button>
            ),
            viewingPrompt?.is_builtin === 0 && (
              <Button
                key="delete"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => viewingPrompt && handleDelete(viewingPrompt.id, e as unknown as React.MouseEvent)}
              >
                删除
              </Button>
            ),
            <Button
              key="copy"
              icon={<CopyOutlined />}
              onClick={() => viewingPrompt && handleCopy(viewingPrompt)}
            >
              复制
            </Button>,
            <Button
              key="favorite"
              type="primary"
              icon={viewingPrompt?.is_favorite ? <StarOutlined style={{ color: '#faad14' }} /> : <StarOutlined />}
              onClick={() => viewingPrompt && handleFavorite(viewingPrompt.id)}
              className="btn-gradient"
            >
              {viewingPrompt?.is_favorite ? '取消收藏' : '收藏'}
            </Button>,
          ]}
          width={720}
          styles={{
            content: {
              background: isDark ? '#252220' : '#ffffff',
            },
          }}
        >
          {viewingPrompt && (
            <div>
              <Space style={{ marginBottom: 16 }}>
                <Tag color={categories.find((c) => c.id === viewingPrompt.category)?.color || '#c9a959'}>
                  {categories.find((c) => c.id === viewingPrompt.category)?.name || viewingPrompt.category}
                </Tag>
                <Text type="secondary">使用次数: {viewingPrompt.usage_count}</Text>
              </Space>

              <div
                style={{
                  background: isDark ? '#1a1612' : '#f5f3f0',
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 16,
                  fontFamily: 'monospace',
                  fontSize: 14,
                  color: textColor,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                  maxHeight: 300,
                  overflow: 'auto',
                }}
              >
                {viewingPrompt.content}
              </div>

              <Space wrap style={{ marginBottom: 16 }}>
                {viewingPrompt.tags?.split(',').filter(Boolean).map((tag) => (
                  <Tag key={tag} style={{ background: isDark ? '#3a3530' : '#f0f0f0', border: 'none' }}>
                    {tag}
                  </Tag>
                ))}
              </Space>

              <Text type="secondary" style={{ fontSize: 12 }}>
                创建时间: {new Date(viewingPrompt.created_at).toLocaleString('zh-CN')}
                {' | '}
                更新时间: {new Date(viewingPrompt.updated_at).toLocaleString('zh-CN')}
              </Text>
            </div>
          )}
        </Modal>

        {/* 添加/编辑弹窗 */}
        <Modal
          title={editingPrompt ? '编辑提示词' : '添加提示词'}
          open={editorOpen}
          onCancel={() => {
            setEditorOpen(false)
            setEditingPrompt(null)
            form.resetFields()
          }}
          onOk={handleEditorSubmit}
          okText="保存"
          cancelText="取消"
          width={640}
          styles={{
            content: {
              background: isDark ? '#252220' : '#ffffff',
            },
          }}
        >
          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="title"
              label="标题"
              rules={[{ required: true, message: '请输入提示词标题' }]}
            >
              <Input placeholder="请输入提示词标题" />
            </Form.Item>

            <Form.Item
              name="content"
              label="内容"
              rules={[{ required: true, message: '请输入提示词内容' }]}
            >
              <TextArea
                rows={6}
                placeholder="请输入提示词内容，可以使用{placeholder}表示变量"
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="请选择分类">
                {categories.filter(c => c.id !== 'all').map(cat => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="tags"
              label="标签"
            >
              <Select
                mode="tags"
                placeholder="输入标签后按回车"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="is_featured"
              label="精选"
              valuePropName="checked"
            >
              <input
                type="checkbox"
                checked={form.getFieldValue('is_featured')}
                onChange={(e) => form.setFieldValue('is_featured', e.target.checked)}
              />
              <Text type="secondary" style={{ marginLeft: 8 }}>标记为精选提示词</Text>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  )
}

export default Prompts
