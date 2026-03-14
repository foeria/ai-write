import { useState } from 'react'
import { Button, Input, Select, Space, message } from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'

const { TextArea } = Input

// 题材选项
const genreOptions = [
  { key: 'xuanhuan', label: '玄幻 / 东方玄幻' },
  { key: 'qihuan', label: '奇幻 / 西幻' },
  { key: 'xianxia', label: '仙侠 / 修真' },
  { key: 'wuxia', label: '武侠' },
  { key: 'dushi', label: '都市' },
  { key: 'yanqing', label: '言情（古言/现言）' },
  { key: 'lishi', label: '历史 / 权谋' },
  { key: 'junshi', label: '军事' },
  { key: 'kehuan', label: '科幻' },
  { key: 'youxi', label: '游戏' },
  { key: 'tiyu', label: '体育' },
  { key: 'xuanyi', label: '悬疑 / 推理' },
  { key: 'lingyi', label: '灵异 / 恐怖' },
  { key: 'moshi', label: '末世 / 灾变' },
  { key: 'wuxian', label: '无限流 / 副本' },
  { key: 'xitong', label: '系统 / 金手指' },
  { key: 'chuanyue', label: '穿越 / 重生 / 轮回' },
  { key: 'jingshang', label: '经商 / 经营' },
  { key: 'lingzhu', label: '领主 / 争霸 / 家族' },
  { key: 'zhongtian', label: '种田 / 生活流' },
]

// 类型定义
interface Competitor {
  name: string
  strengths: string
  differentiation: string
}

interface PleasurePoint {
  category: string
  expression: string
  frequency: string
  emotion: string
  example: string
}

interface SupportingCharacter {
  name: string
  role: string
  background: string
  personality: string
}

interface KeyLocation {
  name: string
  type: string
  description: string
  importance: string
  appearTime: string
}

interface Faction {
  name: string
  type: string
  ideology: string
  leader: string
  power: string
  relationship: string
}

interface Volume {
  name: string
  core: string
  plotLine: string
  stages: any[]
}

interface CharacterLine {
  character: string
  development: string
}

interface OutlineData {
  title: string
  subtitle: string
  description: string
  outline: {
    basic: {
      coreHook: string
      briefOutline: {
        opening: string
        development: string
        climax: string
        resolution: string
      }
      roughOutline: {
        part1: string
        part2: string
        part3: string
        part4: string
        part5: string
      }
      conflicts: {
        internal: string
        external: string
        philosophical: string
      }
    }
    genre: {
      mainTags: string
      subTags: string
      targetAudience: string
      selectedGenres: string[]
      competitors: Competitor[]
    }
    selling: {
      pleasurePoints: PleasurePoint[]
    }
    structure: {
      volumes: Volume[]
      characterLines: CharacterLine[]
    }
  }
  characters: {
    protagonist: {
      name: string
      age: string
      publicIdentity: string
      hiddenIdentity: string
      goal: string
      motivation: string
      conflict: string
      personality: string
      arc: string
    }
    heroine: {
      name: string
      background: string
      goal: string
      motivation: string
      conflict: string
      personality: string
      relationship: string
    }
    supporting: SupportingCharacter[]
  }
  worldBuilding: {
    universe: string
    energySource: string
    lifeForm: string
    worldArchitecture: string
    keyLocations: KeyLocation[]
    factions: Faction[]
    powerSystem: {
      name: string
      levels: string
      growthMethods: string
      limitations: string
    }
    goldenFinger: {
      name: string
      origin: string
      coreFunction: string
      upgradePath: string
      limitations: string
    }
    hiddenRules: string
  }
}

// 默认大纲数据
const defaultOutlineData: OutlineData = {
  title: '',
  subtitle: '',
  description: '',
  outline: {
    basic: {
      coreHook: '',
      briefOutline: {
        opening: '',
        development: '',
        climax: '',
        resolution: '',
      },
      roughOutline: {
        part1: '',
        part2: '',
        part3: '',
        part4: '',
        part5: '',
      },
      conflicts: {
        internal: '',
        external: '',
        philosophical: '',
      },
    },
    genre: {
      mainTags: '',
      subTags: '',
      targetAudience: '',
      selectedGenres: [],
      competitors: [],
    },
    selling: {
      pleasurePoints: [],
    },
    structure: {
      volumes: [],
      characterLines: [],
    },
  },
  characters: {
    protagonist: {
      name: '',
      age: '',
      publicIdentity: '',
      hiddenIdentity: '',
      goal: '',
      motivation: '',
      conflict: '',
      personality: '',
      arc: '',
    },
    heroine: {
      name: '',
      background: '',
      goal: '',
      motivation: '',
      conflict: '',
      personality: '',
      relationship: '',
    },
    supporting: [],
  },
  worldBuilding: {
    universe: '',
    energySource: '',
    lifeForm: '',
    worldArchitecture: '',
    keyLocations: [],
    factions: [],
    powerSystem: {
      name: '',
      levels: '',
      growthMethods: '',
      limitations: '',
    },
    goldenFinger: {
      name: '',
      origin: '',
      coreFunction: '',
      upgradePath: '',
      limitations: '',
    },
    hiddenRules: '',
  },
}

