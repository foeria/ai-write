# API接口文档

## 基础配置

```typescript
// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const TIMEOUT = 120000 // 120秒
```

## Axios封装

```typescript
// src/api/client.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
client.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // 统一错误处理
    const message = error.response?.data?.message || error.message
    console.error(`[API Error] ${error.config?.url}:`, message)
    return Promise.reject(error)
  }
)

export default client
```

## API接口清单

### 用户模块 (user)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /user/login | 用户登录 |
| POST | /user/register | 用户注册 |
| POST | /user/logout | 用户登出 |
| POST | /user/send-code | 发送验证码 |
| POST | /user/reset-password | 重置密码 |
| GET | /user/profile | 获取用户信息 |
| PUT | /user/profile | 更新用户信息 |

### 小说模块 (novel)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /novels | 获取小说列表 |
| POST | /novels | 创建小说 |
| GET | /novels/:id | 获取小说详情 |
| PUT | /novels/:id | 更新小说 |
| DELETE | /novels/:id | 删除小说 |
| GET | /novels/:id/chapters | 获取章节列表 |
| POST | /novels/:id/chapters | 创建章节 |
| PUT | /novels/:id/chapters/:chapterId | 更新章节 |
| DELETE | /novels/:id/chapters/:chapterId | 删除章节 |

### AI模块 (ai)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/ai/chat | AI对话 |
| POST | /api/ai/generate | AI内容生成 |
| POST | /api/ai/polish | 文润 |
| POST | /api/ai/expand | 扩展 |
| POST | /api/ai/outline | 生成大纲 |

### 角色模块 (character)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /characters | 获取角色列表 |
| POST | /characters | 创建角色 |
| GET | /characters/:id | 获取角色详情 |
| PUT | /characters/:id | 更新角色 |
| DELETE | /characters/:id | 删除角色 |
| POST | /characters/generate | AI生成角色 |

### 知识库模块 (knowledge)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /knowledge | 获取知识列表 |
| POST | /knowledge | 创建知识 |
| GET | /knowledge/:id | 获取知识详情 |
| PUT | /knowledge/:id | 更新知识 |
| DELETE | /knowledge/:id | 删除知识 |
| GET | /knowledge/categories | 获取分类 |

### 额度模块 (quota)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /quota | 获取额度信息 |
| POST | /quota/recharge | 充值 |

### 提示词模块 (prompt)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /prompts | 获取提示词列表 |
| POST | /prompts | 创建提示词 |
| GET | /prompts/:id | 获取提示词详情 |
| PUT | /prompts/:id | 更新提示词 |
| DELETE | /prompts/:id | 删除提示词 |

---

## 响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分页响应
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
}
```

---

## 使用示例

```typescript
// api/user.ts
import client from './client'

export const login = async (data: { email: string; password: string }) => {
  const response = await client.post('/user/login', data)
  return response.data
}

export const getProfile = async () => {
  const response = await client.get('/user/profile')
  return response.data
}

// pages/Login.tsx
import { useMutation } from '@tanstack/react-query'
import { login } from '@/api/user'

const loginMutation = useMutation({
  mutationFn: login,
  onSuccess: (data) => {
    useUserStore.getState().setUserInfo(data.data)
    navigate('/')
  },
  onError: (error) => {
    message.error('登录失败')
  },
})
```
