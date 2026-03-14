import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, theme } from 'antd'
import App from './App'
import './assets/styles/global.css'

// React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5分钟
    },
  },
})

// Ant Design 主题配置
const themeConfig = {
  token: {
    colorPrimary: '#667eea',
    colorBgContainer: '#f5f5f5',
    borderRadius: 6,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  algorithm: theme.defaultAlgorithm,
}

// 深色主题
const darkThemeConfig = {
  token: {
    colorPrimary: '#667eea',
    colorBgContainer: '#1a1a2e',
    colorBgElevated: '#2d2d44',
    colorBgLayout: '#0f0f1a',
    borderRadius: 6,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  algorithm: theme.darkAlgorithm,
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={themeConfig}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
