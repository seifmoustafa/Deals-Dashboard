"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CategoriesTable } from "@/core/components/categories/categories-table"
import { CategoryAddDialog } from "@/core/components/categories/category-add-dialog"
import { categoryService } from "@/infrastructure/di/container"
import { showToast } from "@/core/components/ui/animated-toast"

export default function CategoriesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAddCategory = async (title: string) => {
    try {
      setIsAddingCategory(true)
      await categoryService.createCategory({
        title,
        colorCode: "#000000",
        order: 0,
        isFeatured: false,
      })

      showToast({
        type: "success",
        title: "Category Created",
        message: "Category has been created successfully",
      })

      setIsAddDialogOpen(false)
      setRefreshTrigger((prev) => prev + 1) // Trigger refresh
    } catch (error) {
      console.error("Failed to add category:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to create category. Please try again.",
      })
    } finally {
      setIsAddingCategory(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add category
        </Button>
      </div>

      {/* Categories Table */}
      <CategoriesTable refreshTrigger={refreshTrigger} />

      {/* Add Category Dialog */}
      <CategoryAddDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddCategory}
        isLoading={isAddingCategory}
      />
    </div>
  )
}
