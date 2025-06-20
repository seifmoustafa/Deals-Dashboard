"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createPortal } from "react-dom"

interface CustomDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function CustomDialog({ open, onClose, title, description, children, className }: CustomDialogProps) {
  const [mounted, setMounted] = React.useState(false)

  // Handle mounting state
  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (open) {
      document.addEventListener("keydown", handleEsc)
      // Prevent scrolling when dialog is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      // Restore scrolling when dialog is closed
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  // Don't render anything on server or if not mounted
  if (!mounted || !open) return null

  // Use createPortal to render at the document level
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop/overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Dialog content */}
      <div
        className={cn("relative bg-white rounded-lg shadow-lg w-full max-w-md z-50", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Dialog header */}
        <div className="px-8 pt-6 pb-4">
          <h2 id="dialog-title" className="text-lg font-medium text-gray-900">
            {title}
          </h2>
          {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
        </div>

        {/* Dialog content */}
        <div className="px-8 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

interface CustomDialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function CustomDialogFooter({ children, className }: CustomDialogFooterProps) {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 px-8 py-5", className)}>
      {children}
    </div>
  )
}

export function CustomDialogCancel({
  onClick,
  children = "Cancel",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="bg-gray-100 hover:bg-gray-200 border-0 h-10 px-5 rounded-md mt-2 sm:mt-0"
      {...props}
    >
      {children}
    </Button>
  )
}

export function CustomDialogAction({
  onClick,
  children = "Confirm",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      onClick={onClick}
      className={cn("bg-green-500 hover:bg-green-600 h-10 px-5 rounded-md", className)}
      {...props}
    >
      {children}
    </Button>
  )
}
