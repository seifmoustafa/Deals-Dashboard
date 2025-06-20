"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StoresTable } from "@/core/components/stores/stores-table"
import { StoreAddDialog } from "@/core/components/stores/store-add-dialog"
import { categoryService, storeService } from "@/infrastructure/di/container"
import { showToast } from "@/core/components/ui/animated-toast"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function CategoryStoresPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [category, setCategory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddingStore, setIsAddingStore] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true)
        const categories = await categoryService.getCategories({})
        const foundCategory = categories.data.find((cat: any) => cat.slug === slug || cat.id === slug)

        if (foundCategory) {
          setCategory(foundCategory)
        } else {
          showToast({
            type: "error",
            title: "Error",
            message: "Category not found",
          })
        }
      } catch (error) {
        console.error("Failed to fetch category:", error)
        showToast({
          type: "error",
          title: "Error",
          message: "Failed to fetch category. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchCategory()
    }
  }, [slug])

  const handleAddStore = async (title: string, imageUrl: string, storeUrl: string, cashbackRate: number) => {
    if (!category) return

    try {
      setIsAddingStore(true)

      await storeService.createStore({
        title,
        image: { url: imageUrl },
        store_url: storeUrl,
        category: category.id,
        cashback: {
          rate: cashbackRate,
        },
      })

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
      <StoresTable categoryId={category?.id} categoryTitle={category?.title} refreshTrigger={refreshTrigger} />

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
