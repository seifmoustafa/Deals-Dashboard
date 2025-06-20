import type { User } from "@/domain/entities/user"

export class UserMapper {
  static toDomain(dto: any): User {
    if (!dto || typeof dto !== "object") {
      console.error("Invalid DTO received:", dto)
      return {
        id: "",
        firebaseUid: "",
        email: "",
        fullName: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        country: "",
        city: "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    if (!dto.firebase_uid) {
      console.warn(
        "User DTO is missing firebase_uid:",
        JSON.stringify({
          id: dto.id || dto._id,
          email: dto.email,
          full_name: dto.full_name,
        }),
      )
    }

    return {
      id: dto.id?.toString() || dto._id?.toString() || "",
      firebaseUid: dto.firebase_uid || "",
      email: dto.email || "",
      fullName: dto.full_name || "",
      phone: dto.phone || "",
      dateOfBirth: dto.date_of_birth || "",
      gender: dto.gender || "",
      country: dto.country || "",
      city: dto.city || "",
      isActive: dto.is_active ?? true,
      createdAt: dto.created_at || dto.createdAt || new Date().toISOString(),
      updatedAt: dto.updated_at || dto.updatedAt || new Date().toISOString(),
    }
  }

  static toDTO(domain: User): any {
    return {
      _id: domain.id,
      full_name: domain.fullName,
      email: domain.email,
      phone: domain.phone,
      date_of_birth: domain.dateOfBirth,
      gender: domain.gender,
      country: domain.country,
      city: domain.city,
      firebase_uid: domain.firebaseUid,
      total_savings: domain.totalSavings,
      is_active: domain.isActive,
      deleted_at: domain.deletedAt,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      profile_image: domain.profileImage,
    }
  }
}
