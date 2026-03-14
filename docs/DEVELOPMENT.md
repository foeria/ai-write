# 开发指南

## 环境要求

- Node.js >= 18
- npm >= 9 或 pnpm >= 8
- Rust >= 1.70 (Tauri开发需要)

## 开发环境搭建

### 1. 安装依赖

```bash
# 使用pnpm（推荐）
pnpm install

# 或使用npm
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
# API地址
VITE_API_BASE_URL=http://localhost:8080

# AI API密钥（如需要）
VITE_OPENAI_API_KEY=your-api-key
VITE_GEMINI_API_KEY=your-api-key
```

### 3. 启动开发服务器

```bash
# 启动React开发服务器
pnpm dev

# 或启动Tauri开发版本
pnpm tauri:dev
```

## 项目规范

### 命名规范

#### 文件命名
- 组件文件：`PascalCase.tsx` (如 `UserProfile.tsx`)
- 样式文件：`kebab-case.css` (如 `button-styles.css`)
- 工具文件：`camelCase.ts` (如 `formatDate.ts`)
- 测试文件：`*.test.ts` 或 `*.spec.ts`

#### 变量命名
- 组件状态：`camelCase` (如 `userName`, `isLoading`)
- 常量：`UPPER_SNAKE_CASE` (如 `MAX_FILE_SIZE`)
- 类型/接口：`PascalCase` (如 `UserInfo`, `ApiResponse`)

### 组件规范

#### Props类型定义
```typescript
// ✅ 推荐
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
  disabled?: boolean
}

// ❌ 避免
interface ButtonProps {
  v?: string  // 使用完整命名
  s?: string
  click?: () => void
}
```

#### 组件导出
```typescript
// ✅ 推荐：命名的导出
export function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>
}

// 或
export const UserCard = ({ user }: UserCardProps) => {
  return <div>{user.name}</div>
}

// ❌ 避免：默认导出匿名组件
export default ({ user }) => <div>{user.name}</div>
```

### 状态管理

#### Zustand使用
```typescript
// ✅ 推荐
import { create } from 'zustand'

interface UserState {
  userInfo: UserInfo | null
  setUserInfo: (user: UserInfo | null) => void
}

export const useUserStore = create<UserState>((set) => ({
  userInfo: null,
  setUserInfo: (user) => set({ userInfo: user }),
}))

// ❌ 避免直接修改状态
const handleLogin = () => {
  store.userInfo = user // ❌
  set({ userInfo: user }) // ✅
}
```

#### 持久化
```typescript
import { persist, createJSONStorage } from 'zustand/middleware'

export const useUserStore = create(
  persist(
    (set) => ({
      userInfo: null,
      token: null,
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

### API调用

#### 使用TanStack Query（推荐）
```typescript
import { useQuery, useMutation } from '@tanstack/react-query'

// 查询
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => fetchUsers(),
})

// 变更
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})
```

### 样式规范

#### 使用Ant Design
```typescript
import { Button, Card, Space } from 'antd'

// ✅ 推荐：使用Ant Design组件
<Button type="primary">保存</Button>
<Card title="用户信息">{content}</Card>

// ❌ 避免：直接写大量CSS
<button style={{ background: '#667eea' }}>保存</button>
```

#### 深色主题
```typescript
import { theme } from 'antd'

const { darkAlgorithm } = theme

const themeConfig = {
  token: {
    colorPrimary: '#667eea',
    colorBgContainer: '#1a1a2e',
  },
  algorithm: darkAlgorithm,
}
```

### Git提交规范

```
feat: 新功能
fix: 修复bug
refactor: 重构
docs: 文档更新
style: 代码格式（不影响功能）
chore: 构建配置
perf: 性能优化
test: 测试相关
```

示例：
```
feat(user): 添加用户登录功能
fix(editor): 修复编辑器自动保存问题
docs(readme): 更新安装说明
```

## 目录说明

```
src/
├── api/         # API接口定义
├── assets/      # 静态资源
├── components/  # React组件
├── hooks/       # 自定义Hooks
├── pages/       # 页面组件
├── store/       # Zustand状态
├── types/       # TypeScript类型
└── utils/       # 工具函数
```

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 类型检查
pnpm type-check
```

## 调试技巧

### 1. React DevTools
安装浏览器扩展：React DevTools

### 2. Zustand DevTools
```typescript
import { devtools } from 'zustand/middleware'

export const useStore = create(
  devtools((set) => ({
    // ...
  }))
)
```

### 3. 网络请求
使用浏览器开发者工具的Network面板查看API请求
