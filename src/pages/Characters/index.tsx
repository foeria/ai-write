import { useState, useEffect } from 'react'
import {
  Card,
  Typography,
  Empty,
  Button,
  Input,
  Select,
  Space,
  Row,
  Col,
  message,
  Modal,
  Spin,
  Tag,
  Avatar,
  Divider,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  RobotOutlined,
  UserOutlined,
  ManOutlined,
  WomanOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { useCharacterStore, type Character } from '@/store/useCharacterStore'
import { useAppStore } from '@/store/useAppStore'
import { novelRepo } from '@/api/repository'
import { chatComplete } from '@/api/ai'
import CharacterCard from './components/CharacterCard'
import CharacterCreateModal from './components/CharacterCreateModal'
import CharacterEditModal from './components/CharacterEditModal'

const { Title, Text, Paragraph } = Typography

function Characters() {
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  const {
    characters,
    searchQuery,
    filterRole,
    filterNovelId,
    filterStatus,
    setSearchQuery,
    setFilterRole,
    setFilterNovelId,
    setFilterStatus,
    loadCharacters,
    addCharacter,
    updateCharacter,
    deleteCharacter,
  } = useCharacterStore()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingCharacter, setViewingCharacter] = useState<Character | null>(null)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [novels, setNovels] = useState<{ id: string; title: string }[]>([])
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [messageApi, contextHolder] = message.useMessage()

  // 加载数据
  useEffect(() => {
    loadCharacters(filterNovelId || undefined)
  }, [filterNovelId])

  // 加载小说列表
  useEffect(() => {
    const loadNovels = async () => {
      try {
        const allNovels = await novelRepo.getAll()
        setNovels(allNovels.map(n => ({ id: n.id, title: n.title })))
      } catch (error) {
        console.warn('Failed to load novels:', error)
      }
    }
    loadNovels()
  }, [])

  // 背景色
  const bgColor = isDark ? '#1a1612' : '#f5f3f0'
  const cardBgColor = isDark ? '#252220' : '#ffffff'
  const textColor = isDark ? '#e8e0d5' : '#3d3830'
  const secondaryTextColor = isDark ? '#a99d92' : '#6b635a'
  const borderColor = isDark ? '#4a4238' : '#e8e0d5'

  // 筛选角色
  const filteredCharacters = characters.filter((char) => {
    const matchesSearch = !searchQuery
      ? true
      : char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (char.tags && char.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    const matchesRole = !filterRole || filterRole === 'all'
      ? true
      : char.role === filterRole
    const matchesNovel = !filterNovelId
      ? true
      : char.novelId === filterNovelId
    const matchesStatus = !filterStatus
      ? true
      : char.status === filterStatus
    return matchesSearch && matchesRole && matchesNovel && matchesStatus
  })

  const roleOptions = [
    { label: '全部', value: 'all' },
    { label: '主角', value: 'protagonist' },
    { label: '配角', value: 'supporting' },
    { label: '反派', value: 'antagonist' },
    { label: '龙套', value: 'minor' },
  ]

  const statusOptions = [
    { label: '全部状态', value: 'all' },
    { label: '已启用', value: 'enabled' },
    { label: '未启用', value: 'disabled' },
  ]

  const novelOptions = [
    { label: '全部小说', value: 'all' },
    ...novels.map(n => ({ label: n.title, value: n.id }))
  ]

  // 导出角色数据
  const handleExport = () => {
    const exportData = filteredCharacters.map(char => ({
      name: char.name,
      gender: char.gender,
      age: char.age,
      role: char.role,
      status: char.status,
      appearance: char.appearance,
      personality: char.personality,
      background: char.background,
      tags: char.tags,
      novelId: char.novelId,
    }))
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `characters_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    messageApi.success(`已导出 ${exportData.length} 个角色`)
  }

  const handleCreate = async (values: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addCharacter({
        ...values,
        novelId: filterNovelId || undefined,
      })
      messageApi.success('角色创建成功')
      setCreateModalOpen(false)
    } catch (error) {
      messageApi.error('创建失败')
    }
  }

  const handleEdit = (character: Character) => {
    setEditingCharacter(character)
    setEditModalOpen(true)
  }

  const handleView = (character: Character) => {
    setViewingCharacter(character)
    setViewModalOpen(true)
  }

  const handleSave = async (id: string, updates: Partial<Character>) => {
    try {
      await updateCharacter(id, updates)
      messageApi.success('角色更新成功')
      setEditModalOpen(false)
      setEditingCharacter(null)
    } catch (error) {
      messageApi.error('更新失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCharacter(id)
      messageApi.success('角色删除成功')
    } catch (error) {
      messageApi.error('删除失败')
    }
  }

  // AI 生成角色（使用真实 API）
  const handleAIGenerate = async () => {
    setAiGenerating(true)
    try {
      // 获取当前筛选的小说的信息
      const novelInfo = novels.find(n => n.id === filterNovelId)
      const novelContext = novelInfo ? `小说《${novelInfo.title}》的世界观和设定` : '通用小说设定'

      // 构建提示词
      const prompt = `你是一个专业的小说角色创作专家。请根据以下信息生成一个角色，要求返回JSON格式：

小说背景：${novelContext}

请生成一个完整的角色，包含以下信息：
1. 姓名 (name)
2. 性别 (gender): male/female/other
3. 年龄 (age): 数字字符串
4. 外貌描述 (appearance)
5. 性格特点 (personality)
6. 背景故事 (background)
7. 角色定位 (role): protagonist(主角)/supporting(配角)/antagonist(反派)/minor(龙套)
8. 标签 (tags): 数组形式的标签

请只返回JSON，不要其他内容。`

      const result = await chatComplete(prompt)

      // 解析 AI 返回的 JSON
      let aiData
      try {
        // 尝试提取 JSON 部分
        const jsonMatch = result.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          aiData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found')
        }
      } catch {
        // 如果解析失败，使用默认格式
        aiData = {
          name: 'AI生成角色',
          gender: 'male',
          age: '25',
          role: 'supporting',
          appearance: result.includes('外貌') ? result.match(/外貌[：:]\s*([^\n]+)/)?.[1] || '剑眉星目' : '剑眉星目',
          personality: result.includes('性格') ? result.match(/性格[：:]\s*([^\n]+)/)?.[1] || '沉稳内敛' : '沉稳内敛',
          background: result.includes('背景') ? result.match(/背景[：:]\s*([^\n]+)/)?.[1] || '青云宗弟子' : '青云宗弟子',
          tags: ['AI生成'],
        }
      }

      const aiCharacter: Partial<Character> = {
        name: aiData.name || 'AI生成角色',
        gender: aiData.gender || 'male',
        age: String(aiData.age || '25'),
        role: aiData.role || 'supporting',
        appearance: aiData.appearance || '剑眉星目，身姿挺拔',
        personality: aiData.personality || '沉稳内敛，深谋远虑',
        background: aiData.background || '青云宗外门弟子',
        tags: Array.isArray(aiData.tags) ? aiData.tags : ['AI生成'],
        novelId: filterNovelId || undefined,
        status: 'enabled',
      }

      await addCharacter(aiCharacter)
      messageApi.success('AI 角色生成成功')
    } catch (error) {
      console.error('AI生成角色失败:', error)
      messageApi.error('生成失败，请重试')
    } finally {
      setAiGenerating(false)
      setAiModalOpen(false)
    }
  }

  // 统计数据
  const stats = {
    total: characters.length,
    protagonist: characters.filter((c) => c.role === 'protagonist').length,
    antagonist: characters.filter((c) => c.role === 'antagonist').length,
    supporting: characters.filter((c) => c.role === 'supporting').length,
    minor: characters.filter((c) => c.role === 'minor').length,
  }

  return (
    <>
      {contextHolder}
      <div style={{ padding: 8, background: bgColor, minHeight: '100%' }}>
        {/* 顶部栏 */}
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0, color: textColor }}>
              <TeamOutlined style={{ marginRight: 8 }} />
              角色库
            </Title>
            <Text type="secondary" style={{ color: secondaryTextColor }}>
              共 {characters.length} 个角色
            </Text>
          </div>
          <Space>
            <Select
              placeholder="所属小说"
              allowClear
              style={{ width: 150 }}
              value={filterNovelId || undefined}
              onChange={(val) => setFilterNovelId(val || null)}
              options={novelOptions}
            />
            <Select
              placeholder="角色定位"
              allowClear
              style={{ width: 120 }}
              value={filterRole === 'all' ? undefined : filterRole}
              onChange={(val) => setFilterRole(val || null)}
              options={roleOptions}
            />
            <Select
              placeholder="角色状态"
              allowClear
              style={{ width: 110 }}
              value={filterStatus || undefined}
              onChange={(val) => setFilterStatus(val || null)}
              options={statusOptions}
            />
            <Input
              placeholder="搜索角色..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 200 }}
            />
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出
            </Button>
            <Button
              icon={<RobotOutlined />}
              onClick={() => setAiModalOpen(true)}
            >
              AI 生成
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
              className="btn-gradient"
            >
              创建角色
            </Button>
          </Space>
        </div>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={5}>
            <Card
              variant="borderless"
              style={{
                background: cardBgColor,
                borderColor: borderColor,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ fontSize: 24, color: '#c9a959' }}>{stats.total}</Text>
                <Text
                  type="secondary"
                  style={{ display: 'block', fontSize: 12, color: secondaryTextColor }}
                >
                  全部角色
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={5}>
            <Card
              variant="borderless"
              style={{
                background: cardBgColor,
                borderColor: borderColor,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ fontSize: 24, color: '#c9a959' }}>{stats.protagonist}</Text>
                <Text
                  type="secondary"
                  style={{ display: 'block', fontSize: 12, color: secondaryTextColor }}
                >
                  主角
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={5}>
            <Card
              variant="borderless"
              style={{
                background: cardBgColor,
                borderColor: borderColor,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ fontSize: 24, color: '#cf1322' }}>{stats.antagonist}</Text>
                <Text
                  type="secondary"
                  style={{ display: 'block', fontSize: 12, color: secondaryTextColor }}
                >
                  反派
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={5}>
            <Card
              variant="borderless"
              style={{
                background: cardBgColor,
                borderColor: borderColor,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ fontSize: 24, color: '#8b6914' }}>{stats.supporting}</Text>
                <Text
                  type="secondary"
                  style={{ display: 'block', fontSize: 12, color: secondaryTextColor }}
                >
                  配角
                </Text>
              </div>
            </Card>
          </Col>
          <Col span={4}>
            <Card
              variant="borderless"
              style={{
                background: cardBgColor,
                borderColor: borderColor,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ fontSize: 24, color: '#6b635a' }}>{stats.minor}</Text>
                <Text
                  type="secondary"
                  style={{ display: 'block', fontSize: 12, color: secondaryTextColor }}
                >
                  龙套
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 角色列表 */}
        <Card
          variant="borderless"
          style={{
            background: cardBgColor,
            borderColor: borderColor,
          }}
        >
          {filteredCharacters.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredCharacters.map((character) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={character.id}>
                  <CharacterCard
                    character={character}
                    onView={() => handleView(character)}
                    onEdit={() => handleEdit(character)}
                    onDelete={() => handleDelete(character.id)}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="还没有创建角色" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
              >
                创建第一个角色
              </Button>
            </Empty>
          )}
        </Card>

        {/* 创建角色弹窗 */}
        <CharacterCreateModal
          open={createModalOpen}
          onCancel={() => setCreateModalOpen(false)}
          onCreate={handleCreate}
        />

        {/* 编辑角色弹窗 */}
        <CharacterEditModal
          open={editModalOpen}
          character={editingCharacter}
          onCancel={() => {
            setEditModalOpen(false)
            setEditingCharacter(null)
          }}
          onSave={handleSave}
        />

        {/* 角色详情弹窗 */}
        <Modal
          title="角色详情"
          open={viewModalOpen}
          onCancel={() => {
            setViewModalOpen(false)
            setViewingCharacter(null)
          }}
          footer={[
            <Button key="edit" type="primary" onClick={() => {
              setViewModalOpen(false)
              handleEdit(viewingCharacter!)
            }}>
              编辑
            </Button>,
            <Button key="close" onClick={() => {
              setViewModalOpen(false)
              setViewingCharacter(null)
            }}>
              关闭
            </Button>,
          ]}
          width={600}
          styles={{
            content: {
              background: isDark ? '#252220' : '#ffffff',
            },
          }}
        >
          {viewingCharacter && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Avatar
                  size={80}
                  src={viewingCharacter.avatar}
                  icon={!viewingCharacter.avatar && <UserOutlined />}
                  style={{
                    background: viewingCharacter.avatar ? 'transparent' :
                      'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)',
                  }}
                />
                <Title level={4} style={{ marginTop: 12, marginBottom: 4, color: textColor }}>
                  {viewingCharacter.name}
                </Title>
                <Space>
                  {viewingCharacter.gender === 'male' && <ManOutlined style={{ color: '#1890ff' }} />}
                  {viewingCharacter.gender === 'female' && <WomanOutlined style={{ color: '#eb2f96' }} />}
                  {viewingCharacter.gender === 'other' && <UserOutlined style={{ color: '#722ed1' }} />}
                  <Text type="secondary" style={{ color: secondaryTextColor }}>
                    {viewingCharacter.age}岁
                  </Text>
                  <Tag color={
                    viewingCharacter.role === 'protagonist' ? '#c9a959' :
                    viewingCharacter.role === 'antagonist' ? '#cf1322' :
                    '#8b6914'
                  }>
                    {viewingCharacter.role === 'protagonist' ? '主角' :
                     viewingCharacter.role === 'antagonist' ? '反派' :
                     viewingCharacter.role === 'minor' ? '龙套' : '配角'}
                  </Tag>
                </Space>
              </div>

              {viewingCharacter.tags && viewingCharacter.tags.length > 0 && (
                <>
                  <Divider style={{ margin: '12px 0', borderColor: borderColor }} />
                  <Space wrap>
                    {viewingCharacter.tags.map(tag => (
                      <Tag key={tag} style={{
                        background: isDark ? '#3a3530' : '#f5f3f0',
                        border: 'none',
                      }}>
                        {tag}
                      </Tag>
                    ))}
                  </Space>
                </>
              )}

              <Divider style={{ margin: '12px 0', borderColor: borderColor }} />

              {viewingCharacter.appearance && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: textColor }}>外貌描述</Text>
                  <Paragraph style={{ color: secondaryTextColor, marginTop: 4 }}>
                    {viewingCharacter.appearance}
                  </Paragraph>
                </div>
              )}

              {viewingCharacter.personality && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: textColor }}>性格特点</Text>
                  <Paragraph style={{ color: secondaryTextColor, marginTop: 4 }}>
                    {viewingCharacter.personality}
                  </Paragraph>
                </div>
              )}

              {viewingCharacter.background && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: textColor }}>背景故事</Text>
                  <Paragraph style={{ color: secondaryTextColor, marginTop: 4 }}>
                    {viewingCharacter.background}
                  </Paragraph>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* AI 生成角色弹窗 */}
        <Modal
          title="AI 生成角色"
          open={aiModalOpen}
          onCancel={() => !aiGenerating && setAiModalOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => !aiGenerating && setAiModalOpen(false)} disabled={aiGenerating}>
              取消
            </Button>,
            <Button
              key="generate"
              type="primary"
              icon={<RobotOutlined />}
              onClick={handleAIGenerate}
              loading={aiGenerating}
              className="btn-gradient"
            >
              {aiGenerating ? '生成中...' : '开始生成'}
            </Button>,
          ]}
          closable={!aiGenerating}
          maskClosable={!aiGenerating}
          styles={{
            content: {
              background: isDark ? '#252220' : '#ffffff',
            },
          }}
        >
          <Spin spinning={aiGenerating}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <RobotOutlined style={{ fontSize: 48, color: '#c9a959', marginBottom: 16 }} />
              <Title level={5} style={{ color: textColor }}>
                AI 智能生成角色
              </Title>
              <Paragraph style={{ color: secondaryTextColor }}>
                基于当前筛选的小说设定，AI 将为您生成一个符合世界观的完整人物角色。
              </Paragraph>
              {filterNovelId && novels.find(n => n.id === filterNovelId) && (
                <Text type="secondary" style={{ color: secondaryTextColor, fontSize: 12 }}>
                  目标小说: 《{novels.find(n => n.id === filterNovelId)?.title}》
                </Text>
              )}
            </div>
          </Spin>
        </Modal>
      </div>
    </>
  )
}

export default Characters
