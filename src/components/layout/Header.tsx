import {
  Layout,
  Button,
  Space,
  Dropdown,
  Avatar,
  Badge,
  Modal,
  message,
  Tooltip,
} from 'antd'
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  WalletOutlined,
  QuestionCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/useUserStore'
import { useAppStore } from '@/store/useAppStore'
import { useState } from 'react'
import LoginModal from '@/components/modal/LoginModal'

interface HeaderProps {
  isDark: boolean
  onToggleTheme: () => void
}

function Header({ isDark, onToggleTheme }: HeaderProps) {
  const navigate = useNavigate()
  const userInfo = useUserStore((state) => state.userInfo)
  const logout = useUserStore((state) => state.logout)
  const isAuthenticated = useUserStore((state) => !!state.token)
  const { toggleSidebar, sidebarCollapsed } = useAppStore()
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        logout()
        message.success('已退出登录')
      },
    })
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <>
      <Layout.Header
        style={{
          padding: '0 24px',
          background: isDark ? '#1a1612' : '#f5f3f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isDark ? '1px solid #4a4238' : '1px solid #e8e0d5',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 100,
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      >
        <Space>
          <Button
            type="default"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{
              fontSize: 16,
              background: isDark ? '#252220' : '#ffffff',
              borderColor: isDark ? '#4a4238' : '#d4cfc8',
              color: isDark ? '#e8e0d5' : '#3d3830',
            }}
          />
        </Space>

        <Space size="middle">
          {/* 额度显示 */}
          {isAuthenticated && userInfo && (
            <Button
              type="default"
              icon={<WalletOutlined />}
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: isDark ? '#252220' : '#ffffff',
                borderColor: isDark ? '#4a4238' : '#d4cfc8',
                color: isDark ? '#e8e0d5' : '#3d3830',
              }}
            >
              额度: {userInfo.quota.toLocaleString()}
            </Button>
          )}

          {/* 主题切换 */}
          <Button
            type="default"
            icon={<BulbOutlined />}
            onClick={onToggleTheme}
            title={isDark ? '切换到亮色模式' : '切换到深色模式'}
            style={{
              background: isDark ? '#252220' : '#ffffff',
              borderColor: isDark ? '#4a4238' : '#d4cfc8',
              color: isDark ? '#c9a959' : '#8b6914',
            }}
          />

          {/* 帮助 */}
          <Tooltip title="教程">
            <Button
              type="default"
              icon={<QuestionCircleOutlined />}
              style={{
                background: isDark ? '#252220' : '#ffffff',
                borderColor: isDark ? '#4a4238' : '#d4cfc8',
                color: isDark ? '#e8e0d5' : '#3d3830',
              }}
            />
          </Tooltip>

          {/* 通知 */}
          <Badge count={3} size="small">
            <Button
              type="default"
              icon={<BellOutlined />}
              style={{
                background: isDark ? '#252220' : '#ffffff',
                borderColor: isDark ? '#4a4238' : '#d4cfc8',
                color: isDark ? '#e8e0d5' : '#3d3830',
              }}
            />
          </Badge>

          {/* 用户菜单 */}
          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size="small"
                  src={userInfo?.avatar}
                  icon={!userInfo?.avatar && <UserOutlined />}
                />
                <span>{userInfo?.nickname || userInfo?.email}</span>
              </Space>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => setLoginModalOpen(true)}>
              登录
            </Button>
          )}
        </Space>
      </Layout.Header>

      <LoginModal open={loginModalOpen} onCancel={() => setLoginModalOpen(false)} />
    </>
  )
}

export default Header
