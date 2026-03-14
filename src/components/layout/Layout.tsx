import React, { ReactNode } from 'react'
import { Layout } from 'antd'
import Header from './Header'
import Sidebar from './Sidebar'
import { useAppStore } from '@/store/useAppStore'

const { Content } = Layout

interface MainLayoutProps {
  children: ReactNode
  isDark: boolean
  onToggleTheme: () => void
}

function MainLayout({ children, isDark, onToggleTheme }: MainLayoutProps) {
  const collapsed = useAppStore((state) => state.sidebarCollapsed)

  return (
    <Layout className="main-layout" style={{ minHeight: '100vh' }}>
      <Sidebar isDark={isDark} />
      <Layout style={{ marginLeft: collapsed ? 80 : 133 }}>
        <Header isDark={isDark} onToggleTheme={onToggleTheme} />
        <Content
          style={{
            margin: '16px',
            padding: '16px',
            paddingTop: '72px',
            background: 'var(--ant-color-bg-container)',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 100px)',
          }}
        >
          <div className="animate-fadeIn">{children}</div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
