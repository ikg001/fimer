import React, { useEffect, useState, createContext, useContext } from 'react'
import { XIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: number
  message: string
  type: ToastType
}

type ToastContextType = {
  showToast: (message: string, type: ToastType) => void
}

export const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
})

export const useToast = () => useContext(ToastContext)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now()
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
      },
    ])
    // 5 saniye sonra otomatik kaldır
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }

  return (
    <ToastContext.Provider
      value={{
        showToast,
      }}
    >
      {children}
      <Toaster toasts={toasts} setToasts={setToasts} />
    </ToastContext.Provider>
  )
}

type ToasterProps = {
  toasts?: Toast[]
  setToasts?: React.Dispatch<React.SetStateAction<Toast[]>>
}

export const Toaster = ({ toasts = [], setToasts }: ToasterProps) => {
  const handleClose = (id: number) => {
    if (setToasts) {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }
  }

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircleIcon className="w-5 h-5 text-red-500" />
      case 'info':
        return <InfoIcon className="w-5 h-5 text-blue-500" />
    }
  }

  const getToastClass = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/50 dark:text-green-100'
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/50 dark:text-red-100'
      case 'info':
        return 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastClass(toast.type)} p-4 rounded-lg shadow-md border-l-4 flex items-center justify-between animate-slide-up`}
        >
          <div className="flex items-center">
            {getIcon(toast.type)}
            <p className="ml-3">{toast.message}</p>
          </div>
          <button
            onClick={() => handleClose(toast.id)}
            className="ml-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  )
} 