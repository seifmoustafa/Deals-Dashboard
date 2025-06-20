import type {
  ProfileRepository,
  UpdateProfileRequest,
  ChangeEmailRequest,
  ChangePasswordRequest,
} from "../repositories/profile-repository"

export class ProfileService {
  private profileRepository: ProfileRepository

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository
  }

  async updateProfile(data: UpdateProfileRequest): Promise<{ message: string }> {
    return this.profileRepository.updateProfile(data)
  }

  async changeEmail(data: ChangeEmailRequest): Promise<{ message: string }> {
    return this.profileRepository.changeEmail(data)
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    return this.profileRepository.changePassword(data)
  }

  async uploadProfileImage(file: File): Promise<{ imageUrl: string; message: string }> {
    return this.profileRepository.uploadProfileImage(file)
  }
}
