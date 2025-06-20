"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { MoreVertical, Edit, Trash, UserX, Download } from "lucide-react"

interface CustomDropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
  className?: string
  contentClassName?: string
  props?: any
}

export function CustomDropdown({
  trigger,
  children,
  align = "right",
  className,
  contentClassName,
  props,
}: CustomDropdownProps) {
  const [open, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(undefined)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (dropdownRef.current) {
      setTriggerWidth(dropdownRef.current.offsetWidth)
    }
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" {...props} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!open)}>{trigger}</div>
      {open && (
        <CustomDropdownContent
          ref={ref}
          className={cn("absolute right-0 top-0 mt-8", contentClassName)}
          style={{ minWidth: triggerWidth }}
        >
          {children}
        </CustomDropdownContent>
      )}
    </div>
  )
}

interface CustomDropdownContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

const CustomDropdownContent = React.forwardRef<HTMLDivElement, CustomDropdownContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-slate-800 dark:bg-slate-950",
        "absolute",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ),
)
CustomDropdownContent.displayName = "DropdownContent"

interface CustomDropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function CustomDropdownItem({ icon, className, children, ...props }: CustomDropdownItemProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center rounded-sm px-3 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors",
        className,
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}

// Export icons that we'll use in the dropdown
export const DropdownIcons = {
  moreVertical: MoreVertical,
  edit: Edit,
  trash: Trash,
  userX: UserX,
  download: Download,
}
