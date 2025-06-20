import type { Admin, AdminRegisterRequest, UpdateRoleRequest } from "../entities/admin"

export interface AdminsPaginationParams {
  page: number
  limit: number
  sortField?: string
  sortOrder?: "asc" | "dec"
  search?: string
}

export interface AdminsPagination {
  currentPage: number
  totalPages: number
  totalAdmins: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface AdminsResponse {
  data: Admin[]
  pagination: AdminsPagination
}

export interface AdminRepository {
  getAdmins(params: AdminsPaginationParams): Promise<AdminsResponse>
  registerAdmin(data: AdminRegisterRequest): Promise<{ message: string }>
  updateRole(data: UpdateRoleRequest): Promise<{ message: string }>
  activateAdmin(id: string): Promise<{ message: string }>
  inactivateAdmin(id: string): Promise<{ message: string }>
  deleteAdmin(id: string): Promise<{ message: string }>

  // Add these new bulk action methods
  activateSelectedAdmins(adminIds: string[]): Promise<{ message: string; modifiedCount: number }>
  inactivateSelectedAdmins(adminIds: string[]): Promise<{ message: string; modifiedCount: number }>
  deleteSelectedAdmins(adminIds: string[]): Promise<{ message: string; deletedCount: number }>
}
