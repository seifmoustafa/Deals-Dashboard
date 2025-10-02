import type {
  Store,
  StoreCreateRequest,
  StoreUpdateRequest,
  StoresResponse,
  BulkActionResponse,
} from "../entities/store"

export interface StoreRepository {
  getStores(params: {
    page?: number
    limit?: number
    sortField?: string
    sortOrder?: "asc" | "desc"
    search?: string
  }): Promise<StoresResponse>

  getStoreById(id: string): Promise<Store>

  getStoresByCategoryId(
    categoryId: string,
    params: {
      page?: number
      limit?: number
      sortField?: string
      sortOrder?: "asc" | "desc"
      search?: string
    },
  ): Promise<StoresResponse>

  createStore(store: StoreCreateRequest): Promise<Store>

  updateStore(id: string, store: StoreUpdateRequest): Promise<Store>

  uploadStoreImage(storeId: string, imageFile: File): Promise<Store>

  deleteStore(id: string): Promise<{ message: string }>

  activateStore(id: string): Promise<{ message: string }>

  deactivateStore(id: string): Promise<{ message: string }>

  activateSelectedStores(storeIds: string[]): Promise<BulkActionResponse>

  deactivateSelectedStores(storeIds: string[]): Promise<BulkActionResponse>

  deleteSelectedStores(storeIds: string[]): Promise<BulkActionResponse>
}
