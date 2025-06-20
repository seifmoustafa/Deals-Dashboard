"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icons } from "../icons"
import { useTranslation } from "@/core/localization/translation-context"

interface HeaderProps {
  title: string
  actionButton?: {
    label: string
    icon: React.ReactNode
    onClick?: () => void
    href?: string
  }
}

export function Header({ title, actionButton }: HeaderProps) {
  const router = useRouter()
  const { t, dir } = useTranslation()

  const handleButtonClick = () => {
    if (actionButton?.onClick) {
      actionButton.onClick()
    } else if (actionButton?.href) {
      router.push(actionButton.href)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
      <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>
      <div className="flex items-center space-x-4">
        {actionButton && (
          <Button onClick={handleButtonClick} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            {actionButton.icon}
            <span className={dir === "ltr" ? "ml-2" : "mr-2"}>{actionButton.label}</span>
          </Button>
        )}
        <Button variant="ghost" size="icon" className="relative">
          <Icons.notification className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </Button>
      </div>
    </div>
  )
}
