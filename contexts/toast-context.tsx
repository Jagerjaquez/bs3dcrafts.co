'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Toast, ToastType, ToastContainer } from '@/components/admin-toast'

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (type: ToastType, title: string, message?: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration
    }

    setToasts(prev => [...prev, toast])
  }

  const showSuccess = (title: string, message?: string) => {
    showToast('success', title, message)
  }

  const showError = (title: string, message?: string) => {
    showToast('error', title, message)
  }

  const showWarning = (title: string, message?: string) => {
    showToast('warning', title, message)
  }

  const showInfo = (title: string, message?: string) => {
    showToast('info', title, message)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      removeToast
    }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}