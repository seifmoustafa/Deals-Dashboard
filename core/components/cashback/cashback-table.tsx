"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useDebounce } from "@/core/hooks/use-debounce"
import { storeService } from "@/infrastructure/di/container"
import type { Store, StoresResponse } from "@/domain/entities/store"
import { Skeleton } from "@/components/ui/skeleton"
import { SimpleDropdown } from "@/core/components/ui/simple-dropdown"
import { StoreEditDialog } from "../stores/store-edit-dialog"
import { StoreDeleteDialog } from "../stores/store-delete-dialog"
import { CashbackBulkActionDialog } from "./cashback-bulk-action-dialog"
import Image from "next/image"
import { Search, ChevronLeft, ChevronRight, Filter, Download, Trash2, CheckCircle, XCircle, Edit } from "lucide-react"
import { showToast } from "@/core/components/ui/animated-toast"
import { fetchAllStoresForExport } from "@/core/utils/export-utils"
import { ExportServiceImpl } from "@/data/services/export-service-impl"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"

type StoresPaginationParams = {
  page: number
  limit: number
  sortField?: string
  sortOrder?: "asc" | "desc"
  search?: string
}

interface CashbackTableProps {
  refreshTrigger?: number
}

export function CashbackTable({ refreshTrigger = 0 }: CashbackTableProps) {
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
  const router = useRouter()

  // Selection state
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [selectAllChecked, setSelectAllChecked] = useState(false)

  // Dialog states
  const [storeToEdit, setStoreToEdit] = useState<Store | null>(null)
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null)
  const [bulkAction, setBulkAction] = useState<{
    type: "activate" | "deactivate" | "delete"
    show: boolean
  }>({ type: "activate", show: false })

  // Loading states
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportService = new ExportServiceImpl()

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoading(true)
        const response = await storeService.getStores({
          ...params,
          search: debouncedSearchTerm || undefined,
        })

        // Log store data for debugging
        console.log(
          "Store data:",
          response.data.map((store) => ({
            id: store.id,
            _id: store._id,
            title: store.title,
          })),
        )

        setStores(response.data)
        setPagination(response.pagination)

        // Reset selection when data changes
        setSelectedRows({})
        setSelectAllChecked(false)
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
  }, [params, debouncedSearchTerm, refreshTrigger])

  // When search term changes, reset to page 1
  useEffect(() => {
    if (params.page !== 1) {
      setParams((prev) => ({ ...prev, page: 1 }))
    }
  }, [debouncedSearchTerm])

  // Handle individual row selection
  const handleRowSelection = (storeId: string, checked: boolean) => {
    console.log(`Row selection: storeId=${storeId}, checked=${checked}`)

    setSelectedRows((prev) => {
      const newSelection = { ...prev }
      newSelection[storeId] = checked

      console.log("New selection state:", newSelection)
      return newSelection
    })
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    console.log(`Select all: checked=${checked}`)

    setSelectAllChecked(checked)

    if (checked) {
      // Create a new object with all store IDs set to true
      const newSelection: Record<string, boolean> = {}
      stores.forEach((store) => {
        newSelection[store.id] = true
      })
      setSelectedRows(newSelection)
    } else {
      // Clear all selections
      setSelectedRows({})
    }
  }

  // Get selected store IDs as an array
  const getSelectedStoreIds = (): string[] => {
    return Object.entries(selectedRows)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id)
  }

  // Count selected stores
  const selectedCount = Object.values(selectedRows).filter(Boolean).length

  // Check if all stores on current page are selected
  useEffect(() => {
    if (stores.length === 0) {
      setSelectAllChecked(false)
      return
    }

    const allSelected = stores.every((store) => selectedRows[store.id] === true)
    setSelectAllChecked(allSelected)
  }, [selectedRows, stores])

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Bulk actions
  const handleBulkActivate = async () => {
    const selectedIds = getSelectedStoreIds()
    try {
      setIsBulkActionLoading(true)

      // Update selected stores to active status
      const updatePromises = selectedIds.map((storeId) => storeService.updateStore(storeId, { is_active: true }))

      await Promise.all(updatePromises)

      // Refresh the table
      setParams((prev) => ({ ...prev }))
      setSelectedRows({})
      setSelectAllChecked(false)

      showToast({
        type: "success",
        title: "Success",
        message: `${selectedIds.length} store(s) activated successfully`,
      })
    } catch (error) {
      console.error("Failed to activate stores:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to activate stores. Please try again.",
      })
    } finally {
      setIsBulkActionLoading(false)
      setBulkAction({ type: "activate", show: false })
    }
  }

  const handleBulkDeactivate = async () => {
    const selectedIds = getSelectedStoreIds()
    try {
      setIsBulkActionLoading(true)

      // Update selected stores to inactive status
      const updatePromises = selectedIds.map((storeId) => storeService.updateStore(storeId, { is_active: false }))

      await Promise.all(updatePromises)

      // Refresh the table
      setParams((prev) => ({ ...prev }))
      setSelectedRows({})
      setSelectAllChecked(false)

      showToast({
        type: "success",
        title: "Success",
        message: `${selectedIds.length} store(s) deactivated successfully`,
      })
    } catch (error) {
      console.error("Failed to deactivate stores:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to deactivate stores. Please try again.",
      })
    } finally {
      setIsBulkActionLoading(false)
      setBulkAction({ type: "deactivate", show: false })
    }
  }

  const handleBulkDelete = async () => {
    const selectedIds = getSelectedStoreIds()
    try {
      setIsBulkActionLoading(true)

      // Delete selected stores
      const deletePromises = selectedIds.map((storeId) => storeService.deleteStore(storeId))

      await Promise.all(deletePromises)

      // Remove deleted stores from the current view
      setStores((prevStores) => prevStores.filter((store) => !selectedIds.includes(store.id)))
      setSelectedRows({})
      setSelectAllChecked(false)

      showToast({
        type: "success",
        title: "Success",
        message: `${selectedIds.length} store(s) deleted successfully`,
      })
    } catch (error) {
      console.error("Failed to delete stores:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to delete stores. Please try again.",
      })
    } finally {
      setIsBulkActionLoading(false)
      setBulkAction({ type: "delete", show: false })
    }
  }

  const handleExportToCsv = async () => {
    try {
      setIsExporting(true)

      // Fetch all stores for export
      const allStores = await fetchAllStoresForExport()

      // Convert stores to cashback format for export
      const cashbackData = allStores.map((store) => ({
        id: store.id,
        title: store.title,
        category: store.category?.title || "",
        cashback_rate: store.cashback?.rate || 0,
        active_coupons: store.active_coupons || 0,
        is_active: store.is_active,
        store_url: store.store_url || "",
        created_at: store.created_at || "",
      }))

      // Create CSV content
      const headers = ["Store Name", "Category", "Number of Active Coupons", "Status", "Store URL", "Created At"]
      const csvContent = [
        headers.join(","),
        ...cashbackData.map((store) =>
          [
            `"${store.title}"`,
            `"${store.category}"`,
            store.active_coupons,
            store.is_active ? "Active" : "Inactive",
            `"${store.store_url}"`,
            `"${store.created_at}"`,
          ].join(","),
        ),
      ].join("\n")

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `cashback-offers-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showToast({
        type: "success",
        title: "Success",
        message: "Cashback data exported successfully",
      })
    } catch (error) {
      console.error("Failed to export data:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to export data. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Individual store actions
  const handleEditStoreSave = async (title: string, imageUrl: string, storeUrl: string, cashbackRate: number) => {
    if (!storeToEdit) return

    try {
      setIsEditing(true)
      const updatedStore = await storeService.updateStore(storeToEdit.id, {
        title,
        image: { url: imageUrl },
        store_url: storeUrl,
        cashback: { rate: cashbackRate },
      })

      setStores((prevStores) => prevStores.map((store) => (store.id === storeToEdit.id ? updatedStore : store)))

      showToast({
        type: "success",
        title: "Success",
        message: "Store updated successfully",
      })
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

  const handleDeleteStore = async () => {
    if (!storeToDelete) return

    try {
      setIsDeleting(true)
      await storeService.deleteStore(storeToDelete.id)
      setStores((prevStores) => prevStores.filter((store) => store.id !== storeToDelete.id))

      showToast({
        type: "success",
        title: "Success",
        message: "Store deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete store:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to delete store. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setStoreToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-medium">Cashback & Coupons List</h3>

          <div className="flex items-center space-x-2">
            {/* Export buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToCsv}
              disabled={isExporting || isLoading}
              className="text-primary border-primary hover:bg-primary/10"
            >
              {isExporting ? (
                <>
                  <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </>
              )}
            </Button>

            {selectedCount > 0 && (
              <>
                {/* Bulk action buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkAction({ type: "activate", show: true })}
                  disabled={isBulkActionLoading}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Activate Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkAction({ type: "deactivate", show: true })}
                  disabled={isBulkActionLoading}
                  className="text-amber-600 border-amber-600 hover:bg-amber-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Deactivate Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkAction({ type: "delete", show: true })}
                  disabled={isBulkActionLoading}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Input
              placeholder="Search for offers or stores"
              className="pr-8"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search offers"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <Button variant="outline" size="icon" className="ml-auto" aria-label="Filter">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectAllChecked}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Select all stores"
                  />
                </TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>N Of Coupons</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox disabled />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : stores.length > 0 ? (
                stores.map((store) => {
                  // Ensure we have a valid ID
                  const storeId = store.id || store._id || ""
                  const isSelected = !!selectedRows[storeId]

                  return (
                    <TableRow key={storeId}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            // Prevent event bubbling
                            handleRowSelection(storeId, !!checked)
                          }}
                          aria-label={`Select ${store.title}`}
                          onClick={(e) => {
                            // Stop propagation to prevent row selection
                            e.stopPropagation()
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 relative flex-shrink-0">
                            <Image
                              src={store.image?.url || "/placeholder.svg"}
                              alt={store.title || "Store"}
                              fill
                              className="object-contain rounded-lg"
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{store.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{store.category?.title || "—"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">{store.active_coupons || "—"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <SimpleDropdown
                          items={[
                            {
                              label: "Edit Offer",
                              onClick: () => {
                                const storeIdToUse = store.id || store._id
                                if (storeIdToUse) {
                                  router.push(`/dashboard/cashback/edit-offer/${storeIdToUse}`)
                                } else {
                                  showToast({
                                    type: "error",
                                    title: "Error",
                                    message: "Store ID not found",
                                  })
                                }
                              },
                              icon: <Edit className="h-4 w-4" />,
                            },
                            {
                              label: "Delete Store",
                              onClick: () => setStoreToDelete(store),
                              icon: <Trash2 className="h-4 w-4" />,
                              className: "text-red-600",
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchTerm ? (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <p className="text-sm text-gray-500">No offers found matching "{searchTerm}"</p>
                        <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                          Clear search
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No offers found</p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && stores.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {(pagination.currentPage - 1) * params.limit + 1} to{" "}
              {Math.min(pagination.currentPage * params.limit, pagination.totalStores || 0)} of{" "}
              {pagination.totalStores || 0} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNumber: number

                if (pagination.totalPages <= 5) {
                  pageNumber = i + 1
                } else if (pagination.currentPage <= 3) {
                  pageNumber = i + 1
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNumber = pagination.totalPages - 4 + i
                } else {
                  pageNumber = pagination.currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNumber}
                    variant="outline"
                    size="sm"
                    className={`w-9 p-0 ${
                      pagination.currentPage === pageNumber ? "bg-green-50 text-green-600 border-green-200" : ""
                    }`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}

              {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
                <>
                  <div className="px-2">...</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-9 p-0"
                    onClick={() => handlePageChange(pagination.totalPages)}
                  >
                    {pagination.totalPages}
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs remain the same */}
      {storeToEdit && (
        <StoreEditDialog
          open={!!storeToEdit}
          onClose={() => setStoreToEdit(null)}
          onSave={handleEditStoreSave}
          initialTitle={storeToEdit.title}
          initialImageUrl={storeToEdit.image?.url || ""}
          initialStoreUrl={storeToEdit.store_url || ""}
          initialCashbackRate={storeToEdit.cashback?.rate || 0}
          isLoading={isEditing}
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

      <CashbackBulkActionDialog
        open={bulkAction.show}
        onClose={() => setBulkAction({ type: "activate", show: false })}
        onConfirm={() => {
          if (bulkAction.type === "activate") {
            handleBulkActivate()
          } else if (bulkAction.type === "deactivate") {
            handleBulkDeactivate()
          } else if (bulkAction.type === "delete") {
            handleBulkDelete()
          }
        }}
        action={bulkAction.type}
        selectedCount={selectedCount}
        isLoading={isBulkActionLoading}
      />
    </div>
  )
}
