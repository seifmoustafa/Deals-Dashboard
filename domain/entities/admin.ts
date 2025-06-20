export interface Admin {
  id: string
  fullName: string
  username: string
  email: string
  role: "super" | "regular"
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminRegisterRequest {
  full_name: string
  email: string
  username: string
  password: string
}

export interface UpdateRoleRequest {
  id: string
  role: "super" | "regular"
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  admin: Admin
}
