// 文本处理相关API接口

// 字数统计结果
export interface TextStatistics {
  charCount: number          // 字符数（不含空格）
  charCountWithSpaces: number // 字符数（含空格）
  wordCount: number          // 单词数（中文按字计数）
  sentenceCount: number     // 句子数
  paragraphCount: number    // 段落数
  lineCount: number         // 行数
}

// 文本摘要请求参数
export interface TextSummaryParams {
  content: string
  maxLength?: number        // 最大长度，默认 200
  minLength?: number       // 最小长度，默认 50
}

// 文本摘要结果
export interface TextSummaryResult {
  summary: string
  keywords: string[]
}

/**
 * 字数统计
 * 计算文本的各种统计信息
 */
export const countText = (text: string): TextStatistics => {
  if (!text) {
    return {
      charCount: 0,
      charCountWithSpaces: 0,
      wordCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      lineCount: 0,
    }
  }

  // 字符数（不含空格）
  const charCount = text.replace(/\s/g, '').length

  // 字符数（含空格）
  const charCountWithSpaces = text.length

  // 单词数（中文按字计数，英文按空格分词）
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []
  const englishWords = text.match(/[a-zA-Z]+/g) || []
  const wordCount = chineseChars.length + englishWords.length

  // 句子数（按常见句子结束符计数）
  const sentenceCount = (text.match(/[.!?。！？;；]+/g) || []).length || 1

  // 段落数（按空行分割）
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const paragraphCount = paragraphs.length || 1

  // 行数
  const lineCount = text.split('\n').length

  return {
    charCount,
    charCountWithSpaces,
    wordCount,
    sentenceCount,
    paragraphCount,
    lineCount,
  }
}

/**
 * 文本摘要
 * 生成文本的简短摘要
 * 注意：这是前端实现的简单摘要，实际生产环境应调用后端 AI 接口
 */
export const summarizeText = async (params: TextSummaryParams): Promise<TextSummaryResult> => {
  const { content, maxLength = 200, minLength = 50 } = params

  if (!content || content.length < minLength) {
    return {
      summary: content,
      keywords: extractKeywords(content),
    }
  }

  // 简单的提取式摘要：取前 maxLength 个字符
  // 实际生产环境应使用后端 AI 服务进行生成式摘要
  let summary = content.slice(0, maxLength)

  // 尝试在句号处截断，使句子完整
  const lastPeriodIndex = Math.max(
    summary.lastIndexOf('。'),
    summary.lastIndexOf('.'),
    summary.lastIndexOf('！'),
    summary.lastIndexOf('!'),
    summary.lastIndexOf('？'),
    summary.lastIndexOf('?')
  )

  if (lastPeriodIndex > minLength) {
    summary = summary.slice(0, lastPeriodIndex + 1)
  } else {
    summary += '...'
  }

  return {
    summary,
    keywords: extractKeywords(content),
  }
}

/**
 * 提取关键词
 * 简单的关键词提取算法
 */
const extractKeywords = (text: string): string[] => {
  if (!text) return []

  // 移除标点符号
  const cleanedText = text.replace(/[，。！？、：；""''（）【】《》,!?:"'()\[\]]/g, ' ')

  // 分词（简单按空格和中文标点分割）
  const words = cleanedText.split(/[\s,，]+/).filter(w => w.length > 1)

  // 统计词频
  const wordFreq: Record<string, number> = {}
  for (const word of words) {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  }

  // 按词频排序，取前 5 个
  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)

  return sortedWords
}

/**
 * 计算阅读时间
 * 基于平均阅读速度估算阅读时间
 */
export const estimateReadingTime = (text: string, wordsPerMinute: number = 200): number => {
  const stats = countText(text)
  const minutes = Math.ceil(stats.wordCount / wordsPerMinute)
  return minutes
}
