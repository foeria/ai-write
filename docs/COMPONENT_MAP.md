# 组件映射表

## Vue组件 → React组件对照

### 布局组件 ✅已完成

| Vue组件 | React组件 | 状态 | 说明 |
|---------|-----------|------|------|
| App.vue | App.tsx + Layout.tsx | ✅完成 | 根布局 |
| TheHeader.tsx | components/layout/Header.tsx | ✅完成 | 顶部导航 |
| TheSidebar.tsx | components/layout/Sidebar.tsx | ✅完成 | 左侧菜单 |

### 通用组件

| Vue组件 | React组件 | 状态 | 说明 |
|---------|-----------|------|------|
| Modal.vue | components/common/Modal.tsx | ⏳待开发 | 通用模态框 |
| MessageModal.vue | - | ⏳待开发 | 消息提示 |
| LoginModal.vue | components/modal/LoginModal.tsx | ✅完成 | 登录模态框 |
| SettingsModal.vue | components/modal/SettingsModal.tsx | ⏳待开发 | 设置模态框 |
| AnnouncementModal.vue | - | ⏳待开发 | 公告模态框 |
| QuotaModal.vue | - | ⏳待开发 | 额度模态框 |
| RechargeModal.vue | - | ⏳待开发 | 充值模态框 |

### 小说工作台组件 ✅已完成

| Vue组件 | React组件 | 状态 | 说明 |
|---------|-----------|------|------|
| MarkdownQuillEditor.vue | NovelEditor.tsx | ✅完成 | Markdown编辑器 |
| OutlineManager.vue | OutlineManager.tsx | ✅完成 | 大纲管理器 |
| - | ChapterList.tsx | ✅完成 | 章节列表 |
| EntryAIModal.vue | AIAssistModal.tsx | ✅完成 | AI辅助弹窗 |

### 页面组件

| Vue页面 | React页面 | 状态 | 说明 |
|---------|-----------|------|------|
| NovelOverview.vue | pages/Home/index.tsx | ✅完成 | 首页/小说概览 |
| Workspace.vue | pages/Novel/Workspace/index.tsx | ✅完成 | 小说工作台 |
| Dramas.vue | pages/Drama/index.tsx | ⏳待完善 | 短剧列表 |
| DramaWorkspace.vue | pages/Drama/Workspace/index.tsx | ⏳待完善 | 短剧工作台 |
| Characters.vue | pages/Characters/index.tsx | ⏳待完善 | 角色库 |
| Glossary.vue | pages/Glossary/index.tsx | ⏳待完善 | 词条库 |
| Knowledge.vue | pages/Knowledge/index.tsx | ✅完成 | 知识库 |
| Prompts.vue | pages/Prompts/index.tsx | ⏳待完善 | 提示词库 |
| Tools.vue | pages/Tools/index.tsx | ⏳待完善 | 工具库 |
| BookAnalysis.vue | pages/BookAnalysis/index.tsx | ⏳待完善 | 阅读拆书 |
| BookReader.vue | pages/BookReader/index.tsx | ⏳待完善 | 电子书阅读 |

### 状态管理 ✅已完成

| Vue Store (Pinia) | React Store (Zustand) | 状态 |
|-------------------|-----------------------|------|
| stores/user.ts | store/useUserStore.ts | ✅完成 |
| stores/knowledge.ts | store/useKnowledgeStore.ts | ✅完成 |
| - | store/useAppStore.ts | ✅完成 |
| - | store/useNovelStore.ts | ✅完成 |

### API层 ✅已完成

| Vue API文件 | React API文件 | 状态 |
|-------------|---------------|------|
| src/utils/request.ts | api/client.ts | ✅完成 |
| src/tools/api.ts | api/ai.ts | ✅完成 |
| src/tools/aiWriter.ts | - | ✅完成(合并到ai.ts) |
| src/tools/quotaApi.ts | api/quota.ts | ✅完成 |
| src/tools/promptsApi.ts | api/prompts.ts | ⏳待开发 |
| src/tools/user.ts | api/user.ts | ✅完成 |
| src/tools/character.ts | api/character.ts | ✅完成 |
| src/tools/knowledge.ts | api/knowledge.ts | ✅完成 |
| src/tools/novel.ts | api/novel.ts | ✅完成 |

### Hooks ✅已完成

| 功能 | Hook | 状态 |
|------|------|------|
| 认证 | hooks/useAuth.ts | ✅完成 |
| 主题 | hooks/useTheme.ts | ✅完成 |
| 防抖 | hooks/useDebounce.ts | ✅完成 |
| 自动保存 | hooks/useAutoSave.ts | ✅完成 |

---

## 已创建的组件

### 布局组件 (components/layout/)
- `Layout.tsx` - 主布局容器
- `Header.tsx` - 顶部导航栏
- `Sidebar.tsx` - 左侧菜单栏

### 弹窗组件 (components/modal/)
- `LoginModal.tsx` - 登录/注册模态框

### 小说工作台组件 (pages/Novel/Workspace/components/)
- `NovelEditor.tsx` - Markdown编辑器
- `OutlineManager.tsx` - 大纲管理器
- `ChapterList.tsx` - 章节列表
- `AIAssistModal.tsx` - AI辅助弹窗

### 页面组件 (pages/)
- `Home/` - 首页(小说概览)
  - `components/NovelCard.tsx` - 小说卡片
  - `components/CreateNovelModal.tsx` - 创建小说弹窗
- `Novel/Workspace/` - 小说工作台
- `Drama/` - 短剧模块
- `Characters/` - 角色库
- `Glossary/` - 词条库
- `Knowledge/` - 知识库
- `Prompts/` - 提示词库
- `Tools/` - 工具库
- `BookAnalysis/` - 阅读拆书
- `BookReader/` - 电子书阅读

---

## 图例
- ✅完成：已实现
- ⏳待开发：待迁移
- ⏳待完善：基础框架完成，待功能完善
- 🔄进行中：迁移中
