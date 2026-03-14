import { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
} from 'antd'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { FileTextOutlined } from '@ant-design/icons'
import type { Category } from '@/store/useKnowledgeStore'
import type { KnowledgeItem } from '@/store/sqliteStore'
import { useAppStore } from '@/store/useAppStore'

interface KnowledgeEditorModalProps {
  open: boolean
  categories: Category[]
  editItem?: KnowledgeItem | null
  onCancel: () => void
  onSave: (item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate?: (id: string, updates: Partial<KnowledgeItem>) => void
}

function KnowledgeEditorModal({
  open,
  categories,
  editItem,
  onCancel,
  onSave,
  onUpdate,
}: KnowledgeEditorModalProps) {
  const [form] = Form.useForm()
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  const [editorContent, setEditorContent] = useState('')

  const isEdit = !!editItem

  useEffect(() => {
    if (open) {
      if (editItem) {
        form.setFieldsValue({
          title: editItem.title,
          category: editItem.category,
          tags: editItem.tags,
        })
        setEditorContent(editItem.content || '')
      } else {
        form.resetFields()
        setEditorContent('')
      }
    }
  }, [open, editItem, form])

  const handleOk = async () => {
    try {
      // 验证除 content 外的其他字段
      const values = await form.validateFields(['title', 'category'])
      // 手动检查富文本编辑器内容
      const content = editorContent || (editItem?.content || '')
      if (!content || content === '<p><br></p>') {
        form.setFields([{ name: 'content', errors: ['请输入内容'] }])
        return
      }
      if (isEdit && onUpdate) {
        onUpdate(editItem.id, {
          ...values,
          content,
          tags: values.tags || [],
        })
      } else {
        onSave({
          ...values,
          content,
          tags: values.tags || [],
        })
      }
      form.resetFields()
      setEditorContent('')
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

  // Quill 编辑器主题配置
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'clean'],
      ],
    }),
    []
  )

  // Quill 主题选项
  const quillFormats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'list',
      'bullet',
      'link',
    ],
    []
  )

  // 根据主题动态设置 Quill 样式
  const quillStyle = useMemo(
    () => ({
      background: isDark ? '#1a1612' : '#ffffff',
      color: isDark ? '#e8e0d5' : '#3d3830',
    }),
    [isDark]
  )

  return (
    <>
      <Modal
        title={isEdit ? '编辑知识' : '添加知识'}
        open={open}
        onCancel={() => {
          onCancel()
          form.resetFields()
        }}
        width={640}
        footer={null}
        styles={{
          content: {
            background: isDark ? '#252220' : '#ffffff',
          },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input
              placeholder="输入知识标题"
              prefix={<FileTextOutlined />}
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
            name="content"
            label="内容"
            getValueFromEvent={(value) => value}
          >
            <div style={quillStyle}>
              <ReactQuill
                theme="snow"
                modules={quillModules}
                formats={quillFormats}
                placeholder="输入知识内容..."
                style={{ height: 200, marginBottom: 50 }}
                value={editorContent || editItem?.content || ''}
                onChange={(value) => setEditorContent(value)}
              />
            </div>
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
                { value: '世界观', label: '世界观' },
                { value: '角色', label: '角色' },
                { value: '剧情', label: '剧情' },
                { value: '设定', label: '设定' },
                { value: '地点', label: '地点' },
                { value: '物品', label: '物品' },
                { value: '历史', label: '历史' },
                { value: '传说', label: '传说' },
              ]}
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
                {isEdit ? '保存' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default KnowledgeEditorModal
