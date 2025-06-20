import type { AdminRegisterRequest, UpdateRoleRequest } from "../entities/admin"
import type { AdminRepository, AdminsPaginationParams, AdminsResponse } from "../repositories/admin-repository"

export class AdminService {
  private adminRepository: AdminRepository

  constructor(adminRepository: AdminRepository) {
    this.adminRepository = adminRepository
  }

  async getAdmins(params: AdminsPaginationParams): Promise<AdminsResponse> {
    return this.adminRepository.getAdmins(params)
  }

  async registerAdmin(data: AdminRegisterRequest): Promise<{ message: string }> {
    return this.adminRepository.registerAdmin(data)
  }

  async updateRole(data: UpdateRoleRequest): Promise<{ message: string }> {
    return this.adminRepository.updateRole(data)
  }

  async activateAdmin(id: string): Promise<{ message: string }> {
    return this.adminRepository.activateAdmin(id)
  }

  async inactivateAdmin(id: string): Promise<{ message: string }> {
    return this.adminRepository.inactivateAdmin(id)
  }

  async deleteAdmin(id: string): Promise<{ message: string }> {
    return this.adminRepository.deleteAdmin(id)
  }

  // Add these new bulk action methods
  async activateSelectedAdmins(adminIds: string[]): Promise<{ message: string; modifiedCount: number }> {
    return this.adminRepository.activateSelectedAdmins(adminIds)
  }

  async inactivateSelectedAdmins(adminIds: string[]): Promise<{ message: string; modifiedCount: number }> {
    return this.adminRepository.inactivateSelectedAdmins(adminIds)
  }

  async deleteSelectedAdmins(adminIds: string[]): Promise<{ message: string; deletedCount: number }> {
    return this.adminRepository.deleteSelectedAdmins(adminIds)
  }
}
