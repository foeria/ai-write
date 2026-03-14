# CLAUDE.md

本文档为 Claude Code (claude.ai/code) 在处理此代码仓库时提供指导。

## 开发命令

```bash
# 前端开发
pnpm run dev              # 启动 Vite 开发服务器 (端口 3000)
pnpm run build            # 构建生产版本 (tsc && vite build)
pnpm run preview          # 预览生产构建
pnpm run lint             # 运行 ESLint

# 测试
pnpm run test             # 运行 Vitest 测试

# Tauri 桌面应用
pnpm run tauri:dev        # 启动 Tauri 开发模式
pnpm run tauri:build      # 构建 Tauri 生产包
```

## 项目概述

**AI写作助手** - AI 驱动的桌面写作应用，从 Vue 迁移至 React + Tauri。功能包括小说/短剧创作、人物管理、知识库和 AI 辅助写作工具。

## 技术栈

| 层级        | 技术                              |
| ----------- | --------------------------------- |
| 前端        | React 18 + TypeScript             |
| 桌面端      | Tauri 2.0 (Rust 后端)             |
| UI 库       | Ant Design 5.x                    |
| 状态管理    | Zustand                           |
| 路由        | React Router v6                   |
| 构建工具    | Vite 5.x                          |
| 富文本编辑  | React Quill, @uiw/react-md-editor |
| 数据获取    | @tanstack/react-query             |
| HTTP 客户端 | Axios                             |

## 路径别名

```typescript
@/*         → src/*
@components → src/components
@pages      → src/pages
@api        → src/api
@hooks      → src/hooks
@store      → src/store
@utils      → src/utils
@types      → src/types
```

## 核心架构

### 布局系统

两种布局类型定义在 `src/router/index.tsx`：

- **完整布局**：侧边栏 + 头部 + 内容区（默认路由）
- **全屏布局**：无侧边栏/头部（工作区路由如 `/novel/workspace/:novelId`）

使用全屏布局的路由：`/novel/workspace/:novelId`, `/drama/workspace/:dramaId`, `/book-reader/:bookId`

### 状态管理 (Zustand)

`src/store/` 目录下有三个主要 store：

- `useAppStore.ts` - 主题（深色/浅色）、侧边栏折叠、字体设置（持久化）
- `useUserStore.ts` - 用户认证、令牌、登录/注册/退出（持久化）
- `useNovelStore.ts` - 当前小说/章节、章节列表、保存/加载操作

### 主题系统

**暖琥珀色**默认主题。主题配置位置：

- `src/assets/styles/global.css` - CSS 变量
- `src/App.tsx` - Ant Design ConfigProvider 主题
- 各组件 - 带 `isDark` 检查的内联主题对象

`:root` 中的 CSS 变量：

```css
--primary-color: #c9a959;      /* 琥珀金 */
--secondary-color: #8b6914;
--bg-color: #1a1612;            /* 深棕黑色 */
--bg-secondary: #252220;
--text-color: #e8e0d5;         /* 奶白色 */
--text-secondary: #a99d92;
--border-color: #4a4238;
```

### API 层

`src/api/client.ts` - Axios 实例，具有以下特性：

- 从 useUserStore 注入 Bearer token
- 401 错误处理（重定向到登录页）
- 基础 URL 来自 `VITE_API_BASE_URL` 环境变量

API 模块：`ai.ts`, `user.ts`, `novel.ts`, `character.ts`, `knowledge.ts`, `quota.ts`

## 关键文件位置

| 功能       | 路径                             |
| ---------- | -------------------------------- |
| 路由配置   | `src/router/index.tsx`         |
| 应用根组件 | `src/App.tsx`                  |
| 入口文件   | `src/main.tsx`                 |
| 状态存储   | `src/store/*.ts`               |
| API 客户端 | `src/api/client.ts`            |
| 全局样式   | `src/assets/styles/global.css` |
| 布局组件   | `src/components/layout/`       |
| 工作区页面 | `src/pages/Novel/Workspace/`   |

## 文档

请参阅 `docs/` 文件夹：

- `ARCHITECTURE.md` - 系统架构
- `API.md` - API 接口
- `THEME.md` - 主题/颜色系统
- `COMPONENT_MAP.md` - 组件映射
- `DEVELOPMENT.md` - 开发指南

## 重要说明

1. **CSS-in-JS 使用内联样式**：组件使用带主题变量的内联样式对象，而非 CSS 模块，以实现主题感知样式
2. **深色/浅色主题切换**：组件检查 `useAppStore(state => state.config.theme === 'dark')` 并返回相应的主题对象
3. **模拟实现**：认证和部分 API 调用是模拟的 - 真正的 API 集成待实现
4. **滚动条隐藏**：全局 CSS 隐藏滚动条同时保留滚动功能 (`scrollbar-width: none`)
5. 每次完成功能的开发，需要以简洁有力的语言写入对应的文件当中，便于后续开发和已有内容的参考
