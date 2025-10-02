"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StoresTable } from "@/core/components/stores/stores-table"
import { StoreAddDialog } from "@/core/components/stores/store-add-dialog"
import { storeService } from "@/infrastructure/di/container"
import { showToast } from "@/core/components/ui/animated-toast"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function CategoryStoresPage() {
  const params = useParams()
  const categoryId = params?.id as string

  const [category, setCategory] = useState<{ id: string; title: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddingStore, setIsAddingStore] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const fetchCategoryFromStores = async () => {
      try {
        setIsLoading(true)
        // Fetch stores for this category to get the category info
        const storesResponse = await storeService.getStoresByCategoryId(categoryId, {
          page: 1,
          limit: 1, // We only need one store to get the category info
        })

        if (storesResponse.data.length > 0) {
          const firstStore = storesResponse.data[0]
          if (firstStore.category) {
            const categoryInfo = {
              id: firstStore.category._id,
              title: firstStore.category.title,
            }
            console.log(`✅ Found category from stores:`, categoryInfo)
            setCategory(categoryInfo)
          } else {
            console.log(`❌ Store has no category information`)
            showToast({
              type: "error",
              title: "Error",
              message: "Category information not found",
            })
          }
        } else {
          console.log(`❌ No stores found for category ID: ${categoryId}`)
          showToast({
            type: "error",
            title: "Error",
            message: "Category not found or has no stores",
          })
        }
      } catch (error) {
        console.error("Failed to fetch category from stores:", error)
        showToast({
          type: "error",
          title: "Error",
          message: "Failed to fetch category. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (categoryId) {
      fetchCategoryFromStores()
    }
  }, [categoryId])

  const handleAddStore = async (title: string, imageFile: File | null, storeUrl: string, description: string, countries: string[]) => {
    if (!category) return

    try {
      setIsAddingStore(true)

      // Step 1: Create store without image
      const createdStore = await storeService.createStore({
        title,
        store_url: storeUrl,
        category: category.id,
        description,
        countries,
      })

      // Step 2: Upload image if provided
      if (imageFile) {
        try {
          await storeService.uploadStoreImage(createdStore.id, imageFile)
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError)
          showToast({
            type: "warning",
            title: "Store created",
            message: "Store was created but image upload failed. You can update the image later.",
          })
        }
      }

      showToast({
        type: "success",
        title: "Success",
        message: "Store added successfully",
      })

      setIsAddDialogOpen(false)
      // Trigger a refresh of the stores table
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error("Failed to add store:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to add store. Please try again.",
      })
    } finally {
      setIsAddingStore(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Breadcrumb and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm">
          <Link href="/dashboard/categories" className="text-gray-500 hover:text-gray-700">
            Categories
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="font-medium">{category?.title || "Loading..."}</span>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add store
        </Button>
      </div>

      {/* Stores Table */}
      {category ? (
        <StoresTable categoryId={category.id} categoryTitle={category.title} refreshTrigger={refreshTrigger} />
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading stores...</p>
          </div>
        </div>
      )}

      {/* Add Store Dialog */}
      <StoreAddDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddStore}
        isLoading={isAddingStore}
        categoryId={category?.id || ""}
      />
    </div>
  )
}

