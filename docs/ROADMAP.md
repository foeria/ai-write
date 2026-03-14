# 迁移路线图

## 阶段一：项目基础架构 ✅已完成

### 目标
搭建React + Tauri项目基础框架，实现基本布局和路由功能

### 完成标准
- [x] 项目目录结构创建
- [x] 配置文件（package.json, tsconfig.json, vite.config.ts）
- [x] 路由系统配置
- [x] 状态管理（Zustand）基础
- [x] API层（Axios）封装
- [x] 布局组件（Layout, Header, Sidebar）
- [x] 首页（Home/NovelOverview）

### 产出物
- `src/router/index.tsx`
- `src/store/useUserStore.ts`
- `src/api/client.ts`
- `src/components/layout/`

---

## 阶段二：核心功能迁移 ✅已完成

### 目标
迁移核心写作功能模块

#### 2.1 用户认证模块 ✅
- [x] LoginModal.tsx - 登录/注册模态框
- [x] API接口对接 (api/user.ts)
- [x] Token管理 (useUserStore)
- [ ] 权限验证 - 待完善

#### 2.2 小说工作台 ✅
- [x] NovelEditor.tsx - Markdown编辑器组件
- [x] OutlineManager.tsx - 大纲管理组件
- [x] ChapterList.tsx - 章节列表组件
- [x] 章节CRUD操作
- [x] 自动保存功能 (useAutoSave Hook)
- [x] 本地加密存储 (CryptoJS)

#### 2.3 AI写作功能 ✅
- [x] AI对话接口对接 (api/ai.ts)
- [x] AIAssistModal.tsx - AI辅助弹窗
- [ ] 文润功能 - 待API对接
- [ ] 大纲生成 - 待API对接
- [ ] 内容扩展 - 待API对接

---

## 阶段三：内容管理模块 ✅已完成

### 3.1 角色库 ✅
- [x] CharacterCard.tsx - 角色卡片组件
- [x] CharacterCreateModal.tsx - 创建角色弹窗
- [x] CharacterEditModal.tsx - 编辑角色弹窗
- [x] useCharacterStore.ts - 角色状态管理
- [ ] CharacterGenerateModal.tsx - AI生成角色（待开发）
- [ ] 角色CRUD API - 待后端对接

### 3.2 知识库 ✅
- [x] KnowledgeEditorModal.tsx - 知识编辑器弹窗
- [x] useKnowledgeStore.ts - 知识状态管理
- [ ] 分类管理 - 已有分类数据结构
- [ ] 搜索功能 - 待完善
- [ ] 知识导入导出 - 待开发

### 3.3 词条库 ✅
- [x] GlossaryCard.tsx - 词条卡片组件
- [x] GlossaryEditorModal.tsx - 词条编辑器弹窗
- [x] useGlossaryStore.ts - 词条状态管理
- [ ] 关联功能 - 待开发

### 产出物
- `src/store/useCharacterStore.ts`
- `src/pages/Characters/components/`
- `src/store/useGlossaryStore.ts`
- `src/pages/Glossary/components/`
- `src/pages/Knowledge/components/KnowledgeEditorModal.tsx`

---

## 阶段四：辅助功能 ✅已完成

### 4.1 短剧模块 ⚠️已弃用
- 用户已弃用短剧模块，不再迁移
- Drama/index.tsx 保留工作流编辑器

### 4.2 提示词库 ✅
- [x] Prompts/index.tsx - 提示词库页面
- [x] 提示词模板管理（CRUD）
- [x] 分类筛选功能
- [x] 收藏功能
- [ ] 提示词导入导出 - 待开发

### 4.3 工具库 ✅
- [x] Tools/index.tsx - 工具库页面
- [x] 工具卡片展示
- [x] 分类筛选功能
- [ ] 常用工具实现 - 待开发
- [ ] 自定义工具 - 待开发

### 4.4 阅读拆书 ✅
- [x] BookReader/index.tsx - 电子书阅读器页面
- [x] BookAnalysis/index.tsx - 拆书工具页面
- [x] 图书管理功能
- [x] 阅读进度追踪
- [ ] EPUB解析 - 待开发
- [ ] 导入功能 - 待开发

### 产出物
- `src/pages/Prompts/index.tsx`
- `src/pages/Tools/index.tsx`
- `src/pages/BookReader/index.tsx`
- `src/pages/BookAnalysis/index.tsx`

---

## 阶段五：桌面端优化

### 5.1 Tauri集成
- [ ] 主进程配置
- [ ] 窗口管理
- [ ] 系统托盘
- [ ] 快捷键配置
- [ ] 菜单栏集成

### 5.2 原生功能
- [ ] 文件系统访问
- [ ] 本地存储优化
- [ ] 剪贴板集成
- [ ] 通知系统

---

## 阶段六：测试与优化

### 6.1 测试覆盖
- [ ] 单元测试（Jest/Vitest）
- [ ] 集成测试
- [ ] E2E测试（Playwright）

### 6.2 性能优化
- [ ] 渲染优化
- [ ] 状态管理优化
- [ ] 打包体积优化
- [ ] 启动速度优化

### 6.3 代码质量
- [ ] ESLint配置
- [ ] Prettier配置
- [ ] 类型覆盖率检查

---

## 时间估算

| 阶段 | 工作量 | 预计周期 | 状态 |
|------|--------|----------|------|
| 阶段一：基础架构 | 核心 | 1-2天 | ✅ 已完成 |
| 阶段二：核心功能 | 大 | 3-5天 | ✅ 已完成 |
| 阶段三：内容管理 | 中 | 2-3天 | ✅ 已完成 |
| 阶段四：辅助功能 | 中 | 2-3天 | ✅ 已完成 |
| 阶段五：桌面优化 | 中 | 2-3天 | 待开发 |
| 阶段六：测试优化 | 小 | 1-2天 | 待开发 |

**核心迁移阶段已完成，约11-19天**

---

## 里程碑

| 里程碑 | 目标 | 验收标准 | 状态 |
|--------|------|----------|------|
| M1 | 可运行的桌面应用 | 能启动、显示首页 | ✅ 已达成 |
| M2 | 核心写作功能 | 能创建、编辑小说 | ✅ 已达成 |
| M3 | 完整功能迁移 | 所有页面迁移完成 | ✅ 已达成 |
| M4 | 生产就绪 | 测试通过，性能达标 | 待开发 |

---

## 最近更新

**2024-02-11**
- ✅ 完成角色库完整迁移（Store + 组件 + 页面）
- ✅ 完成词条库完整迁移（Store + 组件 + 页面）
- ✅ 完善知识库页面
- ✅ 完成提示词库页面
- ✅ 完成工具库页面
- ✅ 完成阅读拆书和电子书阅读页面
- ✅ 代码审查和修复所有类型错误
