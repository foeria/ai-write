import { useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Slider,
  Spin,
  message,
} from 'antd'
import { StarOutlined } from '@ant-design/icons'
import { chatComplete } from '@/api/ai'
import { useAppStore } from '@/store/useAppStore'
import type { GlossaryItem } from '@/store/useGlossaryStore'

interface GlossaryAIModalProps {
  open: boolean
  categories: { id: string; name: string }[]
  existingItems: GlossaryItem[]
  onCancel: () => void
  onSave: (item: Omit<GlossaryItem, 'id' | 'createdAt' | 'updatedAt'>) => void
}

const { TextArea } = Input

// AI模型选项
const modelOptions = [
  { label: 'GPT-4 (推荐)', value: 'gpt-4' },
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'Claude 3 Opus', value: 'claude-3-opus' },
  { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet' },
]

// 详细程度选项
const detailLevels = [
  { label: '简洁', value: 1, description: '50-100字简明定义' },
  { label: '标准', value: 2, description: '100-200字完整定义' },
  { label: '详细', value: 3, description: '200-500字详尽描述' },
  { label: '百科', value: 4, description: '500字以上全面解析' },
]

function GlossaryAIModal({
  open,
  categories,
  existingItems,
  onCancel,
  onSave,
}: GlossaryAIModalProps) {
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingField, setGeneratingField] = useState<string | null>(null)

  // 表单初始值
  const initialValues = {
    model: 'gpt-4',
    detailLevel: 2,
  }

  // 生成词条
  const handleGenerate = async (field: string) => {
    const values = form.getFieldsValue()
    const prompt = values.prompt?.trim()

    if (!prompt) {
      messageApi.warning('请输入词条关键词')
      return
    }

    setIsGenerating(true)
    setGeneratingField(field)

    try {
      const detailLevel = values.detailLevel || 2
      const model = values.model || 'gpt-4'

      // 构建prompt
      let systemPrompt = ''
      let userPrompt = ''

      switch (field) {
        case 'definition':
          systemPrompt = '你是一个专业的作家助手，擅长创建世界观设定。'
          userPrompt = `请为"${prompt}"这个${values.category ? '在' + categories.find(c => c.id === values.category)?.name + '类别中的' : ''}词条生成一个简洁的定义（${detailLevels[detailLevel - 1].description}）。直接返回定义内容，不要添加任何前缀或格式。`
          break
        case 'description':
          systemPrompt = '你是一个专业的小说世界观架构师。'
          userPrompt = `请为词条"${prompt}"生成详细的背景描述、用途和特性（${detailLevels[detailLevel - 1].description}）。直接返回描述内容，不要添加任何前缀或格式。`
          break
        case 'tags':
          systemPrompt = '你是一个标签生成专家。'
          userPrompt = `请为词条"${prompt}"生成3-8个相关标签，用逗号分隔。直接返回标签列表，不要添加任何前缀或格式。`
          break
        case 'relatedItems':
          systemPrompt = '你是一个世界观设定专家，擅长发现词条之间的关联。'
          const allItemNames = existingItems.map(item => item.title).filter(Boolean)
          userPrompt = `请为词条"${prompt}"推荐3-5个相关的已存在词条。已有词条包括：${allItemNames.join('、') || '暂无词条'}。请选择最相关的词条，直接返回词条名称，用逗号分隔。不要添加任何前缀或格式。`
          break
        case 'all':
          systemPrompt = '你是一个专业的小说世界观架构师。'
          userPrompt = `请为"${prompt}"这个词条生成完整的设定信息（${detailLevels[detailLevel - 1].description}）。

请按照以下JSON格式返回，不要添加任何前缀或格式：
{
  "name": "词条名称",
  "category": "推荐分类（从以下选择：${categories.map(c => c.name).join('、')}）",
  "definition": "一句话定义",
  "description": "详细描述",
  "tags": ["标签1", "标签2", "标签3"],
  "relatedItems": ["相关词条1", "相关词条2"]
}`
          break
      }

      const result = await chatComplete(userPrompt, {
        model,
        temperature: 0.7,
        maxTokens: detailLevel >= 3 ? 2000 : 1000,
        context: systemPrompt,
      })

      // 解析结果并更新表单
      if (field === 'all') {
        try {
          // 尝试解析JSON
          const jsonMatch = result.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            form.setFieldsValue({
              title: parsed.name || prompt,
              category: categories.find(c => c.name === parsed.category)?.id || parsed.category,
              definition: parsed.definition,
              description: parsed.description,
              tags: parsed.tags,
              relatedItems: parsed.relatedItems,
            })
            messageApi.success('已生成完整词条信息')
          }
        } catch {
          // JSON解析失败，使用原始文本
          messageApi.warning('生成内容解析失败，请手动编辑')
        }
      } else if (field === 'tags' || field === 'relatedItems') {
        // 标签和相关内容用逗号分隔
        const items = result.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
        form.setFieldsValue({
          [field]: items,
        })
      } else {
        // definitions和description直接设置
        form.setFieldsValue({
          [field]: result,
        })
      }

      messageApi.success('生成成功')
    } catch (error) {
      messageApi.error('生成失败，请重试')
      console.error('AI生成失败:', error)
    } finally {
      setIsGenerating(false)
      setGeneratingField(null)
    }
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()

      const data = {
        title: values.title,
        category: values.category,
        definition: values.definition,
        description: values.description,
        tags: values.tags || [],
        relatedItems: values.relatedItems || [],
        source: values.source || 'AI生成',
        name: values.title,
      }

      onSave(data as any)
      messageApi.success('词条创建成功')
      form.resetFields()
    } catch {
      // 验证失败
    }
  }

  const formStyle: React.CSSProperties = {
    background: isDark ? '#1a1612' : '#f5f3f0',
    borderColor: isDark ? '#4a4238' : '#d4cfc8',
  }

  const categoryOptions = categories
    .filter((c) => c.id !== 'all')
    .map((c) => ({ label: c.name, value: c.id }))

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <Space>
            <StarOutlined style={{ color: '#c9a959' }} />
            AI生成词条
          </Space>
        }
        open={open}
        onCancel={() => {
          onCancel()
          form.resetFields()
        }}
        footer={null}
        width={700}
        styles={{
          content: {
            background: isDark ? '#252220' : '#ffffff',
          },
        }}
      >
        <Spin spinning={isGenerating}>
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            style={{ marginTop: 16 }}
          >
            {/* AI设置区域 */}
            <div
              style={{
                padding: 16,
                marginBottom: 16,
                background: isDark ? '#1a1612' : '#f5f3f0',
                borderRadius: 8,
                border: `1px solid ${isDark ? '#4a4238' : '#e8e0d5'}`,
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <span style={{ color: isDark ? '#a99d92' : '#6b635a', marginBottom: 8, display: 'block' }}>
                    AI模型
                  </span>
                  <Form.Item name="model" style={{ marginBottom: 0 }}>
                    <Select
                      options={modelOptions}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
                <div>
                  <span style={{ color: isDark ? '#a99d92' : '#6b635a', marginBottom: 8, display: 'block' }}>
                    详细程度
                  </span>
                  <Form.Item name="detailLevel" style={{ marginBottom: 0 }}>
                    <Slider
                      min={1}
                      max={4}
                      marks={{
                        1: '简洁',
                        2: '标准',
                        3: '详细',
                        4: '百科',
                      }}
                    />
                  </Form.Item>
                </div>
              </Space>
            </div>

            {/* 词条关键词 */}
            <Form.Item
              name="prompt"
              label="词条关键词"
              tooltip="输入你想创建的词条关键词，AI将为你生成相关内容"
            >
              <Input
                placeholder="输入词条关键词，如：青云宗、筑基丹、噬魂剑等"
                style={formStyle}
                suffix={
                  <Button
                    type="link"
                    size="small"
                    loading={isGenerating && generatingField === 'all'}
                    onClick={() => handleGenerate('all')}
                    style={{ color: '#c9a959' }}
                  >
                    一键生成
                  </Button>
                }
              />
            </Form.Item>

            {/* 词条名称 */}
            <Form.Item
              name="title"
              label="词条名称"
              rules={[{ required: true, message: '请输入词条名称' }]}
            >
              <Input
                placeholder="词条名称"
                style={formStyle}
              />
            </Form.Item>

            {/* 分类 */}
            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select
                placeholder="选择分类"
                options={categoryOptions}
                style={{ width: '100%' }}
              />
            </Form.Item>

            {/* 定义 */}
            <Form.Item
              name="definition"
              label="定义"
              rules={[{ required: true, message: '请输入定义' }]}
            >
              <Input
                placeholder="一句话定义这个术语"
                style={formStyle}
                suffix={
                  <Button
                    type="link"
                    size="small"
                    loading={isGenerating && generatingField === 'definition'}
                    onClick={() => handleGenerate('definition')}
                    style={{ color: '#c9a959' }}
                  >
                    AI生成
                  </Button>
                }
              />
            </Form.Item>

            {/* 详细描述 */}
            <Form.Item
              name="description"
              label="详细描述"
              rules={[{ required: true, message: '请输入详细描述' }]}
              extra={
                <Button
                  type="link"
                  size="small"
                  loading={isGenerating && generatingField === 'description'}
                  onClick={() => handleGenerate('description')}
                  style={{ color: '#c9a959', padding: 0 }}
                >
                  AI生成
                </Button>
              }
            >
              <TextArea
                rows={4}
                placeholder="详细描述这个词条的背景、用途、特性等..."
                maxLength={2000}
                showCount
                style={formStyle}
              />
            </Form.Item>

            {/* 标签 */}
            <Form.Item
              name="tags"
              label="标签"
              extra={
                <Button
                  type="link"
                  size="small"
                  loading={isGenerating && generatingField === 'tags'}
                  onClick={() => handleGenerate('tags')}
                  style={{ color: '#c9a959', padding: 0 }}
                >
                  AI生成
                </Button>
              }
            >
              <Select
                mode="tags"
                placeholder="添加标签"
                style={{ width: '100%' }}
                options={[
                  { value: '修炼', label: '修炼' },
                  { value: '境界', label: '境界' },
                  { value: '功法', label: '功法' },
                  { value: '法宝', label: '法宝' },
                  { value: '丹药', label: '丹药' },
                  { value: '灵草', label: '灵草' },
                  { value: '灵兽', label: '灵兽' },
                  { value: '势力', label: '势力' },
                  { value: '地点', label: '地点' },
                ]}
              />
            </Form.Item>

            {/* 相关词条 */}
            <Form.Item
              name="relatedItems"
              label="相关词条"
              tooltip="输入相关词条名称，用回车确认"
              extra={
                <Button
                  type="link"
                  size="small"
                  loading={isGenerating && generatingField === 'relatedItems'}
                  onClick={() => handleGenerate('relatedItems')}
                  style={{ color: '#c9a959', padding: 0 }}
                >
                  AI推荐
                </Button>
              }
            >
              <Select
                mode="tags"
                placeholder="相关词条"
                style={{ width: '100%' }}
              />
            </Form.Item>

            {/* 来源 */}
            <Form.Item
              name="source"
              label="来源/出处"
            >
              <Input
                placeholder="注明这个词条的来源或出处"
                style={formStyle}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  onCancel()
                  form.resetFields()
                }}>
                  取消
                </Button>
                <Button type="primary" onClick={handleOk} className="btn-gradient">
                  创建词条
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  )
}

export default GlossaryAIModal
