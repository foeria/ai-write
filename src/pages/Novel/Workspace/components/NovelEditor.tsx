import { useState, useCallback, useEffect } from 'react'
import { Card, Button, Space, Tooltip, Dropdown, message, Modal } from 'antd'
import {
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  FontSizeOutlined,
  BoldOutlined,
  ItalicOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  RobotOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import MDEditor from '@uiw/react-md-editor'
import type { MenuProps } from 'antd'
import { debounce } from '@/utils/format'

interface NovelEditorProps {
  content: string
  onChange: (content: string) => void
  onSave?: () => void
  onAIGenerate?: () => void
  autoSave?: boolean
  autoSaveInterval?: number
  placeholder?: string
  readOnly?: boolean
}

function NovelEditor({
  content,
  onChange,
  onSave,
  onAIGenerate,
  autoSave = true,
  autoSaveInterval = 30000,
  placeholder = '开始写作...',
  readOnly = false,
}: NovelEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // 防抖保存
  const debouncedSave = useCallback(
    debounce(() => {
      if (onSave) {
        setIsSaving(true)
        setTimeout(() => {
          onSave()
          setLastSaved(new Date())
          setIsSaving(false)
          message.success('已保存')
        }, 500)
      }
    }, autoSaveInterval),
    [onSave, autoSaveInterval]
  )

  // 内容变化时触发自动保存
  useEffect(() => {
    if (autoSave && onSave) {
      debouncedSave()
    }
  }, [content, autoSave, debouncedSave, onSave])

  const handleChange = (value: string | undefined) => {
    onChange(value || '')
  }

  const handleSave = () => {
    if (onSave) {
      setIsSaving(true)
      setTimeout(() => {
        onSave()
        setLastSaved(new Date())
        setIsSaving(false)
        message.success('保存成功')
      }, 500)
    }
  }

  const toolbarItems: MenuProps['items'] = [
    {
      key: 'bold',
      icon: <BoldOutlined />,
      label: '加粗',
    },
    {
      key: 'italic',
      icon: <ItalicOutlined />,
      label: '斜体',
    },
    {
      type: 'divider',
    },
    {
      key: 'h1',
      label: '一级标题',
    },
    {
      key: 'h2',
      label: '二级标题',
    },
    {
      key: 'h3',
      label: '三级标题',
    },
    {
      type: 'divider',
    },
    {
      key: 'ul',
      icon: <UnorderedListOutlined />,
      label: '无序列表',
    },
    {
      key: 'ol',
      icon: <OrderedListOutlined />,
      label: '有序列表',
    },
  ]

  return (
    <Card
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}
      bordered={false}
    >
      {/* 工具栏 */}
      <div
        style={{
          padding: '8px 16px',
          borderBottom: '1px solid #4a4238',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#1a1612',
        }}
      >
        <Space>
          <Tooltip title="撤销">
            <Button type="text" icon={<UndoOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="重做">
            <Button type="text" icon={<RedoOutlined />} size="small" />
          </Tooltip>
        </Space>

        <Space>
          {onAIGenerate && (
            <Tooltip title="AI辅助">
              <Button
                type="primary"
                icon={<RobotOutlined />}
                size="small"
                onClick={onAIGenerate}
              >
                AI辅助
              </Button>
            </Tooltip>
          )}

          {onSave && (
            <Tooltip title="保存">
              <Button
                type="primary"
                icon={<SaveOutlined />}
                size="small"
                loading={isSaving}
                onClick={handleSave}
              >
                保存
              </Button>
            </Tooltip>
          )}

          <Tooltip title="预览">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
        </Space>
      </div>

      {/* 编辑器 */}
      <div style={{ flex: 1, overflow: 'auto' }} data-color-mode="dark">
        <MDEditor
          value={content}
          onChange={handleChange}
          placeholder={placeholder}
          preview="edit"
          height="100%"
          visibleDragbar={false}
          disabled={readOnly}
          textareaProps={{
            style: {
              fontSize: 16,
              lineHeight: 1.8,
              padding: '16px',
              minHeight: '100%',
            },
          }}
        />
      </div>

      {/* 状态栏 */}
      <div
        style={{
          padding: '4px 16px',
          borderTop: '1px solid #4a4238',
          fontSize: 12,
          color: '#a99d92',
          background: '#1a1612',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>字数: {content.length}</span>
        {lastSaved && <span>最后保存: {lastSaved.toLocaleTimeString()}</span>}
      </div>
    </Card>
  )
}

export default NovelEditor
