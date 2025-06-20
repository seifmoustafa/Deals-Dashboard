export interface PaginatedResult<T> {
  data: T[]
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
}
