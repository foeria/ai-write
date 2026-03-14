import { Modal, Form, Input, Button, Checkbox, Tabs, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/useUserStore'

interface LoginModalProps {
  open: boolean
  onCancel: () => void
}

function LoginModal({ open, onCancel }: LoginModalProps) {
  const navigate = useNavigate()
  const { login, register, isLoading } = useUserStore()
  const [form] = Form.useForm()

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await login(values)
      message.success('登录成功')
      onCancel()
      navigate('/')
    } catch {
      message.error('登录失败，请检查邮箱和密码')
    }
  }

  const handleRegister = async (values: {
    email: string
    password: string
    nickname: string
    agreement: boolean
  }) => {
    try {
      await register({
        email: values.email,
        password: values.password,
        nickname: values.nickname,
        code: '1234', // TODO: 实现验证码
      })
      message.success('注册成功，请登录')
      form.resetFields(['password'])
      form.setFieldsValue({ tab: 'login' })
    } catch {
      message.error('注册失败')
    }
  }

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form form={form} onFinish={handleLogin} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>记住我</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form form={form} onFinish={handleRegister} layout="vertical" size="large">
          <Form.Item
            name="nickname"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="昵称" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject('请同意用户协议'),
              },
            ]}
          >
            <Checkbox>我已阅读并同意用户协议</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block>
              注册
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <Modal
      title="欢迎使用AI写作助手"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={400}
      destroyOnHidden
    >
      <Tabs items={tabItems} centered style={{ marginTop: 16 }} />
    </Modal>
  )
}

export default LoginModal
