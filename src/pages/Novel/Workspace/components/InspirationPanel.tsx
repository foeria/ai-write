import { useState, useCallback, useRef, useEffect } from 'react'
import { Input, Button, Space, Typography, Avatar, Spin, message } from 'antd'
import { UserOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons'
import { chatComplete } from '@/api/ai'

const { Text, Title } = Typography

// 消息类型
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// 灵感面板Props
interface InspirationPanelProps {
  isDark: boolean
  theme: {
    bg: string
    bgSecondary?: string
    text: string
    textSecondary: string
    border: string
    primary: string
    gradient: string
  }
  onGenerateInspiration?: () => Promise<void>
  isLoading?: boolean
}

// 默认消息列表
const defaultMessages: ChatMessage[] = []

function InspirationPanel({
  theme,
  onGenerateInspiration,
  isLoading: externalLoading,
}: InspirationPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isGeneratingValue = externalLoading ?? isGenerating

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const panelTheme: any = {
    bg: theme.bgSecondary,
    inputBg: theme.bg,
    text: theme.text,
    textSecondary: theme.textSecondary,
    border: theme.border,
    primary: theme.primary,
    gradient: theme.gradient,
  }

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 发送消息
  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) {
      message.warning('请输入内容')
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsGenerating(true)

    // 调用真实的AI API生成灵感
    try {
      const prompt = `你是一个创意写作助手。请根据以下用户请求提供创作灵感：${inputValue}`
      const result = await chatComplete(prompt)

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('生成灵感失败:', error)
      message.error('生成灵感失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }, [inputValue])

  // 生成灵感响应（模拟）
  const generateInspirationResponse = (input: string): string => {
    const responses = [
      `关于"${input}"，我有一些想法：

1. **故事走向**：可以从主角的内心冲突入手，展现他/她面对这一情境时的挣扎与成长。

2. **人物刻画**：建议通过对话和细节描写来展现人物性格，让读者感受到角色的真实情感。

3. **情节设计**：可以考虑设置一个意想不到的转折，让故事更有张力。

4. **氛围营造**：利用环境描写来烘托情绪，比如昏暗的灯光、紧张的氛围等。`,
      `针对"${input}"这个灵感方向，我建议：

**核心冲突**：建议设置一个两难的选择，主角必须在两个都重要的选项中做出决定。

**情感基调**：可以采用先抑后扬或先扬后抑的方式，制造情感的起伏。

**关键场景**：设计一个标志性场景，让读者印象深刻，比如在某个特殊地点的关键对话。

**伏笔埋设**：在前文埋下伏笔，让结局既在意料之外又在情理之中。`,
      `关于"${input}"的创作灵感：

🌟 **人物动机**：深入挖掘角色为什么要这样做，背后有什么样的故事。

🔮 **命运转折**：考虑一个出人意料但合理的转折点，让故事更有戏剧性。

💫 **主题深化**：思考这个情节想要表达什么样的主题，如何让读者产生共鸣。

⚡ **节奏把控**：注意情节的节奏，张弛有度，给读者喘息的空间。`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 按Enter发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 快捷提示
  const quickPrompts = [
    '如何设计一个引人入胜的开头？',
    '帮我构思一个反转情节',
    '如何描写紧张的氛围？',
    '给主角一个独特的性格特点',
  ]

  return (
    <div className="inspiration-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 头部 */}
      <div className="panel-header" style={{
        padding: '16px',
        borderBottom: `1px solid ${panelTheme.border}`,
      }}>
        <Title level={5} style={{ margin: 0, color: panelTheme.text }}>
          AI灵感助手
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          与AI对话获取创作灵感
        </Text>
      </div>

      {/* 消息区域 */}
      <div
        className="messages-area"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          background: panelTheme.bg,
        }}
      >
        {messages.length === 0 ? (
          <div className="welcome-message" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              fontSize: 48,
              marginBottom: 16,
              color: panelTheme.primary,
            }}>
              <RobotOutlined />
            </div>
            <Title level={5} style={{ color: panelTheme.text }}>
              创作灵感助手
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              描述您需要的灵感方向，AI将为您提供创意建议
            </Text>
            <div className="quick-prompts" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  size="small"
                  type="dashed"
                  onClick={() => setInputValue(prompt)}
                  style={{ fontSize: 12 }}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`message ${msg.role}`}
                style={{
                  display: 'flex',
                  gap: 12,
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.role === 'assistant' && (
                  <Avatar
                    icon={<RobotOutlined />}
                    style={{ background: theme.gradient, flexShrink: 0 }}
                  />
                )}
                <div
                  className="message-content"
                  style={{
                    maxWidth: msg.role === 'user' ? '80%' : '100%',
                    background: msg.role === 'user'
                      ? theme.gradient
                      : panelTheme.bgSecondary,
                    padding: '12px 16px',
                    borderRadius: 12,
                    borderTopRightRadius: msg.role === 'user' ? 4 : 12,
                    borderTopLeftRadius: msg.role === 'assistant' ? 4 : 12,
                    border: `1px solid ${panelTheme.border}`,
                  }}
                >
                  <Text
                    style={{
                      color: msg.role === 'user' ? '#fff' : panelTheme.text,
                      whiteSpace: 'pre-wrap',
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    {msg.content}
                  </Text>
                </div>
                {msg.role === 'user' && (
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ background: '#667eea', flexShrink: 0 }}
                  />
                )}
              </div>
            ))}
            {isGeneratingValue && (
              <div className="typing-indicator" style={{ display: 'flex', gap: 12 }}>
                <Avatar icon={<RobotOutlined />} style={{ background: theme.gradient }} />
                <div style={{
                  background: panelTheme.bgSecondary,
                  padding: '12px 16px',
                  borderRadius: 12,
                  borderTopLeftRadius: 4,
                }}>
                  <Spin size="small" />
                  <Text type="secondary" style={{ marginLeft: 8 }}>AI正在思考...</Text>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </Space>
        )}
      </div>

      {/* 输入区域 */}
      <div
        className="input-area"
        style={{
          padding: 16,
          borderTop: `1px solid ${panelTheme.border}`,
          background: panelTheme.bgSecondary,
        }}
      >
        <Input.TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="描述您需要的灵感方向..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{
            background: panelTheme.inputBg,
            borderColor: panelTheme.border,
            color: panelTheme.text,
            resize: 'none',
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 8,
        }}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={isGeneratingValue}
            style={{
              background: theme.gradient,
              border: 'none',
            }}
          >
            发送
          </Button>
        </div>
      </div>

      <style>{`
        .inspiration-panel .ant-input::placeholder {
          color: ${panelTheme.textSecondary} !important;
        }

        .inspiration-panel .ant-btn-dashed:hover {
          border-color: ${panelTheme.primary};
          color: ${panelTheme.primary};
        }
      `}</style>
    </div>
  )
}

export default InspirationPanel
