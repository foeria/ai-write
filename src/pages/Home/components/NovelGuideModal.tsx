import { useState } from 'react'
import { Steps, Button, Card, Input, Select, Space, Typography, Divider, Row, Col, message } from 'antd'
import {
  BulbOutlined,
  FolderOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'
import type { NovelFormData } from './CreateNovelModal'

const { Text, Title, Paragraph } = Typography

// 指南步骤
interface GuideSteps {
  current: number
  title: string
  description: string
  icon: React.ReactNode
}

const steps: GuideSteps[] = [
  {
    current: 0,
    title: '灵感收集',
    description: '确定你的核心创意',
    icon: <BulbOutlined />,
  },
  {
    current: 1,
    title: '大纲规划',
    description: '设计故事结构',
    icon: <FolderOutlined />,
  },
  {
    current: 2,
    title: '世界观设定',
    description: '构建故事背景',
    icon: <GlobalOutlined />,
  },
  {
    current: 3,
    title: '创建作品',
    description: '开始你的创作之旅',
    icon: <CheckCircleOutlined />,
  },
]

// 分类选项
const CATEGORY_OPTIONS = [
  { value: '奇幻', label: '奇幻' },
  { value: '科幻', label: '科幻' },
  { value: '都市', label: '都市' },
  { value: '武侠', label: '武侠' },
  { value: '历史', label: '历史' },
  { value: '悬疑', label: '悬疑' },
  { value: '言情', label: '言情' },
  { value: '玄幻', label: '玄幻' },
  { value: '军事', label: '军事' },
  { value: '游戏', label: '游戏' },
]

// 时代背景选项
const ERA_OPTIONS = [
  { value: '现代', label: '现代' },
  { value: '近代', label: '近代' },
  { value: '古代', label: '古代' },
  { value: '未来', label: '未来' },
  { value: '异世界', label: '异世界' },
  { value: '架空', label: '架空' },
]

// 世界类型选项
const WORLD_TYPE_OPTIONS = [
  { value: 'realistic', label: '现实世界' },
  { value: 'fantasy', label: '奇幻世界' },
  { value: 'sci-fi', label: '科幻世界' },
  { value: 'historical', label: '历史世界' },
  { value: 'alternate', label: '架空世界' },
]

// 基调选项
const TONE_OPTIONS = [
  { value: '轻松愉快', label: '轻松愉快' },
  { value: '紧张刺激', label: '紧张刺激' },
  { value: '沉重严肃', label: '沉重严肃' },
  { value: '浪漫温馨', label: '浪漫温馨' },
  { value: '黑暗压抑', label: '黑暗压抑' },
]

interface NovelGuideModalProps {
  onClose: () => void
  onComplete: (data: NovelFormData) => void
}

function NovelGuideModal({ onClose, onComplete }: NovelGuideModalProps) {
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  const [currentStep, setCurrentStep] = useState(0)

  // 收集的数据
  const [guideData, setGuideData] = useState({
    // 灵感阶段
    title: '',
    category: '',
    coreHook: '',
    tags: '',
    // 大纲阶段
    mainTags: '',
    subTags: '',
    protagonistName: '',
    protagonistGoal: '',
    // 世界观阶段
    era: '',
    location: '',
    worldType: '',
    theme: '',
    tone: '',
    worldArchitecture: '',
    powerSystem: '',
    goldenFinger: '',
  })

  const themeStyles = {
    bg: isDark ? '#1a1612' : '#ffffff',
    text: isDark ? '#e8e0d5' : '#3d3830',
    textSecondary: isDark ? '#a99d92' : '#6b635a',
    border: isDark ? '#4a4238' : '#e8e0d5',
    cardBg: isDark ? '#252220' : '#ffffff',
  }

  // 更新数据
  const updateData = (key: string, value: string) => {
    setGuideData(prev => ({ ...prev, [key]: value }))
  }

  // 下一步
  const handleNext = () => {
    // 验证当前步骤
    if (currentStep === 0 && !guideData.title) {
      message.warning('请输入作品名称')
      return
    }
    if (currentStep === 0 && !guideData.category) {
      message.warning('请选择作品分类')
      return
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  // 上一步
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 完成 - 传递数据到创建表单
  const handleComplete = () => {
    const novelFormData: NovelFormData = {
      title: guideData.title,
      category: guideData.category,
      genre: guideData.category,
      coreHook: guideData.coreHook,
      tags: guideData.tags,
      mainTags: guideData.mainTags,
      subTags: guideData.subTags,
      protagonistName: guideData.protagonistName,
      protagonistGoal: guideData.protagonistGoal,
      era: guideData.era,
      location: guideData.location,
      worldType: guideData.worldType,
      theme: guideData.theme,
      tone: guideData.tone,
      worldArchitecture: guideData.worldArchitecture,
      powerSystem: guideData.powerSystem,
      goldenFinger: guideData.goldenFinger,
      targetWords: 30,
      publishStatus: 'draft',
      description: '',
      cover: null,
    }
    onComplete(novelFormData)
  }

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // 灵感收集
        return (
          <div>
            <Title level={5} style={{ color: '#c9a959', marginBottom: 16 }}>
              第一步：确定你的核心创意
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              好的开始是成功的一半。先想清楚你要讲一个什么样的故事。
            </Paragraph>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ color: themeStyles.text }}>作品名称 *</Text>
                <Input
                  placeholder="给你的作品起个名字"
                  value={guideData.title}
                  onChange={(e) => updateData('title', e.target.value)}
                  style={{ marginTop: 8, ...themeStyles }}
                />
              </div>

              <div>
                <Text strong style={{ color: themeStyles.text }}>作品分类 *</Text>
                <Select
                  placeholder="选择作品分类"
                  value={guideData.category || undefined}
                  onChange={(value) => updateData('category', value)}
                  options={CATEGORY_OPTIONS}
                  style={{ width: '100%', marginTop: 8 }}
                />
              </div>

              <div>
                <Text strong style={{ color: themeStyles.text }}>核心梗概</Text>
                <Input.TextArea
                  placeholder="一句话概括你的故事：在什么背景下，主角要做什么？"
                  value={guideData.coreHook}
                  onChange={(e) => updateData('coreHook', e.target.value)}
                  rows={3}
                  style={{ marginTop: 8, ...themeStyles }}
                />
              </div>

              <div>
                <Text strong style={{ color: themeStyles.text }}>作品标签</Text>
                <Input
                  placeholder="用逗号分隔，如：穿越、重生、热血"
                  value={guideData.tags}
                  onChange={(e) => updateData('tags', e.target.value)}
                  style={{ marginTop: 8, ...themeStyles }}
                />
              </div>
            </Space>
          </div>
        )

      case 1: // 大纲规划
        return (
          <div>
            <Title level={5} style={{ color: '#c9a959', marginBottom: 16 }}>
              第二步：设计故事结构
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              明确你的主角和故事主线。
            </Paragraph>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ color: themeStyles.text }}>主标签</Text>
                <Input
                  placeholder="主要类型，如：玄幻、都市"
                  value={guideData.mainTags}
                  onChange={(e) => updateData('mainTags', e.target.value)}
                  style={{ marginTop: 8, ...themeStyles }}
                />
              </div>

              <div>
                <Text strong style={{ color: themeStyles.text }}>辅标签</Text>
                <Input
                  placeholder="辅助标签，如：系统、无敌、种田"
                  value={guideData.subTags}
                  onChange={(e) => updateData('subTags', e.target.value)}
                  style={{ marginTop: 8, ...themeStyles }}
                />
              </div>

              <div>
                <Text strong style={{ color: themeStyles.text }}>主角名称</Text>
                <Input
                  placeholder="主角是谁？"
                  value={guideData.protagonistName}
                  onChange={(e) => updateData('protagonistName', e.target.value)}
                  style={{ marginTop: 8, ...themeStyles }}
                />
              </div>

              <div>
                <Text strong style={{ color: themeStyles.text }}>主角目标</Text>
                <Input.TextArea
                  placeholder="主角想要什么？他/她的目标是什么？"
                  value={guideData.protagonistGoal}
                  onChange={(e) => updateData('protagonistGoal', e.target.value)}
                  rows={2}
                  style={{ marginTop: 8, ...themeStyles }}
                />
              </div>
            </Space>
          </div>
        )

      case 2: // 世界观设定
        return (
          <div>
            <Title level={5} style={{ color: '#c9a959', marginBottom: 16 }}>
              第三步：构建故事背景
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              为你的故事创造一个独特的世界。
            </Paragraph>

            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: themeStyles.text }}>时代背景</Text>
                  <Select
                    placeholder="选择时代背景"
                    value={guideData.era || undefined}
                    onChange={(value) => updateData('era', value)}
                    options={ERA_OPTIONS}
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: themeStyles.text }}>世界类型</Text>
                  <Select
                    placeholder="选择世界类型"
                    value={guideData.worldType || undefined}
                    onChange={(value) => updateData('worldType', value)}
                    options={WORLD_TYPE_OPTIONS}
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </div>
              </Col>
            </Row>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ color: themeStyles.text }}>地点设定</Text>
                <Input
                  placeholder="故事发生的主要地点"
                  value={guideData.location}
                  onChange={(e) => updateData('location', e.target.value)}
                  style={{ marginTop: 8, ...themeStyles }}
                />
              </div>

              <div>
                <Text strong style={{ color: themeStyles.text }}>整体基调</Text>
                <Select
                  placeholder="选择故事基调"
                  value={guideData.tone || undefined}
                  onChange={(value) => updateData('tone', value)}
                  options={TONE_OPTIONS}
                  style={{ width: '100%', marginTop: 8 }}
                />
              </div>

              <div>
                <Text strong style={{ color: themeStyles.text }}>主题</Text>
                <Input
                  placeholder="你想表达什么？如：成长、正义、爱情"
                  value={guideData.theme}
                  onChange={(e) => updateData('theme', e.target.value)}
                  style={{ marginTop: 8, ...themeStyles }}
                />
              </div>

              <div>
                <Text strong style={{ color: themeStyles.text }}>世界架构</Text>
                <Input.TextArea
                  placeholder="简要描述这个世界的整体架构"
                  value={guideData.worldArchitecture}
                  onChange={(e) => updateData('worldArchitecture', e.target.value)}
                  rows={2}
                  style={{ marginTop: 8, ...themeStyles }}
                />
              </div>

              <div>
                <Text strong style={{ color: themeStyles.text }}>力量体系</Text>
                <Input
                  placeholder="如：修真体系、魔法评议体系、科技等级"
                  value={guideData.powerSystem}
                  onChange={(e) => updateData('powerSystem', e.target.value)}
                  style={{ marginTop: 8, ...themeStyles }}
                />
              </div>

              <div>
                <Text strong style={{ color: themeStyles.text }}>金手指</Text>
                <Input
                  placeholder="主角的特殊优势或系统"
                  value={guideData.goldenFinger}
                  onChange={(e) => updateData('goldenFinger', e.target.value)}
                  style={{ marginTop: 8, ...themeStyles }}
                />
              </div>
            </Space>
          </div>
        )

      case 3: // 创建作品
        return (
          <div>
            <Title level={5} style={{ color: '#c9a959', marginBottom: 16 }}>
              第四步：创建你的作品
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              确认信息，准备开始创作之旅！
            </Paragraph>

            <Card style={{ background: themeStyles.cardBg, borderColor: themeStyles.border, marginBottom: 16 }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">作品名称</Text>
                  <Text strong style={{ color: themeStyles.text }}>{guideData.title || '-'}</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">作品分类</Text>
                  <Text strong style={{ color: themeStyles.text }}>{guideData.category || '-'}</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">主角</Text>
                  <Text strong style={{ color: themeStyles.text }}>{guideData.protagonistName || '-'}</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">目标</Text>
                  <Text strong style={{ color: themeStyles.text }}>{guideData.protagonistGoal || '-'}</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">时代背景</Text>
                  <Text strong style={{ color: themeStyles.text }}>{guideData.era || '-'}</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">世界类型</Text>
                  <Text strong style={{ color: themeStyles.text }}>{guideData.worldType || '-'}</Text>
                </div>
              </Space>
            </Card>

            <Paragraph type="secondary" style={{ textAlign: 'center' }}>
              点击"创建作品"后将跳转到详细编辑页面，你可以进一步完善作品信息。
            </Paragraph>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div>
      {/* 步骤条 */}
      <Steps
        current={currentStep}
        items={steps.map((step) => ({
          title: step.title,
          description: step.description,
          icon: step.icon,
        }))}
        style={{ marginBottom: 32 }}
      />

      {/* 步骤内容 */}
      <div style={{ minHeight: 300 }}>
        {renderStepContent()}
      </div>

      {/* 按钮 */}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={handlePrev}
          disabled={currentStep === 0}
          icon={<LeftOutlined />}
        >
          上一步
        </Button>

        {currentStep < 3 ? (
          <Button
            type="primary"
            onClick={handleNext}
            className="btn-gradient"
            icon={<RightOutlined />}
            iconPosition="end"
          >
            下一步
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={handleComplete}
            className="btn-gradient"
          >
            创建作品
          </Button>
        )}
      </div>
    </div>
  )
}

export default NovelGuideModal
