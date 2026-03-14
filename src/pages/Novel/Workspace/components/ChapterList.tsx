import { useState, useCallback, useEffect } from 'react'
import { List, Button, Space, Input, Empty, Modal, message, Typography, Tag } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  DragOutlined,
  MoreOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Dropdown } from 'antd'
import type { MenuProps, ListProps } from 'antd'
import type { Chapter } from '@/store/useNovelStore'

interface ChapterListProps {
  chapters: Chapter[]
  selectedChapterId?: string | null
  onSelect: (chapter: Chapter | null) => void
  onCreate: (chapter: Partial<Chapter>) => void
  onUpdate: (id: string, data: Partial<Chapter>) => void
  onDelete: (id: string) => void
  onReorder: (chapters: Chapter[]) => void
}

const { Text, Title } = Typography

function ChapterList({
  chapters,
  selectedChapterId,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
}: ChapterListProps) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // 过滤章节
  const filteredChapters = chapters.filter((chapter) =>
    chapter.title.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  // 按顺序排序
  const sortedChapters = [...filteredChapters].sort((a, b) => a.order - b.order)

  const handleAddChapter = () => {
    const newChapter: Partial<Chapter> = {
      title: `第 ${chapters.length + 1} 章`,
      content: '',
      order: chapters.length + 1,
      status: 'draft',
    }
    onCreate(newChapter)
    message.success('已创建新章节')
  }

  const handleEditTitle = (id: string, currentTitle: string) => {
    setEditingId(id)
    setEditTitle(currentTitle)
  }

  const handleSaveTitle = (id: string) => {
    if (editTitle.trim()) {
      onUpdate(id, { title: editTitle.trim() })
      message.success('已修改标题')
    }
    setEditingId(null)
    setEditTitle('')
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
    setDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      if (selectedChapterId === deleteId) {
        onSelect(null)
      }
      message.success('已删除章节')
    }
    setDeleteModalOpen(false)
    setDeleteId(null)
  }

  const statusConfig = {
    draft: { color: 'default', text: '草稿' },
    edited: { color: 'success', text: '已编辑' },
    'ai-assisted': { color: 'processing', text: 'AI辅助' },
  }

  const menuItems = (chapter: Chapter): MenuProps['items'] => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '重命名',
      onClick: () => handleEditTitle(chapter.id, chapter.title),
    },
    {
      key: 'duplicate',
      icon: <FileTextOutlined />,
      label: '复制',
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => handleDelete(chapter.id),
    },
  ]

  const renderChapterItem: ListProps<Chapter>['render'] = (chapter) => {
    const status = statusConfig[chapter.status]
    const isSelected = selectedChapterId === chapter.id

    return (
      <List.Item
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          borderRadius: 6,
          marginBottom: 4,
          background: isSelected ? 'rgba(201, 169, 89, 0.15)' : 'transparent',
          border: isSelected ? '1px solid rgba(201, 169, 89, 0.3)' : '1px solid transparent',
          transition: 'all 0.2s',
        }}
        onClick={() => onSelect(chapter)}
        actions={[
          <Dropdown
            key="menu"
            menu={{ items: menuItems(chapter) }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
          </Dropdown>,
        ]}
      >
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
          <DragOutlined style={{ color: '#666', cursor: 'grab' }} />
          <FileTextOutlined style={{ color: isSelected ? '#c9a959' : '#a99d92' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {editingId === chapter.id ? (
              <Input
                size="small"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onPressEnter={() => handleSaveTitle(chapter.id)}
                onBlur={() => handleSaveTitle(chapter.id)}
                autoFocus
                style={{ width: '100%' }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Text
                strong
                ellipsis
                style={{
                  display: 'block',
                  color: isSelected ? '#c9a959' : 'inherit',
                }}
              >
                {chapter.title}
              </Text>
            )}
            <Space size={4} style={{ marginTop: 4 }}>
              <Tag color={status.color} style={{ margin: 0, fontSize: 10 }}>
                {status.text}
              </Tag>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {chapter.wordCount.toLocaleString()}字
              </Text>
            </Space>
          </div>
        </div>
      </List.Item>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 标题栏 */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #4a4238',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>章节</Text>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleAddChapter}
          >
            新建
          </Button>
        </div>
        <Input
          placeholder="搜索章节..."
          prefix={<SearchOutlined />}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          size="small"
        />
      </div>

      {/* 章节列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {sortedChapters.length > 0 ? (
          <List
            dataSource={sortedChapters}
            renderItem={renderChapterItem}
            locale={{ emptyText: <Empty description="暂无章节" /> }}
          />
        ) : (
          <Empty
            description="还没有章节"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: 40 }}
          >
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddChapter}>
              创建第一章
            </Button>
          </Empty>
        )}
      </div>

      {/* 统计信息 */}
      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid #4a4238',
          fontSize: 12,
          color: '#a99d92',
        }}
      >
        共 {chapters.length} 章 |{' '}
        {chapters.reduce((acc, c) => acc + c.wordCount, 0).toLocaleString()} 字
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

export default ChapterList
