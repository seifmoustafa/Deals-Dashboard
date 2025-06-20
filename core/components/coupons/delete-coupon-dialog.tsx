"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface DeleteCouponDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  couponTitle: string
  isLoading?: boolean
}

export function DeleteCouponDialog({
  open,
  onClose,
  onConfirm,
  couponTitle,
  isLoading = false,
}: DeleteCouponDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <DialogTitle>Delete Coupon</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete "{couponTitle}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
