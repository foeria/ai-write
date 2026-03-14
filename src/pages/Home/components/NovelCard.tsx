import { Card, Typography, Space, Tag, Progress, Dropdown, Button } from 'antd'
import { EditOutlined, DeleteOutlined, MoreOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { Novel } from '@/store/useNovelStore'
import { useAppStore } from '@/store/useAppStore'

// 扩展的Novel接口
interface ExtendedNovel extends Novel {
  cover?: string
  category?: string
  genre?: string
  tags?: string
  targetWords?: number
}

interface NovelCardProps {
  novel: ExtendedNovel
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  onDownload: () => void
}

const { Text } = Typography

// 封面渐变颜色 - 根据分类（暖色调主题）
const getCoverGradient = (category: string | undefined, isDark: boolean): string => {
  if (!category) {
    return isDark
      ? 'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)'
      : 'linear-gradient(135deg, #d4b36a 0%, #a07818 100%)'
  }
  const gradients: Record<string, string> = {
    奇幻: 'linear-gradient(135deg, #8b6914 0%, #c9a959 100%)',
    科幻: 'linear-gradient(135deg, #4a6741 0%, #6b8f62 100%)',
    都市: 'linear-gradient(135deg, #5a7d9a 0%, #7ba3c4 100%)',
    武侠: 'linear-gradient(135deg, #8b4513 0%, #cd853f 100%)',
    历史: 'linear-gradient(135deg, #a0522d 0%, #d2a679 100%)',
    悬疑: 'linear-gradient(135deg, #4a4238 0%, #6b635a 100%)',
    言情: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)',
    玄幻: 'linear-gradient(135deg, #9b6b3a 0%, #c9a959 100%)',
    军事: 'linear-gradient(135deg, #556b2f 0%, #8fbc8f 100%)',
    游戏: 'linear-gradient(135deg, #cd853f 0%, #deb887 100%)',
  }
  return gradients[category] || (isDark
    ? 'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)'
    : 'linear-gradient(135deg, #d4b36a 0%, #a07818 100%)')
}

function NovelCard({ novel, onOpen, onEdit, onDelete, onDownload }: NovelCardProps) {
  const isDark = useAppStore((state) => state.config.theme === 'dark')

  // 状态配置
  const statusConfig: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    writing: { color: 'processing', text: '写作中' },
    published: { color: 'success', text: '已发布' },
    paused: { color: 'warning', text: '暂停' },
  }

  const status = statusConfig[novel.status] || statusConfig.draft

  // 菜单项
  const menuItems: MenuProps['items'] = [
    {
      key: 'open',
      icon: <EyeOutlined />,
      label: '打开',
      onClick: onOpen,
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onClick: onEdit,
    },
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: '下载',
      onClick: onDownload,
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: onDelete,
    },
  ]

  // 计算进度 - 默认目标30万字（与创建默认值一致）
  const targetWords = novel.targetWords
  const targetCount = targetWords || 300000
  const progress = Math.min((novel.wordCount / targetCount) * 100, 100)

  // 解析标签
  const getTagsArray = (tags: string | undefined): string[] => {
    if (!tags || typeof tags !== 'string') return []
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
  }

  const tags = getTagsArray(novel.tags)

  return (
    <Card
      hoverable
      className="novel-card card-hover"
      style={{
        height: '100%',
        background: isDark ? '#252220' : '#ffffff',
        borderColor: isDark ? '#4a4238' : '#e8e0d5',
      }}
      variant="borderless"
      cover={
        <div
          style={{
            height: 140,
            background: novel.cover
              ? `url(${novel.cover}) center/cover`
              : getCoverGradient(novel.category, isDark),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px 8px 0 0',
            position: 'relative',
          }}
        >
          {!novel.cover && (
            <Text
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: 14,
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                padding: 8,
                textAlign: 'center',
              }}
            >
              {novel.title}
            </Text>
          )}
          {novel.category && (
            <Tag
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: 'rgba(0,0,0,0.4)',
                color: '#fff',
                border: 'none',
              }}
            >
              {novel.category}
            </Tag>
          )}
        </div>
      }
      actions={[
        <Button type="text" icon={<EditOutlined />} onClick={onOpen} style={{ color: isDark ? '#e8e0d5' : '#3d3830' }}>
          写作
        </Button>,
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} style={{ color: isDark ? '#e8e0d5' : '#3d3830' }}>
            更多
          </Button>
        </Dropdown>,
      ]}
    >
      <Card.Meta
        title={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: isDark ? '#e8e0d5' : '#3d3830',
                fontWeight: 500,
              }}
            >
              {novel.title}
            </span>
            <Tag
              color={status.color}
              style={{
                background: isDark ? '#3a3530' : '#f5f3f0',
                border: 'none',
              }}
            >
              {status.text}
            </Tag>
          </Space>
        }
        description={
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Text
              type="secondary"
              ellipsis
              style={{
                display: 'block',
                height: 36,
                color: isDark ? '#a99d92' : '#6b635a',
                fontSize: 13,
              }}
            >
              {novel.description || '暂无描述'}
            </Text>

            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {tags.slice(0, 3).map((tag, index) => (
                  <Tag
                    key={index}
                    style={{
                      fontSize: 10,
                      padding: '0 6px',
                      background: isDark ? '#3a3530' : '#f0ede8',
                      border: 'none',
                      color: isDark ? '#a99d92' : '#6b635a',
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
                {tags.length > 3 && (
                  <Text type="secondary" style={{ fontSize: 10, color: isDark ? '#a99d92' : '#6b635a' }}>
                    +{tags.length - 3}
                  </Text>
                )}
              </div>
            )}

            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 12, color: isDark ? '#a99d92' : '#6b635a' }}>
                  字数: {novel.wordCount.toLocaleString()}
                </Text>
                <Text type="secondary" style={{ fontSize: 12, color: isDark ? '#a99d92' : '#6b635a' }}>
                  {targetWords ? `${novel.wordCount.toLocaleString()} / ${(targetWords * 10000).toLocaleString()}` : `目标: ${targetCount.toLocaleString()}`}
                </Text>
              </div>
              <Progress
                percent={progress}
                size="small"
                showInfo={false}
                strokeColor="#c9a959"
                trailColor={isDark ? '#3a3530' : '#f0ede8'}
              />
            </Space>
          </Space>
        }
      />
    </Card>
  )
}

export default NovelCard
