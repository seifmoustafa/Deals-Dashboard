import type { Coupon, CreateCouponDto, UpdateCouponDto, CouponsResponse } from "../entities/coupon"

export interface CouponService {
  getCouponsByStoreId(storeId: string, page?: number, limit?: number): Promise<CouponsResponse>
  getCouponById(id: string): Promise<Coupon>
  createCoupon(coupon: CreateCouponDto): Promise<Coupon>
  updateCoupon(id: string, coupon: UpdateCouponDto): Promise<Coupon>
  deleteCoupon(id: string): Promise<void>
}
