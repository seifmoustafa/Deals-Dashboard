export interface User {
  id: string
  fullName: string
  email: string
  phone?: string
  dateOfBirth?: string | null
  gender?: string | null
  country?: string | null
  city?: string | null
  firebaseUid?: string
  totalSavings?: number
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  profileImage?: {
    url: string
  } | null
}

export interface UsersPaginationParams {
  page: number
  limit: number
  sortField?: string
  sortOrder?: "asc" | "dec"
  search?: string
}

export interface UsersPagination {
  currentPage: number
  totalPages: number
  totalUsers: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface UsersResponse {
  data: User[]
  pagination: UsersPagination
}
