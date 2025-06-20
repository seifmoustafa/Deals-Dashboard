"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/core/hooks/use-debounce"
import { categoryService } from "@/infrastructure/di/container"
import type { Category, CategoriesPagination } from "@/domain/entities/category"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { showToast } from "@/core/components/ui/animated-toast"
import { CategoryEditDialog } from "./category-edit-dialog"
import { CategoryStatusDialog } from "./category-status-dialog"
import { CategoryDeleteDialog } from "./category-delete-dialog"
import { BulkActionDialog } from "./bulk-action-dialog"
import { Check, X, Trash, Download, Search, Filter, ChevronLeft, ChevronRight, Edit, UserX, Users } from "lucide-react"
import { SimpleDropdown } from "@/core/components/ui/simple-dropdown"
import { ExportServiceImpl } from "@/data/services/export-service-impl"
import { fetchAllCategoriesForExport } from "@/core/utils/export-utils"

type CategoriesPaginationParams = {
  page: number
  limit: number
  sortField?: string
  sortOrder?: "asc" | "dec"
  search?: string
}

interface CategoriesTableProps {
  refreshTrigger?: number
}

export function CategoriesTable({ refreshTrigger }: CategoriesTableProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<CategoriesPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [params, setParams] = useState<CategoriesPaginationParams>({
    page: 1,
    limit: 10,
    sortField: "title",
    sortOrder: "asc",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Dialog states
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [categoryToToggleStatus, setCategoryToToggleStatus] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [bulkAction, setBulkAction] = useState<{
    type: "activate" | "deactivate" | "delete"
    show: boolean
  }>({ type: "activate", show: false })

  // Loading states
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingSelected, setIsExportingSelected] = useState(false)

  // Export service instance
  const exportService = new ExportServiceImpl()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await categoryService.getCategories({
          ...params,
          search: debouncedSearchTerm || undefined,
        })
        setCategories(response.data)
        setPagination(response.pagination)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        showToast({
          type: "error",
          title: "Error",
          message: "Failed to fetch categories. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [params, debouncedSearchTerm, refreshTrigger])

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

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, categoryId])
    } else {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId))
    }
  }

  const handleSelectAllCategories = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(categories.map((category) => category.id))
    } else {
      setSelectedCategories([])
    }
  }

  // Export functions
  const handleExportAllCategories = async () => {
    try {
      setIsExporting(true)
      showToast({
        type: "info",
        title: "Export Started",
        message: "Fetching all categories for export...",
      })

      const allCategories = await fetchAllCategoriesForExport()
      const blob = await exportService.exportCategoriesToExcel(allCategories)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `categories_export_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showToast({
        type: "success",
        title: "Export Successful",
        message: `Successfully exported ${allCategories.length} categories to Excel`,
      })
    } catch (error) {
      console.error("Failed to export categories:", error)
      showToast({
        type: "error",
        title: "Export Failed",
        message: "Failed to export categories. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportSelectedCategories = async () => {
    if (selectedCategories.length === 0) {
      showToast({
        type: "error",
        title: "No Categories Selected",
        message: "Please select at least one category to export.",
      })
      return
    }

    try {
      setIsExportingSelected(true)
      showToast({
        type: "info",
        title: "Export Started",
        message: "Exporting selected categories...",
      })

      const selectedCategoryData = categories.filter((category) => selectedCategories.includes(category.id))
      const blob = await exportService.exportCategoriesToExcel(selectedCategoryData)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `selected_categories_export_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showToast({
        type: "success",
        title: "Export Successful",
        message: `Successfully exported ${selectedCategoryData.length} selected categories to Excel`,
      })
    } catch (error) {
      console.error("Failed to export selected categories:", error)
      showToast({
        type: "error",
        title: "Export Failed",
        message: "Failed to export selected categories. Please try again.",
      })
    } finally {
      setIsExportingSelected(false)
    }
  }

  // Individual category actions
  const handleEditCategorySave = async (newTitle: string) => {
    if (!categoryToEdit) return

    try {
      const updatedCategory = await categoryService.updateCategory(categoryToEdit.id, {
        title: newTitle,
      })

      setCategories((prevCategories) =>
        prevCategories.map((cat) => (cat.id === categoryToEdit.id ? updatedCategory : cat)),
      )

      showToast({
        type: "success",
        title: "Category Updated",
        message: "Category title has been updated successfully",
      })
    } catch (error) {
      console.error("Failed to update category:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to update category. Please try again.",
      })
    } finally {
      setCategoryToEdit(null)
    }
  }

  const handleToggleStatus = async () => {
    if (!categoryToToggleStatus) return

    try {
      let response
      if (categoryToToggleStatus.isActive) {
        response = await categoryService.deactivateCategory(categoryToToggleStatus.id)
      } else {
        response = await categoryService.activateCategory(categoryToToggleStatus.id)
      }

      setCategories((prevCategories) =>
        prevCategories.map((cat) => (cat.id === categoryToToggleStatus.id ? { ...cat, isActive: !cat.isActive } : cat)),
      )

      showToast({
        type: "success",
        title: categoryToToggleStatus.isActive ? "Category Deactivated" : "Category Activated",
        message: response.message,
      })
    } catch (error) {
      console.error("Failed to update category status:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to update category status. Please try again.",
      })
    } finally {
      setCategoryToToggleStatus(null)
    }
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      setIsDeleting(true)
      await categoryService.deleteCategory(categoryToDelete.id)

      setCategories((prevCategories) => prevCategories.filter((cat) => cat.id !== categoryToDelete.id))

      showToast({
        type: "success",
        title: "Category Deleted",
        message: "Category has been deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete category:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to delete category. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setCategoryToDelete(null)
    }
  }

  // Bulk actions
  const handleBulkAction = async () => {
    if (selectedCategories.length === 0) return

    try {
      setIsBulkActionLoading(true)
      let response

      switch (bulkAction.type) {
        case "activate":
          response = await categoryService.activateSelectedCategories(selectedCategories)
          setCategories((prevCategories) =>
            prevCategories.map((cat) => (selectedCategories.includes(cat.id) ? { ...cat, isActive: true } : cat)),
          )
          showToast({
            type: "success",
            title: "Categories Activated",
            message: `${response.modifiedCount} categories have been activated successfully`,
          })
          break

        case "deactivate":
          response = await categoryService.deactivateSelectedCategories(selectedCategories)
          setCategories((prevCategories) =>
            prevCategories.map((cat) => (selectedCategories.includes(cat.id) ? { ...cat, isActive: false } : cat)),
          )
          showToast({
            type: "success",
            title: "Categories Deactivated",
            message: `${response.modifiedCount} categories have been deactivated successfully`,
          })
          break

        case "delete":
          response = await categoryService.deleteSelectedCategories(selectedCategories)
          setCategories((prevCategories) => prevCategories.filter((cat) => !selectedCategories.includes(cat.id)))
          showToast({
            type: "success",
            title: "Categories Deleted",
            message: `${response.deletedCount} categories have been deleted successfully`,
          })
          break
      }

      setSelectedCategories([])
    } catch (error) {
      console.error(`Failed to ${bulkAction.type} categories:`, error)
      showToast({
        type: "error",
        title: "Error",
        message: `Failed to ${bulkAction.type} categories. Please try again.`,
      })
    } finally {
      setIsBulkActionLoading(false)
      setBulkAction({ type: "activate", show: false })
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-medium">Categories List</h3>

          <div className="flex items-center space-x-2">
            {/* Export buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAllCategories}
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
                  Export All
                </>
              )}
            </Button>

            {selectedCategories.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSelectedCategories}
                  disabled={isExportingSelected}
                  className="text-primary border-primary hover:bg-primary/10"
                >
                  {isExportingSelected ? (
                    <>
                      <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-1" />
                      Export Selected ({selectedCategories.length})
                    </>
                  )}
                </Button>

                {/* Bulk action buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkAction({ type: "activate", show: true })}
                  disabled={isBulkActionLoading}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Activate Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkAction({ type: "deactivate", show: true })}
                  disabled={isBulkActionLoading}
                  className="text-amber-600 border-amber-600 hover:bg-amber-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Deactivate Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkAction({ type: "delete", show: true })}
                  disabled={isBulkActionLoading}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Input
              placeholder="Search for categories"
              className="pr-8"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search categories"
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
                    checked={selectedCategories.length === categories.length && categories.length > 0}
                    onCheckedChange={handleSelectAllCategories}
                  />
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>N Of Stores</TableHead>
                <TableHead>Status</TableHead>
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
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => handleSelectCategory(category.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => router.push(`/dashboard/categories/${category.slug}/stores`)}
                        className="text-primary hover:text-primary/80 text-left font-medium hover:underline"
                      >
                        {category.title}
                      </button>
                    </TableCell>
                    <TableCell>{category.storeCount}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          category.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <SimpleDropdown
                        items={[
                          {
                            label: "Edit Category",
                            onClick: () => setCategoryToEdit(category),
                            icon: <Edit className="h-4 w-4" />,
                          },
                          {
                            label: category.isActive ? "Deactivate Category" : "Activate Category",
                            onClick: () => setCategoryToToggleStatus(category),
                            icon: category.isActive ? <UserX className="h-4 w-4" /> : <Users className="h-4 w-4" />,
                            className: category.isActive ? "text-amber-600" : "text-green-600",
                          },
                          {
                            label: "Delete Category",
                            onClick: () => setCategoryToDelete(category),
                            icon: <Trash className="h-4 w-4" />,
                            className: "text-red-600",
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchTerm ? (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <p className="text-sm text-gray-500">No categories found matching "{searchTerm}"</p>
                        <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                          Clear search
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No categories found</p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && categories.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {(pagination.currentPage - 1) * params.limit + 1} to{" "}
              {Math.min(pagination.currentPage * params.limit, pagination.totalCategories)} of{" "}
              {pagination.totalCategories} results
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

      {/* Edit Category Dialog */}
      <CategoryEditDialog
        open={!!categoryToEdit}
        onClose={() => setCategoryToEdit(null)}
        onSave={handleEditCategorySave}
        initialTitle={categoryToEdit?.title || ""}
      />

      {/* Toggle Status Dialog */}
      {categoryToToggleStatus && (
        <CategoryStatusDialog
          open={!!categoryToToggleStatus}
          onClose={() => setCategoryToToggleStatus(null)}
          onConfirm={handleToggleStatus}
          categoryName={categoryToToggleStatus.title}
          isActivating={!categoryToToggleStatus.isActive}
        />
      )}

      {/* Delete Category Dialog */}
      {categoryToDelete && (
        <CategoryDeleteDialog
          open={!!categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={handleDeleteCategory}
          categoryName={categoryToDelete.title}
          isDeleting={isDeleting}
        />
      )}

      {/* Bulk Action Dialog */}
      <BulkActionDialog
        open={bulkAction.show}
        onClose={() => setBulkAction({ type: "activate", show: false })}
        onConfirm={handleBulkAction}
        action={bulkAction.type}
        selectedCount={selectedCategories.length}
        isLoading={isBulkActionLoading}
      />
    </div>
  )
}
