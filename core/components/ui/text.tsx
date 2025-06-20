import type React from "react"
import { cn } from "@/lib/utils"
import { type TypographyKey, typographyClasses } from "@/core/styles/typography"

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant: TypographyKey
  as?: React.ElementType
  children: React.ReactNode
}

export function Text({ variant, as: Component = "span", children, className, ...props }: TextProps) {
  return (
    <Component className={cn(typographyClasses[variant], className)} {...props}>
      {children}
    </Component>
  )
}
