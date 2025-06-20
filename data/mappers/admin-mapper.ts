import type { Admin } from "@/domain/entities/admin"

export class AdminMapper {
  static toDomain(raw: any): Admin {
    return {
      id: raw.id || raw._id,
      fullName: raw.full_name,
      email: raw.email,
      username: raw.username,
      role: raw.role,
      isActive: raw.is_active,
      deletedAt: raw.deleted_at,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  static toDTO(domain: Admin): any {
    return {
      _id: domain.id,
      full_name: domain.fullName,
      email: domain.email,
      username: domain.username,
      role: domain.role,
      is_active: domain.isActive,
      deleted_at: domain.deletedAt,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    }
  }
}
