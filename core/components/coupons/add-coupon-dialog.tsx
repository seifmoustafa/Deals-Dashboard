"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { DiscountType, CouponCreateDTO } from "@/domain/entities/coupon"

interface AddCouponDialogProps {
  open: boolean
  onClose: () => void
  onSave: (coupon: CouponCreateDTO) => Promise<void>
  storeId: string
  isLoading?: boolean
}

export function AddCouponDialog({ open, onClose, onSave, storeId, isLoading = false }: AddCouponDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    discount_type: "" as DiscountType,
    discount: 0,
    cashback: 0,
    expiry_date: undefined as Date | undefined,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.title || !formData.discount_type || !formData.expiry_date) {
      return
    }

    const couponData: CouponCreateDTO = {
      code: formData.code,
      store: storeId,
      title: formData.title,
      discount_type: formData.discount_type,
      expiry_date: format(formData.expiry_date, "M/d/yyyy"),
    }

    // Add discount or cashback based on type
    if (formData.discount_type === "DISCOUNT" || formData.discount_type === "DISCOUNT_AND_CASHBACK") {
      couponData.discount = formData.discount
    }
    if (formData.discount_type === "CASHBACK" || formData.discount_type === "DISCOUNT_AND_CASHBACK") {
      couponData.cashback = formData.cashback
    }

    await onSave(couponData)

    // Reset form
    setFormData({
      code: "",
      title: "",
      discount_type: "" as DiscountType,
      discount: 0,
      cashback: 0,
      expiry_date: undefined,
    })
  }

  const handleClose = () => {
    setFormData({
      code: "",
      title: "",
      discount_type: "" as DiscountType,
      discount: 0,
      cashback: 0,
      expiry_date: undefined,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Coupon</DialogTitle>
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expiry_date ? format(formData.expiry_date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.expiry_date}
                  onSelect={(date) => setFormData({ ...formData, expiry_date: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Adding..." : "Add Coupon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
