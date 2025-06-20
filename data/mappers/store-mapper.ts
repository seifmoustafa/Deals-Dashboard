import type { Store } from "@/domain/entities/store"

export class StoreMapper {
  static toDomain(dto: any): Store {
    return {
      id: dto._id || dto.id,
      title: dto.title,
      image: dto.image,
      store_url: dto.store_url,
      category: {
        id: dto.category._id || dto.category.id,
        title: dto.category.title,
        slug: dto.category.slug,
      },
      cashback: dto.cashback,
      average_savings: dto.average_savings,
      total_coupons: dto.total_coupons,
      active_coupons: dto.active_coupons,
      is_featured: dto.is_featured,
      is_active: dto.is_active,
      popularity_score: dto.popularity_score,
      deleted_at: dto.deleted_at,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    }
  }

  static toDTO(domain: Partial<Store>): any {
    const dto: any = {
      title: domain.title,
      store_url: domain.store_url,
    }

    if (domain.image) {
      dto.image = domain.image
    }

    if (domain.category) {
      dto.category = domain.category.id
    }

    if (domain.cashback) {
      dto.cashback = domain.cashback
    }

    return dto
  }
}
