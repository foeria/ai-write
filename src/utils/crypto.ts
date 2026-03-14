import CryptoJS from 'crypto-js'

// 加密密钥（生产环境应使用环境变量）
const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET_KEY || 'ai-write-secret-key'

/**
 * 加密字符串
 */
export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString()
}

/**
 * 解密字符串
 */
export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * 生成哈希
 */
export function hash(text: string): string {
  return CryptoJS.SHA256(text).toString()
}

/**
 * 生成随机字符串
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
