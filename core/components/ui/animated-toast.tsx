"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "warning" | "info"

interface AnimatedToastProps {
  type: ToastType
  title: string
  message: string
  duration?: number
  onClose: () => void
}

export function AnimatedToast({ type = "info", title, message, duration = 5000, onClose }: AnimatedToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setIsVisible(true), 10)

    // Auto-close after duration
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 500) // Match this with the CSS transition duration
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />
    }
  }

  const getContainerStyles = () => {
    const baseStyles =
      "fixed top-4 right-4 z-50 w-96 shadow-lg rounded-lg overflow-hidden transform transition-all duration-500 ease-in-out"

    if (!isVisible) {
      return cn(baseStyles, "translate-x-full opacity-0")
    }

    if (isExiting) {
      return cn(baseStyles, "translate-x-full opacity-0")
    }

    return cn(baseStyles, "translate-x-0 opacity-100")
  }

  const getHeaderStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className={getContainerStyles()}>
      <div className={cn("px-4 py-3 flex items-center justify-between", getHeaderStyles())}>
        <div className="flex items-center">
          {getIcon()}
          <span className="ml-2 font-semibold">{title}</span>
        </div>
        <button onClick={handleClose} className="focus:outline-none">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="bg-white px-4 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-700">{message}</p>
      </div>
      {/* Progress bar */}
      <div
        className={cn(
          "h-1 transition-all duration-linear",
          type === "success"
            ? "bg-green-500"
            : type === "error"
              ? "bg-red-500"
              : type === "warning"
                ? "bg-amber-500"
                : "bg-blue-500",
        )}
        style={{
          width: "100%",
          animation: `shrink ${duration}ms linear forwards`,
        }}
      />
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export type ToastOptions = {
  type: ToastType
  title: string
  message: string
  duration?: number
}

type ToastState = ToastOptions & { id: string }

// Global toast state and functions
let toasts: ToastState[] = []
let listeners: ((toasts: ToastState[]) => void)[] = []

// Function to notify all listeners of state changes
const notifyListeners = () => {
  listeners.forEach((listener) => listener([...toasts]))
}

// Add a toast
export const showToast = (options: ToastOptions) => {
  const id = Math.random().toString(36).substring(2, 9)
  const newToast = { ...options, id }
  toasts = [...toasts, newToast]
  notifyListeners()
  return id
}

// Remove a toast
export const removeToast = (id: string) => {
  toasts = toasts.filter((toast) => toast.id !== id)
  notifyListeners()
}

// Hook to access toasts in components
export const useToasts = () => {
  const [currentToasts, setCurrentToasts] = useState<ToastState[]>(toasts)

  useEffect(() => {
    const handleChange = (newToasts: ToastState[]) => {
      setCurrentToasts([...newToasts])
    }

    listeners.push(handleChange)
    return () => {
      listeners = listeners.filter((listener) => listener !== handleChange)
    }
  }, [])

  return {
    toasts: currentToasts,
    showToast,
    removeToast,
  }
}

// Toast container component
export function ToastContainer() {
  const { toasts, removeToast } = useToasts()

  return (
    <>
      {toasts.map((toast) => (
        <AnimatedToast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  )
}
