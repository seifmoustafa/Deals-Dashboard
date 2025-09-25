"use client"

import type React from "react"

import { useState } from "react"
import { useTranslation } from "@/core/localization/translation-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { User, Eye, EyeOff, Loader2, X } from "lucide-react"
import Link from "next/link"
import { ApiClient } from "@/data/api/api-client"
import { showToast } from "@/core/components/ui/animated-toast"

interface ProfileFormProps {
  admin: any
  onProfileUpdate: (updatedAdmin: any) => void
}

export function ProfileForm({ admin, onProfileUpdate }: ProfileFormProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [firstName, setFirstName] = useState(admin?.fullName?.split(" ")[0] || "")
  const [lastName, setLastName] = useState(admin?.fullName?.split(" ").slice(1).join(" ") || "")
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState("")
  const apiClient = new ApiClient()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Here you would call your API to update the profile
      // const response = await updateProfile({ firstName, lastName })

      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.profileUpdated"),
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: t("profile.updateError"),
        description: t("profile.errorOccurred"),
        variant: "destructive",
      })
    }
  }

  const handleEmailChanged = (newEmail: string) => {
    const updatedAdmin = { ...admin, email: newEmail }
    onProfileUpdate(updatedAdmin)
  }

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError("")
    setIsSubmittingEmail(true)

    try {
      // Changed from post to patch
      const response = await apiClient.patch("/admins/change-email", {
        id: admin.id,
        currentPassword,
        newEmail,
      })

      // Update the admin email in state and storage
      handleEmailChanged(newEmail)

      // Show success toast using AnimatedToast
      showToast({
        type: "success",
        title: "Email Updated",
        message: response?.message || "Your email has been updated successfully",
      })

      // Close the dialog and reset form
      setShowEmailDialog(false)
      setCurrentPassword("")
      setNewEmail("")
    } catch (error: any) {
      console.error("Error changing email:", error)
      setEmailError(error.responseData?.message || "An error occurred while changing your email. Please try again.")

      // Show error toast using AnimatedToast
      showToast({
        type: "error",
        title: "Email Update Failed",
        message: error.responseData?.message || "An error occurred while changing your email. Please try again.",
      })
    } finally {
      setIsSubmittingEmail(false)
    }
  }

  const closeEmailDialog = () => {
    setShowEmailDialog(false)
    setCurrentPassword("")
    setNewEmail("")
    setEmailError("")
  }

  // Custom button style that matches the provided design
  const customButtonStyle =
    "h-11 rounded-full border border-[#04832D] text-[#04832D] px-4 py-3 text-sm font-medium hover:bg-green-50"

  return (
    <div className="space-y-8">
      {/* Profile Header with Image */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100">
            {admin?.profileImage ? (
              <Image
                src={admin.profileImage || "/placeholder.svg"}
                alt={admin.fullName || "Profile"}
                width={64}
                height={64}
                className="object-cover h-full w-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-gray-200 text-gray-700 text-xl font-semibold">
                {admin?.fullName
                  ?.split(" ")
                  .slice(0, 2)
                  .map((name: string) => name[0])
                  .join("")
                  .toUpperCase() || <User className="h-8 w-8 text-gray-500" />}
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-medium">{admin?.fullName || "Admin User"}</h2>
          <p className="text-sm text-gray-500">
            {admin?.role === "super" ? t("profile.superAdmin") : t("profile.admin")}
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              {t("profile.firstName")}
            </label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full" />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              {t("profile.lastName")}
            </label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full" />
          </div>

          {/* Username (Disabled) */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              {t("profile.username")}
            </label>
            <Input
              id="username"
              value={admin?.username || ""}
              disabled
              className="w-full bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">{t("profile.usernameCannotBeChanged")}</p>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t("profile.email")}
          </label>
          <div className="flex items-center gap-4">
            <Input id="email" value={admin?.email || ""} disabled className="flex-1 bg-gray-50" />
            <button type="button" className={customButtonStyle} onClick={() => setShowEmailDialog(true)}>
              {t("profile.changeEmail")}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {t("profile.password")}
          </label>
          <div className="flex items-center gap-4">
            <Input id="password" type="password" value="************" disabled className="flex-1 bg-gray-50" />
            <Link href="/dashboard/profile/change-password" className={customButtonStyle}>
              {t("profile.changePassword")}
            </Link>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
            {t("common.save")}
          </Button>
        </div>
      </form>

      {/* Custom Email Change Dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">{t("profile.changeEmail")}</h3>
              <button type="button" onClick={closeEmailDialog} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleChangeEmail} className="p-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="current-email" className="text-sm font-medium">
                  {t("profile.currentEmail")}
                </label>
                <Input id="current-email" value={admin?.email || ""} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <label htmlFor="new-email" className="text-sm font-medium">
                  {t("profile.newEmail")}
                </label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t("profile.enterNewEmail")}
                  disabled={isSubmittingEmail}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="current-password" className="text-sm font-medium">
                  {t("profile.currentPassword")}
                </label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t("profile.enterCurrentPassword")}
                    disabled={isSubmittingEmail}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmittingEmail}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {emailError && <div className="text-sm text-red-500 mt-2">{emailError}</div>}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white min-w-[120px] flex items-center justify-center"
                  disabled={isSubmittingEmail}
                >
                  {isSubmittingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("profile.changeEmail")
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
