import { useState, useEffect, useCallback } from 'react'
import { Modal, Spin, Button, Typography, Space } from 'antd'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const { Text } = Typography

// 额度使用情况
interface QuotaUsage {
  consumedQuota?: number
  consumed_quota?: number
  remainingQuota?: number
  remaining_quota?: number
}

interface GenerateResultModalProps {
  title?: string
  width?: string
  resultContent: string
  isLoading: boolean
  loadingText?: string
  resultPlaceholder?: string
  noResultText?: string
  generatedWordsCount?: number
  quotaUsage?: QuotaUsage | null
  tokenUsage?: {
    prompt_tokens?: number
    promptTokens?: number
    prompt?: number
    completion_tokens?: number
    completionTokens?: number
    completion?: number
    total_tokens?: number
    totalTokens?: number
  } | null
  open: boolean
  onClose: () => void
  onApply: (content: string) => void
}

function GenerateResultModal({
  title = '生成结果',
  width = '800px',
  resultContent,
  isLoading,
  loadingText = '正在生成内容，请稍候...',
  resultPlaceholder = '生成结果将显示在这里...',
  noResultText = '暂无生成结果，请先生成内容',
  generatedWordsCount = 0,
  quotaUsage = null,
  tokenUsage = null,
  open,
  onClose,
  onApply,
}: GenerateResultModalProps) {
  const [editableResult, setEditableResult] = useState(resultContent)

  useEffect(() => {
    setEditableResult(resultContent)
  }, [resultContent])

  // 统计字数（包含中英文和标点）
  const countResultWords = useCallback((str: string): number => {
    const safeStr = String(str || '')
    if (!safeStr) return 0
    const clean = safeStr.replace(/<[^>]+>/g, '').trim()
    if (!clean) return 0
    const match = clean.match(
      /[\u4e00-\u9fa5\w\d\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\uff01\u2026\u2014\uff5e\uffe5\uFF0E\uFF1B\uFF0C\uFF1A\u2018\u2019\uFF08\uFF09\u3001\uFF1F\uFF01\u2026\u2014\uFF5E\uFFE5\.,;:!\?\-_'"\(\)\[\]\{\}]/g,
    )
    return match ? match.length : 0
  }, [])

  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) {
      return '0'
    }
    return Number(value).toLocaleString()
  }

  const formatTokenSummary = (usage: typeof tokenUsage): string => {
    if (!usage) return '0 / 0 / 0'
    const prompt = usage.prompt_tokens ?? usage.promptTokens ?? usage.prompt ?? 0
    const completion = usage.completion_tokens ?? usage.completionTokens ?? usage.completion ?? 0
    const total = usage.total_tokens ?? usage.totalTokens ?? prompt + completion
    return `${formatNumber(prompt)} / ${formatNumber(completion)} / ${formatNumber(total)}`
  }

  const handleApply = () => {
    const contentToApply = editableResult || resultContent
    onApply(contentToApply)
    setEditableResult('')
    onClose()
  }

  const handleCancel = () => {
    setEditableResult('')
    onClose()
  }

  // 自定义ReactQuill组件以避免theme props问题
  const QuillComponent = ReactQuill as React.ComponentType<any>

  return (
    <Modal
      title={title}
      width={width}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      styles={{
        body: {
          padding: '16px',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          borderRadius: '0 0 16px 16px',
        },
      }}
    >
      <div className="generate-result-modal">
        {/* 加载状态 */}
        {isLoading && (
          <div className="loading-section">
            <Spin size="large" />
            <Text style={{ marginTop: 16, display: 'block', color: '#4a5568' }}>
              {loadingText}
            </Text>
          </div>
        )}

        {/* 生成结果展示 */}
        {!isLoading && resultContent && (
          <>
            {/* 统计信息 */}
            <div className="result-stats">
              <Space size={24}>
                {generatedWordsCount > 0 && (
                  <div className="stat-item">
                    <Text type="secondary" style={{ fontSize: 12 }}>生成字数:</Text>
                    <Text strong style={{ marginLeft: 8, color: '#38a169' }}>
                      {generatedWordsCount.toLocaleString()}
                    </Text>
                  </div>
                )}
                {!generatedWordsCount && resultContent && (
                  <div className="stat-item">
                    <Text type="secondary" style={{ fontSize: 12 }}>生成字数:</Text>
                    <Text strong style={{ marginLeft: 8, color: '#38a169' }}>
                      {countResultWords(resultContent).toLocaleString()}
                    </Text>
                  </div>
                )}
                {quotaUsage && (
                  <>
                    <div className="stat-item">
                      <Text type="secondary" style={{ fontSize: 12 }}>消耗额度:</Text>
                      <Text strong style={{ marginLeft: 8, color: '#f56c6c' }}>
                        -{formatNumber(quotaUsage.consumedQuota ?? quotaUsage.consumed_quota)}
                      </Text>
                    </div>
                    {(quotaUsage.remainingQuota ?? quotaUsage.remaining_quota) !== undefined && (
                      <div className="stat-item">
                        <Text type="secondary" style={{ fontSize: 12 }}>剩余额度:</Text>
                        <Text strong style={{ marginLeft: 8 }}>
                          {formatNumber(quotaUsage.remainingQuota ?? quotaUsage.remaining_quota)}
                        </Text>
                      </div>
                    )}
                  </>
                )}
                {tokenUsage && (
                  <div className="stat-item">
                    <Text type="secondary" style={{ fontSize: 12 }}>Tokens:</Text>
                    <Text strong style={{ marginLeft: 8 }}>
                      {formatTokenSummary(tokenUsage)}
                    </Text>
                  </div>
                )}
              </Space>
            </div>

            {/* 编辑器 */}
            <div className="result-editor">
              <QuillComponent
                theme="snow"
                value={editableResult}
                onChange={setEditableResult}
                placeholder={resultPlaceholder}
                style={{ height: '250px', marginBottom: 50 }}
              />
            </div>

            {/* 操作按钮 */}
            <div className="result-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              <Button onClick={handleCancel}>取消</Button>
              <Button type="primary" onClick={handleApply}>
                应用到编辑器
              </Button>
            </div>
          </>
        )}

        {/* 无结果状态 */}
        {!isLoading && !resultContent && (
          <div className="no-result">
            <Text type="secondary">{noResultText}</Text>
          </div>
        )}

        <style>{`
          .generate-result-modal {
            padding: 0;
          }

          .loading-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 250px;
            padding: 20px;
          }

          .result-stats {
            background: linear-gradient(145deg, #f0f4f8 0%, #ffffff 100%);
            border: 1px solid rgba(102, 126, 234, 0.15);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 16px;
          }

          .result-editor {
            border: 1px solid rgba(102, 126, 234, 0.1);
            border-radius: 8px;
            background: #ffffff;
          }

          .no-result {
            text-align: center;
            padding: 40px 20px;
            color: #718096;
          }

          .ql-container {
            font-family: 'Microsoft YaHei', sans-serif;
          }

          .ql-editor {
            padding: 16px !important;
            line-height: 1.8 !important;
          }

          .ql-editor.ql-blank::before {
            color: #a99d92 !important;
            font-style: normal !important;
            left: 16px !important;
          }
        `}</style>
      </div>
    </Modal>
  )
}

export default GenerateResultModal
