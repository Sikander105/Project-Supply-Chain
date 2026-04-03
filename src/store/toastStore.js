import * as React from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const DEFAULT_TIMEOUT = 2500

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (message, type = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      setToasts((previous) => [...previous, { id, message, type }])
      const timeoutFn =
        typeof window !== 'undefined' ? window.setTimeout : globalThis.setTimeout
      timeoutFn(() => dismissToast(id), DEFAULT_TIMEOUT)
    },
    [dismissToast],
  )

  const value = useMemo(
    () => ({
      toasts,
      pushToast,
      dismissToast,
    }),
    [toasts, pushToast, dismissToast],
  )

  return React.createElement(ToastContext.Provider, { value }, children)
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }
  return context
}