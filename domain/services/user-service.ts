import type { User, UsersPaginationParams, UsersResponse } from "@/domain/entities/user"
import type { UserRepository } from "@/domain/repositories/user-repository"

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUsers(params: UsersPaginationParams): Promise<UsersResponse> {
    return this.userRepository.getUsers(params)
  }

  async getUserById(firebaseUid: string): Promise<User> {
    return this.userRepository.getUserById(firebaseUid)
  }

  async getUserByName(name: string): Promise<User> {
    return this.userRepository.getUserByName(name)
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.userRepository.createUser(userData)
  }

  async updateUser(firebaseUid: string, userData: Partial<User>): Promise<User> {
    return this.userRepository.updateUser(firebaseUid, userData)
  }

  async deleteUser(firebaseUid: string): Promise<any> {
    return this.userRepository.deleteUser(firebaseUid)
  }

  async deleteSelectedUsers(userIds: string[]): Promise<any> {
    return this.userRepository.deleteSelectedUsers(userIds)
  }

  async deleteAllUsers(): Promise<any> {
    return this.userRepository.deleteAllUsers()
  }

  async inactivateSelectedUsers(userIds: string[]): Promise<any> {
    return this.userRepository.inactivateSelectedUsers(userIds)
  }

  async inactivateAllUsers(): Promise<any> {
    return this.userRepository.inactivateAllUsers()
  }

  async activateSelectedUsers(userIds: string[]): Promise<any> {
    return this.userRepository.activateSelectedUsers(userIds)
  }

  async activateAllUsers(): Promise<any> {
    return this.userRepository.activateAllUsers()
  }
}
