import type { ApiClient } from "@/data/api/api-client"
import type { CouponRepository } from "@/domain/repositories/coupon-repository"
import type { Coupon, CreateCouponDto, UpdateCouponDto } from "@/domain/entities/coupon"
import type { PaginatedResponse } from "@/domain/entities/pagination"

export class CouponRepositoryImpl implements CouponRepository {
  constructor(private apiClient: ApiClient) {}

  async getCouponsByStoreId(storeId: string, page = 1, limit = 10): Promise<PaginatedResponse<Coupon>> {
    try {
      return await this.apiClient.get<PaginatedResponse<Coupon>>(
        `/coupons?store=${storeId}&page=${page}&limit=${limit}`,
      )
    } catch (error) {
      throw error
    }
  }

  async getCouponById(id: string): Promise<Coupon> {
    try {
      return await this.apiClient.get<Coupon>(`/coupons/${id}`)
    } catch (error) {
      throw error
    }
  }

  async createCoupon(coupon: CreateCouponDto): Promise<Coupon> {
    try {
      return await this.apiClient.post<Coupon>("/coupons", coupon)
    } catch (error) {
      throw error
    }
  }

  async updateCoupon(id: string, coupon: UpdateCouponDto): Promise<Coupon> {
    try {
      // Use PATCH instead of PUT for updates
      return await this.apiClient.patch<Coupon>(`/coupons/${id}`, coupon)
    } catch (error) {
      throw error
    }
  }

  async deleteCoupon(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`/coupons/${id}`)
    } catch (error) {
      throw error
    }
  }
}
