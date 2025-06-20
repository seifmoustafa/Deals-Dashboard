import type { AuthRepository } from "../repositories/auth-repository"
import type { LoginCredentials, AuthResponse } from "../entities/admin"

export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.authRepository.login(credentials)
  }

  isAuthenticated(): boolean {
    return this.authRepository.isAuthenticated()
  }

  logout(): void {
    this.authRepository.logout()
  }

  getCurrentAdmin() {
    return this.authRepository.getCurrentAdmin()
  }
}
