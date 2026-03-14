# AI写作助手 (React + Tauri)

基于 React 18 + TypeScript + Tauri 构建的 AI 写作桌面应用。

## 功能特性

- **小说创作**：完整的小说创作工作台，支持大纲管理、章节编辑
- **短剧创作**：专业的短剧创作工具
- **知识库**：管理作品相关的世界观、角色、设定等知识
- **角色库**：创建和管理角色卡片
- **AI辅助**：集成多种 AI 模型，辅助创作
- **本地存储**：数据本地加密存储

## 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| UI组件库 | Ant Design 5.x |
| 状态管理 | Zustand |
| 路由 | React Router v6 |
| 桌面框架 | Tauri 2.0 |
| 构建工具 | Vite 5.x |
| HTTP客户端 | Axios |
| 富文本编辑 | @uiw/react-md-editor |

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9 或 pnpm >= 8
- Rust >= 1.70 (Tauri 开发需要)

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置 API 地址和 AI 密钥。

### 开发模式

```bash
# 启动 React 开发服务器
pnpm dev

# 或启动 Tauri 桌面开发版本
pnpm tauri:dev
```

### 构建发布

```bash
# 构建前端
pnpm build

# 构建 Tauri 应用
pnpm tauri:build
```

## 项目结构

```
src/
├── api/           # API 接口层
├── assets/        # 静态资源
├── components/    # React 组件
│   ├── common/    # 公共组件
│   ├── layout/    # 布局组件
│   └── modal/     # 弹窗组件
├── hooks/         # 自定义 Hooks
├── pages/         # 页面组件
├── store/         # Zustand 状态管理
├── types/         # TypeScript 类型定义
└── utils/         # 工具函数
```

## 文档

- [架构文档](docs/ARCHITECTURE.md)
- [API接口文档](docs/API.md)
- [组件映射表](docs/COMPONENT_MAP.md)
- [开发指南](docs/DEVELOPMENT.md)
- [迁移路线图](docs/ROADMAP.md)

## 从 Vue 迁移

本项目由 `vue-ai-text-web` (Vue 3) 迁移而来，详细迁移说明请参考 [ROADMAP.md](docs/ROADMAP.md)。

## License

MIT
