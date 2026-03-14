import { useState } from 'react'
import { Modal, Form, Input, Select, Button, Space, Radio, message, Divider } from 'antd'

// AI模型选项
const AI_MODELS = [
  { id: 'gemini-2.5-pro', name: 'Gemini-2.5-Pro-6-18-稳定' },
  { id: 'gemini-2.5-flash', name: 'Gemini-2.5-Flash-6-18-极速' },
  { id: 'deepseek-ai/DeepSeek-V3.1', name: 'DeepSeek-V3.1' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5-Turbo' },
  { id: 'deepseek-reasoner', name: 'DeepSeek' },
  { id: 'Qwen/Qwen3-235B-A22B-Instruct-2507', name: '通义千问Plus' },
]

// 角色模板
const CHARACTER_TEMPLATES = [
  { id: 'basic', name: '基础角色模板', prompt: '创建一个具有以下特征的角色：' },
  { id: 'protagonist', name: '主角模板', prompt: '创建一个小说主角，具有以下特征：' },
  { id: 'antagonist', name: '反派模板', prompt: '创建一个引人入胜的反派角色，具有以下特征：' },
  { id: 'supporting', name: '配角模板', prompt: '创建一个有深度的配角，具有以下特征：' },
]

// 章节类型
interface Chapter {
  id: string
  title: string
}

// 生成的角色数据
interface GeneratedCharacter {
  name: string
  role: string
  faction: string
  personality: string
  appearance: string
  background: string
  motivation: string
  conflict: string
}

interface CharacterGenerateModalProps {
  open: boolean
  onClose: () => void
  onGenerate: (character: GeneratedCharacter) => void
  chapters?: Chapter[]
}

// 默认章节
const defaultChapters: Chapter[] = []

function CharacterGenerateModal({
  open,
  onClose,
  onGenerate,
  chapters = defaultChapters,
}: CharacterGenerateModalProps) {
  const [form] = Form.useForm()
  const [isGenerating, setIsGenerating] = useState(false)
  const [promptType, setPromptType] = useState<'template' | 'custom'>('template')

  // 生成角色
  const handleGenerate = async () => {
    try {
      const values = await form.validateFields()
      setIsGenerating(true)

      // AI系统提示词（实际调用API时使用）
      // const systemPrompt = `你是一个专业的小说角色创作专家...`
      // const userPrompt = promptType === 'custom'
      //   ? form.getFieldValue('customPrompt')
      //   : buildFullPrompt(values)
      // const result = await AskAI(systemPrompt, userPrompt, selectedModel.value)

      // 模拟AI返回的角色数据
      const mockCharacter: GeneratedCharacter = {
        name: values.faction ? `${values.faction}的${values.gender || ''}角色` : '新角色',
        role: values.relationToProtagonist || '配角',
        faction: values.faction || '中立',
        personality: values.traits || '性格特点由AI根据提示生成',
        appearance: '外貌特征由AI根据提示生成',
        background: `背景故事由AI根据"${values.traits || '创意背景'}"生成`,
        motivation: '动机和目标由AI根据角色设定生成',
        conflict: '内在或外在冲突由AI根据故事背景生成',
      }

      message.success('角色生成成功')
      onGenerate(mockCharacter)
      handleClose()
    } catch (error) {
      console.error('AI生成角色失败:', error)
      message.error('生成角色失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setPromptType('template')
    onClose()
  }

  return (
    <Modal
      title="AI生成角色"
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
          templateId: 'basic',
          promptType: 'template',
          gender: '',
          relationToProtagonist: '',
          faction: '',
          traits: '',
          relatedChapter: '',
          relatedOutline: '',
        }}
      >
        {/* AI模型选择 */}
        <Form.Item name="modelId" label="AI模型">
          <Select>
            {AI_MODELS.map(model => (
              <Select.Option key={model.id} value={model.id}>
                {model.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 提示词类型 */}
        <Form.Item name="promptType" label="提示词类型">
          <Radio.Group onChange={(e) => setPromptType(e.target.value)} value={promptType}>
            <Radio value="template">模板提示词</Radio>
            <Radio value="custom">自定义提示词</Radio>
          </Radio.Group>
        </Form.Item>

        {/* 模板选择 */}
        {promptType === 'template' && (
          <Form.Item name="templateId" label="角色模板">
            <Select>
              {CHARACTER_TEMPLATES.map(template => (
                <Select.Option key={template.id} value={template.id}>
                  {template.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* 自定义提示词 */}
        {promptType === 'custom' && (
          <Form.Item name="customPrompt" label="自定义提示词">
            <Input.TextArea
              rows={4}
              placeholder="请输入自定义提示词，描述你想要生成的角色特征..."
            />
          </Form.Item>
        )}

        <Divider>人物构思</Divider>

        {/* 性别和关系 */}
        <Space style={{ display: 'flex' }}>
          <Form.Item name="gender" label="性别" style={{ flex: 1 }} rules={[{ required: false }]}>
            <Select placeholder="不限">
              <Select.Option value="">不限</Select.Option>
              <Select.Option value="男">男</Select.Option>
              <Select.Option value="女">女</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="relationToProtagonist" label="与主角关系" style={{ flex: 1 }} rules={[{ required: false }]}>
            <Select placeholder="请选择">
              <Select.Option value="">请选择</Select.Option>
              <Select.Option value="盟友">盟友</Select.Option>
              <Select.Option value="对手">对手</Select.Option>
              <Select.Option value="导师">导师</Select.Option>
              <Select.Option value="恋人">恋人</Select.Option>
              <Select.Option value="家人">家人</Select.Option>
              <Select.Option value="陌生人">陌生人</Select.Option>
            </Select>
          </Form.Item>
        </Space>

        {/* 所属势力 */}
        <Form.Item name="faction" label="所属势力">
          <Input placeholder="如：正派、反派、中立等" />
        </Form.Item>

        {/* 角色特征 */}
        <Form.Item name="traits" label="角色特征">
          <Input.TextArea
            rows={3}
            placeholder="描述角色的性格、特点、能力等..."
          />
        </Form.Item>

        <Divider>关联信息</Divider>

        {/* 关联章节 */}
        <Form.Item name="relatedChapter" label="关联章节" rules={[{ required: false }]}>
          <Select placeholder="不关联" allowClear>
            <Select.Option value="">不关联</Select.Option>
            {chapters.map(chapter => (
              <Select.Option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 关联大纲 */}
        <Form.Item name="relatedOutline" label="关联大纲" rules={[{ required: false }]}>
          <Select placeholder="不关联" allowClear>
            <Select.Option value="">不关联</Select.Option>
            <Select.Option value="main">主大纲</Select.Option>
            <Select.Option value="character">人物大纲</Select.Option>
            <Select.Option value="world">世界观大纲</Select.Option>
          </Select>
        </Form.Item>

        {/* 操作按钮 */}
        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
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
              {isGenerating ? '生成中...' : '生成角色'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CharacterGenerateModal
