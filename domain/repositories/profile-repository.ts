export interface UpdateProfileRequest {
  firstName: string
  lastName: string
}

export interface ChangeEmailRequest {
  newEmail: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ProfileRepository {
  updateProfile(data: UpdateProfileRequest): Promise<{ message: string }>
  changeEmail(data: ChangeEmailRequest): Promise<{ message: string }>
  changePassword(data: ChangePasswordRequest): Promise<{ message: string }>
  uploadProfileImage(file: File): Promise<{ imageUrl: string; message: string }>
}
