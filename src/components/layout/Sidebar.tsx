import { Layout, Menu } from 'antd'
import {
  HomeOutlined,
  EditOutlined,
  ProjectOutlined,
  ReadOutlined,
  BulbOutlined,
  ToolOutlined,
  TeamOutlined,
  BookOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'

const { Sider } = Layout

interface SidebarProps {
  isDark: boolean
}

const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: '小说创作',
    title: '小说创作',
  },
  {
    key: '/workflow',
    icon: <ProjectOutlined />,
    label: '工作流管理',
    title: '工作流管理',
  },
  {
    key: '/book-analysis',
    icon: <ReadOutlined />,
    label: '阅读拆书',
    title: '阅读拆书',
  },
  {
    key: '/prompts',
    icon: <BulbOutlined />,
    label: '提示词库',
    title: '提示词库',
  },
  {
    key: '/tools',
    icon: <ToolOutlined />,
    label: '工具库',
    title: '工具库',
  },
  {
    key: '/characters',
    icon: <TeamOutlined />,
    label: '角色库',
    title: '角色库',
  },
  {
    key: '/glossary',
    icon: <BookOutlined />,
    label: '词条库',
    title: '词条库',
  },
  {
    key: '/knowledge',
    icon: <DatabaseOutlined />,
    label: '知识库',
    title: '知识库',
  },
]

function Sidebar({ isDark }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const collapsed = useAppStore((state) => state.sidebarCollapsed)

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  // 计算当前选中的菜单key，支持动态路由匹配
  const getSelectedKeys = () => {
    const path = location.pathname

    // 精确匹配首页
    if (path === '/') {
      return ['/']
    }

    // 匹配 /novel/workspace/:novelId -> /novel/workspace
    if (path.startsWith('/novel/workspace')) {
      return ['/novel/workspace']
    }

    // 匹配 /book-reader/:bookId -> /book-analysis
    if (path.startsWith('/book-reader')) {
      return ['/book-analysis']
    }

    // 其他路径精确匹配
    const matchedItem = menuItems.find(item => item.key === path)
    return matchedItem ? [path] : []
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={133}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        background: isDark ? '#1a1612' : '#f5f3f0',
        borderRight: isDark ? '1px solid #4a4238' : '1px solid #e8e0d5',
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: isDark ? '1px solid #4a4238' : '1px solid #e8e0d5',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontSize: collapsed ? 14 : 18,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #c9a959 0%, #8b6914 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap',
          }}
        >
          {collapsed ? 'AI' : 'AI写作助手'}
        </span>
      </div>

      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          background: 'transparent',
          marginTop: 8,
        }}
        theme={isDark ? 'dark' : 'light'}
      />
    </Sider>
  )
}

export default Sidebar
