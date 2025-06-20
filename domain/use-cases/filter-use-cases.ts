import type { UserFilters } from "../entities/filter"
import type { UsersPaginationParams } from "../entities/user"
import { format } from "date-fns"

export class FilterUseCases {
  resetFilters(): UserFilters {
    return {
      gender: {
        male: false,
        female: false,
        other: false,
      },
      status: {
        active: false,
        inactive: false,
      },
      birthDate: null,
      location: {
        country: "",
        city: "",
      },
    }
  }

  updateFilterCategory(filters: UserFilters, category: keyof UserFilters, field: string, value: boolean): UserFilters {
    if (category === "gender" || category === "status") {
      return {
        ...filters,
        [category]: {
          ...filters[category],
          [field]: value,
        },
      }
    }
    return filters
  }

  applyFiltersToParams(filters: UserFilters, currentParams: UsersPaginationParams): UsersPaginationParams {
    const newParams: UsersPaginationParams = {
      ...currentParams,
      page: 1, // Reset to first page when applying filters
    }

    // Add gender filter if any gender is selected
    const selectedGenders = Object.entries(filters.gender)
      .filter(([_, isSelected]) => isSelected)
      .map(([gender]) => gender)

    if (selectedGenders.length > 0) {
      newParams.gender = selectedGenders.join(",")
    }

    // Add status filter
    if (filters.status.active && !filters.status.inactive) {
      newParams.isActive = "true"
    } else if (!filters.status.active && filters.status.inactive) {
      newParams.isActive = "false"
    }

    // Add birth date filter if selected
    if (filters.birthDate) {
      newParams.dateOfBirth = format(filters.birthDate, "yyyy-MM-dd")
    }

    // Add location filters
    if (filters.location.country) {
      newParams.country = filters.location.country
    }

    if (filters.location.city) {
      newParams.city = filters.location.city
    }

    return newParams
  }

  countActiveFilters(filters: UserFilters): number {
    return [
      Object.values(filters.gender).some(Boolean),
      Object.values(filters.status).some(Boolean),
      !!filters.birthDate,
      !!(filters.location.country || filters.location.city),
    ].filter(Boolean).length
  }
}
