import type { PaginatedResult } from "./pagination"

export enum DiscountType {
  DISCOUNT = "DISCOUNT",
  CASHBACK = "CASHBACK",
  DISCOUNT_AND_CASHBACK = "DISCOUNT_AND_CASHBACK",
}

export interface Coupon {
  _id: string
  code: string
  title: string
  description?: string
  discount_type: DiscountType
  discount: number
  cashback: number
  country: string
  minimum_purchase: {
    currency: string
  }
  terms_and_conditions: string[]
  start_date: string
  expiry_date: string
  usage_count: number
  success_rate: number
  average_savings: {
    currency: string
  }
  popularity_score: number
  is_verified: boolean
  is_featured: boolean
  is_active: boolean
  status: string
  deleted_at: string | null
  verified_by: string[]
  reported_not_working: string[]
  createdAt: string
  updatedAt: string
  __v: number
  store?: string | null
}

export interface CreateCouponDto {
  code: string
  store: string
  title: string
  description?: string
  discount_type: DiscountType
  discount?: number
  cashback?: number
  country: string
  expiry_date: string
}

export interface UpdateCouponDto extends Partial<CreateCouponDto> { }

export type CouponsResponse = PaginatedResult<Coupon>

export interface CouponsPaginationParams {
  page?: number
  limit?: number
  store?: string
}
