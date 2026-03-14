import { Card, Typography, Space, Tag, Avatar, Button, Dropdown, message } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  UserOutlined,
  ManOutlined,
  WomanOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { Character } from '@/store/useCharacterStore'
import { useAppStore } from '@/store/useAppStore'

interface CharacterCardProps {
  character: Character
  onView?: () => void
  onEdit: () => void
  onDelete: () => void
}

const { Text, Paragraph } = Typography

function CharacterCard({ character, onView, onEdit, onDelete }: CharacterCardProps) {
  const isDark = useAppStore((state) => state.config.theme === 'dark')

  const roleConfig = {
    protagonist: { color: '#c9a959', text: '主角' },
    supporting: { color: '#8b6914', text: '配角' },
    antagonist: { color: '#cf1322', text: '反派' },
    minor: { color: '#6b635a', text: '龙套' },
  }

  const statusConfig = {
    enabled: { color: '#52c41a', text: '已启用' },
    disabled: { color: '#8c8c8c', text: '未启用' },
  }

  // 导出单个角色
  const handleExport = () => {
    const exportData = {
      name: character.name,
      gender: character.gender,
      age: character.age,
      role: character.role,
      status: character.status,
      appearance: character.appearance,
      personality: character.personality,
      background: character.background,
      tags: character.tags,
      novelId: character.novelId,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `character_${character.name}_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    message.success('角色导出成功')
  }

  const genderConfig = {
    male: <ManOutlined style={{ color: '#1890ff' }} />,
    female: <WomanOutlined style={{ color: '#eb2f96' }} />,
    other: <UserOutlined style={{ color: '#722ed1' }} />,
  }

  const role = roleConfig[character.role as keyof typeof roleConfig]

  const menuItems: MenuProps['items'] = [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: '查看详情',
      onClick: onView,
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onClick: onEdit,
    },
    {
      key: 'export',
      icon: <DownloadOutlined />,
      label: '导出',
      onClick: handleExport,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: onDelete,
    },
  ]

  // 头像背景渐变
  const avatarGradient = isDark
    ? 'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)'
    : 'linear-gradient(135deg, #d4b36a 0%, #a07818 100%)'

  return (
    <Card
      hoverable
      className="character-card card-hover"
      style={{
        height: '100%',
        background: isDark ? '#252220' : '#ffffff',
        borderColor: isDark ? '#4a4238' : '#e8e0d5',
      }}
      variant="borderless"
    >
      <Card.Meta
        avatar={
          <Avatar
            size={56}
            src={character.avatar}
            icon={!character.avatar && <UserOutlined />}
            style={{
              background: character.avatar ? 'transparent' : avatarGradient,
            }}
          />
        }
        title={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <span
                style={{
                  color: isDark ? '#e8e0d5' : '#3d3830',
                  fontWeight: 500,
                }}
              >
                {character.name}
              </span>
              {genderConfig[character.gender as keyof typeof genderConfig]}
            </Space>
            <Space>
              <Tag color={role.color} style={{ border: 'none' }}>
                {role.text}
              </Tag>
              {character.status && (
                <Tag color={statusConfig[character.status]?.color || '#8c8c8c'} style={{ border: 'none' }}>
                  {statusConfig[character.status]?.text || (character.status === 'enabled' ? '已启用' : '未启用')}
                </Tag>
              )}
            </Space>
          </Space>
        }
        description={
          <div style={{ marginTop: 8 }}>
            <Paragraph
              type="secondary"
              ellipsis={{ rows: 2 }}
              style={{
                marginBottom: 12,
                color: isDark ? '#a99d92' : '#6b635a',
                fontSize: 12,
              }}
            >
              {character.appearance || '暂无外貌描述'}
            </Paragraph>

            <Space wrap style={{ marginBottom: 8 }}>
              {(character.tags || []).slice(0, 3).map((tag) => (
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
              {(character.tags || []).length > 3 && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  +{(character.tags || []).length - 3}
                </Text>
              )}
            </Space>

            <Text
              type="secondary"
              style={{
                display: 'block',
                fontSize: 11,
                color: isDark ? '#a99d92' : '#6b635a',
              }}
            >
              年龄: {character.age}岁
            </Text>
          </div>
        }
      />
      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} size="small">
            操作
          </Button>
        </Dropdown>
      </div>
    </Card>
  )
}

export default CharacterCard
