"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { categoryService } from "@/infrastructure/di/container"
import { useRouter } from "next/navigation"
import { showToast } from "@/core/components/ui/animated-toast"
import type { Category } from "@/domain/entities/category"
import { Skeleton } from "@/components/ui/skeleton"

interface EditCategoryFormProps {
  categorySlug: string
}

export function EditCategoryForm({ categorySlug }: EditCategoryFormProps) {
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true)
        // Get all categories and find the one with matching slug
        const response = await categoryService.getCategories({
          page: 1,
          limit: 100,
        })

        const foundCategory = response.data.find((cat) => cat.slug === categorySlug)

        if (foundCategory) {
          setCategory(foundCategory)
          setTitle(foundCategory.title)
        } else {
          showToast({
            type: "error",
            title: "Error",
            message: "Category not found",
          })
          router.push("/dashboard/categories")
        }
      } catch (error) {
        console.error("Failed to fetch category:", error)
        showToast({
          type: "error",
          title: "Error",
          message: "Failed to fetch category details",
        })
        router.push("/dashboard/categories")
      } finally {
        setIsLoading(false)
      }
    }

    if (categorySlug) {
      fetchCategory()
    }
  }, [categorySlug, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category) return

    if (!title.trim()) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Category title is required",
      })
      return
    }

    try {
      setIsSaving(true)
      await categoryService.updateCategory(category.id, {
        title: title.trim(),
      })

      showToast({
        type: "success",
        title: "Success",
        message: "Category updated successfully",
      })

      router.push("/dashboard/categories")
    } catch (error) {
      console.error("Failed to update category:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to update category. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/categories")
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-end space-x-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!category) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">Category Not Found</h2>
            <p className="text-gray-600 mt-2">The category you're trying to edit doesn't exist.</p>
            <Button className="mt-4" onClick={handleCancel}>
              Back to Categories
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Category</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Category Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter category title"
              disabled={isSaving}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !title.trim()} className="bg-green-600 hover:bg-green-700">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
