// AI相关API接口
import client from './client'

// 模拟数据延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// AI对话请求
export interface AIChatRequest {
  message: string
  context?: string
  model?: string
}

// AI对话响应
export interface AIChatResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// AI生成请求
export interface AIGenerateRequest {
  prompt: string
  type: 'outline' | 'content' | 'polish' | 'expand'
  context?: string
  options?: {
    length?: number
    style?: string
    temperature?: number
  }
}

// AI生成响应
export interface AIGenerateResponse {
  content: string
  type: string
}

// 续写请求参数
export interface ContinueWriteParams {
  content: string
  context?: {
    novelId?: string
    chapterId?: string
    previousContent?: string
    nextContent?: string
  }
  options?: {
    length?: number
    style?: string
    temperature?: number
  }
}

// 扩写请求参数
export interface ExpandTextParams {
  content: string
  expandType?: 'detail' | 'emotion' | 'dialogue' | 'description'
  options?: {
    length?: number
    temperature?: number
  }
}

// 润色请求参数
export interface PolishTextParams {
  content: string
  style?: 'formal' | 'casual' | 'literary' | 'dramatic' | 'humorous'
  options?: {
    temperature?: number
  }
}

// 灵感生成请求参数
export interface GenerateInspirationParams {
  keyword: string
  type?: 'plot' | 'character' | 'scene' | 'dialogue'
  options?: {
    count?: number
  }
}

// 大纲生成请求参数
export interface GenerateOutlineParams {
  prompt: string
  genre?: string
  style?: string
  length?: 'short' | 'medium' | 'long'
}

// 角色生成请求参数
export interface GenerateCharacterParams {
  prompt: string
  role?: 'main' | 'supporting' | 'minor'
}

// 灵感响应
export interface InspirationResult {
  ideas: Array<{
    title: string
    content: string
    type: string
  }>
}

// 大纲响应
export interface OutlineResult {
  outline: Array<{
    title: string
    description?: string
    chapters?: Array<{ title: string; content?: string }>
  }>
}

// 角色响应
export interface CharacterResult {
  name: string
  age?: number
  gender?: string
  appearance?: string
  personality?: string
  background?: string
  goals?: string
  relationships?: Array<{ name: string; relation: string }>
}

// 对话接口
export const chat = async (data: AIChatRequest): Promise<AIChatResponse> => {
  const response = await client.post<AIChatResponse>('/api/ai/chat', data)
  return response.data
}

// AI对话完整接口
export const chatComplete = async (
  prompt: string,
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
    context?: string
  }
): Promise<string> => {
  // TODO: 对接真实 AI 服务后替换为真实请求
  await delay(500)

  // 返回模拟数据
  return `这是AI对"${prompt}"的回复。这是一个模拟响应，实际对接后端AI服务时会返回真实的对话内容。`
}

// 续写接口
export const continueWrite = async (
  content: string,
  context?: {
    novelId?: string
    chapterId?: string
    previousContent?: string
    nextContent?: string
  }
): Promise<string> => {
  // TODO: 对接真实 AI 服务后替换为真实请求
  await delay(800)

  // 返回模拟续写内容
  return `${content}\n\n他继续向前走着，脚步声在寂静的走廊里回响。墙上的烛火摇曳不定，将他的影子拉得忽长忽短。前方隐约传来水滴落的声音，每一下都像是敲击在心跳上的鼓点。`
}

// 扩写接口
export const expandText = async (
  content: string,
  expandType: 'detail' | 'emotion' | 'dialogue' | 'description' = 'detail'
): Promise<string> => {
  // TODO: 对接真实 AI 服务后替换为真实请求
  await delay(800)

  // 返回模拟扩写内容
  const expansions: Record<string, string> = {
    detail: `\n\n细节描写：阳光透过窗户洒落在桌面上，空气中漂浮着细小的尘埃，在光束中缓缓旋转。`,
    emotion: `\n\n情感描写：她感觉眼眶有些湿润，心中涌起一股难以言说的情绪，像是怀念，又像是惆怅。`,
    dialogue: `\n\n"你真的准备好了吗？"他轻声问道，目光中带着一丝担忧。`,
    description: `\n\n环境描写：这是一间古老的书房，四壁摆满了泛黄的书籍，空气中弥漫着纸张和墨水的香气。`,
  }

  return content + (expansions[expandType] || expansions.detail)
}

