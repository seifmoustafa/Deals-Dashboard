import type {
  Category,
  CategoryCreateDTO,
  CategoryUpdateDTO,
  CategoriesPaginationParams,
  CategoriesResponse,
} from "@/domain/entities/category"
import type { CategoryRepository } from "@/domain/repositories/category-repository"
import type { ApiClient } from "../api/api-client"
import { CategoryMapper } from "../mappers/category-mapper"

export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(private apiClient: ApiClient) {}

  async getCategories(params: CategoriesPaginationParams): Promise<CategoriesResponse> {
    try {
      const response = await this.apiClient.get<{
        data: any[]
        pagination: any
      }>("/categories", params)

      return {
        data: response.data.map(CategoryMapper.toDomain),
        pagination: response.pagination,
      }
    } catch (error) {
      throw error
    }
  }

  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await this.apiClient.get<any>(`/categories/${id}`)
      return CategoryMapper.toDomain(response)
    } catch (error) {
      throw error
    }
  }

  async createCategory(data: CategoryCreateDTO): Promise<Category> {
    try {
      const response = await this.apiClient.post<any>("/categories", {
        title: data.title,
        color_code: data.colorCode || "#000000",
        order: data.order || 0,
        is_featured: data.isFeatured || false,
      })
      return CategoryMapper.toDomain(response)
    } catch (error) {
      throw error
    }
  }

  async updateCategory(id: string, data: CategoryUpdateDTO): Promise<Category> {
    try {
      const dto: Record<string, any> = {}

      if (data.title !== undefined) dto.title = data.title
      if (data.colorCode !== undefined) dto.color_code = data.colorCode
      if (data.order !== undefined) dto.order = data.order
      if (data.isFeatured !== undefined) dto.is_featured = data.isFeatured
      if (data.isActive !== undefined) dto.is_active = data.isActive

      const response = await this.apiClient.patch<any>(`/categories/${id}`, dto)
      return CategoryMapper.toDomain(response)
    } catch (error) {
      throw error
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`/categories/${id}`)
    } catch (error) {
      throw error
    }
  }

  async activateCategory(id: string): Promise<{ message: string }> {
    try {
      const response = await this.apiClient.patch<{ message: string }>(`/categories/activate-category?id=${id}`, {})
      return response
    } catch (error) {
      throw error
    }
  }

  async deactivateCategory(id: string): Promise<{ message: string }> {
    try {
      const response = await this.apiClient.patch<{ message: string }>(`/categories/inactivate-category?id=${id}`, {})
      return response
    } catch (error) {
      throw error
    }
  }

  async activateSelectedCategories(categoryIds: string[]): Promise<{ message: string; modifiedCount: number }> {
    try {
      const response = await this.apiClient.patch<{ message: string; modifiedCount: number }>(
        "/categories/activate-selectedCategory",
        { categoryIds },
      )
      return response
    } catch (error) {
      throw error
    }
  }

  async deactivateSelectedCategories(categoryIds: string[]): Promise<{ message: string; modifiedCount: number }> {
    try {
      const response = await this.apiClient.patch<{ message: string; modifiedCount: number }>(
        "/categories/inactivate-selectedCategory",
        { categoryIds },
      )
      return response
    } catch (error) {
      throw error
    }
  }

  async deleteSelectedCategories(categoryIds: string[]): Promise<{ message: string; deletedCount: number }> {
    try {
      const response = await this.apiClient.delete<{ message: string; deletedCount: number }>(
        "/categories/delete-selectedCategory",
        { categoryIds },
      )
      return response
    } catch (error) {
      throw error
    }
  }
}
