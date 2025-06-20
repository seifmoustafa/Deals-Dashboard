"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

type DropdownItem = {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  className?: string
}

type SimpleDropdownProps = {
  items: DropdownItem[]
  buttonClassName?: string
  menuClassName?: string
  buttonIcon?: React.ReactNode
}

export function SimpleDropdown({
  items,
  buttonClassName = "",
  menuClassName = "",
  buttonIcon = <MoreVertical className="h-4 w-4" />,
}: SimpleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Toggle dropdown
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up

    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()

      // Always position the dropdown to the left of the button
      // and either above or below depending on available space
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom
      const menuHeight = items.length * 40 + 16 // Estimate menu height

      // Position left of the button (viewport coordinates)
      const left = rect.right - 180 // Menu width is 180px

      // Position above or below based on available space
      // Add extra buffer (50px) for pagination controls
      const top =
        spaceBelow < menuHeight + 50 && rect.top > menuHeight
          ? rect.top - menuHeight // Position above
          : rect.bottom // Position below

      setMenuPosition({ top, left })
    }

    setIsOpen(!isOpen)
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        buttonRef.current &&
        menuRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    // Handle escape key
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscapeKey)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isOpen])

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isOpen])

  // Handle item click
  const handleItemClick = (item: DropdownItem) => (e: React.MouseEvent) => {
    e.stopPropagation()
    item.onClick()
    setIsOpen(false)
  }

  return (
    <>
      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        size="icon"
        className={`relative z-10 ${buttonClassName}`}
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {buttonIcon}
        <span className="sr-only">Open menu</span>
      </Button>

      {mounted &&
        isOpen &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            className={`fixed z-[9999] bg-white rounded-md shadow-lg border border-gray-200 py-1 overflow-hidden ${menuClassName}`}
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              width: "180px",
              position: "fixed", // Ensure fixed positioning
            }}
            role="menu"
          >
            {items.map((item, index) => (
              <button
                key={index}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 ${
                  item.className || ""
                }`}
                onClick={handleItemClick(item)}
                role="menuitem"
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
