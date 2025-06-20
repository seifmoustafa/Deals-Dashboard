"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, ArrowLeft, Plus } from "lucide-react"
import { categoryService, storeService, couponService } from "@/infrastructure/di/container"
import type { Category } from "@/domain/entities/category"
import type { Store } from "@/domain/entities/store"
import { useRouter } from "next/navigation"
import type { Coupon, CreateCouponDto } from "@/domain/entities/coupon"
import { CouponFormDialog } from "@/core/components/coupons/coupon-form-dialog"
import { DeleteCouponDialog } from "@/core/components/coupons/delete-coupon-dialog"
import { CouponCard } from "@/core/components/coupons/coupon-card"
import { OfferSuccessDialog } from "@/core/components/coupons/offer-success-dialog"
import { showToast } from "@/core/components/ui/animated-toast"

export default function AddOfferPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedStore, setSelectedStore] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingStores, setIsLoadingStores] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false)

  // Dialog states
  const [showCouponDialog, setShowCouponDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add")
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const [selectedCategoryName, setSelectedCategoryName] = useState("")
  const [selectedStoreName, setSelectedStoreName] = useState("")

  // Load categories on component mount
  useEffect(() => {
    loadCategories()
  }, [])

  // Load stores when category is selected and moving to step 2
  useEffect(() => {
    if (currentStep === 2 && selectedCategory) {
      loadStoresByCategory(selectedCategory)
    }
  }, [currentStep, selectedCategory])

  useEffect(() => {
    if (currentStep === 3 && selectedStore) {
      loadCouponsByStore(selectedStore)
    }
  }, [currentStep, selectedStore])

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const response = await categoryService.getCategories({ page: 1, limit: 100 })
      setCategories(response.data)
    } catch (error) {
      console.error("Failed to load categories:", error)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const loadStoresByCategory = async (categoryId: string) => {
    try {
      setIsLoadingStores(true)
      const response = await storeService.getStoresByCategoryId(categoryId, { page: 1, limit: 100 })
      setStores(response.data)
    } catch (error) {
      console.error("Failed to load stores:", error)
    } finally {
      setIsLoadingStores(false)
    }
  }

  const loadCouponsByStore = async (storeId: string) => {
    try {
      setIsLoadingCoupons(true)
      const response = await couponService.getCouponsByStoreId(storeId, 1, 100)
      setCoupons(response.data)
    } catch (error) {
      console.error("Failed to load coupons:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load coupons. Please try again.",
      })
    } finally {
      setIsLoadingCoupons(false)
    }
  }

  const handleAddCoupon = () => {
    setDialogMode("add")
    setEditingCoupon(null)
    setShowCouponDialog(true)
  }

  const handleEditCoupon = async (coupon: Coupon) => {
    try {
      // Fetch the full coupon details
      const fullCoupon = await couponService.getCouponById(coupon._id)
      setDialogMode("edit")
      setEditingCoupon(fullCoupon)
      setShowCouponDialog(true)
    } catch (error) {
      console.error("Failed to load coupon details:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load coupon details. Please try again.",
      })
    }
  }

  const handleDeleteCoupon = (coupon: Coupon) => {
    setDeletingCoupon(coupon)
    setShowDeleteDialog(true)
  }

  const handleSaveCoupon = async (couponData: CreateCouponDto) => {
    try {
      setIsProcessing(true)
      console.log("Saving coupon with mode:", dialogMode, "Data:", couponData)

      if (dialogMode === "add") {
        const newCoupon = await couponService.createCoupon(couponData)
        setCoupons((prev) => [...prev, newCoupon])
        showToast({
          type: "success",
          title: "Success",
          message: "Coupon added successfully",
        })
      } else if (dialogMode === "edit" && editingCoupon) {
        console.log("Updating coupon with ID:", editingCoupon._id)
        const updatedCoupon = await couponService.updateCoupon(editingCoupon._id, couponData)
        setCoupons((prev) => prev.map((c) => (c._id === editingCoupon._id ? updatedCoupon : c)))
        showToast({
          type: "success",
          title: "Success",
          message: "Coupon updated successfully",
        })
      }
    } catch (error) {
      console.error("Failed to save coupon:", error)
      showToast({
        type: "error",
        title: "Error",
        message: `Failed to ${dialogMode === "add" ? "add" : "update"} coupon. Please try again.`,
      })
      // Don't close the dialog on error by not calling setShowCouponDialog(false)
      throw error // Re-throw so the form dialog knows there was an error
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingCoupon) return

    try {
      setIsProcessing(true)
      await couponService.deleteCoupon(deletingCoupon._id)
      setCoupons((prev) => prev.filter((c) => c._id !== deletingCoupon._id))
      showToast({
        type: "success",
        title: "Success",
        message: "Coupon deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete coupon:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to delete coupon. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmitOffer = () => {
    // Get selected category and store names
    const category = categories.find((c) => c.id === selectedCategory)
    const store = stores.find((s) => s.id === selectedStore)

    setSelectedCategoryName(category?.title || "")
    setSelectedStoreName(store?.title || "")
    setShowSuccessDialog(true)
  }

  const handleNext = () => {
    if (currentStep === 1 && selectedCategory) {
      setCurrentStep(2)
    } else if (currentStep === 2 && selectedStore) {
      // Set the names for the success dialog
      const category = categories.find((c) => c.id === selectedCategory)
      const store = stores.find((s) => s.id === selectedStore)
      setSelectedCategoryName(category?.title || "")
      setSelectedStoreName(store?.title || "")
      setCurrentStep(3)
    }
  }

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
      setSelectedStore("") // Reset store selection when going back
    } else if (currentStep === 3) {
      setCurrentStep(2)
    }
  }

  const canProceed = () => {
    if (currentStep === 1) return selectedCategory !== ""
    if (currentStep === 2) return selectedStore !== ""
    return false
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Cashback & Coupon</span>
        <span>»</span>
        <span>Add offer</span>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4 mb-8">
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            currentStep === 1 ? "bg-green-600 text-white" : "bg-green-100 text-green-600"
          }`}
        >
          <span>Select a category</span>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400" />
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            currentStep === 2
              ? "bg-green-600 text-white"
              : currentStep > 2
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-400"
          }`}
        >
          <span>Select a store</span>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400" />
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            currentStep === 3 ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"
          }`}
        >
          <span>Add offer</span>
        </div>
      </div>

      {/* Step 1: Select Category */}
      {currentStep === 1 && (
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="select" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCategories ? (
                  <SelectItem value="loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Store */}
      {currentStep === 2 && (
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store</label>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="select" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingStores ? (
                  <SelectItem value="loading" disabled>
                    Loading stores...
                  </SelectItem>
                ) : stores.length === 0 ? (
                  <SelectItem value="no-stores" disabled>
                    No stores available
                  </SelectItem>
                ) : (
                  stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between">
            <Button onClick={handlePrevious} variant="outline" className="text-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Manage Coupons */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleAddCoupon}
              className="bg-green-600 hover:bg-green-700 text-white border border-green-600 rounded-full px-4 py-2"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add coupon
            </Button>
            <div className="flex space-x-2">
              <Button onClick={handlePrevious} variant="outline" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button onClick={handleSubmitOffer} className="bg-green-600 hover:bg-green-700 text-white">
                Submit
              </Button>
            </div>
          </div>

          {isLoadingCoupons ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <CouponCard
                  key={coupon._id}
                  coupon={coupon}
                  storeName={selectedStoreName}
                  categoryName={selectedCategoryName}
                  onEdit={handleEditCoupon}
                  onDelete={handleDeleteCoupon}
                />
              ))}

              {coupons.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No coupons found. Add your first coupon to get started.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <CouponFormDialog
        open={showCouponDialog}
        onClose={() => setShowCouponDialog(false)}
        onSave={handleSaveCoupon}
        storeId={selectedStore}
        isLoading={isProcessing}
        editCoupon={editingCoupon}
        mode={dialogMode}
      />

      <DeleteCouponDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        couponTitle={deletingCoupon?.title || ""}
        isLoading={isProcessing}
      />

      <OfferSuccessDialog
        open={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false)
          router.push("/dashboard/cashback")
        }}
        storeName={selectedStoreName}
        categoryName={selectedCategoryName}
        cashbackRate={stores.find((s) => s.id === selectedStore)?.cashback?.rate || 0}
        couponCount={coupons.length}
      />
    </div>
  )
}
