import { useState } from 'react'
import { Modal, Form, Input, Select, Button, Radio, message, Typography, Checkbox, Space } from 'antd'

const { Text, Title } = Typography

// AI模型选项
const AI_MODELS = [
  { id: 'gemini-2.5-pro', name: 'Gemini-2.5-Pro-6-18-稳定' },
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'claude-3', name: 'Claude-3' },
  { id: 'qwen-plus', name: '通义千问Plus' },
]

// 词条类型
const ENTRY_TYPES = [
  { value: 'place', label: '地点' },
  { value: 'item', label: '物品' },
  { value: 'skill', label: '技能' },
  { value: 'organization', label: '组织' },
  { value: 'concept', label: '概念' },
  { value: 'other', label: '其他' },
]

// 详细程度
const DETAIL_LEVELS = [
  { value: 'brief', label: '简洁' },
  { value: 'detailed', label: '详细' },
  { value: 'comprehensive', label: '全面' },
]

// 生成的角色数据
interface GeneratedEntry {
  name: string
  category: string
  description: string
  related: string
  tags: string
}

interface EntryAIModalProps {
  open: boolean
  onClose: () => void
  onGenerate: (entry: GeneratedEntry) => void
}

function EntryAIModal({
  open,
  onClose,
  onGenerate,
}: EntryAIModalProps) {
  const [form] = Form.useForm()
  const [isGenerating, setIsGenerating] = useState(false)

  // 生成随机名称
  const generateRandomName = (type: string): string => {
    const names: Record<string, string[]> = {
      place: ['天机城', '玄武关', '灵霄宫', '青云峰', '幽冥谷'],
      item: ['龙渊剑', '凤凰羽', '混元珠', '太极图', '八卦镜'],
      skill: ['九阳神功', '凌波微步', '降龙十八掌', '天罡北斗阵', '逍遥游'],
      organization: ['天机阁', '无量剑宗', '血刀门', '明月教', '青城派'],
      concept: ['天人合一', '武道真意', '阴阳调和', '五行相克', '太极之道'],
      other: ['天命之子', '命运之轮', '因果循环', '宿命对决', '天道轮回'],
    }
    const typeNames = names[type] || names.other
    return typeNames[Math.floor(Math.random() * typeNames.length)]
  }

  // 生成标签
  const generateTags = (type: string): string => {
    const tags: Record<string, string> = {
      place: '地点,重要,神秘',
      item: '物品,珍贵,强大',
      skill: '武学,高深,难学',
      organization: '势力,影响力,历史',
      concept: '理念,哲学,境界',
      other: '特殊,独特,重要',
    }
    return tags[type] || tags.other
  }

  // 获取分类中文名称
  const getCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      place: '地点',
      item: '物品',
      skill: '技能',
      organization: '组织',
      concept: '概念',
      other: '其他',
    }
    return names[category] || '未分类'
  }

  // 生成词条
  const handleGenerate = async () => {
    try {
      const values = await form.validateFields()
      setIsGenerating(true)

      const entryType = values.entryType || 'place'
      const entryName = values.entryName || generateRandomName(entryType)
      const creativeContext = values.creativeContext || ''
      const generateRequirements = values.generateRequirements || ''
      const keywords = values.keywords || ''
      const detailLevel = values.detailLevel || 'detailed'
      const includeHistory = values.includeHistory !== false
      const includeUsage = values.includeUsage !== false

      // TODO: 调用实际的AI API，这里使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 1500))

      const mockEntry: GeneratedEntry = {
        name: entryName,
        category: entryType,
        description: `根据您的要求"${generateRequirements}"生成的${getCategoryName(entryType)}。${creativeContext ? `创作背景：${creativeContext}` : ''}这是AI生成的示例内容，实际使用时会调用真实的AI接口生成更详细和个性化的内容。详细程度：${detailLevel}。`,
        related: `这是关于${getCategoryName(entryType)}的相关背景信息。${includeHistory ? '包含详细的历史背景。' : ''}${includeUsage ? '包含使用方法说明。' : ''}`,
        tags: keywords || generateTags(entryType),
      }

      message.success('词条生成成功')
      onGenerate(mockEntry)
      handleClose()
    } catch (error) {
      console.error('AI生成词条失败:', error)
      message.error('生成词条失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0, color: '#667eea' }}>
          AI生成词条
        </Title>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          modelId: 'gemini-2.5-pro',
          entryType: 'place',
          entryName: '',
          creativeContext: '',
          generateRequirements: '',
          keywords: '',
          detailLevel: 'detailed',
          includeHistory: true,
          includeUsage: true,
        }}
      >
        {/* AI模型选择 */}
        <Form.Item name="modelId" label={<Text strong>AI模型</Text>}>
          <Select>
            {AI_MODELS.map(model => (
              <Select.Option key={model.id} value={model.id}>
                {model.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 词条类型 */}
        <Form.Item name="entryType" label={<Text strong>词条类型</Text>}>
          <Select>
            {ENTRY_TYPES.map(type => (
              <Select.Option key={type.value} value={type.value}>
                {type.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 词条名称 */}
        <Form.Item name="entryName" label={<Text strong>词条名称 <Text type="secondary">(可选)</Text></Text>}>
          <Input placeholder="如果留空，AI会自动生成名称" />
        </Form.Item>

        {/* 创作背景 */}
        <Form.Item name="creativeContext" label={<Text strong>创作背景</Text>}>
          <Input.TextArea
            rows={3}
            placeholder="描述您的小说背景、世界观、故事风格等..."
          />
        </Form.Item>

        {/* 生成要求 */}
        <Form.Item
          name="generateRequirements"
          label={<Text strong>生成要求</Text>}
          rules={[{ required: true, message: '请填写生成要求' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="描述您希望AI生成什么样的词条，包括特点、用途、重要性等..."
          />
        </Form.Item>

        {/* 参考关键词 */}
        <Form.Item name="keywords" label={<Text strong>参考关键词</Text>}>
          <Input placeholder="用逗号分隔的关键词，如：神秘, 强大, 古老" />
        </Form.Item>

        {/* 详细程度 */}
        <Form.Item name="detailLevel" label={<Text strong>详细程度</Text>}>
          <Radio.Group>
            {DETAIL_LEVELS.map(level => (
              <Radio key={level.value} value={level.value}>
                {level.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        {/* 选项 */}
        <Form.Item>
          <Form.Item name="includeHistory" valuePropName="checked" noStyle>
            <Checkbox>包含历史背景</Checkbox>
          </Form.Item>
          <Form.Item name="includeUsage" valuePropName="checked" noStyle style={{ marginLeft: 24 }}>
            <Checkbox>包含使用方法</Checkbox>
          </Form.Item>
        </Form.Item>

        {/* 操作按钮 */}
        <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose}>取消</Button>
            <Button
              type="primary"
              onClick={handleGenerate}
              loading={isGenerating}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              {isGenerating ? '生成中...' : '开始生成'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EntryAIModal
