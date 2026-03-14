import { useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  List,
  Popconfirm,
  message,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
} from '@ant-design/icons'
import type { Category } from '@/store/useKnowledgeStore'
import { useAppStore } from '@/store/useAppStore'

interface CategoryManagerProps {
  open: boolean
  categories: Category[]
  onClose: () => void
  onAdd: (category: Omit<Category, 'id'>) => void
  onUpdate: (id: string, category: Partial<Category>) => void
  onDelete: (id: string) => void
}

function CategoryManager({
  open,
  categories,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<string | null>(null)
  const isDark = useAppStore((state) => state.config.theme === 'dark')

  const bgColor = isDark ? '#1a1612' : '#f5f3f0'
  const cardBgColor = isDark ? '#252220' : '#ffffff'
  const textColor = isDark ? '#e8e0d5' : '#3d3830'
  const secondaryTextColor = isDark ? '#a99d92' : '#6b635a'
  const borderColor = isDark ? '#4a4238' : '#e8e0d5'

  // 过滤掉 "all" 分类
  const filteredCategories = categories.filter((c) => c.id !== 'all')

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        onUpdate(editingId, values)
        message.success('分类更新成功')
      } else {
        onAdd({
          name: values.name,
          color: values.color || '#c9a959',
        })
        message.success('分类添加成功')
      }
      form.resetFields()
      setEditingId(null)
    } catch {
      // 验证失败
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    form.setFieldsValue({
      name: category.name,
      color: category.color,
    })
  }

  const handleDelete = (id: string) => {
    onDelete(id)
    message.success('分类删除成功')
  }

  const colorOptions = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe',
    '#00f2fe', '#43e97b', '#fa709a', '#fee140',
    '#c9a959', '#8b6914', '#e8a87c', '#38b2ac',
  ]

  return (
    <Modal
      title={
        <Space>
          <FolderOutlined />
          分类管理
        </Space>
      }
      open={open}
      onCancel={() => {
        onClose()
        form.resetFields()
        setEditingId(null)
      }}
      width={480}
      footer={null}
      styles={{
        content: {
          background: cardBgColor,
        },
      }}
    >
      {/* 添加/编辑表单 */}
      <Form form={form} layout="inline" style={{ marginBottom: 16, width: '100%' }}>
        <Form.Item
          name="name"
          rules={[{ required: true, message: '请输入分类名称' }]}
          style={{ flex: 1 }}
        >
          <Input placeholder="分类名称" />
        </Form.Item>
        <Form.Item name="color" initialValue="#c9a959">
          <Input
            type="color"
            style={{ width: 40, height: 32, padding: 2 }}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleSubmit}
              className="btn-gradient"
            >
              {editingId ? '保存' : '添加'}
            </Button>
            {editingId && (
              <Button
                onClick={() => {
                  setEditingId(null)
                  form.resetFields()
                }}
              >
                取消
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>

      {/* 分类列表 */}
      <List
        dataSource={filteredCategories}
        renderItem={(item) => (
          <List.Item
            style={{
              background: isDark ? '#2a2622' : '#fafafa',
              borderColor: borderColor,
              borderRadius: 6,
              padding: '8px 12px',
              marginBottom: 8,
            }}
            actions={[
              <Button
                key="edit"
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(item)}
              >
                编辑
              </Button>,
              <Popconfirm
                key="delete"
                title="确认删除此分类？"
                description="删除后，使用该分类的知识将变为未分类"
                onConfirm={() => handleDelete(item.id)}
                okText="确认"
                cancelText="取消"
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: item.color || '#c9a959',
                  }}
                />
              }
              title={<span style={{ color: textColor }}>{item.name}</span>}
              description={
                <span style={{ color: secondaryTextColor }}>
                  ID: {item.id}
                </span>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: '暂无分类' }}
      />

      {/* 颜色选择提示 */}
      <div style={{ marginTop: 8, color: secondaryTextColor, fontSize: 12 }}>
        点击颜色选择器可自定义分类颜色
      </div>
    </Modal>
  )
}

export default CategoryManager
