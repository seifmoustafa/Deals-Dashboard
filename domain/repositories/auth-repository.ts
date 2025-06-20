import type { Admin, AuthResponse, LoginCredentials } from "../entities/admin"

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>
  getCurrentAdmin(): Admin | null
  isAuthenticated(): boolean
  logout(): void
}
