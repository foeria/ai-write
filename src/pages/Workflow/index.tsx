import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Button,
  Typography,
  Space,
  Input,
  Modal,
  message,
  Empty,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  ExpandOutlined,
  CompressOutlined,
  BulbOutlined,
  TeamOutlined,
  DatabaseOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  BranchesOutlined,
  DragOutlined,
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'

const { Text } = Typography

// 节点类型定义
interface Node {
  id: string
  type: string
  title: string
  x: number
  y: number
  inputs: string[]
  outputs: string[]
  config: Record<string, unknown>
}

interface Connection {
  id: string
  sourceNodeId: string
  sourceOutput: string
  targetNodeId: string
  targetInput: string
}

interface WorkflowNodeTemplate {
  type: string
  title: string
  icon: React.ReactNode
  color: string
  inputs: string[]
  outputs: string[]
  defaultConfig: Record<string, unknown>
  description?: string
}

// 节点模板
const nodeTemplates: WorkflowNodeTemplate[] = [
  {
    type: 'start',
    title: '开始',
    icon: <PlayCircleOutlined />,
    color: '#52c41a',
    inputs: [],
    outputs: ['main'],
    defaultConfig: {},
    description: '工作流起始节点',
  },
  {
    type: 'aiWriting',
    title: 'AI写作',
    icon: <ThunderboltOutlined />,
    color: '#c9a959',
    inputs: ['trigger'],
    outputs: ['result'],
    defaultConfig: { model: 'gpt-4', promptMode: 'template' },
    description: 'AI智能写作生成',
  },
  {
    type: 'expandText',
    title: '扩写',
    icon: <ExpandOutlined />,
    color: '#1890ff',
    inputs: ['trigger', 'content'],
    outputs: ['result'],
    defaultConfig: { expandType: 'plot' },
    description: '文本内容扩展',
  },
  {
    type: 'polishText',
    title: '润色',
    icon: <CompressOutlined />,
    color: '#722ed1',
    inputs: ['trigger', 'content'],
    outputs: ['result'],
    defaultConfig: { polishOptions: ['optimize'] },
    description: '文本优化润色',
  },
  {
    type: 'inspiration',
    title: '灵感',
    icon: <BulbOutlined />,
    color: '#faad14',
    inputs: ['trigger'],
    outputs: ['ideas'],
    defaultConfig: {},
    description: '获取创意灵感',
  },
  {
    type: 'condition',
    title: '条件判断',
    icon: <BranchesOutlined />,
    color: '#f5222d',
    inputs: ['trigger'],
    outputs: ['true', 'false'],
    defaultConfig: { condition: '' },
    description: '条件分支处理',
  },
  {
    type: 'character',
    title: '人物',
    icon: <TeamOutlined />,
    color: '#13c2c2',
    inputs: ['trigger'],
    outputs: ['character'],
    defaultConfig: {},
    description: '人物角色调用',
  },
  {
    type: 'knowledge',
    title: '知识库',
    icon: <DatabaseOutlined />,
    color: '#eb2f96',
    inputs: ['trigger'],
    outputs: ['result'],
    defaultConfig: {},
    description: '知识库检索',
  },
  {
    type: 'end',
    title: '结束',
    icon: <PauseCircleOutlined />,
    color: '#fa8c16',
    inputs: ['trigger'],
    outputs: [],
    defaultConfig: {},
    description: '工作流结束',
  },
]

// 获取主题样式
function useTheme() {
  const isDark = useAppStore((state) => state.config.theme === 'dark')
  return isDark
    ? {
        bg: '#1a1612',
        bgSecondary: '#252220',
        bgTertiary: '#3a3530',
        text: '#e8e0d5',
        textSecondary: '#a99d92',
        border: '#4a4238',
        primary: '#c9a959',
        gradient: 'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)',
      }
    : {
        bg: '#f5f3f0',
        bgSecondary: '#ffffff',
        bgTertiary: '#f0ede8',
        text: '#3d3830',
        textSecondary: '#6b6358',
        border: '#e8e0d5',
        primary: '#c9a959',
        gradient: 'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)',
      }
}

