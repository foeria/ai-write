import { useState } from 'react'
import { Tree, Button, Space, Modal, Input, message, Typography } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FileOutlined,
  FolderOpenOutlined,
  ImportOutlined,
} from '@ant-design/icons'
import type { TreeProps } from 'antd'
import type { OutlineNode } from '@/store/useNovelStore'

const { Text } = Typography

interface OutlineManagerProps {
  outline: OutlineNode[]
  onChange: (outline: OutlineNode[]) => void
  onImport?: () => void
}

function OutlineManager({ outline, onChange, onImport }: OutlineManagerProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ key: string; isParent: boolean; parentKey?: string } | null>(null)

  // 转换数据为Tree组件格式
  const transformToTreeData = (nodes: OutlineNode[], parentKey?: string): TreeProps['treeData'] => {
    return nodes.map((node, index) => ({
      key: parentKey ? `${parentKey}-${index}` : String(index),
      title: (
        <Space>
          {node.children && node.children.length > 0 ? (
            <FolderOpenOutlined style={{ color: '#c9a959' }} />
          ) : (
            <FileOutlined style={{ color: '#a99d92' }} />
          )}
          <span>{node.title}</span>
        </Space>
      ),
      children: node.children ? transformToTreeData(node.children, parentKey ? `${parentKey}-${index}` : String(index)) : undefined,
    }))
  }

  const handleAddNode = (parentKey?: string) => {
    const newNode: OutlineNode = {
      id: Date.now().toString(),
      title: '新章节',
      children: [],
    }

    if (!parentKey) {
      // 添加顶级节点
      onChange([...outline, newNode])
    } else {
      // 添加子节点
      const newOutline = [...outline]
      const keys = parentKey.split('-').map(Number)
      let current = newOutline
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]].children!
      }
      current[keys[keys.length - 1]].children!.push(newNode)
      onChange(newOutline)
    }
    message.success('已添加章节')
  }

  const handleEdit = (key: string) => {
    setEditingKey(key)
    // 获取当前值
    const keys = key.split('-').map(Number)
    let current = outline
    for (let i = 0; i < keys.length; i++) {
      current = current[keys[i]].children || current
    }
    setEditValue(current[keys[keys.length - 1]].title)
  }

  const handleEditSubmit = () => {
    if (!editingKey) return

    const keys = editingKey.split('-').map(Number)
    const newOutline = [...outline]
    let current = newOutline
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]].children || current
    }
    current[keys[keys.length - 1]].title = editValue

    onChange(newOutline)
    setEditingKey(null)
    setEditValue('')
    message.success('已修改')
  }

  const handleDelete = (key: string) => {
    setDeleteTarget({ key, isParent: false })
    setDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    const keys = deleteTarget.key.split('-').map(Number)
    const newOutline = [...outline]

    if (keys.length === 1) {
      // 删除顶级节点
      newOutline.splice(keys[0], 1)
    } else {
      // 删除子节点
      let current = newOutline
      for (let i = 0; i < keys.length - 2; i++) {
        current = current[keys[i]].children!
      }
      current[keys[keys.length - 2]].children!.splice(keys[keys.length - 1], 1)
    }

    onChange(newOutline)
    setDeleteModalOpen(false)
    setDeleteTarget(null)
    message.success('已删除')
  }

  const treeData = transformToTreeData(outline)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 标题栏 */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #4a4238',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text strong>大纲</Text>
        <Space>
          {onImport && (
            <Button
              type="text"
              size="small"
              icon={<ImportOutlined />}
              onClick={onImport}
            >
              导入
            </Button>
          )}
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddNode()}
          >
            添加卷
          </Button>
        </Space>
      </div>

      {/* 树形列表 */}
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {outline.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#a99d92' }}>
            <Text type="secondary">暂无大纲，点击添加卷开始创建</Text>
          </div>
        ) : (
          <Tree
            treeData={treeData}
            showIcon
            blockNode
            selectable={false}
            defaultExpandAll
            titleRender={(nodeData) => {
              const key = nodeData.key as string
              return (
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  {editingKey === key ? (
                    <Input
                      size="small"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onPressEnter={handleEditSubmit}
                      onBlur={handleEditSubmit}
                      style={{ flex: 1 }}
                      autoFocus
                    />
                  ) : (
                    <span style={{ flex: 1 }}>{nodeData.title as React.ReactNode}</span>
                  )}
                  <Space size={4} onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="text"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddNode(key)}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(key)}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(key)}
                    />
                  </Space>
                </Space>
              )
            }}
          />
        )}
      </div>

      {/* 删除确认弹窗 */}
      <Modal
        title="确认删除"
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={confirmDelete}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除这个章节吗？此操作不可恢复。</p>
      </Modal>
    </div>
  )
}

export default OutlineManager
