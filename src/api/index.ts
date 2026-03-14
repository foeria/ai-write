/**
 * API 接口导出
 *
 * 新架构说明：
 * - 使用 repository.ts 中的统一数据访问层
 * - 旧的 API 文件 (novel.ts, character.ts 等) 为远程 API 预留
 * - 数据自动选择 Tauri(SQLite) 或 API 模式
 */

// 统一数据访问层
export * from './repository'

// 旧版 API（用于远程服务端对接，未来扩展）
export * from './ai'
export * from './client'
export * from './quota'
export * from './user'
export * from './text'

// 遗留文件（待废弃）
// export * from './novel'
// export * from './character'
// export * from './knowledge'
// export * from './sqlite'
