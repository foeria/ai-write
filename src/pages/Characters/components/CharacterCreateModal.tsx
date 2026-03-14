import { useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
  message,
} from 'antd'
import {
  UserOutlined,
  ManOutlined,
  WomanOutlined,
} from '@ant-design/icons'
import type { Character } from '@/store/useCharacterStore'
import { useAppStore } from '@/store/useAppStore'

interface CharacterCreateModalProps {
  open: boolean
  onCancel: () => void
  onCreate: (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => void
}

const { TextArea } = Input

function CharacterCreateModal({ open, onCancel, onCreate }: CharacterCreateModalProps) {
  const [form] = Form.useForm()
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    if (open) {
      form.resetFields()
    }
  }, [open, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onCreate({
        ...values,
        abilities: values.abilities || [],
        relationships: values.relationships || [],
        tags: values.tags || [],
      })
      form.resetFields()
      messageApi.success('角色创建成功')
    } catch {
      // 验证失败，不处理
    }
  }

  const formStyle: React.CSSProperties = {
    background: isDark ? '#1a1612' : '#f5f3f0',
    borderColor: isDark ? '#4a4238' : '#d4cfc8',
  }

  return (
    <>
      {contextHolder}
      <Modal
        title="创建角色"
        open={open}
        onCancel={() => {
          onCancel()
          form.resetFields()
        }}
        footer={null}
        width={720}
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
          initialValues={{
            gender: 'male',
            role: 'protagonist',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="角色姓名"
                rules={[{ required: true, message: '请输入角色姓名' }]}
              >
                <Input
                  placeholder="输入角色姓名"
                  prefix={<UserOutlined />}
                  style={formStyle}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select
                  style={{ width: '100%' }}
                  options={[
                    { label: <Space><ManOutlined /> 男</Space>, value: 'male' },
                    { label: <Space><WomanOutlined /> 女</Space>, value: 'female' },
                    { label: <Space><UserOutlined /> 其他</Space>, value: 'other' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="age"
                label="年龄"
                rules={[{ required: true, message: '请输入年龄' }]}
              >
                <Input placeholder="年龄" style={formStyle} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="角色定位"
                rules={[{ required: true, message: '请选择角色定位' }]}
              >
                <Select
                  style={{ width: '100%' }}
                  options={[
                    { label: '主角', value: 'protagonist' },
                    { label: '配角', value: 'supporting' },
                    { label: '反派', value: 'antagonist' },
                    { label: '龙套', value: 'minor' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tags"
                label="标签"
              >
                <Select
                  mode="tags"
                  placeholder="添加标签"
                  style={{ width: '100%' }}
                  options={[
                    { value: '剑修', label: '剑修' },
                    { value: '法术', label: '法术' },
                    { value: '阵法', label: '阵法' },
                    { value: '炼器', label: '炼器' },
                    { value: '炼丹', label: '炼丹' },
                    { value: '宗门', label: '宗门' },
                    { value: '家族', label: '家族' },
                    { value: '皇室', label: '皇室' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="appearance"
            label="外貌描述"
          >
            <TextArea
              rows={2}
              placeholder="描述角色的外貌特征..."
              maxLength={300}
              showCount
              style={formStyle}
            />
          </Form.Item>

          <Form.Item
            name="personality"
            label="性格特点"
          >
            <TextArea
              rows={2}
              placeholder="描述角色的性格特点..."
              maxLength={300}
              showCount
              style={formStyle}
            />
          </Form.Item>

          <Form.Item
            name="background"
            label="背景故事"
          >
            <TextArea
              rows={3}
              placeholder="描述角色的背景故事..."
              maxLength={1000}
              showCount
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
                创建角色
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default CharacterCreateModal
