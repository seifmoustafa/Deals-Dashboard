"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/core/hooks/use-debounce"
import { storeService } from "@/infrastructure/di/container"
import type { Store, StoresResponse } from "@/domain/entities/store"
import { Skeleton } from "@/components/ui/skeleton"
import { SimpleDropdown } from "@/core/components/ui/simple-dropdown"
import { StoreEditDialog } from "./store-edit-dialog"
import { StoreStatusDialog } from "./store-status-dialog"
import { StoreDeleteDialog } from "./store-delete-dialog"
import { BulkActionDialog } from "./bulk-action-dialog"
import Image from "next/image"
import { MoreVertical, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { showToast } from "@/core/components/ui/animated-toast"

type StoresPaginationParams = {
  page: number
  limit: number
  sortField?: string
  sortOrder?: "asc" | "desc"
  search?: string
}

interface StoresTableProps {
  categoryId?: string
  categoryTitle?: string
  refreshTrigger?: number
}

export function StoresTable({ categoryId, categoryTitle, refreshTrigger = 0 }: StoresTableProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [pagination, setPagination] = useState<StoresResponse["pagination"] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [params, setParams] = useState<StoresPaginationParams>({
    page: 1,
    limit: 10,
    sortField: "title",
    sortOrder: "asc",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Dialog states
  const [storeToEdit, setStoreToEdit] = useState<Store | null>(null)
  const [storeToToggleStatus, setStoreToToggleStatus] = useState<Store | null>(null)
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null)
  const [bulkAction, setBulkAction] = useState<{
    type: "activate" | "deactivate" | "delete"
    show: boolean
  }>({ type: "activate", show: false })

  // Loading states
  const [isEditing, setIsEditing] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false)

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoading(true)
        let response: StoresResponse

        console.log(`🔍 StoresTable - categoryId: ${categoryId}`)
        console.log(`🔍 StoresTable - categoryId type: ${typeof categoryId}`)
        console.log(`🔍 StoresTable - categoryId truthy: ${!!categoryId}`)

        // Always use getStoresByCategoryId when categoryId is provided
        if (categoryId) {
          const requestParams = {
            ...params,
            search: debouncedSearchTerm || undefined,
          }
          console.log(`🔍 Fetching stores for category ID: ${categoryId}`)
          console.log(`📋 Request params:`, requestParams)
          console.log(`🌐 Expected URL: /stores/stores-bycategoryId/${categoryId}?page=${requestParams.page}&limit=${requestParams.limit}&sortField=${requestParams.sortField}&sortOrder=${requestParams.sortOrder}`)
          
          response = await storeService.getStoresByCategoryId(categoryId, requestParams)
        } else {
          console.log("📋 Fetching all stores (no category filter) with params:", {
            ...params,
            search: debouncedSearchTerm || undefined,
          })
          response = await storeService.getStores({
            ...params,
            search: debouncedSearchTerm || undefined,
          })
        }

        console.log(`Fetched ${response.data.length} stores`)
        setStores(response.data)
        setPagination(response.pagination)
      } catch (error) {
        console.error("Failed to fetch stores:", error)
        showToast({
          type: "error",
          title: "Error",
          message: "Failed to fetch stores. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStores()
  }, [params, debouncedSearchTerm, categoryId, refreshTrigger])

  // When search term changes, reset to page 1
  useEffect(() => {
    if (params.page !== 1) {
      setParams((prev) => ({ ...prev, page: 1 }))
    }
  }, [debouncedSearchTerm])

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Individual store actions
  const handleEditStoreSave = async (title: string, imageFile: File | null, storeUrl: string, description: string, countries: string[]) => {
    if (!storeToEdit) return

    try {
      setIsEditing(true)
      
      // Step 1: Update store without image
      const updatedStore = await storeService.updateStore(storeToEdit.id, {
        title,
        store_url: storeUrl,
        description,
        countries,
      })

      console.log("🔍 Updated store response:", updatedStore)

      // Step 2: Upload new image if provided
      if (imageFile) {
        try {
          const storeWithNewImage = await storeService.uploadStoreImage(updatedStore.id, imageFile)
          console.log("🔍 Store with new image:", storeWithNewImage)
          setStores((prevStores) => prevStores.map((store) => (store.id === storeToEdit.id ? storeWithNewImage : store)))
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError)
          // Still update the store data even if image upload fails
          setStores((prevStores) => prevStores.map((store) => (store.id === storeToEdit.id ? updatedStore : store)))
          showToast({
            type: "warning",
            title: "Store updated",
            message: "Store was updated but image upload failed. You can try updating the image again.",
          })
        }
      } else {
        setStores((prevStores) => prevStores.map((store) => (store.id === storeToEdit.id ? updatedStore : store)))
      }

      showToast({
        type: "success",
        title: "Success",
        message: "Store updated successfully",
      })

      // Refresh the stores list to ensure we have the latest data
      const fetchStores = async () => {
        try {
          setIsLoading(true)
          let response: StoresResponse

          console.log(`🔍 StoresTable - categoryId: ${categoryId}`)
          console.log(`🔍 StoresTable - categoryId type: ${typeof categoryId}`)
          console.log(`🔍 StoresTable - categoryId truthy: ${!!categoryId}`)

          // Always use getStoresByCategoryId when categoryId is provided
          if (categoryId) {
            const requestParams = {
              ...params,
              search: debouncedSearchTerm || undefined,
            }
            console.log(`🔍 Fetching stores for category ID: ${categoryId}`)
            console.log(`📋 Request params:`, requestParams)
            console.log(`🌐 Expected URL: /stores/stores-bycategoryId/${categoryId}?page=${requestParams.page}&limit=${requestParams.limit}&sortField=${requestParams.sortField}&sortOrder=${requestParams.sortOrder}`)
            
            response = await storeService.getStoresByCategoryId(categoryId, requestParams)
          } else {
            console.log("📋 Fetching all stores (no category filter) with params:", {
              ...params,
              search: debouncedSearchTerm || undefined,
            })
            response = await storeService.getStores({
              ...params,
              search: debouncedSearchTerm || undefined,
            })
          }

          console.log(`Fetched ${response.data.length} stores`)
          setStores(response.data)
          setPagination(response.pagination)
        } catch (error) {
          console.error("Failed to fetch stores:", error)
          showToast({
            type: "error",
            title: "Error",
            message: "Failed to fetch stores. Please try again.",
          })
        } finally {
          setIsLoading(false)
        }
      }

      // Refresh the stores list
      await fetchStores()
    } catch (error) {
      console.error("Failed to update store:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to update store. Please try again.",
      })
    } finally {
      setIsEditing(false)
      setStoreToEdit(null)
    }
  }

  const handleToggleStatus = async () => {
    if (!storeToToggleStatus) return

    try {
      setIsTogglingStatus(true)

      console.log(`Toggling status for store ID: ${storeToToggleStatus.id}`)
      console.log(`Current status: ${storeToToggleStatus.is_active ? "Active" : "Inactive"}`)
      console.log(`Will ${storeToToggleStatus.is_active ? "deactivate" : "activate"} the store`)

      if (storeToToggleStatus.is_active) {
        console.log("Calling deactivateStore API...")
        await storeService.deactivateStore(storeToToggleStatus.id)
        console.log("Store deactivated successfully")
      } else {
        console.log("Calling activateStore API...")
        await storeService.activateStore(storeToToggleStatus.id)
        console.log("Store activated successfully")
      }

      // Update the local state optimistically
      setStores((prevStores) =>
        prevStores.map((store) =>
          store.id === storeToToggleStatus.id ? { ...store, is_active: !store.is_active } : store,
        ),
      )

      showToast({
        type: "success",
        title: "Success",
        message: storeToToggleStatus.is_active ? "Store deactivated successfully" : "Store activated successfully",
      })
    } catch (error) {
      console.error("Failed to update store status:", error)
      console.error("Error details:", error)

      // Show more specific error message
      let errorMessage = "Failed to update store status"

      if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as any).message
      } else if (error && typeof error === "object" && "responseData" in error) {
        const responseData = (error as any).responseData
        if (responseData && responseData.message) {
          errorMessage = responseData.message
        }
      }

      showToast({
        type: "error",
        title: "Error",
        message: `${errorMessage}. Please try again.`,
      })
    } finally {
      setIsTogglingStatus(false)
      setStoreToToggleStatus(null)
    }
  }

  const handleDeleteStore = async () => {
    if (!storeToDelete) return

    try {
      setIsDeleting(true)
      console.log(`Attempting to delete store ID: ${storeToDelete.id}`)

      await storeService.deleteStore(storeToDelete.id)
      setStores((prevStores) => prevStores.filter((store) => store.id !== storeToDelete.id))

      showToast({
        type: "success",
        title: "Success",
        message: "Store deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete store:", error)

      let errorMessage = "Failed to delete store"

      if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as any).message
      } else if (error && typeof error === "object" && "responseData" in error) {
        const responseData = (error as any).responseData
        if (responseData && responseData.message) {
          errorMessage = responseData.message
        }
      }

      showToast({
        type: "error",
        title: "Error",
        message: `${errorMessage}. Please try again.`,
      })
    } finally {
      setIsDeleting(false)
      setStoreToDelete(null)
    }
  }

  // Generate pagination pages
  const generatePaginationItems = () => {
    if (!pagination || pagination.totalPages <= 0) return []

    const currentPage = pagination.currentPage
    const totalPages = pagination.totalPages
    const items = []

    // Always show first page
    items.push(1)

    // If we're not on the first few pages, add ellipsis
    if (currentPage > 3) {
      items.push("ellipsis")
    }

    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!items.includes(i)) {
        items.push(i)
      }
    }

    // If we're not on the last few pages, add ellipsis
    if (currentPage < totalPages - 2) {
      items.push("ellipsis")
    }

    // Always show last page if there is more than one page
    if (totalPages > 1 && !items.includes(totalPages)) {
      items.push(totalPages)
    }

    return items
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Stores list</h2>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 flex justify-end">
        <div className="relative w-80">
          <Input
            placeholder="Search for a store"
            value={searchTerm}
            onChange={handleSearchChange}
            className="pr-10 text-sm border-gray-300 focus:border-green-500 focus:ring-green-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Stores List */}
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="px-6 py-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-14 w-14 rounded-lg" />
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                </div>
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
          ))
        ) : stores.length > 0 ? (
          stores.map((store) => (
            <div key={store.id} className="px-6 py-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="h-14 w-14 relative flex-shrink-0">
                    <Image
                      src={store.image?.url || "/placeholder.svg"}
                      alt={store.title || "Store"}
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 mb-2">{store.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2">
                      {store.description || "No description available"}
                    </p>
                    {/* Countries */}
                    {store.countries && store.countries.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {store.countries.map((country, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {country}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Status indicator */}
                    <div className="flex items-center mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          store.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {store.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <SimpleDropdown
                    trigger={
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </Button>
                    }
                    items={[
                      {
                        label: "Edit Store",
                        onClick: () => setStoreToEdit(store),
                        icon: <span className="mr-2">✏️</span>,
                      },
                      {
                        label: store.is_active ? "Deactivate Store" : "Activate Store",
                        onClick: () => setStoreToToggleStatus(store),
                        icon: store.is_active ? <span className="mr-2">🔴</span> : <span className="mr-2">🟢</span>,
                        className: store.is_active ? "text-amber-600" : "text-green-600",
                      },
                      {
                        label: "Delete Store",
                        onClick: () => setStoreToDelete(store),
                        icon: <span className="mr-2">🗑️</span>,
                        className: "text-red-600",
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          ))
        ) : searchTerm ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500 mb-4">No stores found matching "{searchTerm}"</p>
            <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">
              {categoryTitle ? `No stores found in ${categoryTitle}` : "No stores found"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 0 && (
        <div className="flex items-center justify-center py-6 border-t border-gray-200 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="text-gray-600 hover:text-gray-900 text-sm font-normal px-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {generatePaginationItems().map((item, index) => {
              if (item === "ellipsis") {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 text-sm text-gray-400">
                    ...
                  </span>
                )
              }

              const pageNum = item as number
              return (
                <Button
                  key={pageNum}
                  variant={pagination.currentPage === pageNum ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 w-8 p-0 text-sm ${
                    pagination.currentPage === pageNum
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="text-gray-600 hover:text-gray-900 text-sm font-normal px-3"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Dialogs */}
      {storeToEdit && (
        <StoreEditDialog
          open={!!storeToEdit}
          onClose={() => setStoreToEdit(null)}
          onSave={handleEditStoreSave}
          initialTitle={storeToEdit.title}
          initialImageUrl={storeToEdit.image?.url || ""}
          initialStoreUrl={storeToEdit.store_url || ""}
          initialDescription={storeToEdit.description || ""}
          initialCountries={storeToEdit.countries || []}
          isLoading={isEditing}
        />
      )}

      {storeToToggleStatus && (
        <StoreStatusDialog
          open={!!storeToToggleStatus}
          onClose={() => setStoreToToggleStatus(null)}
          onConfirm={handleToggleStatus}
          storeName={storeToToggleStatus.title || ""}
          isActivating={!storeToToggleStatus.is_active}
          isLoading={isTogglingStatus}
        />
      )}

      {storeToDelete && (
        <StoreDeleteDialog
          open={!!storeToDelete}
          onClose={() => setStoreToDelete(null)}
          onConfirm={handleDeleteStore}
          storeName={storeToDelete.title || ""}
          isDeleting={isDeleting}
        />
      )}

      <BulkActionDialog
        open={bulkAction.show}
        onClose={() => setBulkAction({ type: "activate", show: false })}
        onConfirm={() => {}}
        action={bulkAction.type}
        selectedCount={0}
        isLoading={isBulkActionLoading}
      />
    </div>
  )
}
