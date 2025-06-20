import type { Category } from "@/domain/entities/category"

export class CategoryMapper {
  static toDomain(raw: any): Category {
    return {
      id: raw.id || raw._id,
      title: raw.title,
      colorCode: raw.color_code,
      order: raw.order,
      isFeatured: raw.is_featured,
      storeCount: raw.store_count,
      activeCouponCount: raw.active_coupon_count,
      averageSavings: raw.average_savings,
      isActive: raw.is_active,
      deletedAt: raw.deleted_at,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      slug: raw.slug,
    }
  }

  static toDTO(domain: Category): any {
    return {
      _id: domain.id,
      title: domain.title,
      color_code: domain.colorCode,
      order: domain.order,
      is_featured: domain.isFeatured,
      store_count: domain.storeCount,
      active_coupon_count: domain.activeCouponCount,
      average_savings: domain.averageSavings,
      is_active: domain.isActive,
      deleted_at: domain.deletedAt,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      slug: domain.slug,
    }
  }
}
