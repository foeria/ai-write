// 额度相关API接口
import client from './client'

// 额度信息
export interface QuotaInfo {
  total: number
  used: number
  remaining: number
  lastResetAt: string
  nextResetAt: string
}

// 使用记录
export interface UsageRecord {
  id: string
  type: 'chat' | 'generate' | 'polish' | 'expand'
  amount: number
  description: string
  createdAt: string
}

// 充值选项
export interface RechargeOption {
  id: string
  name: string
  amount: number
  price: number
  description?: string
}

// 获取额度信息
export const getQuotaInfo = async (): Promise<QuotaInfo> => {
  const response = await client.get<QuotaInfo>('/quota')
  return response.data
}

// 获取使用记录
export const getUsageRecords = async (params?: {
  page?: number
  limit?: number
  type?: string
}): Promise<{ data: UsageRecord[]; total: number }> => {
  const response = await client.get('/quota/usage', { params })
  return response.data
}

// 获取充值选项
export const getRechargeOptions = async (): Promise<RechargeOption[]> => {
  const response = await client.get<RechargeOption[]>('/quota/recharge/options')
  return response.data
}

// 发起充值
export const createRecharge = async (optionId: string): Promise<{ orderId: string; payUrl: string }> => {
  const response = await client.post('/quota/recharge', { optionId })
  return response.data
}

// 充值回调
export const verifyRecharge = async (orderId: string): Promise<QuotaInfo> => {
  const response = await client.post(`/quota/recharge/verify`, { orderId })
  return response.data
}
