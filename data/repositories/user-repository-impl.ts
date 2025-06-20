import type { User, UsersPaginationParams, UsersResponse } from "@/domain/entities/user"
import type { UserRepository } from "@/domain/repositories/user-repository"
import type { ApiClient } from "../api/api-client"
import { UserMapper } from "../mappers/user-mapper"

export class UserRepositoryImpl implements UserRepository {
  constructor(private apiClient: ApiClient) {}

  async getUsers(params: UsersPaginationParams): Promise<UsersResponse> {
    try {
      // Make sure all parameters including search are passed to the API
      const queryParams = {
        page: params.page,
        limit: params.limit,
        sortField: params.sortField,
        sortOrder: params.sortOrder,
        search: params.search,
      }

      const response = await this.apiClient.get<{
        data: any[]
        pagination: any
      }>("/users", queryParams)

      return {
        data: response.data.map(UserMapper.toDomain),
        pagination: response.pagination,
      }
    } catch (error) {
      throw error
    }
  }

  async getUserById(firebaseUid: string): Promise<User> {
    try {
      const response = await this.apiClient.get<any>(`/users/${firebaseUid}`)
      return UserMapper.toDomain(response)
    } catch (error) {
      throw error
    }
  }

  async getUserByName(name: string): Promise<User> {
    try {
      // First try to get users with a search filter
      const queryParams = {
        search: name,
        limit: 10,
        page: 1,
      }

      const response = await this.apiClient.get<{
        data: any[]
        pagination: any
      }>("/users", queryParams)

      // Find the user that matches the name exactly or closest match
      const exactMatch = response.data.find(
        (user) => user.full_name && user.full_name.toLowerCase() === name.toLowerCase(),
      )

      if (exactMatch) {
        const user = UserMapper.toDomain(exactMatch)
        // Don't throw an error for missing Firebase UID, just log a warning
        if (!user.firebaseUid) {
          console.warn(`User found with name "${name}" but has no Firebase UID`)
        }
        return user
      }

      // If no exact match, return the first user from search results
      if (response.data.length > 0) {
        const user = UserMapper.toDomain(response.data[0])
        // Don't throw an error for missing Firebase UID, just log a warning
        if (!user.firebaseUid) {
          console.warn(`User found from search results for "${name}" but has no Firebase UID`)
        }
        return user
      }

      // If no users found, throw an error
      throw new Error(`User with name "${name}" not found`)
    } catch (error) {
      console.error("Error fetching user by name:", error)
      throw error
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      // Convert the userData to the DTO format expected by the API
      const dto = UserMapper.toDTO(userData as User)

      // Make the API call
      const response = await this.apiClient.post<any>("/users", dto)
      return UserMapper.toDomain(response)
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  async updateUser(firebaseUid: string, userData: Partial<User>): Promise<User> {
    try {
      if (!firebaseUid) {
        throw new Error("Cannot update user: Missing Firebase UID")
      }

      // Convert the userData to the DTO format expected by the API
      const dto: Record<string, any> = {}

      // Map only the fields that are provided in userData
      if (userData.fullName !== undefined) dto.full_name = userData.fullName
      if (userData.phone !== undefined) dto.phone = userData.phone
      if (userData.dateOfBirth !== undefined) dto.date_of_birth = userData.dateOfBirth
      if (userData.gender !== undefined) dto.gender = userData.gender
      if (userData.country !== undefined) dto.country = userData.country
      if (userData.city !== undefined) dto.city = userData.city
      if (userData.isActive !== undefined) dto.is_active = userData.isActive

      console.log("Sending update with data:", dto)
      console.log("Using endpoint:", `/users/${firebaseUid}`)

      // Make the API call with the correct endpoint and method
      const response = await this.apiClient.patch<any>(`/users/${firebaseUid}`, dto)
      return UserMapper.toDomain(response)
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  }

  async deleteUser(firebaseUid: string): Promise<any> {
    try {
      const response = await this.apiClient.delete(`/users/${firebaseUid}`)
      return response
    } catch (error) {
      throw error
    }
  }

  async deleteSelectedUsers(userIds: string[]): Promise<any> {
    try {
      // Use DELETE method with the correct endpoint and body format
      console.log("Deleting selected users with payload:", { userIds })

      const response = await this.apiClient.delete<any>("/users/delete-selectedUsers", { userIds })
      return response
    } catch (error) {
      console.error("Error deleting selected users:", error)
      throw error
    }
  }

  async deleteAllUsers(): Promise<any> {
    try {
      const response = await this.apiClient.delete("/users/delete-all")
      return response
    } catch (error) {
      throw error
    }
  }

  async inactivateSelectedUsers(userIds: string[]): Promise<any> {
    try {
      const response = await this.apiClient.patch("/users/inactivate-selectedUsers", { userIds })
      return response
    } catch (error) {
      throw error
    }
  }

  async inactivateAllUsers(): Promise<any> {
    try {
      const response = await this.apiClient.patch("/users/inactivate-all")
      return response
    } catch (error) {
      throw error
    }
  }

  async activateSelectedUsers(userIds: string[]): Promise<any> {
    try {
      const response = await this.apiClient.patch("/users/activate-selectedUsers", { userIds })
      return response
    } catch (error) {
      throw error
    }
  }

  async activateAllUsers(): Promise<any> {
    try {
      const response = await this.apiClient.patch("/users/activate-all")
      return response
    } catch (error) {
      throw error
    }
  }
}
