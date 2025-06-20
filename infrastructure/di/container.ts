import { ApiClient } from "@/data/api/api-client"
import { AdminRepositoryImpl } from "@/data/repositories/admin-repository-impl"
import { AuthRepositoryImpl } from "@/data/repositories/auth-repository-impl"
import { CategoryRepositoryImpl } from "@/data/repositories/category-repository-impl"
import { CouponRepositoryImpl } from "@/data/repositories/coupon-repository-impl"
import { StoreRepositoryImpl } from "@/data/repositories/store-repository-impl"
import { UserRepositoryImpl } from "@/data/repositories/user-repository-impl"
import { CouponServiceImpl } from "@/data/services/coupon-service-impl"
import { ExportServiceImpl } from "@/data/services/export-service-impl"
import { AdminService } from "@/domain/services/admin-service"
import { AuthService } from "@/domain/services/auth-service"
import { CategoryService } from "@/domain/services/category-service"
import { StoreService } from "@/domain/services/store-service"
import { UserService } from "@/domain/services/user-service"
import { FilterUseCases } from "@/domain/use-cases/filter-use-cases"
import { TokenStorage } from "../storage/token-storage"
import { AdminStorage } from "../storage/admin-storage"

// Create instances
const apiClient = new ApiClient()
const tokenStorage = new TokenStorage()
const adminStorage = new AdminStorage()

// Create repositories
const authRepository = new AuthRepositoryImpl(apiClient, tokenStorage, adminStorage)
const userRepository = new UserRepositoryImpl(apiClient)
const categoryRepository = new CategoryRepositoryImpl(apiClient)
const adminRepository = new AdminRepositoryImpl(apiClient)
const storeRepository = new StoreRepositoryImpl(apiClient)
const couponRepository = new CouponRepositoryImpl(apiClient)

// Create services
export const authService = new AuthService(authRepository)
export const userService = new UserService(userRepository)
export const categoryService = new CategoryService(categoryRepository)
export const exportService = new ExportServiceImpl()
export const adminService = new AdminService(adminRepository)
export const storeService = new StoreService(storeRepository)
export const couponService = new CouponServiceImpl(couponRepository)

// Create use cases
export const filterUseCases = new FilterUseCases()
