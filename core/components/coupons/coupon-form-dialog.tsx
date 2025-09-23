"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getCountryOptions } from "@/core/utils/countries"
import type { DiscountType, CreateCouponDto, Coupon } from "@/domain/entities/coupon"

interface CouponFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (coupon: CreateCouponDto) => Promise<void>
  storeId: string
  isLoading?: boolean
  editCoupon?: Coupon | null
  mode: "add" | "edit"
}

export function CouponFormDialog({
  open,
  onClose,
  onSave,
  storeId,
  isLoading = false,
  editCoupon = null,
  mode,
}: CouponFormDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    discount_type: "" as DiscountType,
    discount: 0,
    cashback: 0,
    country: "",
    expiry_date: "",
  })
  const [openCountrySelect, setOpenCountrySelect] = useState(false)
  const [countrySearchValue, setCountrySearchValue] = useState("")

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && editCoupon) {
      const expiryDate = editCoupon.expiry_date ? new Date(editCoupon.expiry_date) : null
      setFormData({
        code: editCoupon.code,
        title: editCoupon.title,
        discount_type: editCoupon.discount_type,
        discount: editCoupon.discount || 0,
        cashback: editCoupon.cashback || 0,
        country: editCoupon.country || "",
        expiry_date: expiryDate ? format(expiryDate, "yyyy-MM-dd") : "",
      })
    } else if (mode === "add") {
      // Reset form for add mode
      setFormData({
        code: "",
        title: "",
        discount_type: "" as DiscountType,
        discount: 0,
        cashback: 0,
        country: "",
        expiry_date: "",
      })
    }
    setCountrySearchValue("")
    setOpenCountrySelect(false)
  }, [mode, editCoupon, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.title || !formData.discount_type || !formData.country || !formData.expiry_date) {
      console.log("Form validation failed:", {
        code: formData.code,
        title: formData.title,
        discount_type: formData.discount_type,
        country: formData.country,
        expiry_date: formData.expiry_date,
      })
      return
    }

    try {
      // Convert date from YYYY-MM-DD to M/D/YYYY format for API
      const dateObj = new Date(formData.expiry_date)
      const formattedDate = format(dateObj, "M/d/yyyy")

      const couponData: CreateCouponDto = {
        code: formData.code,
        store: storeId,
        title: formData.title,
        discount_type: formData.discount_type,
        country: formData.country,
        expiry_date: formattedDate,
      }

      // Add discount or cashback based on type
      if (formData.discount_type === "DISCOUNT" || formData.discount_type === "DISCOUNT_AND_CASHBACK") {
        couponData.discount = formData.discount
      }
      if (formData.discount_type === "CASHBACK" || formData.discount_type === "DISCOUNT_AND_CASHBACK") {
        couponData.cashback = formData.cashback
      }

      console.log("Submitting coupon data:", couponData)
      await onSave(couponData)
      handleClose()
    } catch (error) {
      console.error("Error in form submission:", error)
      // Don't close the dialog on error so user can retry
    }
  }

  const handleClose = () => {
    setFormData({
      code: "",
      title: "",
      discount_type: "" as DiscountType,
      discount: 0,
      cashback: 0,
      country: "",
      expiry_date: "",
    })
    setCountrySearchValue("")
    setOpenCountrySelect(false)
    onClose()
  }

  const handleCountrySelect = (country: string) => {
    setFormData({ ...formData, country })
    setCountrySearchValue("")
    setOpenCountrySelect(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Coupon" : "Edit Coupon"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Enter coupon code"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter coupon title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <Popover open={openCountrySelect} onOpenChange={setOpenCountrySelect}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCountrySelect}
                  className="w-full justify-between h-10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                  disabled={isLoading}
                >
                  {formData.country || "Select country..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="p-2">
                  <Input
                    placeholder="Search countries..."
                    value={countrySearchValue}
                    onChange={(e) => setCountrySearchValue(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {getCountryOptions()
                      .filter((country) =>
                        country.label.toLowerCase().includes(countrySearchValue.toLowerCase())
                      )
                      .length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">No country found.</div>
                    ) : (
                      getCountryOptions()
                        .filter((country) =>
                          country.label.toLowerCase().includes(countrySearchValue.toLowerCase())
                        )
                        .map((country) => (
                          <div
                            key={country.value}
                            onClick={() => handleCountrySelect(country.value)}
                            className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded-sm"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.country === country.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {country.label}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <Select
              value={formData.discount_type}
              onValueChange={(value: DiscountType) => setFormData({ ...formData, discount_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DISCOUNT">Discount Only</SelectItem>
                <SelectItem value="CASHBACK">Cashback Only</SelectItem>
                <SelectItem value="DISCOUNT_AND_CASHBACK">Discount & Cashback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.discount_type === "DISCOUNT" || formData.discount_type === "DISCOUNT_AND_CASHBACK") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount</label>
              <Input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                placeholder="Enter discount amount"
                min="0"
              />
            </div>
          )}

          {(formData.discount_type === "CASHBACK" || formData.discount_type === "DISCOUNT_AND_CASHBACK") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cashback Amount</label>
              <Input
                type="number"
                value={formData.cashback}
                onChange={(e) => setFormData({ ...formData, cashback: Number(e.target.value) })}
                placeholder="Enter cashback amount"
                min="0"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <div className="relative">
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full"
                required
                min={format(new Date(), "yyyy-MM-dd")} // Prevent selecting past dates
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading
                ? mode === "add"
                  ? "Adding..."
                  : "Updating..."
                : mode === "add"
                  ? "Add Coupon"
                  : "Update Coupon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
