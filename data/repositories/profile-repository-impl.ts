import type {
  ProfileRepository,
  UpdateProfileRequest,
  ChangeEmailRequest,
  ChangePasswordRequest,
} from "@/domain/repositories/profile-repository"
import type { ApiClient } from "../api/api-client"

export class ProfileRepositoryImpl implements ProfileRepository {
  private apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  async updateProfile(data: UpdateProfileRequest): Promise<{ message: string }> {
    console.log("[ProfileRepo] updateProfile called with data:", data)
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim()
      const response = await this.apiClient.patch("/admins/update-profile", { full_name: fullName })
      console.log("[ProfileRepo] updateProfile response:", response)
      return { message: response.message || "Profile updated successfully" }
    } catch (error: any) {
      console.error("[ProfileRepo] Error in updateProfile:", error)
      throw new Error(error.message || "Failed to update profile")
    }
  }

  async changeEmail(data: ChangeEmailRequest): Promise<{ message: string }> {
    console.log("[ProfileRepo] changeEmail called with data:", data)
    try {
      const response = await this.apiClient.patch("/admins/change-email", {
        new_email: data.newEmail,
        password: data.password,
      })
      console.log("[ProfileRepo] changeEmail response:", response)
      return { message: response.message || "Email updated successfully" }
    } catch (error: any) {
      console.error("[ProfileRepo] Error in changeEmail:", error)
      throw new Error(error.message || "Failed to change email")
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    console.log("[ProfileRepo] changePassword called with data:", { ...data, newPassword: "***" })
    try {
      const response = await this.apiClient.patch("/admins/change-password", {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      })
      console.log("[ProfileRepo] changePassword response:", response)
      return { message: response.message || "Password updated successfully" }
    } catch (error: any) {
      console.error("[ProfileRepo] Error in changePassword:", error)
      throw new Error(error.message || "Failed to change password")
    }
  }

  async uploadProfileImage(file: File): Promise<{ imageUrl: string; message: string }> {
    console.log("[ProfileRepo] uploadProfileImage called with file:", file.name)
    try {
      const formData = new FormData()
      formData.append("profile_image", file)

      const response = await this.apiClient.postFormData("/admins/upload-profile-image", formData)
      console.log("[ProfileRepo] uploadProfileImage response:", response)

      return {
        imageUrl: response.imageUrl || response.image_url || "",
        message: response.message || "Profile image uploaded successfully",
      }
    } catch (error: any) {
      console.error("[ProfileRepo] Error in uploadProfileImage:", error)
      throw new Error(error.message || "Failed to upload profile image")
    }
  }
}
