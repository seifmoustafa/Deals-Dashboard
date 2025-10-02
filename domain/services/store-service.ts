import type {
  Store,
  StoreCreateRequest,
  StoreUpdateRequest,
  StoresResponse,
  BulkActionResponse,
} from "../entities/store"
import type { StoreRepository } from "../repositories/store-repository"

export class StoreService {
  private storeRepository: StoreRepository

  constructor(storeRepository: StoreRepository) {
    this.storeRepository = storeRepository
  }

  async getStores(params: {
    page?: number
    limit?: number
    sortField?: string
    sortOrder?: "asc" | "desc"
    search?: string
  }): Promise<StoresResponse> {
    return this.storeRepository.getStores(params)
  }

  async getStoreById(id: string): Promise<Store> {
    return this.storeRepository.getStoreById(id)
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
    return this.storeRepository.getStoresByCategoryId(categoryId, params)
  }

  async createStore(store: StoreCreateRequest): Promise<Store> {
    return this.storeRepository.createStore(store)
  }

  async updateStore(id: string, store: StoreUpdateRequest): Promise<Store> {
    return this.storeRepository.updateStore(id, store)
  }

  async uploadStoreImage(storeId: string, imageFile: File): Promise<Store> {
    return this.storeRepository.uploadStoreImage(storeId, imageFile)
  }

  async deleteStore(id: string): Promise<{ message: string }> {
    return this.storeRepository.deleteStore(id)
  }

  async activateStore(id: string): Promise<{ message: string }> {
    return this.storeRepository.activateStore(id)
  }

  async deactivateStore(id: string): Promise<{ message: string }> {
    return this.storeRepository.deactivateStore(id)
  }

  async activateSelectedStores(storeIds: string[]): Promise<BulkActionResponse> {
    return this.storeRepository.activateSelectedStores(storeIds)
  }

  async deactivateSelectedStores(storeIds: string[]): Promise<BulkActionResponse> {
    return this.storeRepository.deactivateSelectedStores(storeIds)
  }

  async deleteSelectedStores(storeIds: string[]): Promise<BulkActionResponse> {
    return this.storeRepository.deleteSelectedStores(storeIds)
  }
}
