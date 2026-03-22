import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)
const DEFAULT_TIMEOUT = 2500

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const removeToast = useCallback((id) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    ({ message, type = 'info', title = '', timeout = DEFAULT_TIMEOUT }) => {
      const id = createId()
      const toast = { id, message, title, type, createdAt: Date.now() }

      setToasts((prev) => [...prev, toast])

      if (timeout > 0) {
        const timer = setTimeout(() => removeToast(id), timeout)
        timersRef.current.set(id, timer)
      }

      return id
    },
    [removeToast],
  )

  const clearToasts = useCallback(() => {
    for (const timer of timersRef.current.values()) {
      clearTimeout(timer)
    }
    timersRef.current.clear()
    setToasts([])
  }, [])

  const value = useMemo(
    () => ({ toasts, addToast, removeToast, clearToasts }),
    [toasts, addToast, removeToast, clearToasts],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToastStore() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastStore must be used within ToastProvider')
  }
  return context
}