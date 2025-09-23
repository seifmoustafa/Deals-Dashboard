import type { ApiClient } from "../api/api-client"
import type {
  Store,
  StoreCreateRequest,
  StoreUpdateRequest,
  StoresResponse,
  BulkActionResponse,
} from "@/domain/entities/store"
import type { StoreRepository } from "@/domain/repositories/store-repository"

export class StoreRepositoryImpl implements StoreRepository {
  private apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  async getStores(params: {
    page?: number
    limit?: number
    sortField?: string
    sortOrder?: "asc" | "desc"
    search?: string
  }): Promise<StoresResponse> {
    return this.apiClient.get<StoresResponse>("/stores", params)
  }

  async getStoreById(id: string): Promise<Store> {
    return this.apiClient.get<Store>(`/stores/${id}`)
  }

  async getStoresByCategoryId(
    categoryId: string,
    params: {
      page?: number
      limit?: number
      sortField?: string
      sortOrder?: "asc" | "desc"
      search?: string
    },
  ): Promise<StoresResponse> {
    // Use the specific endpoint for category filtering
    return this.apiClient.get<StoresResponse>(`/stores/stores-bycategoryId/${categoryId}`, params)
  }

  async createStore(store: StoreCreateRequest): Promise<Store> {
    return this.apiClient.post<Store>("/stores", store)
  }

  async updateStore(id: string, store: StoreUpdateRequest): Promise<Store> {
    return this.apiClient.patch<Store>(`/stores/${id}`, store)
  }

  async deleteStore(id: string): Promise<{ message: string }> {
    return this.apiClient.delete<{ message: string }>(`/stores/${id}`)
  }

  async activateStore(id: string): Promise<{ message: string }> {
    // Use the correct endpoint that sends the ID in the request body
    return this.apiClient.patch<{ message: string }>(`/stores/activate-store`, { id })
  }

  async deactivateStore(id: string): Promise<{ message: string }> {
    // Use the correct endpoint that sends the ID in the request body
    return this.apiClient.patch<{ message: string }>(`/stores/inactivate-store`, { id })
  }

  async activateSelectedStores(storeIds: string[]): Promise<BulkActionResponse> {
    return this.apiClient.patch<BulkActionResponse>("/stores/activate-selectedStore", { storeIds })
  }

  async deactivateSelectedStores(storeIds: string[]): Promise<BulkActionResponse> {
    return this.apiClient.patch<BulkActionResponse>("/stores/inactivate-selectedStore", { storeIds })
  }

  async deleteSelectedStores(storeIds: string[]): Promise<BulkActionResponse> {
    return this.apiClient.post<BulkActionResponse>("/stores/delete-selectedStore", { storeIds })
  }
}
