import { useState, useEffect } from 'react'
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
  Statistic,
  Modal,
  Form,
  Select,
  Drawer,
  Spin,
  Divider,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  ToolOutlined,
  StarOutlined,
  StarFilled,
  FileTextOutlined,
  TranslationOutlined,
  BgColorsOutlined,
  ThunderboltOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'
import {
  generateOutline,
  generateCharacter,
  polishText,
  expandText,
  continueWrite,
  generateInspiration,
  chatComplete,
} from '@/api/ai'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

// 工具类型
interface Tool {
  id: string
  name: string
  description: string
  category: string
  icon: string
  isPopular: boolean
  usageCount: number
}

// 自定义工具
interface CustomTool {
  id: string
  name: string
  description: string
  prompt: string
  category: string
  createdAt: number
}

// 工具分类
interface ToolCategory {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

// 工具分类数据
const toolCategories: ToolCategory[] = [
  { id: 'all', name: '全部', icon: <ToolOutlined />, color: '#c9a959' },
  { id: 'writing', name: '写作辅助', icon: <EditOutlined />, color: '#1890ff' },
  { id: 'text', name: '文本处理', icon: <FileTextOutlined />, color: '#52c41a' },
  { id: 'format', name: '格式转换', icon: <TranslationOutlined />, color: '#722ed1' },
  { id: 'style', name: '样式调整', icon: <BgColorsOutlined />, color: '#eb2f96' },
  { id: 'ai', name: 'AI工具', icon: <ThunderboltOutlined />, color: '#fa8c16' },
  { id: 'check', name: '质量检测', icon: <CheckCircleOutlined />, color: '#f5222d' },
  { id: 'custom', name: '自定义', icon: <PlusOutlined />, color: '#13c2c2' },
]

// 模拟工具数据
const mockTools: Tool[] = [
  {
    id: 'outline',
    name: '大纲生成器',
    description: '根据主题自动生成故事大纲和章节规划。',
    category: 'ai',
    icon: '📋',
    isPopular: true,
    usageCount: 167,
  },
  {
    id: 'character',
    name: '角色设定生成',
    description: 'AI辅助创建角色档案，包括外貌、性格、背景故事。',
    category: 'ai',
    icon: '👤',
    isPopular: true,
    usageCount: 98,
  },
  {
    id: 'detail',
    name: '细纲生成',
    description: '根据故事主题生成详细的章节纲目。',
    category: 'writing',
    icon: '📑',
    isPopular: true,
    usageCount: 145,
  },
  {
    id: 'bookname',
    name: '书名生成',
    description: 'AI根据作品类型和关键词生成吸引人的书名。',
    category: 'ai',
    icon: '📖',
    isPopular: false,
    usageCount: 76,
  },
  {
    id: 'intro',
    name: '简介生成',
    description: '根据作品内容生成吸引人的简介/文案。',
    category: 'ai',
    icon: '📝',
    isPopular: true,
    usageCount: 134,
  },
  {
    id: 'role',
    name: '人设生成',
    description: 'AI辅助创建完整的人物设定档案。',
    category: 'ai',
    icon: '🎭',
    isPopular: false,
    usageCount: 89,
  },
  {
    id: 'continue',
    name: 'AI续写助手',
    description: '基于AI的智能续写功能，帮助你突破写作瓶颈。',
    category: 'ai',
    icon: '🤖',
    isPopular: true,
    usageCount: 234,
  },
  {
    id: 'polish',
    name: '对话润色',
    description: 'AI辅助优化角色对话，使其更符合人物性格。',
    category: 'ai',
    icon: '💬',
    isPopular: true,
    usageCount: 145,
  },
  {
    id: 'expand',
    name: '内容扩写',
    description: 'AI扩写指定内容，增加细节和描写。',
    category: 'ai',
    icon: '✨',
    isPopular: false,
    usageCount: 67,
  },
  {
    id: 'inspiration',
    name: '灵感生成',
    description: '根据关键词生成故事灵感和创意点子。',
    category: 'ai',
    icon: '💡',
    isPopular: false,
    usageCount: 54,
  },
  {
    id: 'wordcount',
    name: '批量字数统计',
    description: '快速统计多个章节或文档的总字数、平均字数，帮助你把控写作进度。',
    category: 'text',
    icon: '📊',
    isPopular: true,
    usageCount: 156,
  },
  {
    id: 'sensitive',
    name: '敏感词检测',
    description: '检测文中可能存在的敏感词汇，提供替换建议。',
    category: 'check',
    icon: '⚠️',
    isPopular: true,
    usageCount: 89,
  },
  {
    id: 'convert',
    name: '简体繁体转换',
    description: '一键将文本在简体中文和繁体中文之间互相转换。',
    category: 'format',
    icon: '🔄',
    isPopular: false,
    usageCount: 45,
  },
  {
    id: 'punctuation',
    name: '标点规范化',
    description: '统一全文标点符号格式，修正不当使用的中英文标点。',
    category: 'style',
    icon: '✏️',
    isPopular: true,
    usageCount: 112,
  },
]

// 获取分类颜色
const getCategoryColor = (categoryId: string): string => {
  const category = toolCategories.find((c) => c.id === categoryId)
  return category?.color || '#c9a959'
}

// 生成唯一ID
const generateId = () => {
  return `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// localStorage键名
const FAVORITES_KEY = 'ai_write_tool_favorites'
const CUSTOM_TOOLS_KEY = 'ai_write_custom_tools'

function Tools() {
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  const [tools] = useState<Tool[]>(mockTools)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [messageApi, contextHolder] = message.useMessage()

  // 弹窗状态
  const [toolModalVisible, setToolModalVisible] = useState(false)
  const [customToolModalVisible, setCustomToolModalVisible] = useState(false)
  const [currentTool, setCurrentTool] = useState<Tool | null>(null)
  const [customTool, setCustomTool] = useState<CustomTool | null>(null)

  // 收藏状态
  const [favorites, setFavorites] = useState<string[]>([])

  // 自定义工具
  const [customTools, setCustomTools] = useState<CustomTool[]>([])

  // 生成状态
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')

  // 表单
  const [form] = Form.useForm()
  const [customForm] = Form.useForm()

  // 背景色
  const bgColor = isDark ? '#1a1612' : '#f5f3f0'
  const cardBgColor = isDark ? '#252220' : '#ffffff'
  const textColor = isDark ? '#e8e0d5' : '#3d3830'
  const secondaryTextColor = isDark ? '#a99d92' : '#6b635a'
  const borderColor = isDark ? '#4a4238' : '#e8e0d5'

  // 加载收藏和自定义工具
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY)
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch {
        console.error('Failed to parse favorites')
      }
    }

    const savedCustomTools = localStorage.getItem(CUSTOM_TOOLS_KEY)
    if (savedCustomTools) {
      try {
        setCustomTools(JSON.parse(savedCustomTools))
      } catch {
        console.error('Failed to parse custom tools')
      }
    }
  }, [])

  // 保存收藏
  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites))
  }

  // 保存自定义工具
  const saveCustomTools = (newTools: CustomTool[]) => {
    setCustomTools(newTools)
    localStorage.setItem(CUSTOM_TOOLS_KEY, JSON.stringify(newTools))
  }

  // 切换收藏
  const toggleFavorite = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newFavorites = favorites.includes(toolId)
      ? favorites.filter((id) => id !== toolId)
      : [...favorites, toolId]
    saveFavorites(newFavorites)
    messageApi.success(favorites.includes(toolId) ? '已取消收藏' : '已添加到收藏')
  }

  // 处理使用工具
  const handleUseTool = (tool: Tool) => {
    setCurrentTool(tool)
    setGeneratedContent('')
    form.resetFields()
    setToolModalVisible(true)
  }

  // 处理使用自定义工具
  const handleUseCustomTool = (tool: CustomTool) => {
    setCustomTool(tool)
    setGeneratedContent('')
    setToolModalVisible(true)
  }

  // 处理AI生成
  const handleGenerate = async (values: any) => {
    setGenerating(true)
    try {
      let result = ''

      if (currentTool) {
        // 使用预设工具
        switch (currentTool.id) {
          case 'outline': {
            const outlineResult = await generateOutline({
              prompt: values.topic,
              genre: values.genre,
              length: values.length || 'medium',
            })
            result = JSON.stringify(outlineResult.outline, null, 2)
            break
          }
          case 'character': {
            const charResult = await generateCharacter(values.description, {
              role: values.role,
            })
            result = `姓名: ${charResult.name}\n年龄: ${charResult.age}\n性别: ${charResult.gender}\n\n外貌: ${charResult.appearance}\n\n性格: ${charResult.personality}\n\n背景: ${charResult.background}\n\n目标: ${charResult.goals}\n\n人际关系:\n${charResult.relationships?.map((r) => `- ${r.name} (${r.relation})`).join('\n')}`
            break
          }
          case 'detail': {
            const detailResult = await generateOutline({
              prompt: values.storyTheme,
              genre: values.genre,
              length: values.length || 'long',
            })
            result = JSON.stringify(detailResult.outline, null, 2)
            break
          }
          case 'bookname': {
            const nameResult = await chatComplete(
              `请根据以下信息生成${values.count || 5}个书名：类型：${values.type}，关键词：${values.keywords}，风格：${values.style}`
            )
            result = nameResult
            break
          }
          case 'intro': {
            const introResult = await chatComplete(
              `请根据以下内容生成一个吸引人的简介：${values.description}`
            )
            result = introResult
            break
          }
          case 'role': {
            const roleResult = await generateCharacter(values.description, {
              role: values.role,
            })
            result = `姓名: ${roleResult.name}\n年龄: ${roleResult.age}\n性别: ${roleResult.gender}\n\n外貌: ${roleResult.appearance}\n\n性格: ${roleResult.personality}\n\n背景: ${roleResult.background}\n\n目标: ${roleResult.goals}\n\n人际关系:\n${roleResult.relationships?.map((r) => `- ${r.name} (${r.relation})`).join('\n')}`
            break
          }
          case 'continue': {
            result = await continueWrite(values.content || '')
            break
          }
          case 'polish': {
            result = await polishText(values.content || '', values.style || 'literary')
            break
          }
          case 'expand': {
            result = await expandText(values.content || '', values.expandType || 'detail')
            break
          }
          case 'inspiration': {
            const insResult = await generateInspiration(values.keyword, {
              type: values.type,
              count: values.count || 3,
            })
            result = insResult.ideas
              .map((idea, i) => `${i + 1}. ${idea.title}\n${idea.content}`)
              .join('\n\n')
            break
          }
          default:
            result = `${currentTool.name}功能开发中...`
        }
      } else if (customTool) {
        // 使用自定义工具
        const fullPrompt = `${customTool.prompt}\n\n用户输入: ${values.userInput || '无'}`
        result = await chatComplete(fullPrompt)
      }

      setGeneratedContent(result)
      messageApi.success('生成完成')
    } catch (error) {
      messageApi.error('生成失败: ' + (error as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  // 复制到剪贴板
  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent)
      messageApi.success('已复制到剪贴板')
    }
  }

  // 创建自定义工具
  const handleCreateCustomTool = async (values: any) => {
    const newTool: CustomTool = {
      id: generateId(),
      name: values.name,
      description: values.description,
      prompt: values.prompt,
      category: 'custom',
      createdAt: Date.now(),
    }
    saveCustomTools([...customTools, newTool])
    setCustomToolModalVisible(false)
    customForm.resetFields()
    messageApi.success('自定义工具创建成功')
  }

  // 删除自定义工具
  const handleDeleteCustomTool = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个自定义工具吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        const newTools = customTools.filter((t) => t.id !== toolId)
        saveCustomTools(newTools)
        messageApi.success('已删除')
      },
    })
  }

  // 合并所有工具
  const allTools = [
    ...tools,
    ...customTools.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      icon: '🛠️',
      isPopular: false,
      usageCount: 0,
    })),
  ]

  // 筛选工具
  const filteredTools = allTools.filter((tool) => {
    const matchesSearch = !searchQuery
      ? true
      : tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' ||
      tool.category === selectedCategory ||
      (selectedCategory === 'custom' && customTools.some((t) => t.id === tool.id))
    return matchesSearch && matchesCategory
  })

  // 分类统计
  const categoryStats = toolCategories.map((cat) => {
    if (cat.id === 'all') {
      return { ...cat, count: allTools.length }
    }
    if (cat.id === 'custom') {
      return { ...cat, count: customTools.length }
    }
    return { ...cat, count: tools.filter((t) => t.category === cat.id).length }
  })

  // 统计数据
  const stats = {
    total: allTools.length,
    popular: tools.filter((t) => t.isPopular).length,
    totalUsage: tools.reduce((sum, t) => sum + t.usageCount, 0),
    favorites: favorites.length,
  }

  // 获取工具表单字段
  const getToolFormFields = () => {
    if (!currentTool) return null

    switch (currentTool.id) {
      case 'outline':
        return (
          <>
            <Form.Item name="topic" label="主题" rules={[{ required: true, message: '请输入故事主题' }]}>
              <TextArea placeholder="例如：都市青年重生后改变命运" rows={3} />
            </Form.Item>
            <Form.Item name="genre" label="类型">
              <Select placeholder="选择小说类型">
                <Select.Option value="都市">都市</Select.Option>
                <Select.Option value="玄幻">玄幻</Select.Option>
                <Select.Option value="仙侠">仙侠</Select.Option>
                <Select.Option value="历史">历史</Select.Option>
                <Select.Option value="科幻">科幻</Select.Option>
                <Select.Option value="悬疑">悬疑</Select.Option>
                <Select.Option value="言情">言情</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="length" label="大纲长度">
              <Select placeholder="选择长度">
                <Select.Option value="short">短篇 (5-10章)</Select.Option>
                <Select.Option value="medium">中篇 (10-20章)</Select.Option>
                <Select.Option value="long">长篇 (20-50章)</Select.Option>
              </Select>
            </Form.Item>
          </>
        )
      case 'character':
      case 'role':
        return (
          <>
            <Form.Item name="description" label="角色设定描述" rules={[{ required: true, message: '请输入角色描述' }]}>
              <TextArea placeholder="例如：一个沉默寡言的杀手，内心深处渴望温暖..." rows={4} />
            </Form.Item>
            <Form.Item name="role" label="角色类型">
              <Select placeholder="选择角色类型">
                <Select.Option value="main">主角</Select.Option>
                <Select.Option value="supporting">配角</Select.Option>
                <Select.Option value="minor">龙套</Select.Option>
              </Select>
            </Form.Item>
          </>
        )
      case 'detail':
        return (
          <>
            <Form.Item name="storyTheme" label="故事主题" rules={[{ required: true, message: '请输入故事主题' }]}>
              <TextArea placeholder="描述你的故事核心主题和背景..." rows={4} />
            </Form.Item>
            <Form.Item name="genre" label="类型">
              <Select placeholder="选择小说类型">
                <Select.Option value="都市">都市</Select.Option>
                <Select.Option value="玄幻">玄幻</Select.Option>
                <Select.Option value="仙侠">仙侠</Select.Option>
                <Select.Option value="历史">历史</Select.Option>
                <Select.Option value="科幻">科幻</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="length" label="细纲长度">
              <Select placeholder="选择长度">
                <Select.Option value="medium">中篇 (10-20章)</Select.Option>
                <Select.Option value="long">长篇 (20-50章)</Select.Option>
              </Select>
            </Form.Item>
          </>
        )
      case 'bookname':
        return (
          <>
            <Form.Item name="type" label="作品类型" rules={[{ required: true, message: '请选择作品类型' }]}>
              <Select placeholder="选择作品类型">
                <Select.Option value="都市">都市</Select.Option>
                <Select.Option value="玄幻">玄幻</Select.Option>
                <Select.Option value="仙侠">仙侠</Select.Option>
                <Select.Option value="历史">历史</Select.Option>
                <Select.Option value="科幻">科幻</Select.Option>
                <Select.Option value="悬疑">悬疑</Select.Option>
                <Select.Option value="言情">言情</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="keywords" label="关键词">
              <Input placeholder="输入关键词，用逗号分隔" />
            </Form.Item>
            <Form.Item name="style" label="风格">
              <Select placeholder="选择风格">
                <Select.Option value="简洁">简洁</Select.Option>
                <Select.Option value="文艺">文艺</Select.Option>
                <Select.Option value="霸气">霸气</Select.Option>
                <Select.Option value="清新">清新</Select.Option>
                <Select.Option value="神秘">神秘</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="count" label="生成数量">
              <Select placeholder="选择数量">
                <Select.Option value={3}>3个</Select.Option>
                <Select.Option value={5}>5个</Select.Option>
                <Select.Option value={10}>10个</Select.Option>
              </Select>
            </Form.Item>
          </>
        )
      case 'intro':
        return (
          <>
            <Form.Item name="description" label="作品描述" rules={[{ required: true, message: '请输入作品描述' }]}>
              <TextArea placeholder="描述你的作品内容、主角和亮点..." rows={6} />
            </Form.Item>
          </>
        )
      case 'continue':
        return (
          <>
            <Form.Item name="content" label="当前内容" rules={[{ required: true, message: '请输入需要续写的内容' }]}>
              <TextArea placeholder="输入需要续写的文本内容..." rows={8} />
            </Form.Item>
          </>
        )
      case 'polish':
        return (
          <>
            <Form.Item name="content" label="待润色内容" rules={[{ required: true, message: '请输入需要润色的内容' }]}>
              <TextArea placeholder="输入需要润色的文本..." rows={8} />
            </Form.Item>
            <Form.Item name="style" label="润色风格">
              <Select placeholder="选择风格">
                <Select.Option value="formal">正式</Select.Option>
                <Select.Option value="casual">轻松</Select.Option>
                <Select.Option value="literary">文学</Select.Option>
                <Select.Option value="dramatic">戏剧</Select.Option>
                <Select.Option value="humorous">幽默</Select.Option>
              </Select>
            </Form.Item>
          </>
        )
      case 'expand':
        return (
          <>
            <Form.Item name="content" label="待扩写内容" rules={[{ required: true, message: '请输入需要扩写的内容' }]}>
              <TextArea placeholder="输入需要扩写的文本..." rows={6} />
            </Form.Item>
            <Form.Item name="expandType" label="扩写类型">
              <Select placeholder="选择扩写类型">
                <Select.Option value="detail">细节描写</Select.Option>
                <Select.Option value="emotion">情感描写</Select.Option>
                <Select.Option value="dialogue">对话扩展</Select.Option>
                <Select.Option value="description">环境描写</Select.Option>
              </Select>
            </Form.Item>
          </>
        )
      case 'inspiration':
        return (
          <>
            <Form.Item name="keyword" label="关键词" rules={[{ required: true, message: '请输入关键词' }]}>
              <Input placeholder="输入关键词" />
            </Form.Item>
            <Form.Item name="type" label="灵感类型">
              <Select placeholder="选择类型">
                <Select.Option value="plot">剧情</Select.Option>
                <Select.Option value="character">角色</Select.Option>
                <Select.Option value="scene">场景</Select.Option>
                <Select.Option value="dialogue">对话</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="count" label="生成数量">
              <Select placeholder="选择数量">
                <Select.Option value={3}>3条</Select.Option>
                <Select.Option value={5}>5条</Select.Option>
                <Select.Option value={10}>10条</Select.Option>
              </Select>
            </Form.Item>
          </>
        )
      default:
        return (
          <Form.Item name="userInput" label="输入">
            <TextArea placeholder="请输入内容..." rows={6} />
          </Form.Item>
        )
    }
  }

  // 获取弹窗标题
  const getModalTitle = () => {
    if (currentTool) return currentTool.name
    if (customTool) return customTool.name
    return '工具'
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
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0, color: textColor }}>
              <ToolOutlined style={{ marginRight: 8 }} />
              工具库
            </Title>
            <Text type="secondary" style={{ color: secondaryTextColor }}>
              共 {allTools.length} 个实用工具
            </Text>
          </div>
          <Space>
            <Input
              placeholder="搜索工具..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 200 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="btn-gradient"
              onClick={() => setCustomToolModalVisible(true)}
            >
              自定义工具
            </Button>
          </Space>
        </div>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card
              variant="borderless"
              style={{
                background: cardBgColor,
                borderColor: borderColor,
              }}
            >
              <Statistic
                title={<span style={{ color: secondaryTextColor }}>全部工具</span>}
                value={stats.total}
                valueStyle={{ color: '#c9a959', fontSize: 28 }}
                prefix={<ToolOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              variant="borderless"
              style={{
                background: cardBgColor,
                borderColor: borderColor,
              }}
            >
              <Statistic
                title={<span style={{ color: secondaryTextColor }}>热门工具</span>}
                value={stats.popular}
                valueStyle={{ color: '#fa8c16', fontSize: 28 }}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              variant="borderless"
              style={{
                background: cardBgColor,
                borderColor: borderColor,
              }}
            >
              <Statistic
                title={<span style={{ color: secondaryTextColor }}>总使用次数</span>}
                value={stats.totalUsage}
                valueStyle={{ color: '#52c41a', fontSize: 28 }}
                prefix={<ThunderboltOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              variant="borderless"
              style={{
                background: cardBgColor,
                borderColor: borderColor,
              }}
            >
              <Statistic
                title={<span style={{ color: secondaryTextColor }}>我的收藏</span>}
                value={stats.favorites}
                valueStyle={{ color: '#1890ff', fontSize: 28 }}
                prefix={<StarFilled />}
              />
            </Card>
          </Col>
        </Row>

        {/* 分类标签栏 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            {categoryStats.map((cat) => (
              <Tag
                key={cat.id}
                icon={cat.icon}
                style={{
                  cursor: 'pointer',
                  padding: '6px 14px',
                  fontSize: 13,
                  border: selectedCategory === cat.id ? 'none' : `1px solid ${borderColor}`,
                  background: selectedCategory === cat.id ? cat.color : isDark ? '#252220' : '#ffffff',
                  color: selectedCategory === cat.id ? '#fff' : secondaryTextColor,
                  borderRadius: 16,
                  transition: 'all 0.3s',
                }}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name} ({cat.count})
              </Tag>
            ))}
          </Space>
        </div>

        {/* 工具卡片 */}
        {filteredTools.length > 0 ? (
          <Row gutter={[16, 16]}>
            {filteredTools.map((tool) => {
              const isFavorite = favorites.includes(tool.id)
              const isCustom = customTools.some((t) => t.id === tool.id)

              return (
                <Col xs={24} sm={12} lg={8} xl={6} key={tool.id}>
                  <Card
                    hoverable
                    style={{
                      background: cardBgColor,
                      borderColor: borderColor,
                      height: '100%',
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                    variant="borderless"
                    cover={
                      <div
                        style={{
                          height: 100,
                          background: `linear-gradient(135deg, ${getCategoryColor(tool.category)} 0%, ${getCategoryColor(tool.category)}99 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 40,
                          position: 'relative',
                        }}
                      >
                        <span style={{ filter: 'grayscale(0)' }}>{tool.icon}</span>
                        <div
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: 'rgba(255,255,255,0.2)',
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontSize: 11,
                            color: '#fff',
                          }}
                        >
                          {toolCategories.find((c) => c.id === tool.category)?.name ||
                            (isCustom ? '自定义' : tool.category)}
                        </div>
                      </div>
                    }
                    actions={[
                      <Button
                        type="text"
                        icon={<ToolOutlined />}
                        key="use"
                        onClick={() => (isCustom ? handleUseCustomTool(customTools.find((t) => t.id === tool.id)!) : handleUseTool(tool))}
                        style={{ color: '#c9a959' }}
                      >
                        使用
                      </Button>,
                      <Button
                        type="text"
                        icon={isFavorite ? <StarFilled /> : <StarOutlined />}
                        key="favorite"
                        onClick={(e) => toggleFavorite(tool.id, e)}
                        style={{ color: isFavorite ? '#fa8c16' : undefined }}
                      >
                        {isFavorite ? '已收藏' : '收藏'}
                      </Button>,
                      isCustom && (
                        <Tooltip title="删除" key="delete">
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={(e) => handleDeleteCustomTool(tool.id, e)}
                            danger
                          />
                        </Tooltip>
                      ),
                    ].filter(Boolean)}
                  >
                    <Card.Meta
                      title={
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <span style={{ color: textColor, fontWeight: 600 }}>{tool.name}</span>
                          {tool.isPopular && (
                            <Tag color="#fa8c16" style={{ margin: 0, fontSize: 10 }}>
                              热门
                            </Tag>
                          )}
                        </Space>
                      }
                      description={
                        <div>
                          <Paragraph
                            type="secondary"
                            ellipsis={{ rows: 2 }}
                            style={{
                              marginBottom: 8,
                              fontSize: 12,
                              color: secondaryTextColor,
                              minHeight: 36,
                            }}
                          >
                            {tool.description}
                          </Paragraph>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 11, color: isDark ? '#a99d92' : '#6b635a' }}>
                              {tool.usageCount > 0 ? `使用 ${tool.usageCount} 次` : '自定义工具'}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              )
            })}
          </Row>
        ) : (
          <Card
            style={{
              background: cardBgColor,
              borderColor: borderColor,
              textAlign: 'center',
              padding: 40,
            }}
            variant="borderless"
          >
            <Empty description="没有找到相关工具" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Card>
        )}
      </div>

      {/* 工具使用弹窗 */}
      <Drawer
        title={getModalTitle()}
        placement="right"
        width={500}
        open={toolModalVisible}
        onClose={() => {
          setToolModalVisible(false)
          setCurrentTool(null)
          setCustomTool(null)
          setGeneratedContent('')
        }}
        extra={
          generatedContent && (
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              复制
            </Button>
          )
        }
      >
        <Spin spinning={generating}>
          <Form form={form} layout="vertical" onFinish={handleGenerate}>
            {currentTool && getToolFormFields()}
            {customTool && (
              <Form.Item name="userInput" label="输入">
                <TextArea placeholder="请输入内容..." rows={6} />
              </Form.Item>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={generating} className="btn-gradient">
                {generating ? '生成中...' : '生成'}
              </Button>
            </Form.Item>
          </Form>

          {generatedContent && (
            <>
              <Divider>生成结果</Divider>
              <div
                style={{
                  background: isDark ? '#1a1612' : '#f5f3f0',
                  padding: 16,
                  borderRadius: 8,
                  maxHeight: 400,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: textColor,
                }}
              >
                {generatedContent}
              </div>
            </>
          )}
        </Spin>
      </Drawer>

      {/* 自定义工具创建弹窗 */}
      <Modal
        title="创建自定义工具"
        open={customToolModalVisible}
        onCancel={() => {
          setCustomToolModalVisible(false)
          customForm.resetFields()
        }}
        footer={null}
      >
        <Form form={customForm} layout="vertical" onFinish={handleCreateCustomTool}>
          <Form.Item
            name="name"
            label="工具名称"
            rules={[{ required: true, message: '请输入工具名称' }]}
          >
            <Input placeholder="例如：帮我写一首诗" />
          </Form.Item>
          <Form.Item
            name="description"
            label="工具描述"
            rules={[{ required: true, message: '请输入工具描述' }]}
          >
            <Input placeholder="描述这个工具的用途..." />
          </Form.Item>
          <Form.Item
            name="prompt"
            label="AI提示词"
            rules={[{ required: true, message: '请输入AI提示词' }]}
            extra="这是发送给AI的核心指令，可以使用{input}占位用户输入"
          >
            <TextArea
              placeholder="例如：请根据以下内容生成一首诗：{input}"
              rows={4}
            />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCustomToolModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" className="btn-gradient">
                创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Tools
