export interface Category {
  id: string
  title: string
  colorCode: string
  order: number
  isFeatured: boolean
  storeCount: number
  activeCouponCount: number
  averageSavings: number
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  slug: string
}

export interface CategoryCreateDTO {
  title: string
  colorCode?: string
  order?: number
  isFeatured?: boolean
}

export interface CategoryUpdateDTO {
  title?: string
  colorCode?: string
  order?: number
  isFeatured?: boolean
  isActive?: boolean
}

export interface CategoriesPaginationParams {
  page: number
  limit: number
  sortField?: string
  sortOrder?: "asc" | "dec"
  search?: string
}

export interface CategoriesPagination {
  currentPage: number
  totalPages: number
  totalCategories: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface CategoriesResponse {
  data: Category[]
  pagination: CategoriesPagination
}
