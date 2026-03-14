import { useState } from 'react'
import { Modal, Form, Input, Select, Slider, Button, Space, Typography, Card, message } from 'antd'
import {
  RobotOutlined,
  BulbOutlined,
  FileTextOutlined,
  ScissorOutlined,
  ExpandOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { AIGenerateRequest } from '@/api/ai'

const { Text, Title } = Typography

interface AIAssistModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: (params: AIGenerateRequest) => Promise<void>
  context?: string
}

type AIAssistType = 'chat' | 'polish' | 'expand' | 'outline' | 'generate'

interface AIAssistForm {
  type: AIAssistType
  prompt: string
  length: number
  style: string
  temperature: number
}

function AIAssistModal({ open, onCancel, onSubmit, context }: AIAssistModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<AIAssistType>('polish')

  const assistTypes: { key: AIAssistType; label: string; icon: React.ReactNode; description: string }[] = [
    {
      key: 'chat',
      label: 'AI对话',
      icon: <RobotOutlined />,
      description: '与AI进行对话，获取创作建议',
    },
    {
      key: 'polish',
      label: '文润',
      icon: <BulbOutlined />,
      description: '优化文字表达，提升文笔',
    },
    {
      key: 'expand',
      label: '扩展',
      icon: <ExpandOutlined />,
      description: '扩展内容，增加细节',
    },
    {
      key: 'generate',
      label: '生成',
      icon: <FileTextOutlined />,
      description: '根据提示生成新内容',
    },
    {
      key: 'outline',
      label: '大纲',
      icon: <ScissorOutlined />,
      description: '生成或优化章节大纲',
    },
  ]

  const currentType = assistTypes.find((t) => t.key === activeTab)!

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      await onSubmit({
        type: values.type,
        prompt: values.prompt,
        context: context,
        options: {
          length: values.length,
          style: values.style,
          temperature: values.temperature,
        },
      })

      message.success('AI处理完成')
      onCancel()
      form.resetFields()
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (value: AIAssistType) => {
    setActiveTab(value)
    form.setFieldsValue({ type: value })
  }

  return (
    <Modal
      title={
        <Space>
          <RobotOutlined />
          AI辅助创作
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="开始生成"
      cancelText="取消"
      confirmLoading={loading}
      width={600}
      destroyOnHidden
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">选择AI辅助功能</Text>
      </div>

      {/* 功能选择卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 24 }}>
        {assistTypes.map((type) => (
          <Card
            key={type.key}
            size="small"
            hoverable
            style={{
              textAlign: 'center',
              borderColor: activeTab === type.key ? '#c9a959' : '#4a4238',
              background: activeTab === type.key ? 'rgba(201, 169, 89, 0.1)' : 'transparent',
            }}
            onClick={() => handleTypeChange(type.key)}
            bodyStyle={{ padding: '12px 8px' }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>{type.icon}</div>
            <Text strong style={{ fontSize: 12 }}>{type.label}</Text>
          </Card>
        ))}
      </div>

      <Form form={form} layout="vertical" initialValues={{ type: activeTab, length: 50, temperature: 0.7 }}>
        <Form.Item name="type" hidden>
          <Select />
        </Form.Item>

        <Form.Item
          label="提示词"
          name="prompt"
          rules={[{ required: true, message: '请输入提示词' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder={`请描述你想要${currentType.label}的内容...${context ? '\n\n上下文：' + context.slice(0, 100) + '...' : ''}`}
          />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item label="生成长度" name="length">
            <Slider
              min={10}
              max={100}
              marks={{ 10: '短', 50: '中', 100: '长' }}
              tooltip={{ formatter: (v) => `${v}%` }}
            />
          </Form.Item>

          <Form.Item label="创意度" name="temperature">
            <Slider
              min={0.1}
              max={1}
              step={0.1}
              marks={{ 0.1: '保守', 0.5: '平衡', 1: '创意' }}
              tooltip={{ formatter: (v) => v?.toFixed(1) }}
            />
          </Form.Item>
        </div>

        <Form.Item label="风格" name="style">
          <Select
            placeholder="选择生成风格（可选）"
            allowClear
            options={[
              { label: '严肃', value: 'serious' },
              { label: '轻松', value: 'casual' },
              { label: '幽默', value: 'humorous' },
              { label: '诗意', value: 'poetic' },
              { label: '科幻', value: 'sci-fi' },
              { label: '古风', value: 'ancient' },
            ]}
          />
        </Form.Item>
      </Form>

      <Card size="small" style={{ background: '#252220', border: 'none' }}>
        <Space>
          <SettingOutlined />
          <Text type="secondary" style={{ fontSize: 12 }}>
            当前使用模型：DeepSeek Chat | 每次对话消耗约 500 字额度
          </Text>
        </Space>
      </Card>
    </Modal>
  )
}

export default AIAssistModal