function Workflow() {
  const isDark = useTheme()

  // 状态管理
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; output: string } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newNodeType, setNewNodeType] = useState<string>('')
  const [workflowName, setWorkflowName] = useState('未命名工作流')

  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    nodeId: string | null
    startX: number
    startY: number
    nodeStartX: number
    nodeStartY: number
  }>({
    nodeId: null,
    startX: 0,
    startY: 0,
    nodeStartX: 0,
    nodeStartY: 0,
  })

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  // 添加节点
  const addNode = (type: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }

    const template = nodeTemplates.find((t) => t.type === type)
    if (!template) return

    const canvas = canvasRef.current
    const offsetX = canvas ? canvas.scrollLeft + 200 : 200
    const offsetY = canvas ? canvas.scrollTop + 100 : 100

    const newNode: Node = {
      id: `node_${Date.now()}`,
      type,
      title: template.title,
      x: offsetX,
      y: offsetY,
      inputs: [...template.inputs],
      outputs: [...template.outputs],
      config: { ...template.defaultConfig },
    }

    setNodes([...nodes, newNode])
    setSelectedNodeId(newNode.id)
    setModalOpen(false)
    message.success('节点已添加')
  }

  // 节点拖拽
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    dragRef.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.x,
      nodeStartY: node.y,
    }

    setSelectedNodeId(nodeId)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const { nodeId, startX, startY, nodeStartX, nodeStartY } = dragRef.current
      if (!nodeId) return

      const dx = e.clientX - startX
      const dy = e.clientY - startY

      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, x: nodeStartX + dx, y: nodeStartY + dy } : n
        )
      )
    },
    []
  )

  const handleMouseUp = useCallback(() => {
    dragRef.current = { nodeId: null, startX: 0, startY: 0, nodeStartX: 0, nodeStartY: 0 }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // 连接相关
  const handleOutputMouseDown = (e: React.MouseEvent, nodeId: string, output: string) => {
    e.stopPropagation()
    setConnectingFrom({ nodeId, output })
  }

  const handleInputMouseUp = (e: React.MouseEvent, nodeId: string, input: string) => {
    e.stopPropagation()
    if (!connectingFrom) return

    if (connectingFrom.nodeId !== nodeId) {
      const exists = connections.some(
        (c) =>
          c.sourceNodeId === connectingFrom.nodeId &&
          c.targetNodeId === nodeId &&
          c.targetInput === input
      )

      if (!exists) {
        setConnections([
          ...connections,
          {
            id: `conn_${Date.now()}`,
            sourceNodeId: connectingFrom.nodeId,
            sourceOutput: connectingFrom.output,
            targetNodeId: nodeId,
            targetInput: input,
          },
        ])
        message.success('连接已创建')
      }
    }
    setConnectingFrom(null)
  }

  const deleteConnection = (connId: string) => {
    setConnections(connections.filter((c) => c.id !== connId))
    message.success('连接已删除')
  }

  // 节点操作
  const deleteNode = () => {
    if (!selectedNodeId) return
    setNodes(nodes.filter((n) => n.id !== selectedNodeId))
    setConnections(
      connections.filter(
        (c) => c.sourceNodeId !== selectedNodeId && c.targetNodeId !== selectedNodeId
      )
    )
    setSelectedNodeId(null)
    message.success('节点已删除')
  }

  const duplicateNode = () => {
    if (!selectedNode) return
    const newNode: Node = {
      ...selectedNode,
      id: `node_${Date.now()}`,
      x: selectedNode.x + 50,
      y: selectedNode.y + 50,
    }
    setNodes([...nodes, newNode])
    setSelectedNodeId(newNode.id)
    message.success('节点已复制')
  }

  const updateNodeConfig = (key: string, value: unknown) => {
    if (!selectedNodeId) return
    setNodes((prev) =>
      prev.map((n) =>
        n.id === selectedNodeId
          ? { ...n, config: { ...n.config, [key]: value } }
          : n
      )
    )
  }

  // 工作流操作
  const saveWorkflow = () => {
    message.success('工作流已保存')
  }

  const runWorkflow = () => {
    message.loading('执行中...', 1).then(() => {
      message.success('工作流执行完成')
    })
  }

  const getNodeTemplate = (type: string) => nodeTemplates.find((t) => t.type === type)

  // 获取连接线的终点坐标
  const getConnectionPoints = (conn: Connection) => {
    const sourceNode = nodes.find((n) => n.id === conn.sourceNodeId)
    const targetNode = nodes.find((n) => n.id === conn.targetNodeId)
    if (!sourceNode || !targetNode) return null

    const sourceIdx = sourceNode.outputs.indexOf(conn.sourceOutput)
    const sourceY =
      sourceNode.y +
      60 +
      (sourceIdx + 1) * 100 / (sourceNode.outputs.length + 1)

    const targetIdx = targetNode.inputs.indexOf(conn.targetInput)
    const targetY =
      targetNode.y +
      60 +
      (targetIdx + 1) * 100 / (targetNode.inputs.length + 1)

    return {
      sourceX: sourceNode.x + 180,
      sourceY,
      targetX: targetNode.x,
      targetY,
    }
  }

  // 渲染节点
  const renderNode = (node: Node) => {
    const template = getNodeTemplate(node.type)
    if (!template) return null

    return (
      <div
        key={node.id}
        className="workflow-node"
        style={{
          left: node.x,
          top: node.y,
          backgroundColor: isDark.bgSecondary,
          borderColor:
            selectedNodeId === node.id ? isDark.primary : template.color,
        }}
        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
        onContextMenu={(e) => {
          e.preventDefault()
          setSelectedNodeId(node.id)
        }}
      >
        <div
          className="node-header"
          style={{ backgroundColor: template.color }}
        >
          <DragOutlined className="node-drag-icon" />
          <span className="node-icon">{template.icon}</span>
          <span className="node-title">{node.title}</span>
        </div>

        <div className="node-body">
          {Object.entries(node.config)
            .slice(0, 2)
            .map(([key, value]) => (
              <div key={key} className="node-config-item">
                <Text
                  style={{ color: isDark.textSecondary, fontSize: 10 }}
                >
                  {key}:
                </Text>
                <Text style={{ color: isDark.text, fontSize: 10 }}>
                  {String(value)}
                </Text>
              </div>
            ))}
        </div>

        {/* 输入端口 */}
        <div className="node-ports inputs">
          {node.inputs.map((input, idx) => (
            <div
              key={input}
              className="port input-port"
              style={{
                top: `${((idx + 1) * 100) / (node.inputs.length + 1)}%`,
              }}
              onMouseUp={(e) => handleInputMouseUp(e, node.id, input)}
            >
              <div
                className="port-dot"
                style={{ backgroundColor: isDark.primary }}
              />
              <span className="port-label">{input}</span>
            </div>
          ))}
        </div>

        {/* 输出端口 */}
        <div className="node-ports outputs">
          {node.outputs.map((output, idx) => (
            <div
              key={output}
              className="port output-port"
              style={{
                top: `${((idx + 1) * 100) / (node.outputs.length + 1)}%`,
              }}
              onMouseDown={(e) => handleOutputMouseDown(e, node.id, output)}
            >
              <div
                className="port-dot"
                style={{ backgroundColor: isDark.primary }}
              />
              <span className="port-label">{output}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 渲染连线
  const renderConnections = () => {
    return connections.map((conn) => {
      const points = getConnectionPoints(conn)
      if (!points) return null

      const { sourceX, sourceY, targetX, targetY } = points
      const pathD = `M ${sourceX} ${sourceY} C ${sourceX + 100} ${sourceY}, ${targetX - 100} ${targetY}, ${targetX} ${targetY}`

      return (
        <g key={conn.id}>
          <path
            d={pathD}
            stroke={isDark.primary}
            strokeWidth={2}
            fill="none"
            className="connection-path"
            onClick={() => deleteConnection(conn.id)}
          />
          <circle cx={sourceX} cy={sourceY} r={4} fill={isDark.primary} />
        </g>
      )
    })
  }

  // 渲染节点属性面板
  const renderPropertiesPanel = () => {
    if (!selectedNode) {
      return (
        <div className="properties-empty">
          <Empty description="选择一个节点" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )
    }

    const template = getNodeTemplate(selectedNode.type)

    return (
      <div className="properties-content">
        <div className="properties-header">
          <Text strong style={{ color: isDark.text, fontSize: 14 }}>
            节点属性
          </Text>
          <Text style={{ color: isDark.textSecondary, fontSize: 12 }}>
            {template?.title}
          </Text>
        </div>

        <div className="properties-form">
          <div className="form-item">
            <Text style={{ color: isDark.textSecondary, fontSize: 12 }}>
              节点名称
            </Text>
            <Input
              size="small"
              value={selectedNode.title}
              onChange={(e) => {
                setNodes((prev) =>
                  prev.map((n) =>
                    n.id === selectedNode.id
                      ? { ...n, title: e.target.value }
                      : n
                  )
                )
              }}
              style={{
                marginTop: 4,
                backgroundColor: isDark.bg,
                borderColor: isDark.border,
              }}
            />
          </div>

          {Object.entries(selectedNode.config).map(([key, value]) => (
            <div key={key} className="form-item">
              <Text style={{ color: isDark.textSecondary, fontSize: 12 }}>
                {key}
              </Text>
              <Input
                size="small"
                value={String(value)}
                onChange={(e) => updateNodeConfig(key, e.target.value)}
                style={{
                  marginTop: 4,
                  backgroundColor: isDark.bg,
                  borderColor: isDark.border,
                }}
              />
            </div>
          ))}

          <div className="node-actions">
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={duplicateNode}
              style={{ color: isDark.textSecondary }}
            >
              复制
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={deleteNode}
            >
              删除
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="workflow-page" style={{ backgroundColor: isDark.bg }}>
      {/* 顶部工具栏 */}
      <div
        className="workflow-toolbar"
        style={{
          backgroundColor: isDark.bgSecondary,
          borderBottom: `1px solid ${isDark.border}`,
        }}
      >
        <div className="toolbar-left">
          <Button type="text" href="/" style={{ color: isDark.textSecondary }}>
            返回
          </Button>
          <div className="toolbar-divider" />
          <input
            type="text"
            className="workflow-name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            style={{
              background: 'transparent',
              color: isDark.text,
              border: 'none',
              fontSize: 16,
              fontWeight: 600,
              outline: 'none',
            }}
          />
        </div>

        <div className="toolbar-center">
          <Space>
            <Tooltip title="撤销">
              <Button type="text" icon={<UndoOutlined />} style={{ color: isDark.textSecondary }} />
            </Tooltip>
            <Tooltip title="重做">
              <Button type="text" icon={<RedoOutlined />} style={{ color: isDark.textSecondary }} />
            </Tooltip>
            <div className="toolbar-divider" />
            <Tooltip title="放大">
              <Button type="text" icon={<ZoomInOutlined />} style={{ color: isDark.textSecondary }} />
            </Tooltip>
            <Tooltip title="缩小">
              <Button type="text" icon={<ZoomOutOutlined />} style={{ color: isDark.textSecondary }} />
            </Tooltip>
            <Tooltip title="全屏">
              <Button type="text" icon={<FullscreenOutlined />} style={{ color: isDark.textSecondary }} />
            </Tooltip>
          </Space>
        </div>

        <div className="toolbar-right">
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={saveWorkflow}
              style={{ color: isDark.textSecondary }}
            >
              保存
            </Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={runWorkflow}
              style={{ background: isDark.gradient, border: 'none' }}
            >
              执行
            </Button>
          </Space>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="workflow-main">
        {/* 左侧节点库面板 */}
        <div
          className="node-panel"
          style={{
            backgroundColor: isDark.bgSecondary,
            borderRight: `1px solid ${isDark.border}`,
          }}
        >
          <div className="panel-header">
            <Text strong style={{ color: isDark.text }}>
              节点库
            </Text>
            <Tooltip title="点击节点添加到画布">
              <QuestionCircleOutlined style={{ color: isDark.textSecondary }} />
            </Tooltip>
          </div>

          <div className="node-list">
            {nodeTemplates.map((template) => (
              <div
                key={template.type}
                className="node-template"
                onClick={() => {
                  setNewNodeType(template.type)
                  setModalOpen(true)
                }}
              >
                <span className="template-icon" style={{ color: template.color }}>
                  {template.icon}
                </span>
                <div className="template-info">
                  <span className="template-title" style={{ color: isDark.text }}>
                    {template.title}
                  </span>
                  <span
                    className="template-desc"
                    style={{ color: isDark.textSecondary }}
                  >
                    {template.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 中央画布 */}
        <div className="canvas-wrapper" ref={canvasRef}>
          <div
            className="canvas"
            style={{
              backgroundImage: `radial-gradient(circle, ${
                isDark ? '#4a4238' : '#e8e0d5'
              } 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          >
            <svg className="connections-layer">{renderConnections()}</svg>

            {/* 连接提示 */}
            {connectingFrom && (
              <div className="connecting-hint">
                点击目标节点的输入端口完成连接
              </div>
            )}

            {/* 节点渲染 */}
            {nodes.map(renderNode)}

            {/* 空状态 */}
            {nodes.length === 0 && (
              <div className="canvas-empty">
                <Empty
                  description="从左侧节点库添加节点开始构建工作流"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => addNode('start')}
                  style={{ background: isDark.gradient, border: 'none', marginTop: 16 }}
                >
                  添加开始节点
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 右侧属性面板 */}
        <div
          className="properties-panel"
          style={{
            backgroundColor: isDark.bgSecondary,
            borderLeft: `1px solid ${isDark.border}`,
          }}
        >
          {renderPropertiesPanel()}
        </div>
      </div>

      {/* 添加节点弹窗 */}
      <Modal
        title="添加节点"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={400}
      >
        <div className="add-node-modal">
          {nodeTemplates.map((template) => (
            <div
              key={template.type}
              className={`template-option ${
                newNodeType === template.type ? 'selected' : ''
              }`}
              onClick={() => setNewNodeType(template.type)}
              style={{
                borderColor:
                  newNodeType === template.type
                    ? isDark.primary
                    : isDark.border,
                backgroundColor:
                  newNodeType === template.type
                    ? 'rgba(201, 169, 89, 0.1)'
                    : 'transparent',
              }}
            >
              <span style={{ color: template.color }}>{template.icon}</span>
              <span style={{ color: isDark.text }}>{template.title}</span>
            </div>
          ))}
          <Button
            type="primary"
            block
            onClick={() => newNodeType && addNode(newNodeType)}
            style={{
              background: isDark.gradient,
              border: 'none',
              marginTop: 16,
            }}
          >
            添加节点
          </Button>
        </div>
      </Modal>

      {/* 全局样式 */}
      <style>{`
        .workflow-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          overflow: hidden;
        }

        /* 顶部工具栏 */
        .workflow-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          height: 52px;
          flex-shrink: 0;
        }

        .toolbar-left,
        .toolbar-center,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background-color: ${isDark.border};
          margin: 0 8px;
        }

        .workflow-name {
          min-width: 150px;
          max-width: 250px;
        }

        /* 主要内容区域 */
        .workflow-main {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* 左侧节点面板 */
        .node-panel {
          width: 220px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid ${isDark.border};
        }

        .node-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .node-template {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 6px;
          cursor: pointer;
          border: 1px solid ${isDark.border};
          margin-bottom: 4px;
          transition: all 0.2s;
        }

        .node-template:hover {
          background-color: rgba(201, 169, 89, 0.08);
          border-color: ${isDark.primary};
        }

        .template-icon {
          font-size: 18px;
        }

        .template-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .template-title {
          font-size: 13px;
          font-weight: 500;
        }

        .template-desc {
          font-size: 11px;
        }

        /* 中央画布 */
        .canvas-wrapper {
          flex: 1;
          overflow: auto;
          position: relative;
        }

        .canvas {
          min-width: 2000px;
          min-height: 1500px;
          position: relative;
        }

        .connections-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .connection-path {
          cursor: pointer;
          transition: stroke-width 0.2s;
        }

        .connection-path:hover {
          stroke-width: 3;
        }

        .connecting-hint {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: ${isDark.bgSecondary};
          padding: 8px 16px;
          border-radius: 4px;
          border: 1px solid ${isDark.primary};
          color: ${isDark.text};
          font-size: 12px;
          z-index: 100;
        }

        .canvas-empty {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        /* 节点样式 */
        .workflow-node {
          position: absolute;
          width: 180px;
          border: 2px solid;
          border-radius: 8px;
          cursor: move;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: box-shadow 0.2s, border-color 0.2s;
          user-select: none;
        }

        .workflow-node:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .node-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 6px 6px 0 0;
          font-size: 12px;
          font-weight: 500;
        }

        .node-drag-icon {
          color: rgba(255, 255, 255, 0.5);
          cursor: grab;
        }

        .node-drag-icon:active {
          cursor: grabbing;
        }

        .node-icon {
          font-size: 14px;
          color: #fff;
        }

        .node-title {
          color: #fff;
        }

        .node-body {
          padding: 8px 12px;
          min-height: 40px;
        }

        .node-config-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        /* 端口样式 */
        .node-ports {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 20px;
        }

        .node-ports.inputs {
          left: -10px;
        }

        .node-ports.outputs {
          right: -10px;
        }

        .port {
          position: absolute;
          display: flex;
          align-items: center;
          transform: translateY(-50%);
          cursor: pointer;
        }

        .port-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid ${isDark.bgSecondary};
          transition: transform 0.2s;
        }

        .port:hover .port-dot {
          transform: scale(1.3);
        }

        .port-label {
          font-size: 10px;
          color: ${isDark.textSecondary};
          white-space: nowrap;
        }

        .inputs .port {
          left: 0;
        }

        .outputs .port {
          right: 0;
          flex-direction: row-reverse;
        }

        .outputs .port-label {
          margin-right: 8px;
        }

        /* 右侧属性面板 */
        .properties-panel {
          width: 280px;
          flex-shrink: 0;
          padding: 16px;
          overflow-y: auto;
        }

        .properties-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .properties-header {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .properties-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-item {
          display: flex;
          flex-direction: column;
        }

        .node-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        /* 添加节点弹窗 */
        .add-node-modal {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 400px;
          overflow-y: auto;
        }

        .template-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: 1px solid ${isDark.border};
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .template-option:hover {
          border-color: ${isDark.primary} !important;
        }
      `}</style>
    </div>
  )
}

export default Workflow
