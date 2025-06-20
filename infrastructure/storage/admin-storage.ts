"use client"

import { useState, useEffect, useCallback } from "react"
import type { Admin } from "@/domain/entities/admin"

export class AdminStorage {
  private readonly ADMIN_KEY = "current_admin"

  setAdmin(admin: Admin): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.ADMIN_KEY, JSON.stringify(admin))
    }
  }

  getAdmin(): Admin | null {
    if (typeof window !== "undefined") {
      const adminJson = localStorage.getItem(this.ADMIN_KEY)
      if (adminJson) {
        try {
          return JSON.parse(adminJson) as Admin
        } catch (e) {
          return null
        }
      }
    }
    return null
  }

  removeAdmin(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.ADMIN_KEY)
    }
  }
}

// Create a singleton instance
const adminStorageInstance = new AdminStorage()

// React hook for using AdminStorage
export function useAdminStorage() {
  const [admin, setAdminState] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load admin on initial mount
  useEffect(() => {
    const loadAdmin = () => {
      try {
        const storedAdmin = adminStorageInstance.getAdmin()
        setAdminState(storedAdmin)
      } catch (error) {
        console.error("Error loading admin from storage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAdmin()
  }, [])

  // Get admin (returns promise for async compatibility)
  const getAdmin = useCallback(async (): Promise<Admin | null> => {
    return adminStorageInstance.getAdmin()
  }, [])

  // Set admin
  const setAdmin = useCallback((admin: Admin) => {
    adminStorageInstance.setAdmin(admin)
    setAdminState(admin)
  }, [])

  // Remove admin
  const removeAdmin = useCallback(() => {
    adminStorageInstance.removeAdmin()
    setAdminState(null)
  }, [])

  return {
    admin,
    isLoading,
    getAdmin,
    setAdmin,
    removeAdmin,
  }
}
