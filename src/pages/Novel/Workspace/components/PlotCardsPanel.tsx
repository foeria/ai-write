import { useState, useCallback } from 'react'
import { Card, Button, Input, Select, Space, Typography, Empty, Tag, message, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

// 剧情卡片数据类型
export interface PlotCardData {
  id: string
  title: string
  content: string
  importance: 'high' | 'medium' | 'low'
  mood: string
  sceneGoal: string
  createdAt: string
}

// 剧情卡片Props
interface PlotCardsPanelProps {
  isDark: boolean
  theme: {
    bg: string
    bgSecondary: string
    text: string
    textSecondary: string
    border: string
    primary: string
    gradient: string
  }
  cards?: PlotCardData[]
  onAddCard?: (card: Omit<PlotCardData, 'id' | 'createdAt'>) => void
  onUpdateCard?: (id: string, card: Partial<PlotCardData>) => void
  onDeleteCard?: (id: string) => void
}

// 默认卡片列表
const defaultCards: PlotCardData[] = []

function PlotCardsPanel({
  isDark,
  theme,
  cards = defaultCards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
}: PlotCardsPanelProps) {
  const [addingCard, setAddingCard] = useState(false)
  const [editingCard, setEditingCard] = useState<PlotCardData | null>(null)
  const [newCard, setNewCard] = useState({
    title: '',
    content: '',
    importance: 'medium' as const,
    mood: '',
    sceneGoal: '',
  })

  const cardTheme = {
    bg: isDark ? '#252220' : '#ffffff',
    bgHover: isDark ? '#3a3530' : '#f8f9ff',
    text: theme.text,
    textSecondary: theme.textSecondary,
    border: theme.border,
    primary: theme.primary,
    gradient: theme.gradient,
  }

  // 添加卡片
  const handleAddCard = useCallback(() => {
    if (!newCard.title.trim()) {
      message.warning('请输入剧情点标题')
      return
    }

    onAddCard?.({
      title: newCard.title,
      content: newCard.content,
      importance: newCard.importance,
      mood: newCard.mood,
      sceneGoal: newCard.sceneGoal,
    })

    setNewCard({
      title: '',
      content: '',
      importance: 'medium',
      mood: '',
      sceneGoal: '',
    })
    setAddingCard(false)
    message.success('添加成功')
  }, [newCard, onAddCard])

  // 删除卡片
  const handleDeleteCard = useCallback((id: string) => {
    onDeleteCard?.(id)
    message.success('删除成功')
  }, [onDeleteCard])

  // 保存编辑
  const handleSaveEdit = useCallback(() => {
    if (!editingCard) return

    onUpdateCard?.(editingCard.id, editingCard)
    setEditingCard(null)
    message.success('保存成功')
  }, [editingCard, onUpdateCard])

  // 获取重要程度颜色
  const getImportanceColor = (importance: string): string => {
    switch (importance) {
      case 'high': return '#f56c6c'
      case 'medium': return '#e6a23c'
      case 'low': return '#909399'
      default: return '#909399'
    }
  }

  // 获取重要程度标签
  const getImportanceLabel = (importance: string): string => {
    switch (importance) {
      case 'high': return '重要'
      case 'medium': return '一般'
      case 'low': return '次要'
      default: return '普通'
    }
  }

  return (
    <div className="plot-cards-panel">
      {/* 头部 */}
      <div className="panel-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <div>
          <Title level={5} style={{ margin: 0, color: cardTheme.text }}>
            剧情卡片
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {cards.length} 个剧情点
          </Text>
        </div>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => setAddingCard(true)}
          style={{
            background: theme.gradient,
            border: 'none',
          }}
        >
          添加
        </Button>
      </div>

      {/* 添加新卡片表单 */}
      {addingCard && (
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: cardTheme.bg,
            borderColor: cardTheme.border,
          }}
        >
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Input
              placeholder="剧情点标题"
              value={newCard.title}
              onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
              style={{ background: 'transparent', borderColor: cardTheme.border }}
            />
            <Input.TextArea
              placeholder="核心剧情描述..."
              rows={2}
              value={newCard.content}
              onChange={(e) => setNewCard({ ...newCard, content: e.target.value })}
            />
            <Space wrap>
              <Select
                size="small"
                value={newCard.importance}
                onChange={(value) => setNewCard({ ...newCard, importance: value })}
                style={{ width: 100 }}
                options={[
                  { label: '重要', value: 'high' },
                  { label: '一般', value: 'medium' },
                  { label: '次要', value: 'low' },
                ]}
              />
              <Input
                size="small"
                placeholder="情绪基调"
                value={newCard.mood}
                onChange={(e) => setNewCard({ ...newCard, mood: e.target.value })}
                style={{ width: 120 }}
              />
              <Input
                size="small"
                placeholder="场景目标"
                value={newCard.sceneGoal}
                onChange={(e) => setNewCard({ ...newCard, sceneGoal: e.target.value })}
                style={{ width: 120 }}
              />
            </Space>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="small" onClick={() => setAddingCard(false)}>取消</Button>
              <Button size="small" type="primary" onClick={handleAddCard}>保存</Button>
            </Space>
          </Space>
        </Card>
      )}

      {/* 卡片列表 */}
      <div className="cards-list" style={{ overflowY: 'auto' }}>
        {cards.length === 0 ? (
          <Empty description="暂无剧情点" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="link" size="small" onClick={() => setAddingCard(true)}>
              添加第一个剧情点
            </Button>
          </Empty>
        ) : (
          cards.map(card => (
            <Card
              key={card.id}
              size="small"
              style={{
                marginBottom: 12,
                background: cardTheme.bg,
                borderColor: cardTheme.border,
              }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text strong style={{ color: cardTheme.text, flex: 1 }}>
                    {card.title}
                  </Text>
                  <Tag color={getImportanceColor(card.importance)} style={{ margin: 0 }}>
                    {getImportanceLabel(card.importance)}
                  </Tag>
                </div>
              }
              extra={
                <Space size={4}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setEditingCard(card)}
                    style={{ color: cardTheme.textSecondary }}
                  />
                  <Popconfirm
                    title="确定删除此剧情点？"
                    onConfirm={() => handleDeleteCard(card.id)}
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      danger
                    />
                  </Popconfirm>
                </Space>
              }
            >
              {editingCard?.id === card.id ? (
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Input.TextArea
                    rows={2}
                    value={editingCard.content}
                    onChange={(e) => setEditingCard({ ...editingCard, content: e.target.value })}
                  />
                  <Space wrap>
                    <Select
                      size="small"
                      value={editingCard.importance}
                      onChange={(value) => setEditingCard({ ...editingCard, importance: value })}
                      style={{ width: 80 }}
                      options={[
                        { label: '重要', value: 'high' },
                        { label: '一般', value: 'medium' },
                        { label: '次要', value: 'low' },
                      ]}
                    />
                    <Input
                      size="small"
                      placeholder="情绪"
                      value={editingCard.mood}
                      onChange={(e) => setEditingCard({ ...editingCard, mood: e.target.value })}
                      style={{ width: 80 }}
                    />
                  </Space>
                  <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={() => setEditingCard(null)}>取消</Button>
                    <Button size="small" type="primary" onClick={handleSaveEdit}>保存</Button>
                  </Space>
                </Space>
              ) : (
                <div>
                  {card.content && (
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                      {card.content}
                    </Text>
                  )}
                  <Space wrap size={4}>
                    {card.mood && (
                      <Tag color="blue" style={{ margin: 0 }}>{card.mood}</Tag>
                    )}
                    {card.sceneGoal && (
                      <Tag color="purple" style={{ margin: 0 }}>{card.sceneGoal}</Tag>
                    )}
                  </Space>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <style>{`
        .plot-cards-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .plot-cards-panel .ant-card {
          border-radius: 8px;
        }

        .plot-cards-panel .ant-card-head {
          border-bottom-color: ${cardTheme.border};
          min-height: auto;
          padding: 8px 12px;
        }

        .plot-cards-panel .ant-card-body {
          padding: 12px;
        }

        .plot-cards-panel .ant-input,
        .plot-cards-panel .ant-input-affix-wrapper,
        .plot-cards-panel .ant-select-selector {
          background: transparent !important;
          border-color: ${cardTheme.border} !important;
          color: ${cardTheme.text} !important;
        }

        .plot-cards-panel .ant-input::placeholder {
          color: ${cardTheme.textSecondary} !important;
        }

        .plot-cards-panel .ant-input-textarea textarea {
          background: transparent !important;
          border-color: ${cardTheme.border} !important;
          color: ${cardTheme.text} !important;
        }
      `}</style>
    </div>
  )
}

export default PlotCardsPanel
