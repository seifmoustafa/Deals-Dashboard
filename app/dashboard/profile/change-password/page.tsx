"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslation } from "@/core/localization/translation-context"
import { Input } from "@/components/ui/input"
import { ApiClient } from "@/data/api/api-client"
import { AdminStorage } from "@/infrastructure/storage/admin-storage"
import { Eye, EyeOff, Info, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { showToast } from "@/core/components/ui/animated-toast"

export default function ChangePasswordPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validations, setValidations] = useState({
    length: false,
    number: false,
    special: false,
  })

  const apiClient = new ApiClient()
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

  useEffect(() => {
    // Validate password as user types
    setValidations({
      length: newPassword.length >= 8,
      number: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    })
  }, [newPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate password
    if (!validations.length || !validations.number || !validations.special) {
      setError(t("profile.passwordRequirements"))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t("profile.passwordsDoNotMatch"))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await apiClient.patch("/admins/change-password", {
        id: admin?.id,
        currentPassword: currentPassword,
        newPassword: newPassword,
      })

      // Show success toast using AnimatedToast
      showToast({
        type: "success",
        title: t("profile.passwordUpdated"),
        message: response.message || t("profile.passwordSuccessfullyUpdated"),
      })

      // Navigate back to profile page immediately
      router.push("/dashboard/profile")
    } catch (error: any) {
      console.error("Error changing password:", error)
      setError(error.message || t("profile.errorChangingPassword"))

      // Show error toast using AnimatedToast
      showToast({
        type: "error",
        title: t("profile.passwordUpdateFailed"),
        message: error.message || t("profile.errorChangingPassword"),
      })

      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">{t("sidebar.dashboard")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/profile">{t("profile.title")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("profile.changePassword")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">
            {t("profile.title")} &gt; {t("profile.changePassword")}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    {t("profile.currentPassword")}
                  </label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pr-10"
                      required
                      placeholder={t("profile.currentPassword")}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      disabled={isSubmitting}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    {t("profile.newPassword")}
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pr-10"
                      required
                      placeholder={t("profile.newPassword")}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isSubmitting}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    {t("profile.confirmNewPassword")}
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pr-10"
                      required
                      placeholder={t("profile.confirmNewPassword")}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-2 h-11 flex items-center justify-center min-w-[150px] disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("common.loading")}
                      </>
                    ) : (
                      t("profile.changePassword")
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">{t("profile.passwordRequirementsTitle")}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Info className={`h-5 w-5 ${validations.length ? "text-green-500" : "text-gray-400"}`} />
                  <p className="text-sm">{t("profile.passwordLength")}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Info className={`h-5 w-5 ${validations.number ? "text-green-500" : "text-gray-400"}`} />
                  <p className="text-sm">{t("profile.passwordNumber")}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Info className={`h-5 w-5 ${validations.special ? "text-green-500" : "text-gray-400"}`} />
                  <p className="text-sm">{t("profile.passwordSpecial")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
