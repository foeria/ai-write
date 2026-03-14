import { useState, useRef } from 'react'
import { Form, Input, Select, Button, Space, Divider, Typography, InputNumber, Switch, Modal } from 'antd'
import { UploadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'

const { Text, Title } = Typography

// 分类选项
const CATEGORY_OPTIONS = [
  { value: '', label: '请选择分类' },
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
]

// 内容分级
const CONTENT_RATING_OPTIONS = [
  { value: 'general', label: '全年龄' },
  { value: 'teen', label: '青少年' },
  { value: 'mature', label: '成人' },
]

// 世界类型
const WORLD_TYPE_OPTIONS = [
  { value: 'realistic', label: '现实世界' },
  { value: 'fantasy', label: '奇幻世界' },
  { value: 'sci-fi', label: '科幻世界' },
  { value: 'historical', label: '历史世界' },
  { value: 'alternate', label: '架空世界' },
]

// 整体基调
const TONE_OPTIONS = [
  { value: '', label: '请选择' },
  { value: '轻松愉快', label: '轻松愉快' },
  { value: '紧张刺激', label: '紧张刺激' },
  { value: '沉重严肃', label: '沉重严肃' },
  { value: '浪漫温馨', label: '浪漫温馨' },
  { value: '黑暗压抑', label: '黑暗压抑' },
]

// 发布状态
const STATUS_OPTIONS = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'paused', label: '暂停' },
]

// 小说表单类型
interface NovelFormData {
  title?: string
  category?: string
  genre?: string
  author?: string
  publishStatus?: string
  tags?: string
  targetWords?: number
  contentRating?: string
  description?: string
  cover?: string | null
  theme?: string
  style?: string
  audience?: string
  tone?: string
  era?: string
  location?: string
  worldType?: string
  coreHook?: string
  mainTags?: string
  subTags?: string
  targetAudience?: string
  protagonistName?: string
  protagonistAge?: string
  protagonistBackground?: string
  protagonistGoal?: string
  worldArchitecture?: string
  powerSystem?: string
  goldenFinger?: string
  isPartOfSeries?: boolean
  seriesName?: string
  bookNumber?: number
  totalBooks?: number
}

interface CreateNovelModalProps {
  open: boolean
  onCancel: () => void
  onCreate: (values: NovelFormData, cover: string | null) => void
  editingNovel?: NovelFormData | null
}

const defaultValues: NovelFormData = {
  title: '',
  category: '',
  genre: '',
  author: '',
  publishStatus: 'draft',
  tags: '',
  targetWords: 30,
  contentRating: 'general',
  description: '',
  cover: null,
  theme: '',
  style: '',
  audience: '',
  tone: '',
  era: '',
  location: '',
  worldType: 'realistic',
  coreHook: '',
  mainTags: '',
  subTags: '',
  targetAudience: '',
  protagonistName: '',
  protagonistAge: '',
  protagonistBackground: '',
  protagonistGoal: '',
  worldArchitecture: '',
  powerSystem: '',
  goldenFinger: '',
  isPartOfSeries: false,
  seriesName: '',
  bookNumber: 1,
  totalBooks: 1,
}

