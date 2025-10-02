export interface Store {
  _id: string
  id: string
  title: string
  image: {
    url: string
  }
  store_url: string
  category: {
    _id: string
    title: string
    slug: string
    id: string
  } | null
  description: string
  countries: string[]
  average_savings: number
  total_coupons: number
  active_coupons: number
  is_featured: boolean
  is_active: boolean
  popularity_score: number
  deleted_at: string | null
  createdAt: string
  updatedAt: string
  __v: number
}

export interface StoresResponse {
  data: Store[]
  pagination: {
    currentPage: number
    totalPages: number
    totalStores: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface StoreCreateRequest {
  title: string
  store_url: string
  category: string
  description: string
  countries: string[]
}

export interface StoreUpdateRequest {
  title?: string
  store_url?: string
  category?: string
  description?: string
  countries?: string[]
}

export interface BulkActionResponse {
  message: string
  modifiedCount?: number
  deletedCount?: number
}
