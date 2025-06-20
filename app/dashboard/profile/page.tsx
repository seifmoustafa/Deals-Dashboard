"use client"

import { useTranslation } from "@/core/localization/translation-context"
import { ProfileForm } from "@/core/components/profile/profile-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useEffect, useState } from "react"
import { AdminStorage } from "@/infrastructure/storage/admin-storage"

export default function ProfilePage() {
  const { t } = useTranslation()
  const [admin, setAdmin] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const adminStorage = new AdminStorage()

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const adminData = adminStorage.getAdmin()
        setAdmin(adminData)
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdmin()
  }, [])

  const handleProfileUpdate = (updatedAdmin: any) => {
    console.log("Updating admin profile:", updatedAdmin)
    setAdmin(updatedAdmin)
    adminStorage.setAdmin(updatedAdmin)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("profile.title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">{t("profile.title")}</h1>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <ProfileForm admin={admin} onProfileUpdate={handleProfileUpdate} />
          )}
        </div>
      </div>
    </div>
  )
}
