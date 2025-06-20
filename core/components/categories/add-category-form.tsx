"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { categoryService } from "@/infrastructure/di/container"
import type { CategoryCreateDTO } from "@/domain/entities/category"

export function AddCategoryForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CategoryCreateDTO>({
    title: "",
    colorCode: "#000000",
    order: 0,
    isFeatured: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isFeatured: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await categoryService.createCategory(formData)

      toast({
        title: "Category created",
        description: "The category has been created successfully.",
      })

      router.push("/dashboard/categories")
    } catch (error) {
      console.error("Failed to create category:", error)
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/categories")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white p-6 rounded-md border">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Category Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="Enter category title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="colorCode">Color Code</Label>
          <div className="flex items-center gap-2">
            <Input
              id="colorCode"
              name="colorCode"
              type="color"
              value={formData.colorCode}
              onChange={handleChange}
              className="w-12 h-10 p-1"
            />
            <Input name="colorCode" value={formData.colorCode} onChange={handleChange} className="flex-1" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Display Order</Label>
          <Input id="order" name="order" type="number" value={formData.order} onChange={handleChange} />
          <p className="text-xs text-gray-500">Lower numbers will be displayed first</p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="isFeatured" checked={formData.isFeatured} onCheckedChange={handleCheckboxChange} />
          <Label htmlFor="isFeatured">Featured category</Label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Category"}
        </Button>
      </div>
    </form>
  )
}
