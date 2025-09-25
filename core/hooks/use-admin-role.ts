"use client"

import { useState, useEffect } from "react"
import { authService } from "@/infrastructure/di/container"
import type { Admin } from "@/domain/entities/admin"

export function useAdminRole() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = () => {
      try {
        const currentAdmin = authService.getCurrentAdmin()
        setAdmin(currentAdmin)
      } catch (error) {
        console.error("Error getting admin:", error)
        setAdmin(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [])

  const isSuperAdmin = admin?.role === "super"
  const isRegularAdmin = admin?.role === "regular"
  const hasRole = (role: "super" | "regular") => admin?.role === role
  const hasAnyRole = (roles: ("super" | "regular")[]) => admin ? roles.includes(admin.role) : false

  return {
    admin,
    isLoading,
    isSuperAdmin,
    isRegularAdmin,
    hasRole,
    hasAnyRole,
  }
}
