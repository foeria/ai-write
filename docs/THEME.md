# 配色方案配置

## 概述

本项目使用 TypeScript 配置文件管理配色方案，位于 `src/assets/styles/theme.ts`。

## 当前配色：暖棕色调 (Warm Amber)

特点：温暖、舒适、适合长时间写作阅读

```
主色调: #c9a959 (琥珀金)
渐变: linear-gradient(135deg, #c9a959 0%, #8b6914 100%)
背景: #1a1612 (深棕黑)
文字: #e8e0d5 (米白色)
```

## 配色配置

### 1. 主题配置文件

**路径**: `src/assets/styles/theme.ts`

包含 4 种配色方案：
- `warmAmber` - 暖棕色调 (默认)
- `emeraldGreen` - 翡翠绿色
- `mintBlue` - 薄荷蓝色
- `roseGold` - 玫瑰金色

### 2. 全局 CSS 变量

**路径**: `src/assets/styles/global.css`

```css
:root {
  --primary-color: #c9a959;
  --secondary-color: #8b6914;
  --bg-color: #1a1612;
  --bg-secondary: #252220;
  --text-color: #e8e0d5;
  --text-secondary: #a99d92;
  --border-color: #4a4238;
}
```

### 3. Ant Design 主题配置

**路径**: `src/App.tsx`

```typescript
const darkTheme = {
  token: {
    colorPrimary: '#c9a959',
    colorBgContainer: '#1a1612',
    colorBgElevated: '#252220',
    colorBgLayout: '#1a1612',
    colorText: '#e8e0d5',
    colorTextSecondary: '#a99d92',
    colorBorder: '#4a4238',
  },
  algorithm: theme.darkAlgorithm,
}
```

## 切换配色方案

### 方法 1：修改全局 CSS 变量 (推荐)

在 `src/assets/styles/global.css` 中修改 `:root` 变量：

```css
:root {
  /* 翡翠绿 */
  --primary-color: #4ade80;
  --secondary-color: #166534;
  --bg-color: #0f1f15;
  --bg-secondary: #1a2e21;
  --text-color: #e8f5e9;
  --text-secondary: #a3b8a8;
  --border-color: #2d4a35;
}
```

### 方法 2：导入不同配色方案

```typescript
import { warmAmber, emeraldGreen, mintBlue, roseGold } from '@/assets/styles/theme'

// 在组件中使用
const colors = warmAmber.colors
// 或
const colors = emeraldGreen.colors
```

### 方法 3：动态切换主题

可以通过修改 AppStore 来支持动态主题切换：

```typescript
// src/store/useAppStore.ts
interface AppState {
  config: {
    theme: 'warmAmber' | 'emeraldGreen' | 'mintBlue' | 'roseGold'
    // ...
  }
  setTheme: (theme: string) => void
}
```

## 配色方案详情

### 暖棕色调 (Warm Amber) - 默认

```
主色:     #c9a959 琥珀金
次要色:   #8b6914 深金
背景:     #1a1612 深棕黑
次级背景: #252220 棕灰
文字主:   #e8e0d5 米白
文字次:   #a99d92 柔和灰
边框:     #4a4238 深棕灰
```

### 翡翠绿色 (Emerald Green)

```
主色:     #4ade80 翠绿
次要色:   #166534 深绿
背景:     #0f1f15 深墨绿
次级背景: #1a2e21 深绿灰
文字主:   #e8f5e9 淡绿白
文字次:   #a3b8a8 灰绿
边框:     #2d4a35 森林绿
```

### 薄荷蓝色 (Mint Blue)

```
主色:     #38bdf8 天蓝
次要色:   #0369a1 深蓝
背景:     #0c1f2e 深蓝黑
次级背景: #152a3a 深蓝灰
文字主:   #e0f2fe 淡蓝白
文字次:   #94a3b8 灰蓝
边框:     #1e3a4f 海军蓝
```

### 玫瑰金色 (Rose Gold)

```
主色:     #f0abfc 粉色
次要色:   #be185d 深粉
背景:     #1a0f14 深玫黑
次级背景: #25181d 深粉灰
文字主:   #fce7f3 淡粉白
文字次:   #c9a0b0 灰粉
边框:     #3d2430 玫瑰棕
```

## 文件修改清单

修改配色时需要同步更新的文件：

- [ ] `src/assets/styles/global.css` - CSS 变量
- [ ] `src/App.tsx` - Ant Design 主题
- [ ] `src/components/layout/Sidebar.tsx` - 侧边栏
- [ ] `src/components/layout/Header.tsx` - 顶部栏
- [ ] `src/pages/Home/index.tsx` - 首页图标
- [ ] `src/pages/Home/components/NovelCard.tsx` - 小说卡片
- [ ] `src/pages/Novel/Workspace/index.tsx` - 工作台
- [ ] `src/pages/Novel/Workspace/components/AIAssistModal.tsx` - AI弹窗
- [ ] `src/pages/Novel/Workspace/components/ChapterList.tsx` - 章节列表
- [ ] `src/pages/Novel/Workspace/components/ChapterList.tsx` - 大纲管理

## 添加新配色方案

1. 在 `src/assets/styles/theme.ts` 中添加新方案
2. 更新 `src/assets/styles/global.css` 变量
3. 更新 `src/App.tsx` 主题配置
4. 同步所有组件的颜色值
