import type { User, UsersPaginationParams, UsersResponse } from "@/domain/entities/user"

export interface UserRepository {
  getUsers(params: UsersPaginationParams): Promise<UsersResponse>
  getUserById(firebaseUid: string): Promise<User>
  getUserByName(name: string): Promise<User>
  createUser(userData: Partial<User>): Promise<User>
  updateUser(firebaseUid: string, userData: Partial<User>): Promise<User>
  deleteUser(firebaseUid: string): Promise<any>
  deleteSelectedUsers(userIds: string[]): Promise<any>
  deleteAllUsers(): Promise<any>
  inactivateSelectedUsers(userIds: string[]): Promise<any>
  inactivateAllUsers(): Promise<any>
  activateSelectedUsers(userIds: string[]): Promise<any>
  activateAllUsers(): Promise<any>
}
