import { userService, adminService, categoryService, storeService } from "@/infrastructure/di/container"
import type { User } from "@/domain/entities/user"
import type { Admin } from "@/domain/entities/admin"
import type { Category } from "@/domain/entities/category"
import type { Store } from "@/domain/entities/store"

/**
 * Fetches all users for export
 * @param limit Number of users to fetch per page
 * @returns Promise with array of all users
 */
export async function fetchAllUsersForExport(limit = 100): Promise<User[]> {
  let allUsers: User[] = []
  let currentPage = 1
  let hasMorePages = true

  try {
    while (hasMorePages) {
      const response = await userService.getUsers({
        page: currentPage,
        limit,
        sortField: "full_name",
        sortOrder: "asc",
      })

      allUsers = [...allUsers, ...response.data]

      // Check if there are more pages
      hasMorePages = response.pagination.hasNextPage
      currentPage++

      // Safety check to prevent infinite loops
      if (currentPage > 100) {
        console.warn("Stopped fetching users after 100 pages")
        break
      }
    }

    return allUsers
  } catch (error) {
    console.error("Error fetching all users for export:", error)
    throw error
  }
}

/**
 * Fetches all admins for export
 * @param limit Number of admins to fetch per page
 * @returns Promise with array of all admins
 */
export async function fetchAllAdminsForExport(limit = 100): Promise<Admin[]> {
  let allAdmins: Admin[] = []
  let currentPage = 1
  let hasMorePages = true

  try {
    while (hasMorePages) {
      const response = await adminService.getAdmins({
        page: currentPage,
        limit,
        sortField: "full_name",
        sortOrder: "asc",
      })

      // Handle different response formats
      let adminData = []
      if (Array.isArray(response)) {
        adminData = response
      } else if (response.data && Array.isArray(response.data)) {
        adminData = response.data
        hasMorePages = response.pagination.hasNextPage
      } else if (response.admins && Array.isArray(response.admins)) {
        adminData = response.admins
        hasMorePages = response.pagination.hasNextPage
      } else {
        const possibleAdmins = Object.values(response).find((val) => Array.isArray(val))
        if (possibleAdmins) {
          adminData = possibleAdmins
        }
        hasMorePages = false // Can't determine pagination, so stop after first page
      }

      allAdmins = [...allAdmins, ...adminData]
      currentPage++

      // Safety check to prevent infinite loops
      if (currentPage > 100) {
        console.warn("Stopped fetching admins after 100 pages")
        break
      }
    }

    return allAdmins
  } catch (error) {
    console.error("Error fetching all admins for export:", error)
    throw error
  }
}

/**
 * Fetches all categories for export
 * @param limit Number of categories to fetch per page
 * @returns Promise with array of all categories
 */
export async function fetchAllCategoriesForExport(limit = 100): Promise<Category[]> {
  let allCategories: Category[] = []
  let currentPage = 1
  let hasMorePages = true

  try {
    while (hasMorePages) {
      const response = await categoryService.getCategories({
        page: currentPage,
        limit,
        sortField: "title",
        sortOrder: "asc",
      })

      allCategories = [...allCategories, ...response.data]

      // Check if there are more pages
      hasMorePages = response.pagination.hasNextPage
      currentPage++

      // Safety check to prevent infinite loops
      if (currentPage > 100) {
        console.warn("Stopped fetching categories after 100 pages")
        break
      }
    }

    return allCategories
  } catch (error) {
    console.error("Error fetching all categories for export:", error)
    throw error
  }
}

/**
 * Fetches all stores for export
 * @param limit Number of stores to fetch per page
 * @returns Promise with array of all stores
 */
export async function fetchAllStoresForExport(limit = 100): Promise<Store[]> {
  let allStores: Store[] = []
  let currentPage = 1
  let hasMorePages = true

  try {
    while (hasMorePages) {
      const response = await storeService.getStores({
        page: currentPage,
        limit,
        sortField: "title",
        sortOrder: "asc",
      })

      allStores = [...allStores, ...response.data]

      // Check if there are more pages
      hasMorePages = response.pagination.hasNextPage
      currentPage++

      // Safety check to prevent infinite loops
      if (currentPage > 100) {
        console.warn("Stopped fetching stores after 100 pages")
        break
      }
    }

    return allStores
  } catch (error) {
    console.error("Error fetching all stores for export:", error)
    throw error
  }
}
