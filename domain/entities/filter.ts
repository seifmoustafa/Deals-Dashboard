// Define filter-related entities
export interface FilterOption {
  id: string
  label: string
}

export interface GenderFilter {
  male: boolean
  female: boolean
  other: boolean
}

export interface StatusFilter {
  active: boolean
  inactive: boolean
}

export interface LocationFilter {
  country: string
  city: string
}

export interface UserFilters {
  gender: GenderFilter
  status: StatusFilter
  birthDate: Date | null
  location: LocationFilter
}

export interface FilterState {
  showBirthDateFilter: boolean
  showLocationFilter: boolean
  filters: UserFilters
}

export const defaultFilters: UserFilters = {
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

export const defaultFilterState: FilterState = {
  showBirthDateFilter: false,
  showLocationFilter: false,
  filters: defaultFilters,
}
