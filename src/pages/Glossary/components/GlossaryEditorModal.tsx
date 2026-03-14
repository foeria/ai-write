import { useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
} from 'antd'
import { BookOutlined } from '@ant-design/icons'
import type { GlossaryItem, GlossaryCategory } from '@/store/useGlossaryStore'
import { useAppStore } from '@/store/useAppStore'

interface GlossaryEditorModalProps {
  open: boolean
  categories: GlossaryCategory[]
  editItem?: GlossaryItem | null
  onCancel: () => void
  onSave: (item: Omit<GlossaryItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate?: (id: string, updates: Partial<GlossaryItem>) => void
}

const { TextArea } = Input

function GlossaryEditorModal({
  open,
  categories,
  editItem,
  onCancel,
  onSave,
  onUpdate,
}: GlossaryEditorModalProps) {
  const [form] = Form.useForm()
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  const [messageApi, contextHolder] = message.useMessage()

  const isEdit = !!editItem

  useEffect(() => {
    if (open) {
      if (editItem) {
        // 兼容 Entry 和 GlossaryItem 的字段
        form.setFieldsValue({
          title: editItem.title,
          category: editItem.category,
          definition: editItem.definition || editItem.description,
          description: editItem.description,
          relatedItems: editItem.relatedItems || [],
          tags: editItem.tags || [],
          source: editItem.source,
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, editItem, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const data = {
        ...values,
        // 保存兼容的字段
        name: values.title,
        description: values.definition,
        relatedItems: values.relatedItems || [],
        tags: values.tags || [],
      }

      if (isEdit && onUpdate) {
        onUpdate(editItem.id, data)
        messageApi.success('词条更新成功')
      } else {
        onSave(data as any)
        messageApi.success('词条创建成功')
      }
      form.resetFields()
    } catch {
      // 验证失败，不处理
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
        title={isEdit ? '编辑词条' : '创建词条'}
        open={open}
        onCancel={() => {
          onCancel()
          form.resetFields()
        }}
        footer={null}
        width={640}
        styles={{
          content: {
            background: isDark ? '#252220' : '#ffffff',
          },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="词条名称"
            rules={[{ required: true, message: '请输入词条名称' }]}
          >
            <Input
              placeholder="输入词条名称"
              prefix={<BookOutlined />}
              style={formStyle}
            />
          </Form.Item>

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

          <Form.Item
            name="definition"
            label="定义"
            rules={[{ required: true, message: '请输入定义' }]}
            tooltip="简明扼要地解释这个词条的含义"
          >
            <Input
              placeholder="一句话定义这个术语"
              style={formStyle}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="详细描述"
            rules={[{ required: true, message: '请输入详细描述' }]}
          >
            <TextArea
              rows={4}
              placeholder="详细描述这个词条的背景、用途、特性等..."
              maxLength={2000}
              showCount
              style={formStyle}
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
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

          <Form.Item
            name="relatedItems"
            label="相关词条"
            tooltip="输入相关词条名称，用回车确认"
          >
            <Select
              mode="tags"
              placeholder="相关词条"
              style={{ width: '100%' }}
            />
          </Form.Item>

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
                {isEdit ? '保存' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default GlossaryEditorModal
