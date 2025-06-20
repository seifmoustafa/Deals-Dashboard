import type { Category, CategoriesPagination } from "../entities/category"
import type {
  CategoryRepository,
  CategoryParams,
  CategoryCreateParams,
  CategoryUpdateParams,
  BulkActionResponse,
  BulkDeleteResponse,
} from "../repositories/category-repository"

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async getCategories(params?: CategoryParams): Promise<{ data: Category[]; pagination: CategoriesPagination }> {
    return this.categoryRepository.getCategories(params)
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.categoryRepository.getCategoryById(id)
  }

  async createCategory(params: CategoryCreateParams): Promise<Category> {
    return this.categoryRepository.createCategory(params)
  }

  async updateCategory(id: string, params: CategoryUpdateParams): Promise<Category> {
    return this.categoryRepository.updateCategory(id, params)
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    return this.categoryRepository.deleteCategory(id)
  }

  async activateCategory(id: string): Promise<{ message: string }> {
    return this.categoryRepository.activateCategory(id)
  }

  async deactivateCategory(id: string): Promise<{ message: string }> {
    return this.categoryRepository.deactivateCategory(id)
  }

  async activateSelectedCategories(categoryIds: string[]): Promise<BulkActionResponse> {
    return this.categoryRepository.activateSelectedCategories(categoryIds)
  }

  async deactivateSelectedCategories(categoryIds: string[]): Promise<BulkActionResponse> {
    return this.categoryRepository.deactivateSelectedCategories(categoryIds)
  }

  async deleteSelectedCategories(categoryIds: string[]): Promise<BulkDeleteResponse> {
    return this.categoryRepository.deleteSelectedCategories(categoryIds)
  }
}
