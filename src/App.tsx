import { Suspense, useEffect } from 'react'
import { ConfigProvider, theme, Spin } from 'antd'
import { useRoutes, useLocation } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import routes, { mainLayoutRoutes, fullscreenRoutes } from './router'
import { useAppStore } from '@/store/useAppStore'
import { migrateLocalStorageToSQLite } from '@/api/migration'

// 暖棕色调主题配置 - Warm Amber
const darkTheme = {
  token: {
    colorPrimary: '#c9a959',
    colorBgContainer: '#1a1612',
    colorBgElevated: '#252220',
    colorBgLayout: '#1a1612',
    colorText: '#e8e0d5',
    colorTextSecondary: '#a99d92',
    colorTextTertiary: '#6b635a',
    colorBorder: '#4a4238',
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  algorithm: theme.darkAlgorithm,
}

// 浅色主题配置
const lightTheme = {
  token: {
    colorPrimary: '#c9a959',
    colorBgContainer: '#f5f3f0',
    colorBgElevated: '#ffffff',
    colorText: '#3d3830',
    colorTextSecondary: '#6b6358',
    colorBorder: '#d4cfc8',
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  algorithm: theme.defaultAlgorithm,
}

// 全屏布局组件
function FullscreenLayout({ children }: { children: React.ReactNode }) {
  const { config } = useAppStore()
  const isDark = config.theme === 'dark'

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: isDark ? '#1a1612' : '#f5f3f0',
      overflow: 'hidden'
    }}>
      {children}
    </div>
  )
}

function App() {
  const element = useRoutes(routes)
  const location = useLocation()
  const { config, toggleTheme } = useAppStore()
  const isDark = config.theme === 'dark'

  // 启动时迁移 localStorage 数据到 SQLite
  useEffect(() => {
    migrateLocalStorageToSQLite().catch(console.error)
  }, [])

  // 判断是否是全屏页面
  const useFullscreenLayout = () => {
    const path = location.pathname
    return fullscreenRoutes.some(route => path.startsWith(route))
  }

  // Loading
  const Loading = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: isDark ? '#1a1612' : '#f5f3f0'
    }}>
      <Spin size="large" tip="加载中..." />
    </div>
  )

  return (
    <ConfigProvider theme={isDark ? darkTheme : lightTheme}>
      {useFullscreenLayout() ? (
        <Suspense fallback={<Loading />}>
          <FullscreenLayout>{element}</FullscreenLayout>
        </Suspense>
      ) : (
        <Layout isDark={isDark} onToggleTheme={toggleTheme}>
          <Suspense fallback={<Loading />}>
            {element}
          </Suspense>
        </Layout>
      )}
    </ConfigProvider>
  )
}

export default App
