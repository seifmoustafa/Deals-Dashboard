import type { Category, CategoriesPagination } from "../entities/category"

export type CategoryParams = {
  page?: number
  limit?: number
  sortField?: string
  sortOrder?: "asc" | "dec"
  search?: string
}

export type CategoryCreateParams = {
  title: string
  colorCode?: string
  order?: number
  isFeatured?: boolean
}

export type CategoryUpdateParams = {
  title?: string
  colorCode?: string
  order?: number
  isFeatured?: boolean
  isActive?: boolean
}

export type BulkActionResponse = {
  message: string
  modifiedCount: number
}

export type BulkDeleteResponse = {
  message: string
  deletedCount: number
}

export interface CategoryRepository {
  getCategories(params?: CategoryParams): Promise<{ data: Category[]; pagination: CategoriesPagination }>
  getCategoryById(id: string): Promise<Category>
  createCategory(params: CategoryCreateParams): Promise<Category>
  updateCategory(id: string, params: CategoryUpdateParams): Promise<Category>
  deleteCategory(id: string): Promise<{ message: string }>
  activateCategory(id: string): Promise<{ message: string }>
  deactivateCategory(id: string): Promise<{ message: string }>
  activateSelectedCategories(categoryIds: string[]): Promise<BulkActionResponse>
  deactivateSelectedCategories(categoryIds: string[]): Promise<BulkActionResponse>
  deleteSelectedCategories(categoryIds: string[]): Promise<BulkDeleteResponse>
}
