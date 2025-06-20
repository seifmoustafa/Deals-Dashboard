import type { AuthRepository } from "@/domain/repositories/auth-repository"
import type { Admin, AuthResponse, LoginCredentials } from "@/domain/entities/admin"
import type { ApiClient } from "../api/api-client"
import { AdminMapper } from "../mappers/admin-mapper"
import type { TokenStorage } from "@/infrastructure/storage/token-storage"
import type { AdminStorage } from "@/infrastructure/storage/admin-storage"
import { setCookie } from "cookies-next"

export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private apiClient: ApiClient,
    private tokenStorage: TokenStorage,
    private adminStorage: AdminStorage,
  ) {}

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<{
        token: string
        admin: any
      }>("/admins/login", credentials)

      const admin = AdminMapper.toDomain(response.admin)

      // Store token and admin data
      this.tokenStorage.setToken(response.token)
      this.adminStorage.setAdmin(admin)

      // Set cookie for middleware authentication
      setCookie("auth_token", response.token, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      return {
        token: response.token,
        admin,
      }
    } catch (error) {
      throw error
    }
  }

  getCurrentAdmin(): Admin | null {
    return this.adminStorage.getAdmin()
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.getToken() !== null
  }

  logout(): void {
    this.tokenStorage.removeToken()
    this.adminStorage.removeAdmin()

    // Remove auth cookie
    setCookie("auth_token", "", {
      maxAge: 0,
      path: "/",
    })
  }
}