function CreateNovelModal({ open, onCancel, onCreate, editingNovel }: CreateNovelModalProps) {
  const [form] = Form.useForm()
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isDark = useAppStore((state) => state.config.theme === 'dark')

  // 根据分类获取默认封面渐变（暖色调主题）
  const getDefaultCoverGradient = (category: string): string => {
    const gradients: Record<string, string> = {
      奇幻: 'linear-gradient(135deg, #8b6914 0%, #c9a959 100%)',
      科幻: 'linear-gradient(135deg, #4a6741 0%, #6b8f62 100%)',
      都市: 'linear-gradient(135deg, #5a7d9a 0%, #7ba3c4 100%)',
      武侠: 'linear-gradient(135deg, #8b4513 0%, #cd853f 100%)',
      历史: 'linear-gradient(135deg, #a0522d 0%, #d2a679 100%)',
      悬疑: 'linear-gradient(135deg, #4a4238 0%, #6b635a 100%)',
      言情: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)',
      玄幻: 'linear-gradient(135deg, #9b6b3a 0%, #c9a959 100%)',
      军事: 'linear-gradient(135deg, #556b2f 0%, #8fbc8f 100%)',
      游戏: 'linear-gradient(135deg, #cd853f 0%, #deb887 100%)',
    }
    return gradients[category] || 'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)'
  }

  // 处理分类变化
  const handleCategoryChange = (category: string) => {
    if (!editingNovel?.cover) {
      setCoverPreview(getDefaultCoverGradient(category))
    }
  }

  // 触发封面上传
  const triggerCoverUpload = () => {
    fileInputRef.current?.click()
  }

  // 处理封面上传
  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCoverPreview(result)
        form.setFieldsValue({ cover: result })
      }
      reader.readAsDataURL(file)
    }
  }

  // 表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      onCreate(values, coverPreview)
      form.resetFields()
      setCoverPreview(null)
    } catch {
      // 验证失败
    }
  }

  // 关闭模态框
  const handleClose = () => {
    form.resetFields()
    setCoverPreview(null)
    onCancel()
  }

  // 清理封面
  const handleClearCover = () => {
    setCoverPreview(null)
    form.setFieldsValue({ cover: null })
  }

  // 主题样式
  const themeStyles = {
    bg: isDark ? '#1a1612' : '#ffffff',
    text: isDark ? '#e8e0d5' : '#3d3830',
    textSecondary: isDark ? '#a99d92' : '#6b635a',
    border: isDark ? '#4a4238' : '#e8e0d5',
  }

  // 初始化表单值
  const initialValues = editingNovel || defaultValues

  return (
    <Modal
      title={editingNovel ? '编辑书籍' : '新建书籍'}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={720}
      destroyOnClose
      styles={{
        content: {
          background: isDark ? '#252220' : '#ffffff',
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        style={{ maxHeight: '70vh', overflowY: 'auto', padding: '16px 24px' }}
      >
        <Title level={5} style={{ color: '#c9a959', marginBottom: 16 }}>
          基本信息
        </Title>

        <Form.Item
          name="title"
          label="书籍名称"
          rules={[{ required: true, message: '请输入书籍名称' }]}
        >
          <Input placeholder="请输入书籍名称" style={themeStyles} />
        </Form.Item>

        <Space style={{ display: 'flex' }} size={16}>
          <Form.Item
            name="category"
            label="作品分类"
            rules={[{ required: true, message: '请选择分类' }]}
            style={{ flex: 1 }}
          >
            <Select options={CATEGORY_OPTIONS} onChange={handleCategoryChange} />
          </Form.Item>

          <Form.Item name="genre" label="细分类型" style={{ flex: 1 }}>
            <Input placeholder="如：修仙、末世、校园等" style={themeStyles} />
          </Form.Item>
        </Space>

        <Space style={{ display: 'flex' }} size={16}>
          <Form.Item name="author" label="作者" style={{ flex: 1 }}>
            <Input placeholder="作者名" style={themeStyles} />
          </Form.Item>

          <Form.Item name="publishStatus" label="状态" style={{ flex: 1 }}>
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Space>

        <Form.Item name="tags" label="书籍标签">
          <Input placeholder="用逗号分隔多个标签，如：穿越、重生、热血" style={themeStyles} />
        </Form.Item>

        <Space style={{ display: 'flex' }} size={16}>
          <Form.Item
            name="targetWords"
            label="目标字数(万)"
            rules={[{ required: true, message: '请输入目标字数' }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={1} max={1000} style={{ width: '100%', ...themeStyles }} />
          </Form.Item>

          <Form.Item name="contentRating" label="内容分级" style={{ flex: 1 }}>
            <Select options={CONTENT_RATING_OPTIONS} />
          </Form.Item>
        </Space>

        <Form.Item name="description" label="书籍简介">
          <Input.TextArea rows={3} maxLength={500} placeholder="简要描述您的作品内容、风格和亮点" style={themeStyles} />
        </Form.Item>

        <Divider />

        <Title level={5} style={{ color: '#c9a959', marginBottom: 16 }}>
          创作设定
        </Title>

        <Space style={{ display: 'flex' }} size={16}>
          <Form.Item name="theme" label="主题" style={{ flex: 1 }}>
            <Input placeholder="如：成长、正义、爱情等" style={themeStyles} />
          </Form.Item>

          <Form.Item name="style" label="写作风格" style={{ flex: 1 }}>
            <Input placeholder="如：轻松幽默、热血激情等" style={themeStyles} />
          </Form.Item>
        </Space>

        <Space style={{ display: 'flex' }} size={16}>
          <Form.Item name="audience" label="目标读者" style={{ flex: 1 }}>
            <Input placeholder="如：年轻人、女性读者等" style={themeStyles} />
          </Form.Item>

          <Form.Item name="tone" label="整体基调" style={{ flex: 1 }}>
            <Select options={TONE_OPTIONS} />
          </Form.Item>
        </Space>

        <Divider />

        <Title level={5} style={{ color: '#c9a959', marginBottom: 16 }}>
          背景设定
        </Title>

        <Space style={{ display: 'flex' }} size={16}>
          <Form.Item name="era" label="时代背景" style={{ flex: 1 }}>
            <Input placeholder="如：现代、古代、未来等" style={themeStyles} />
          </Form.Item>

          <Form.Item name="location" label="地点设定" style={{ flex: 1 }}>
            <Input placeholder="如：中国、异世界、宇宙等" style={themeStyles} />
          </Form.Item>
        </Space>

        <Form.Item name="worldType" label="世界类型">
          <Select options={WORLD_TYPE_OPTIONS} />
        </Form.Item>

        <Divider />

        <Title level={5} style={{ color: '#c9a959', marginBottom: 16 }}>
          大纲基础
        </Title>

        <Form.Item name="coreHook" label="核心梗概（一句话亮点）">
          <Input.TextArea
            rows={3}
            placeholder="在一个怎样的[世界观]下，一个怎样的[主角]因为[动机/目标]，利用[金手指/独特能力]，去解决怎样的[核心冲突]，最终将带来怎样的[爽点/奇观]。"
            style={themeStyles}
          />
        </Form.Item>

        <Space style={{ display: 'flex' }} size={16}>
          <Form.Item name="mainTags" label="主标签" style={{ flex: 1 }}>
            <Input placeholder="如：玄幻、都市" style={themeStyles} />
          </Form.Item>

          <Form.Item name="subTags" label="辅标签" style={{ flex: 1 }}>
            <Input placeholder="如：系统、无敌、种田、权谋" style={themeStyles} />
          </Form.Item>
        </Space>

        <Form.Item name="targetAudience" label="目标读者">
          <Input placeholder="年龄段、性别、阅读偏好等" style={themeStyles} />
        </Form.Item>

        <Divider />

        <Title level={5} style={{ color: '#c9a959', marginBottom: 16 }}>
          主角设定
        </Title>

        <Space style={{ display: 'flex' }} size={16}>
          <Form.Item name="protagonistName" label="主角名称" style={{ flex: 1 }}>
            <Input placeholder="主角姓名" style={themeStyles} />
          </Form.Item>

          <Form.Item name="protagonistAge" label="年龄" style={{ flex: 1 }}>
            <Input placeholder="如：18岁" style={themeStyles} />
          </Form.Item>
        </Space>

        <Form.Item name="protagonistBackground" label="人物背景（公开身份）">
          <Input.TextArea rows={2} placeholder="表面上是什么人，如废柴、学生、小职员" style={themeStyles} />
        </Form.Item>

        <Form.Item name="protagonistGoal" label="主角目标">
          <Input.TextArea rows={2} placeholder="他想要什么？(具体、外在的。如：复仇、找到回家路、成为世界最强)" style={themeStyles} />
        </Form.Item>

        <Divider />

        <Title level={5} style={{ color: '#c9a959', marginBottom: 16 }}>
          世界观基础
        </Title>

        <Form.Item name="worldArchitecture" label="整体架构">
          <Input.TextArea rows={3} placeholder="描述这个世界最笼统的大陆、板块、维度、层级等信息" style={themeStyles} />
        </Form.Item>

        <Space style={{ display: 'flex' }} size={16}>
          <Form.Item name="powerSystem" label="力量体系名称" style={{ flex: 1 }}>
            <Input placeholder="如：修真体系、魔法评议体系" style={themeStyles} />
          </Form.Item>

          <Form.Item name="goldenFinger" label="金手指名称" style={{ flex: 1 }}>
            <Input placeholder="如：大反派系统、神级签到系统" style={themeStyles} />
          </Form.Item>
        </Space>

        <Divider />

        <Title level={5} style={{ color: '#c9a959', marginBottom: 16 }}>
          系列设定
        </Title>

        <Form.Item name="isPartOfSeries" label="系列作品" valuePropName="checked">
          <Space>
            <Switch />
            <Text>这是系列作品的一部分</Text>
          </Space>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) =>
          prevValues.isPartOfSeries !== currentValues.isPartOfSeries
        }>
          {({ getFieldValue }) => {
            const isPartOfSeries = getFieldValue('isPartOfSeries')
            if (!isPartOfSeries) return null

            return (
              <Space style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Form.Item name="seriesName" label="系列名称" style={{ marginBottom: 0 }}>
                  <Input placeholder="请输入系列名称" style={themeStyles} />
                </Form.Item>
                <Space style={{ display: 'flex' }} size={16}>
                  <Form.Item name="bookNumber" label="本书册数" style={{ flex: 1 }}>
                    <InputNumber min={1} style={{ width: '100%', ...themeStyles }} />
                  </Form.Item>
                  <Form.Item name="totalBooks" label="总册数" style={{ flex: 1 }}>
                    <InputNumber min={1} style={{ width: '100%', ...themeStyles }} />
                  </Form.Item>
                </Space>
              </Space>
            )
          }}
        </Form.Item>

        <Divider />

        <Title level={5} style={{ color: '#c9a959', marginBottom: 16 }}>
          封面设置
        </Title>

        <Form.Item name="cover" label="书籍封面">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              onClick={triggerCoverUpload}
              style={{
                width: 120,
                height: 160,
                border: `2px dashed ${isDark ? '#4a4238' : '#d4cfc8'}`,
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                background: coverPreview ? `url(${coverPreview}) center/cover` : (isDark ? '#1a1612' : '#f5f3f0'),
                overflow: 'hidden',
              }}
            >
              {!coverPreview && <PlusOutlined style={{ fontSize: 32, color: isDark ? '#4a4238' : '#d4cfc8' }} />}
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
            <Space>
              <Button icon={<UploadOutlined />} onClick={triggerCoverUpload}>
                上传封面
              </Button>
              {coverPreview && (
                <Button danger icon={<DeleteOutlined />} onClick={handleClearCover}>
                  清除
                </Button>
              )}
            </Space>
          </div>
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            推荐尺寸：240 x 320 像素
          </Text>
        </Form.Item>

        <Form.Item name="cover" noStyle>
          <input type="hidden" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose}>取消</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              className="btn-gradient"
            >
              {editingNovel ? '更新书籍' : '创建书籍'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export type { NovelFormData }
export default CreateNovelModal
