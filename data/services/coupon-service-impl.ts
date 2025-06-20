import type { CouponService } from "../../domain/services/coupon-service"
import type { CouponRepository } from "../../domain/repositories/coupon-repository"
import type { Coupon, CreateCouponDto, UpdateCouponDto, CouponsResponse } from "../../domain/entities/coupon"

export class CouponServiceImpl implements CouponService {
  constructor(private couponRepository: CouponRepository) {}

  async getCouponsByStoreId(storeId: string, page = 1, limit = 10): Promise<CouponsResponse> {
    return this.couponRepository.getCouponsByStoreId(storeId, page, limit)
  }

  async getCouponById(id: string): Promise<Coupon> {
    return this.couponRepository.getCouponById(id)
  }

  async createCoupon(coupon: CreateCouponDto): Promise<Coupon> {
    return this.couponRepository.createCoupon(coupon)
  }

  async updateCoupon(id: string, coupon: UpdateCouponDto): Promise<Coupon> {
    return this.couponRepository.updateCoupon(id, coupon)
  }

  async deleteCoupon(id: string): Promise<void> {
    return this.couponRepository.deleteCoupon(id)
  }
}
