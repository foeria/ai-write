import { useState, useEffect, useCallback, useRef } from 'react'
import { message } from 'antd'
import CryptoJS from 'crypto-js'

// 加密存储键
const STORAGE_PREFIX = 'aiwrite_'

/**
 * 自动保存Hook
 */
export function useAutoSave<T>(
  data: T,
  key: string,
  options?: {
    interval?: number
    encrypt?: boolean
    onSave?: (data: T) => Promise<void>
  }
) {
  const {
    interval = 30000, // 30秒
    encrypt = false,
    onSave,
  } = options || {}

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const dataRef = useRef(data)

  // 更新数据引用
  useEffect(() => {
    dataRef.current = data
  }, [data])

  // 自动保存
  useEffect(() => {
    if (!onSave) return

    const saveTimer = setInterval(async () => {
      if (hasUnsavedChanges) {
        setIsSaving(true)
        try {
          await onSave(dataRef.current)
          setLastSaved(new Date())
          setHasUnsavedChanges(false)
        } catch (error) {
          console.error('Auto save failed:', error)
          message.error('自动保存失败')
        } finally {
          setIsSaving(false)
        }
      }
    }, interval)

    return () => {
      clearInterval(saveTimer)
    }
  }, [interval, hasUnsavedChanges, onSave])

  // 标记有未保存的更改
  const markDirty = useCallback(() => {
    setHasUnsavedChanges(true)
  }, [])

  // 手动保存
  const save = useCallback(async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave(dataRef.current)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      message.success('保存成功')
    } catch (error) {
      console.error('Manual save failed:', error)
      message.error('保存失败')
    } finally {
      setIsSaving(false)
    }
  }, [onSave])

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    markDirty,
    save,
  }
}

/**
 * 本地加密存储Hook
 */
export function useLocalStorage<T>(key: string, initialValue: T, encrypt = false) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const storageKey = STORAGE_PREFIX + key
      const item = window.localStorage.getItem(storageKey)

      if (!item) {
        return initialValue
      }

      if (encrypt) {
        const decrypted = CryptoJS.AES.decrypt(item, key)
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
        if (decryptedString) {
          return JSON.parse(decryptedString)
        }
      }

      return JSON.parse(item)
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        const storageKey = STORAGE_PREFIX + key
        const serialized = JSON.stringify(valueToStore)

        if (encrypt) {
          const encrypted = CryptoJS.AES.encrypt(serialized, key).toString()
          window.localStorage.setItem(storageKey, encrypted)
        } else {
          window.localStorage.setItem(storageKey, serialized)
        }
      } catch (error) {
        console.error('Error writing to localStorage:', error)
      }
    },
    [key, encrypt, storedValue]
  )

  const removeValue = useCallback(() => {
    try {
      const storageKey = STORAGE_PREFIX + key
      window.localStorage.removeItem(storageKey)
      setStoredValue(initialValue)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}

/**
 * 导出加密工具
 */
export { CryptoJS }
