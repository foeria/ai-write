# 项目架构文档

## 1. 技术栈概览

| 层次 | 技术选型 | 说明 |
|------|----------|------|
| 前端框架 | React 18 + TypeScript | 组件化开发 |
| 桌面框架 | Tauri 2.0 | 轻量级桌面应用 |
| UI组件库 | Ant Design 5.x | 最受欢迎的React UI库 |
| 状态管理 | Zustand | 轻量级状态管理 |
| 路由 | React Router v6 | 声明式路由 |
| 构建工具 | Vite 5.x | 快速构建 |
| HTTP客户端 | Axios | API对接 |
| 富文本编辑器 | @uiw/react-md-editor | Markdown支持 |

## 2. 项目目录结构

```
ai-write-react/
├── public/                    # 静态资源
│   └── prompts/               # AI提示词模板
├── src/
│   ├── api/                  # API接口层
│   │   ├── client.ts         # Axios封装
│   │   ├── ai.ts             # AI相关接口
│   │   ├── user.ts           # 用户接口
│   │   ├── novel.ts          # 小说接口
│   │   ├── character.ts      # 角色接口
│   │   ├── knowledge.ts      # 知识库接口
│   │   └── ...
│   ├── assets/               # 静态资源
│   │   ├── images/           # 图片资源
│   │   └── styles/           # 全局样式
│   │       ├── global.css    # 全局样式
│   │       └── dark-theme.css # 深色主题
│   ├── components/           # 通用组件
│   │   ├── common/           # 公共组件
│   │   │   ├── Modal.tsx    # 通用模态框
│   │   │   ├── Card.tsx     # 卡片组件
│   │   │   └── Empty.tsx    # 空状态
│   │   ├── layout/          # 布局组件
│   │   │   ├── Header.tsx   # 顶部导航
│   │   │   ├── Sidebar.tsx  # 左侧菜单
│   │   │   ├── Layout.tsx   # 主布局
│   │   │   └── Breadcrumb.tsx # 面包屑
│   │   ├── modal/            # 弹窗组件
│   │   │   ├── LoginModal.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   └── ...
│   │   ├── editor/          # 编辑器组件
│   │   │   ├── NovelEditor.tsx
│   │   │   └── MarkdownEditor.tsx
│   │   ├── guide/           # 向导组件
│   │   │   ├── CreateBookStep.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── pages/               # 页面组件
│   │   ├── Home/            # 首页/小说概览
│   │   │   ├── index.tsx
│   │   │   └── components/
│   │   ├── Novel/           # 小说模块
│   │   │   ├── Workspace/   # 小说工作台
│   │   │   ├── Overview/   # 小说概览
│   │   │   └── ...
│   │   ├── Drama/           # 短剧模块
│   │   ├── Characters/      # 角色库
│   │   ├── Glossary/        # 词条库
│   │   ├── Knowledge/       # 知识库
│   │   ├── Prompts/         # 提示词库
│   │   ├── Tools/           # 工具库
│   │   ├── BookAnalysis/    # 阅读拆书
│   │   ├── BookReader/      # 电子书阅读
│   │   └── ...
│   ├── store/               # 状态管理
│   │   ├── useUserStore.ts
│   │   ├── useAppStore.ts
│   │   ├── useKnowledgeStore.ts
│   │   └── index.ts
│   ├── hooks/              # 自定义Hooks
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   └── ...
│   ├── utils/              # 工具函数
│   │   ├── request.ts      # Axios封装
│   │   ├── crypto.ts       # 加密工具
│   │   ├── format.ts       # 格式化工具
│   │   └── ...
│   ├── types/              # TypeScript类型
│   │   ├── user.ts
│   │   ├── novel.ts
│   │   ├── character.ts
│   │   └── ...
│   ├── router.tsx          # 路由配置
│   ├── App.tsx             # 根组件
│   ├── main.tsx            # 入口文件
│   └── vite-env.d.ts      # Vite类型
├── docs/                   # 文档目录
│   ├── ARCHITECTURE.md     # 架构文档
│   ├── API.md              # API接口文档
│   ├── COMPONENT_MAP.md    # 组件映射表
│   ├── DEVELOPMENT.md      # 开发指南
│   └── ROADMAP.md          # 迁移路线图
├── tauriconfig.json        # Tauri配置
├── vite.config.ts          # Vite配置
├── tsconfig.json           # TypeScript配置
├── tailwind.config.js      # Tailwind配置（可选）
├── package.json
└── README.md
```

## 3. 核心架构设计

### 3.1 布局架构

```
┌─────────────────────────────────────────┐
│              Header (顶部导航)           │  ← useUserStore
├───────┬─────────────────────────────────┤
│       │                                 │
│Sidebar│          Main Content           │  ← router-view
│(菜单) │          (页面内容)              │
│       │                                 │
│       │                                 │
└───────┴─────────────────────────────────┘
```

### 3.2 数据流架构

```
                    ┌─────────────┐
                    │   Tauri     │
                    │  Backend    │
                    └──────┬──────┘
                           │
                           ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Components │◄──►│   Stores    │◄──►│    API      │
│   (UI层)    │    │ (Zustand)   │    │ (Axios)    │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  External   │
                    │    APIs     │
                    │(AI服务等)   │
                    └─────────────┘
```

### 3.3 状态管理设计

| Store | 职责 | 持久化 |
|-------|------|--------|
| useUserStore | 用户认证信息 | localStorage |
| useAppStore | 应用全局配置（主题等） | localStorage |
| useKnowledgeStore | 知识库数据 | localStorage |
| useNovelStore | 当前编辑的小说 | 内存 |

## 4. 组件设计原则

### 4.1 组件分类

1. **布局组件** (layout/) - 页面结构
2. **通用组件** (common/) - 可复用的基础组件
3. **业务组件** (按功能模块) - 特定业务场景
4. **页面组件** (pages/) - 路由对应的页面

### 4.2 组件大小规范

- 单个组件文件不超过 **500行**
- 复杂组件拆分为子组件
- 共享逻辑提取为 **Custom Hooks**

## 5. 迁移优先级

| 优先级 | 模块 | 说明 |
|--------|------|------|
| P0 | 基础布局 | Header + Sidebar + Layout |
| P0 | 路由系统 | React Router配置 |
| P0 | API层 | Axios封装 + API接口 |
| P0 | 用户认证 | Login + Token管理 |
| P1 | 首页 | NovelOverview |
| P1 | 小说工作台 | Workspace |
| P2 | 角色库 | Characters |
| P2 | 知识库 | Knowledge |
| P3 | 短剧模块 | Drama |
| P3 | 其他模块 | Tools, Prompts等 |

## 6. 主题配置

```typescript
// 主色调：渐变紫
primaryColor: '#667eea'
secondaryColor: '#764ba2'
```
