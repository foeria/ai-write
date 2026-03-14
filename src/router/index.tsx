import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

// 页面组件懒加载
const Home = lazy(() => import('@/pages/Home'))
const NovelWorkspace = lazy(() => import('@/pages/Novel/Workspace'))
const Characters = lazy(() => import('@/pages/Characters'))
const Glossary = lazy(() => import('@/pages/Glossary'))
const Knowledge = lazy(() => import('@/pages/Knowledge'))
const Prompts = lazy(() => import('@/pages/Prompts'))
const Tools = lazy(() => import('@/pages/Tools'))
const BookAnalysis = lazy(() => import('@/pages/BookAnalysis'))
const BookReader = lazy(() => import('@/pages/BookReader'))
const Workflow = lazy(() => import('@/pages/Workflow'))

// 需要侧边栏和顶部菜单的路由
const mainLayoutRoutes = ['/', '/workflow', '/characters', '/glossary', '/knowledge', '/prompts', '/tools', '/book-analysis']

// 需要全屏的路由（工作台）
const fullscreenRoutes = ['/novel/workspace', '/book-reader']

// 路由配置
const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/novel/workspace/:novelId',
    element: <NovelWorkspace />,
  },
  {
    path: '/workflow',
    element: <Workflow />,
  },
  {
    path: '/characters',
    element: <Characters />,
  },
  {
    path: '/glossary',
    element: <Glossary />,
  },
  {
    path: '/knowledge',
    element: <Knowledge />,
  },
  {
    path: '/prompts',
    element: <Prompts />,
  },
  {
    path: '/tools',
    element: <Tools />,
  },
  {
    path: '/book-analysis',
    element: <BookAnalysis />,
  },
  {
    path: '/book-reader/:bookId',
    element: <BookReader />,
  },
]

// 路由配置导出
export { routes, mainLayoutRoutes, fullscreenRoutes }
export default routes
