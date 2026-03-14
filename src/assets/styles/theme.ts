/**
 * AI写作助手 - 配色方案配置
 *
 * 推荐配色方案：暖棕色调 (Warm Amber)
 * 特点：温暖、舒适、适合长时间写作阅读
 *
 * 其他可选方案：
 * - 翡翠绿 (Emerald Green): 清新生机
 * - 薄荷蓝 (Mint Blue): 清新冷静
 * - 玫瑰金 (Rose Gold): 优雅精致
 */

// 暖棕色调 (Warm Amber) - 推荐用于写作应用
export const warmAmber = {
  name: 'warmAmber',
  description: '温暖舒适的棕色调，适合长时间写作阅读',
  colors: {
    // 主色系
    primary: '#c9a959',        // 琥珀金
    primaryHover: '#d4b36a',
    primaryLight: '#e8d5a3',

    // 渐变
    gradientStart: '#c9a959',
    gradientEnd: '#8b6914',

    // 深色背景
    bg: '#1a1612',            // 深棕黑
    bgSecondary: '#252220',    // 次级深棕
    bgTertiary: '#3a3530',    // 三级棕灰

    // 文字颜色
    text: '#e8e0d5',          // 米白色
    textSecondary: '#a99d92', // 柔和灰
    textMuted: '#6b635a',

    // 边框
    border: '#4a4238',
    borderLight: '#5c5348',

    // 强调色
    accent: '#e6b855',        // 金色
    success: '#7a9e6e',       // 柔和绿
    warning: '#d4a84b',        // 柔和橙
    error: '#c45c5c',          // 柔和红
    info: '#6b8e9f',           // 柔和蓝灰

    // 特定用途
    headerBg: 'linear-gradient(135deg, #2d2620 0%, #1a1612 100%)',
    sidebarBg: '#1f1c18',
    cardBg: '#252220',
    hoverBg: '#3a3530',
  }
}

// 翡翠绿方案 (Emerald Green)
export const emeraldGreen = {
  name: 'emeraldGreen',
  description: '清新生机的绿色调',
  colors: {
    primary: '#4ade80',
    primaryHover: '#22c55e',
    primaryLight: '#86efac',
    gradientStart: '#4ade80',
    gradientEnd: '#166534',
    bg: '#0f1f15',
    bgSecondary: '#1a2e21',
    bgTertiary: '#2d4a35',
    text: '#e8f5e9',
    textSecondary: '#a3b8a8',
    textMuted: '#6b8a76',
    border: '#2d4a35',
    borderLight: '#3d5a45',
    accent: '#4ade80',
    success: '#4ade80',
    warning: '#facc15',
    error: '#f87171',
    info: '#60a5fa',
    headerBg: 'linear-gradient(135deg, #1a2e21 0%, #0f1f15 100%)',
    sidebarBg: '#141d16',
    cardBg: '#1a2e21',
    hoverBg: '#2d4a35',
  }
}

// 薄荷蓝方案 (Mint Blue)
export const mintBlue = {
  name: 'mintBlue',
  description: '清新冷静的蓝绿色调',
  colors: {
    primary: '#38bdf8',
    primaryHover: '#0ea5e9',
    primaryLight: '#7dd3fc',
    gradientStart: '#38bdf8',
    gradientEnd: '#0369a1',
    bg: '#0c1f2e',
    bgSecondary: '#152a3a',
    bgTertiary: '#1e3a4f',
    text: '#e0f2fe',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#1e3a4f',
    borderLight: '#2e4a5f',
    accent: '#38bdf8',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#38bdf8',
    headerBg: 'linear-gradient(135deg, #152a3a 0%, #0c1f2e 100%)',
    sidebarBg: '#0a1824',
    cardBg: '#152a3a',
    hoverBg: '#1e3a4f',
  }
}

// 玫瑰金方案 (Rose Gold)
export const roseGold = {
  name: 'roseGold',
  description: '优雅精致的玫瑰金色调',
  colors: {
    primary: '#f0abfc',
    primaryHover: '#e879f9',
    primaryLight: '#f5d0fe',
    gradientStart: '#f0abfc',
    gradientEnd: '#be185d',
    bg: '#1a0f14',
    bgSecondary: '#25181d',
    bgTertiary: '#3d2430',
    text: '#fce7f3',
    textSecondary: '#c9a0b0',
    textMuted: '#8a6a78',
    border: '#3d2430',
    borderLight: '#4d3240',
    accent: '#f0abfc',
    success: '#6ee7b7',
    warning: '#fcd34d',
    error: '#fca5a5',
    info: '#93c5fd',
    headerBg: 'linear-gradient(135deg, #2d1820 0%, #1a0f14 100%)',
    sidebarBg: '#1810',
    cardBg: '#25181d',
    hoverBg: '#3d2430',
  }
}

// 默认导出暖棕色调
export default warmAmber