// 润色接口
export const polishText = async (
  content: string,
  style: 'formal' | 'casual' | 'literary' | 'dramatic' | 'humorous' = 'literary'
): Promise<string> => {
  // TODO: 对接真实 AI 服务后替换为真实请求
  await delay(600)

  // 返回模拟润色内容
  const polishes: Record<string, string> = {
    formal: `经审慎考虑，该内容表述如下：${content}`,
    casual: `哎呀，这么说就是：${content}`,
    literary: `岁月如梭，回首往昔：${content}`,
    dramatic: `命运弄人，世事无常！${content}`,
    humorous: `哈哈，说起来可有意思了：${content}`,
  }

  return polishes[style] || polishes.literary
}

// 灵感生成接口
export const generateInspiration = async (
  keyword: string,
  params?: {
    type?: 'plot' | 'character' | 'scene' | 'dialogue'
    count?: number
  }
): Promise<InspirationResult> => {
  // TODO: 对接真实 AI 服务后替换为真实请求
  await delay(1000)

  // 返回模拟灵感
  return {
    ideas: [
      {
        title: `${keyword}相关的故事线`,
        content: `一个关于${keyword}的悬疑故事，主角在追寻真相的过程中逐渐发现隐藏在表面之下的秘密。`,
        type: params?.type || 'plot',
      },
      {
        title: `角色构思`,
        content: `一位与${keyword}有着深厚渊源的角色，他/她的命运与这个关键词紧紧交织在一起。`,
        type: 'character',
      },
      {
        title: `场景设想`,
        content: `一个充满${keyword}元素的场景，可能是故事的关键转折点或高潮所在。`,
        type: 'scene',
      },
    ],
  }
}

// 大纲生成接口
export const generateOutline = async (params: GenerateOutlineParams): Promise<OutlineResult> => {
  // TODO: 对接真实 AI 服务后替换为真实请求
  await delay(1200)

  // 返回模拟大纲
  return {
    outline: [
      {
        title: '第一章：开篇',
        description: `${params.prompt}的故事从这里开始...`,
        chapters: [
          { title: '1.1 背景设定' },
          { title: '1.2 主角登场' },
          { title: '1.3 冲突初现' },
        ],
      },
      {
        title: '第二章：发展',
        description: '故事逐渐展开，矛盾日益加深...',
        chapters: [
          { title: '2.1 第一次转折' },
          { title: '2.2 新角色登场' },
          { title: '2.3 秘密揭露' },
        ],
      },
      {
        title: '第三章：高潮',
        description: '所有矛盾在这一刻爆发...',
        chapters: [
          { title: '3.1 最终对决' },
          { title: '3.2 真相大白' },
        ],
      },
      {
        title: '第四章：结局',
        description: '故事走向终点，人物命运尘埃落定...',
        chapters: [
          { title: '4.1 余波' },
          { title: '4.2 新的开始' },
        ],
      },
    ],
  }
}

// 角色生成接口
export const generateCharacter = async (
  prompt: string,
  params?: {
    role?: 'main' | 'supporting' | 'minor'
  }
): Promise<CharacterResult> => {
  // TODO: 对接真实 AI 服务后替换为真实请求
  await delay(1000)

  // 返回模拟角色
  return {
    name: '李明',
    age: 28,
    gender: '男',
    appearance: '身材高挑，面容清秀，留着一头利落的短发，眼神深邃而有神。',
    personality: '沉稳内敛，思维缜密，表面冷漠实则内心热情，重情重义。',
    background: '出生于一个普通的工人家庭，从小就展现出超常的智慧。经历了家庭的变故后，变得独立坚强。',
    goals: '追寻真相，揭开隐藏多年的秘密，为家人讨回公道。',
    relationships: [
      { name: '张伟', relation: '挚友' },
      { name: '林雨', relation: '恋人' },
      { name: '王强', relation: '对手' },
    ],
  }
}

// 生成内容接口
export const generate = async (data: AIGenerateRequest): Promise<AIGenerateResponse> => {
  const response = await client.post<AIGenerateResponse>('/api/ai/generate', data)
  return response.data
}

// 文润接口（使用远程API）
export const polishRemote = async (content: string, options?: { style?: string }): Promise<string> => {
  const response = await client.post<string>('/api/ai/polish', { content, ...options })
  return response.data
}

// 扩展内容接口（使用远程API）
export const expandRemote = async (content: string, options?: { length?: number }): Promise<string> => {
  const response = await client.post<string>('/api/ai/expand', { content, ...options })
  return response.data
}

// 获取可用模型列表
export const getModels = async (): Promise<Array<{ id: string; name: string; enabled: boolean }>> => {
  const response = await client.get('/api/ai/models')
  return response.data
}