const tabList = [
  { key: 'basic', label: '基本信息' },
  { key: 'genre', label: '题材类型' },
  { key: 'selling', label: '核心卖点' },
  { key: 'characters', label: '人物' },
  { key: 'worldbuilding', label: '世界观' },
  { key: 'structure', label: '分卷结构' },
]

interface OutlineManagerProps {
  open: boolean
  onClose: () => void
}

function OutlineManager({ open, onClose }: OutlineManagerProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [outlineData, setOutlineData] = useState<OutlineData>(defaultOutlineData)
  const isDark = useAppStore((state) => state.config.theme === 'dark')

  // 主题颜色
  const theme = isDark ? {
    bg: '#1a1612',
    bgSecondary: '#252220',
    bgTertiary: '#3a3530',
    text: '#e8e0d5',
    textSecondary: '#a99d92',
    border: '#4a4238',
    primary: '#c9a959',
    gradient: 'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)',
  } : {
    bg: '#f5f3f0',
    bgSecondary: '#ffffff',
    bgTertiary: '#f0ede8',
    text: '#3d3830',
    textSecondary: '#6b6358',
    border: '#e8e0d5',
    primary: '#c9a959',
    gradient: 'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)',
  }

  const styles: Record<string, React.CSSProperties> = {
    section: {
      marginBottom: 24,
      padding: 16,
      background: theme.bgSecondary,
      borderRadius: 8,
      border: `1px solid ${theme.border}`,
    },
    label: {
      display: 'block',
      marginBottom: 8,
      color: theme.textSecondary,
      fontSize: 12,
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: 6,
      border: `1px solid ${theme.border}`,
      background: theme.bg,
      color: theme.text,
      marginBottom: 12,
      fontSize: 14,
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: 6,
      border: `1px solid ${theme.border}`,
      background: theme.bg,
      color: theme.text,
      resize: 'vertical',
      fontSize: 14,
    },
    row: {
      display: 'flex',
      gap: 16,
      marginBottom: 12,
    },
    col: {
      flex: 1,
    },
  }

  // 更新数据
  const updateData = (path: string[], value: any) => {
    setOutlineData((prev) => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      current[path[path.length - 1]] = value
      return newData
    })
  }

  // 添加/删除辅助函数
  const addItem = (path: string[]) => {
    setOutlineData((prev) => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      const lastKey = path[path.length - 1]
      if (lastKey === 'competitors') {
        current[lastKey] = [...current[lastKey], { name: '', strengths: '', differentiation: '' }]
      } else if (lastKey === 'pleasurePoints') {
        current[lastKey] = [...current[lastKey], { category: '', expression: '', frequency: '', emotion: '', example: '' }]
      } else if (lastKey === 'supporting') {
        current[lastKey] = [...current[lastKey], { name: '', role: '', background: '', personality: '' }]
      } else if (lastKey === 'keyLocations') {
        current[lastKey] = [...current[lastKey], { name: '', type: '起点', description: '', importance: '一般', appearTime: '' }]
      } else if (lastKey === 'factions') {
        current[lastKey] = [...current[lastKey], { name: '', type: '帝国', ideology: '', leader: '', power: 'T3', relationship: '中立' }]
      } else if (lastKey === 'volumes') {
        current[lastKey] = [...current[lastKey], { name: '', core: '', plotLine: '', stages: [] }]
      } else if (lastKey === 'characterLines') {
        current[lastKey] = [...current[lastKey], { character: '', development: '' }]
      }
      return newData
    })
  }

  const removeItem = (path: string[], index: number) => {
    setOutlineData((prev) => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      const lastKey = path[path.length - 1]
      current[lastKey] = current[lastKey].filter((_: any, i: number) => i !== index)
      return newData
    })
  }

  // 保存功能
  const handleSave = () => {
    message.success('大纲保存成功')
    onClose()
  }

  // 导出功能
  const handleExport = () => {
    const dataStr = JSON.stringify(outlineData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${outlineData.title || '小说大纲'}.json`
    link.click()
    URL.revokeObjectURL(url)
    message.success('大纲导出成功')
  }

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div style={{ padding: 20 }}>
            {/* 小说名称 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>小说名称</h4>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>主标题</label>
                <input
                  style={styles.input}
                  placeholder="要求具有爆点、记忆点，能概括核心看点或引发好奇"
                  value={outlineData.title}
                  onChange={(e) => setOutlineData({ ...outlineData, title: e.target.value })}
                />
              </div>
              <div>
                <label style={styles.label}>副标题（可选）</label>
                <input
                  style={styles.input}
                  placeholder="如：卷一·帝都风云"
                  value={outlineData.subtitle}
                  onChange={(e) => setOutlineData({ ...outlineData, subtitle: e.target.value })}
                />
              </div>
            </div>

            {/* 核心梗 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>核心梗（一句话亮点）</h4>
              <TextArea
                style={{ ...styles.textarea, minHeight: 100 }}
                placeholder="在一个怎样的[世界观]下，一个怎样的[主角]因为[动机/目标]，利用[金手指/独特能力]，去解决怎样的[核心冲突]，最终将带来怎样的[爽点/奇观]。"
                value={outlineData.outline.basic.coreHook}
                onChange={(e) => updateData(['outline', 'basic', 'coreHook'], e.target.value)}
              />
            </div>

            {/* 简介 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>简介（故事文案）</h4>
              <TextArea
                style={{ ...styles.textarea, minHeight: 120 }}
                placeholder="简介是读者付费的第二道门槛。必须在短时间内抓住眼球，展现核心卖点，交代清楚'这是个什么故事'，并留下悬念。"
                value={outlineData.description}
                onChange={(e) => setOutlineData({ ...outlineData, description: e.target.value })}
              />
            </div>

            {/* 简纲 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>简纲（500字内）</h4>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>开端</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="故事如何开始？主角的初始状态和目标是什么？"
                  value={outlineData.outline.basic.briefOutline.opening}
                  onChange={(e) => updateData(['outline', 'basic', 'briefOutline', 'opening'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>发展</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="主角采取了哪些主要行动？经历了哪些重要转折点？"
                  value={outlineData.outline.basic.briefOutline.development}
                  onChange={(e) => updateData(['outline', 'basic', 'briefOutline', 'development'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>高潮</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="故事最紧张的时刻，主角与核心对手的终极对决。"
                  value={outlineData.outline.basic.briefOutline.climax}
                  onChange={(e) => updateData(['outline', 'basic', 'briefOutline', 'climax'], e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>结局</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="高潮之后的结果，主角是否达成目标？"
                  value={outlineData.outline.basic.briefOutline.resolution}
                  onChange={(e) => updateData(['outline', 'basic', 'briefOutline', 'resolution'], e.target.value)}
                />
              </div>
            </div>

            {/* 核心冲突 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>核心冲突</h4>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>内部冲突</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="主角内心的斗争，如善良的本性 vs 为了生存必须心狠手辣..."
                  value={outlineData.outline.basic.conflicts.internal}
                  onChange={(e) => updateData(['outline', 'basic', 'conflicts', 'internal'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>外部冲突</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="主角与外界的斗争，如 vs 反派/社会/自然环境..."
                  value={outlineData.outline.basic.conflicts.external}
                  onChange={(e) => updateData(['outline', 'basic', 'conflicts', 'external'], e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>哲学冲突（主题）</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="故事深层探讨的矛盾，如宿命论 vs 自由意志..."
                  value={outlineData.outline.basic.conflicts.philosophical}
                  onChange={(e) => updateData(['outline', 'basic', 'conflicts', 'philosophical'], e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 'genre':
        return (
          <div style={{ padding: 20 }}>
            {/* 市场定位 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>市场定位</h4>
              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>主标签（1-2个）</label>
                  <input
                    style={styles.input}
                    placeholder="如：玄幻、都市"
                    value={outlineData.outline.genre.mainTags}
                    onChange={(e) => updateData(['outline', 'genre', 'mainTags'], e.target.value)}
                  />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>辅标签（3-5个）</label>
                  <input
                    style={styles.input}
                    placeholder="如：系统、无敌、种田、权谋、迪化"
                    value={outlineData.outline.genre.subTags}
                    onChange={(e) => updateData(['outline', 'genre', 'subTags'], e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label style={styles.label}>目标读者画像</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="年龄段、性别、阅读偏好等"
                  value={outlineData.outline.genre.targetAudience}
                  onChange={(e) => updateData(['outline', 'genre', 'targetAudience'], e.target.value)}
                />
              </div>
            </div>

            {/* 题材选择 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>题材选择</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {genreOptions.map((genre) => (
                  <label
                    key={genre.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: outlineData.outline.genre.selectedGenres.includes(genre.key)
                        ? 'rgba(201, 169, 89, 0.2)'
                        : theme.bg,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      color: theme.text,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={outlineData.outline.genre.selectedGenres.includes(genre.key)}
                      onChange={(e) => {
                        const newGenres = e.target.checked
                          ? [...outlineData.outline.genre.selectedGenres, genre.key]
                          : outlineData.outline.genre.selectedGenres.filter((g) => g !== genre.key)
                        updateData(['outline', 'genre', 'selectedGenres'], newGenres)
                      }}
                      style={{ marginRight: 8 }}
                    />
                    {genre.label}
                  </label>
                ))}
              </div>
            </div>

            {/* 对标作品分析 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>对标作品分析</h4>
              {outlineData.outline.genre.competitors.map((competitor, index) => (
                <div
                  key={index}
                  style={{
                    padding: 12,
                    background: theme.bg,
                    borderRadius: 8,
                    marginBottom: 12,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={styles.row}>
                    <div style={styles.col}>
                      <label style={styles.label}>作品名</label>
                      <input
                        style={styles.input}
                        value={competitor.name}
                        onChange={(e) => {
                          const newCompetitors = [...outlineData.outline.genre.competitors]
                          newCompetitors[index].name = e.target.value
                          updateData(['outline', 'genre', 'competitors'], newCompetitors)
                        }}
                      />
                    </div>
                    <div style={styles.col}>
                      <label style={styles.label}>成功点</label>
                      <input
                        style={styles.input}
                        value={competitor.strengths}
                        onChange={(e) => {
                          const newCompetitors = [...outlineData.outline.genre.competitors]
                          newCompetitors[index].strengths = e.target.value
                          updateData(['outline', 'genre', 'competitors'], newCompetitors)
                        }}
                      />
                    </div>
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(['outline', 'genre', 'competitors'], index)}
                    >
                      删除
                    </Button>
                  </div>
                  <div>
                    <label style={styles.label}>差异化优势</label>
                    <TextArea
                      rows={2}
                      style={styles.textarea}
                      placeholder="我的优势在哪里？"
                      value={competitor.differentiation}
                      onChange={(e) => {
                        const newCompetitors = [...outlineData.outline.genre.competitors]
                        newCompetitors[index].differentiation = e.target.value
                        updateData(['outline', 'genre', 'competitors'], newCompetitors)
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => addItem(['outline', 'genre', 'competitors'])}
              >
                添加对标作品
              </Button>
            </div>
          </div>
        )

      case 'selling':
        return (
          <div style={{ padding: 20 }}>
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>爽点与情绪钩子设计表</h4>
              {outlineData.outline.selling.pleasurePoints.map((point, index) => (
                <div
                  key={index}
                  style={{
                    padding: 12,
                    background: theme.bg,
                    borderRadius: 8,
                    marginBottom: 12,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={styles.row}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>爽点类别</label>
                      <Select
                        style={{ width: '100%', background: theme.bg }}
                        value={point.category || undefined}
                        onChange={(value) => {
                          const newPoints = [...outlineData.outline.selling.pleasurePoints]
                          newPoints[index].category = value
                          updateData(['outline', 'selling', 'pleasurePoints'], newPoints)
                        }}
                        options={[
                          { label: '打脸爽', value: '打脸爽' },
                          { label: '升级爽', value: '升级爽' },
                          { label: '揭秘爽', value: '揭秘爽' },
                          { label: '掌控爽', value: '掌控爽' },
                          { label: '情感爽', value: '情感爽' },
                          { label: '信息差爽', value: '信息差爽' },
                          { label: '装逼爽', value: '装逼爽' },
                          { label: '期待钩子', value: '期待钩子' },
                          { label: '共鸣共情', value: '共鸣共情' },
                        ]}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>预计频率</label>
                      <input
                        style={styles.input}
                        value={point.frequency}
                        onChange={(e) => {
                          const newPoints = [...outlineData.outline.selling.pleasurePoints]
                          newPoints[index].frequency = e.target.value
                          updateData(['outline', 'selling', 'pleasurePoints'], newPoints)
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>目标情绪</label>
                      <input
                        style={styles.input}
                        value={point.emotion}
                        onChange={(e) => {
                          const newPoints = [...outlineData.outline.selling.pleasurePoints]
                          newPoints[index].emotion = e.target.value
                          updateData(['outline', 'selling', 'pleasurePoints'], newPoints)
                        }}
                      />
                    </div>
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(['outline', 'selling', 'pleasurePoints'], index)}
                    >
                      删除
                    </Button>
                  </div>
                  <div style={styles.row}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>表现方式</label>
                      <TextArea
                        rows={2}
                        style={styles.textarea}
                        value={point.expression}
                        onChange={(e) => {
                          const newPoints = [...outlineData.outline.selling.pleasurePoints]
                          newPoints[index].expression = e.target.value
                          updateData(['outline', 'selling', 'pleasurePoints'], newPoints)
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>具体设计示例</label>
                      <TextArea
                        rows={2}
                        style={styles.textarea}
                        value={point.example}
                        onChange={(e) => {
                          const newPoints = [...outlineData.outline.selling.pleasurePoints]
                          newPoints[index].example = e.target.value
                          updateData(['outline', 'selling', 'pleasurePoints'], newPoints)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => addItem(['outline', 'selling', 'pleasurePoints'])}
              >
                添加爽点
              </Button>
            </div>
          </div>
        )

      case 'characters':
        return (
          <div style={{ padding: 20 }}>
            {/* 男主 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>男主</h4>
              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>名称</label>
                  <input
                    style={styles.input}
                    value={outlineData.characters.protagonist.name}
                    onChange={(e) => updateData(['characters', 'protagonist', 'name'], e.target.value)}
                  />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>年龄</label>
                  <input
                    style={styles.input}
                    value={outlineData.characters.protagonist.age}
                    onChange={(e) => updateData(['characters', 'protagonist', 'age'], e.target.value)}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>人物背景（公开身份）</label>
                <TextArea
                  rows={2}
                  style={styles.textarea}
                  placeholder="表面上是什么人，如废柴、学生、小职员"
                  value={outlineData.characters.protagonist.publicIdentity}
                  onChange={(e) => updateData(['characters', 'protagonist', 'publicIdentity'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>隐藏身份</label>
                <TextArea
                  rows={2}
                  style={styles.textarea}
                  placeholder="真实的身份，如转世大能、豪门遗子、天选之人"
                  value={outlineData.characters.protagonist.hiddenIdentity}
                  onChange={(e) => updateData(['characters', 'protagonist', 'hiddenIdentity'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>目标 (Goal)</label>
                <TextArea
                  rows={2}
                  style={styles.textarea}
                  placeholder="他想要什么？(具体、外在的。如：复仇、找到回家路、成为世界最强)"
                  value={outlineData.characters.protagonist.goal}
                  onChange={(e) => updateData(['characters', 'protagonist', 'goal'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>动机 (Motivation)</label>
                <TextArea
                  rows={2}
                  style={styles.textarea}
                  placeholder="他为什么想要？(抽象、内在的。如：为了守护亲人、证明自己、寻求真理)"
                  value={outlineData.characters.protagonist.motivation}
                  onChange={(e) => updateData(['characters', 'protagonist', 'motivation'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>冲突 (Conflict)</label>
                <TextArea
                  rows={2}
                  style={styles.textarea}
                  placeholder="什么在阻碍他？(内在和外在的障碍)"
                  value={outlineData.characters.protagonist.conflict}
                  onChange={(e) => updateData(['characters', 'protagonist', 'conflict'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>人设/标签</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="性格、行事风格、说话风格等。如：杀伐果断、苟道至上、腹黑、热血"
                  value={outlineData.characters.protagonist.personality}
                  onChange={(e) => updateData(['characters', 'protagonist', 'personality'], e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>角色弧光</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="他在故事开始时是怎样的？在故事结束时变成了怎样？"
                  value={outlineData.characters.protagonist.arc}
                  onChange={(e) => updateData(['characters', 'protagonist', 'arc'], e.target.value)}
                />
              </div>
            </div>

            {/* 女主 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>女主（或其他核心人物）</h4>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>名字</label>
                <input
                  style={styles.input}
                  value={outlineData.characters.heroine.name}
                  onChange={(e) => updateData(['characters', 'heroine', 'name'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>人物背景/隐藏身份</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  value={outlineData.characters.heroine.background}
                  onChange={(e) => updateData(['characters', 'heroine', 'background'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>目标</label>
                <TextArea
                  rows={2}
                  style={styles.textarea}
                  value={outlineData.characters.heroine.goal}
                  onChange={(e) => updateData(['characters', 'heroine', 'goal'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>动机</label>
                <TextArea
                  rows={2}
                  style={styles.textarea}
                  value={outlineData.characters.heroine.motivation}
                  onChange={(e) => updateData(['characters', 'heroine', 'motivation'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>冲突</label>
                <TextArea
                  rows={2}
                  style={styles.textarea}
                  value={outlineData.characters.heroine.conflict}
                  onChange={(e) => updateData(['characters', 'heroine', 'conflict'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>人设/标签</label>
                <TextArea
                  rows={2}
                  style={styles.textarea}
                  placeholder="高冷、傲娇、病娇、元气、御姐、圣女"
                  value={outlineData.characters.heroine.personality}
                  onChange={(e) => updateData(['characters', 'heroine', 'personality'], e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>与主角的关系</label>
                <input
                  style={styles.input}
                  placeholder="恋人、战友、对手、引路人"
                  value={outlineData.characters.heroine.relationship}
                  onChange={(e) => updateData(['characters', 'heroine', 'relationship'], e.target.value)}
                />
              </div>
            </div>

            {/* 配角 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>配角</h4>
              {outlineData.characters.supporting.map((char, index) => (
                <div
                  key={index}
                  style={{
                    padding: 12,
                    background: theme.bg,
                    borderRadius: 8,
                    marginBottom: 12,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={styles.row}>
                    <div style={styles.col}>
                      <label style={styles.label}>名称</label>
                      <input
                        style={styles.input}
                        value={char.name}
                        onChange={(e) => {
                          const newChars = [...outlineData.characters.supporting]
                          newChars[index].name = e.target.value
                          updateData(['characters', 'supporting'], newChars)
                        }}
                      />
                    </div>
                    <div style={styles.col}>
                      <label style={styles.label}>核心作用</label>
                      <input
                        style={styles.input}
                        placeholder="推动剧情、衬托主角，提供帮助、制造麻烦"
                        value={char.role}
                        onChange={(e) => {
                          const newChars = [...outlineData.characters.supporting]
                          newChars[index].role = e.target.value
                          updateData(['characters', 'supporting'], newChars)
                        }}
                      />
                    </div>
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(['characters', 'supporting'], index)}
                    >
                      删除
                    </Button>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={styles.label}>人物背景</label>
                    <TextArea
                      rows={2}
                      style={styles.textarea}
                      value={char.background}
                      onChange={(e) => {
                        const newChars = [...outlineData.characters.supporting]
                        newChars[index].background = e.target.value
                        updateData(['characters', 'supporting'], newChars)
                      }}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>人设</label>
                    <TextArea
                      rows={2}
                      style={styles.textarea}
                      placeholder="他在团队中的功能是什么？搞笑担当、坦克、智囊？"
                      value={char.personality}
                      onChange={(e) => {
                        const newChars = [...outlineData.characters.supporting]
                        newChars[index].personality = e.target.value
                        updateData(['characters', 'supporting'], newChars)
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => addItem(['characters', 'supporting'])}
              >
                添加配角
              </Button>
            </div>
          </div>
        )

      case 'worldbuilding':
        return (
          <div style={{ padding: 20 }}>
            {/* 物理与自然法则 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>物理与自然法则</h4>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>宇宙观</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="单一宇宙、平行宇宙、高维时空？世界是真实的还是虚拟的？"
                  value={outlineData.worldBuilding.universe}
                  onChange={(e) => updateData(['worldBuilding', 'universe'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>能量来源</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="灵气、魔力、核能、信仰力、情绪力、星辰之力？"
                  value={outlineData.worldBuilding.energySource}
                  onChange={(e) => updateData(['worldBuilding', 'energySource'], e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>生命形态</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="碳基、硅基、能量体、机械体，信息体？"
                  value={outlineData.worldBuilding.lifeForm}
                  onChange={(e) => updateData(['worldBuilding', 'lifeForm'], e.target.value)}
                />
              </div>
            </div>

            {/* 整体架构 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>整体架构与关键地点</h4>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>整体架构</label>
                <TextArea
                  rows={4}
                  style={styles.textarea}
                  placeholder="描述这个世界最笼统的大陆、板块、维度、层级等信息。如：世界由三大陆组成：东洲灵气充沛适合修炼，西荒妖兽横行，中原是人族文明中心..."
                  value={outlineData.worldBuilding.worldArchitecture}
                  onChange={(e) => updateData(['worldBuilding', 'worldArchitecture'], e.target.value)}
                />
              </div>
              <h5 style={{ marginTop: 16, marginBottom: 12, color: theme.textSecondary }}>关键地点</h5>
              {outlineData.worldBuilding.keyLocations.map((loc, index) => (
                <div
                  key={index}
                  style={{
                    padding: 12,
                    background: theme.bg,
                    borderRadius: 8,
                    marginBottom: 12,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={styles.row}>
                    <input
                      style={{ ...styles.input, flex: 1 }}
                      placeholder="地点名称"
                      value={loc.name}
                      onChange={(e) => {
                        const newLocs = [...outlineData.worldBuilding.keyLocations]
                        newLocs[index].name = e.target.value
                        updateData(['worldBuilding', 'keyLocations'], newLocs)
                      }}
                    />
                    <Select
                      style={{ width: 120, background: theme.bg }}
                      value={loc.type}
                      onChange={(value) => {
                        const newLocs = [...outlineData.worldBuilding.keyLocations]
                        newLocs[index].type = value
                        updateData(['worldBuilding', 'keyLocations'], newLocs)
                      }}
                      options={[
                        { label: '起点区域', value: '起点' },
                        { label: '主城/核心枢纽', value: '主城' },
                        { label: '副本/秘境/遗迹', value: '秘境' },
                        { label: '特殊自然景观', value: '自然' },
                        { label: '势力据点', value: '势力' },
                        { label: '危险区域', value: '危险' },
                      ]}
                    />
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(['worldBuilding', 'keyLocations'], index)}
                    >
                      删除
                    </Button>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <TextArea
                      rows={3}
                      style={styles.textarea}
                      placeholder="地理特征、风土人情、特殊产出、重要性等..."
                      value={loc.description}
                      onChange={(e) => {
                        const newLocs = [...outlineData.worldBuilding.keyLocations]
                        newLocs[index].description = e.target.value
                        updateData(['worldBuilding', 'keyLocations'], newLocs)
                      }}
                    />
                  </div>
                  <div style={styles.row}>
                    <div style={styles.col}>
                      <label style={styles.label}>重要程度</label>
                      <Select
                        style={{ width: '100%', background: theme.bg }}
                        value={loc.importance}
                        onChange={(value) => {
                          const newLocs = [...outlineData.worldBuilding.keyLocations]
                          newLocs[index].importance = value
                          updateData(['worldBuilding', 'keyLocations'], newLocs)
                        }}
                        options={[
                          { label: '核心地点', value: '核心' },
                          { label: '重要地点', value: '重要' },
                          { label: '一般地点', value: '一般' },
                          { label: '背景地点', value: '背景' },
                        ]}
                      />
                    </div>
                    <div style={styles.col}>
                      <label style={styles.label}>出现时机</label>
                      <input
                        style={styles.input}
                        placeholder="如：第一卷、中期、后期"
                        value={loc.appearTime}
                        onChange={(e) => {
                          const newLocs = [...outlineData.worldBuilding.keyLocations]
                          newLocs[index].appearTime = e.target.value
                          updateData(['worldBuilding', 'keyLocations'], newLocs)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => addItem(['worldBuilding', 'keyLocations'])}
              >
                添加新地点
              </Button>
            </div>

            {/* 势力划分 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>势力划分</h4>
              {outlineData.worldBuilding.factions.map((faction, index) => (
                <div
                  key={index}
                  style={{
                    padding: 12,
                    background: theme.bg,
                    borderRadius: 8,
                    marginBottom: 12,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={styles.row}>
                    <input
                      style={{ ...styles.input, flex: 1 }}
                      placeholder="势力名称"
                      value={faction.name}
                      onChange={(e) => {
                        const newFactions = [...outlineData.worldBuilding.factions]
                        newFactions[index].name = e.target.value
                        updateData(['worldBuilding', 'factions'], newFactions)
                      }}
                    />
                    <Select
                      style={{ width: 100, background: theme.bg }}
                      value={faction.type}
                      onChange={(value) => {
                        const newFactions = [...outlineData.worldBuilding.factions]
                        newFactions[index].type = value
                        updateData(['worldBuilding', 'factions'], newFactions)
                      }}
                      options={[
                        { label: '帝国', value: '帝国' },
                        { label: '联邦', value: '联邦' },
                        { label: '宗门', value: '宗门' },
                        { label: '财团', value: '财团' },
                        { label: '反抗组织', value: '反抗组织' },
                      ]}
                    />
                    <input
                      style={{ ...styles.input, flex: 1 }}
                      placeholder="核心理念"
                      value={faction.ideology}
                      onChange={(e) => {
                        const newFactions = [...outlineData.worldBuilding.factions]
                        newFactions[index].ideology = e.target.value
                        updateData(['worldBuilding', 'factions'], newFactions)
                      }}
                    />
                    <input
                      style={{ ...styles.input, flex: 1 }}
                      placeholder="领袖"
                      value={faction.leader}
                      onChange={(e) => {
                        const newFactions = [...outlineData.worldBuilding.factions]
                        newFactions[index].leader = e.target.value
                        updateData(['worldBuilding', 'factions'], newFactions)
                      }}
                    />
                    <Select
                      style={{ width: 80, background: theme.bg }}
                      value={faction.power}
                      onChange={(value) => {
                        const newFactions = [...outlineData.worldBuilding.factions]
                        newFactions[index].power = value
                        updateData(['worldBuilding', 'factions'], newFactions)
                      }}
                      options={[
                        { label: 'T0', value: 'T0' },
                        { label: 'T1', value: 'T1' },
                        { label: 'T2', value: 'T2' },
                        { label: 'T3', value: 'T3' },
                      ]}
                    />
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(['worldBuilding', 'factions'], index)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => addItem(['worldBuilding', 'factions'])}
              >
                添加势力
              </Button>
            </div>

            {/* 力量体系 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>力量体系</h4>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>体系名称</label>
                <input
                  style={styles.input}
                  placeholder="如：修真体系、魔法评议体系、基因锁体系"
                  value={outlineData.worldBuilding.powerSystem.name}
                  onChange={(e) => updateData(['worldBuilding', 'powerSystem', 'name'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>等级划分</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="如：锻体 → 聚气 → 凝脉 → 开府 → 通玄 → 王侯 → 皇者 → 圣人 → 大帝"
                  value={outlineData.worldBuilding.powerSystem.levels}
                  onChange={(e) => updateData(['worldBuilding', 'powerSystem', 'levels'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>成长方式</label>
                <TextArea
                  rows={2}
                  style={styles.textarea}
                  placeholder="修炼、战斗、吞噬、融合、觉醒、传承、进化"
                  value={outlineData.worldBuilding.powerSystem.growthMethods}
                  onChange={(e) => updateData(['worldBuilding', 'powerSystem', 'growthMethods'], e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>限制与代价</label>
                <TextArea
                  rows={2}
                  style={styles.textarea}
                  placeholder="寿命限制、能量消耗、身体负荷、副作用"
                  value={outlineData.worldBuilding.powerSystem.limitations}
                  onChange={(e) => updateData(['worldBuilding', 'powerSystem', 'limitations'], e.target.value)}
                />
              </div>
            </div>

            {/* 金手指 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>金手指</h4>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>名称</label>
                <input
                  style={styles.input}
                  placeholder="如：大反派系统、神级签到系统、因果律编辑器"
                  value={outlineData.worldBuilding.goldenFinger.name}
                  onChange={(e) => updateData(['worldBuilding', 'goldenFinger', 'name'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>来源</label>
                <Select
                  style={{ width: '100%', background: theme.bg }}
                  value={outlineData.worldBuilding.goldenFinger.origin || undefined}
                  onChange={(value) => updateData(['worldBuilding', 'goldenFinger', 'origin'], value)}
                  options={[
                    { label: '穿越福利', value: '穿越福利' },
                    { label: '高人馈赠', value: '高人馈赠' },
                    { label: '奇遇获得', value: '奇遇获得' },
                    { label: '血脉觉醒', value: '血脉觉醒' },
                    { label: '自身异变', value: '自身异变' },
                  ]}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>核心功能</label>
                <TextArea
                  rows={3}
                  style={styles.textarea}
                  placeholder="具体化描述金手指的主要功能，如签到获得奖励、属性加点等"
                  value={outlineData.worldBuilding.goldenFinger.coreFunction}
                  onChange={(e) => updateData(['worldBuilding', 'goldenFinger', 'coreFunction'], e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>升级路径</label>
                <TextArea
                  rows={2}
                  style={styles.textarea}
                  placeholder="金手指如何升级？升级条件是什么？"
                  value={outlineData.worldBuilding.goldenFinger.upgradePath}
                  onChange={(e) => updateData(['worldBuilding', 'goldenFinger', 'upgradePath'], e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>限制与代价</label>
                <TextArea
                  rows={2}
                  style={styles.textarea}
                  placeholder="冷却时间、使用次数、能量消耗、道德成本等"
                  value={outlineData.worldBuilding.goldenFinger.limitations}
                  onChange={(e) => updateData(['worldBuilding', 'goldenFinger', 'limitations'], e.target.value)}
                />
              </div>
            </div>

            {/* 隐藏规则 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>隐藏规则/暗线设定</h4>
              <TextArea
                rows={5}
                style={styles.textarea}
                placeholder="只给作者看，用于制造反转和深化主题的设定。如：系统其实是主角母亲留下的灵魂印记..."
                value={outlineData.worldBuilding.hiddenRules}
                onChange={(e) => updateData(['worldBuilding', 'hiddenRules'], e.target.value)}
              />
            </div>
          </div>
        )

      case 'structure':
        return (
          <div style={{ padding: 20 }}>
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>分卷管理</h4>
              {outlineData.outline.structure.volumes.map((volume, vIndex) => (
                <div
                  key={vIndex}
                  style={{
                    padding: 16,
                    background: theme.bg,
                    borderRadius: 8,
                    marginBottom: 16,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={styles.row}>
                    <input
                      style={{ ...styles.input, flex: 1 }}
                      placeholder="分卷名称，如：潜龙在渊"
                      value={volume.name}
                      onChange={(e) => {
                        const newVolumes = [...outlineData.outline.structure.volumes]
                        newVolumes[vIndex].name = e.target.value
                        updateData(['outline', 'structure', 'volumes'], newVolumes)
                      }}
                    />
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(['outline', 'structure', 'volumes'], vIndex)}
                    >
                      删除卷
                    </Button>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={styles.label}>本卷核心</label>
                    <TextArea
                      rows={2}
                      style={styles.textarea}
                      placeholder="本卷的核心内容和目标"
                      value={volume.core}
                      onChange={(e) => {
                        const newVolumes = [...outlineData.outline.structure.volumes]
                        newVolumes[vIndex].core = e.target.value
                        updateData(['outline', 'structure', 'volumes'], newVolumes)
                      }}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>故事发展脉络</label>
                    <TextArea
                      rows={3}
                      style={styles.textarea}
                      placeholder="从[初始状态] -> 遭遇[危机/转折] -> 获得[收获] -> 决定[下一步]"
                      value={volume.plotLine}
                      onChange={(e) => {
                        const newVolumes = [...outlineData.outline.structure.volumes]
                        newVolumes[vIndex].plotLine = e.target.value
                        updateData(['outline', 'structure', 'volumes'], newVolumes)
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => addItem(['outline', 'structure', 'volumes'])}
              >
                添加分卷
              </Button>
            </div>

            {/* 人物线 */}
            <div style={styles.section}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>人物线</h4>
              {outlineData.outline.structure.characterLines.map((line, index) => (
                <div
                  key={index}
                  style={{
                    padding: 12,
                    background: theme.bg,
                    borderRadius: 8,
                    marginBottom: 12,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={styles.row}>
                    <input
                      style={{ ...styles.input, flex: 1 }}
                      placeholder="主角、女主、反派等"
                      value={line.character}
                      onChange={(e) => {
                        const newLines = [...outlineData.outline.structure.characterLines]
                        newLines[index].character = e.target.value
                        updateData(['outline', 'structure', 'characterLines'], newLines)
                      }}
                    />
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(['outline', 'structure', 'characterLines'], index)}
                    >
                      删除
                    </Button>
                  </div>
                  <div>
                    <label style={styles.label}>人物线发展</label>
                    <TextArea
                      rows={3}
                      style={styles.textarea}
                      placeholder="以当前人物视角记录主线的发展过程中的经历，分前期、中期、后期描述"
                      value={line.development}
                      onChange={(e) => {
                        const newLines = [...outlineData.outline.structure.characterLines]
                        newLines[index].development = e.target.value
                        updateData(['outline', 'structure', 'characterLines'], newLines)
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => addItem(['outline', 'structure', 'characterLines'])}
              >
                添加人物线
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.bgSecondary,
          borderRadius: 16,
          width: '90%',
          maxWidth: 1200,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div
          style={{
            padding: '20px 28px',
            background: 'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, color: '#fff', fontSize: 20 }}>书籍大纲管理</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              fontSize: 24,
              color: '#fff',
              width: 36,
              height: 36,
              borderRadius: '50%',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* 标签页导航 */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '12px 20px 0',
            background: theme.bgSecondary,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          {tabList.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 16px',
                background: activeTab === tab.key ? theme.bgSecondary : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.key ? `2px solid ${theme.primary}` : '2px solid transparent',
                color: activeTab === tab.key ? theme.primary : theme.textSecondary,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: activeTab === tab.key ? 600 : 400,
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 标签页内容 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {renderTabContent()}
        </div>

        {/* 底部 */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            background: theme.bgSecondary,
          }}
        >
          <Space>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出大纲
            </Button>
            <Button icon={<ImportOutlined />}>
              导入大纲
            </Button>
          </Space>
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button
              type="primary"
              style={{ background: theme.gradient, border: 'none' }}
              onClick={handleSave}
            >
              保存大纲
            </Button>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default OutlineManager
