import { Card, Typography, Space, Tag, Button, Dropdown, Popconfirm } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  BookOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { GlossaryItem } from '@/store/useGlossaryStore'
import { useAppStore } from '@/store/useAppStore'

interface GlossaryCardProps {
  item: GlossaryItem
  onEdit: () => void
  onDelete: () => void
  onRelatedClick?: (relatedName: string) => void
}

const { Text, Paragraph } = Typography

function GlossaryCard({ item, onEdit, onDelete, onRelatedClick }: GlossaryCardProps) {
  const isDark = useAppStore((state) => state.config.theme === 'dark')

  // 兼容 Entry 和 GlossaryItem 的字段
  const name = item.title || ''
  const definition = item.definition || item.description || ''
  const tags = item.tags || []
  const relatedItems = item.relatedItems || []
  const description = item.description || ''

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onClick: onEdit,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: (
        <Popconfirm
          title="确认删除"
          description="确定要删除这个词条吗？此操作不可撤销。"
          onConfirm={(e) => {
            e?.stopPropagation()
            onDelete()
          }}
          okText="确认删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <span onClick={(e) => e.stopPropagation()}>删除</span>
        </Popconfirm>
      ),
      danger: true,
    },
  ]

  return (
    <Card
      hoverable
      className="glossary-card card-hover"
      style={{
        height: '100%',
        background: isDark ? '#252220' : '#ffffff',
        borderColor: isDark ? '#4a4238' : '#e8e0d5',
      }}
      variant="borderless"
    >
      <Card.Meta
        title={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <BookOutlined style={{ color: '#667eea' }} />
              <span
                style={{
                  color: isDark ? '#e8e0d5' : '#3d3830',
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                {name}
              </span>
            </Space>
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="text" icon={<MoreOutlined />} size="small">
                操作
              </Button>
            </Dropdown>
          </Space>
        }
        description={
          <div style={{ marginTop: 12 }}>
            {/* 定义 */}
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{
                marginBottom: 8,
                color: isDark ? '#e8e0d5' : '#3d3830',
                fontStyle: 'italic',
              }}
            >
              "{definition}"
            </Paragraph>

            {/* 描述 */}
            <Paragraph
              type="secondary"
              ellipsis={{ rows: 2 }}
              style={{
                marginBottom: 12,
                fontSize: 12,
                color: isDark ? '#a99d92' : '#6b635a',
              }}
            >
              {description}
            </Paragraph>

            {/* 标签 */}
            <Space wrap>
              {tags.slice(0, 4).map((tag) => (
                <Tag
                  key={tag}
                  style={{
                    background: isDark ? '#3a3530' : '#f5f3f0',
                    border: 'none',
                    fontSize: 11,
                  }}
                >
                  {tag}
                </Tag>
              ))}
            </Space>

            {/* 相关词条 */}
            {relatedItems.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Text
                  type="secondary"
                  style={{ fontSize: 11, color: isDark ? '#a99d92' : '#6b635a' }}
                >
                  相关:{' '}
                </Text>
                {relatedItems.slice(0, 3).map((rel, idx) => (
                  <Text
                    key={rel}
                    type="secondary"
                    style={{
                      fontSize: 11,
                      color: '#667eea',
                      marginLeft: 4,
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onRelatedClick?.(rel)
                    }}
                  >
                    <span style={{ textDecoration: 'underline' }}>{rel}</span>
                    {idx < Math.min(relatedItems.length, 3) - 1 ? ', ' : ''}
                  </Text>
                ))}
              </div>
            )}
          </div>
        }
      />
    </Card>
  )
}

export default GlossaryCard
