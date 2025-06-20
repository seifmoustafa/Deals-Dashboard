"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface OfferSuccessDialogProps {
  open: boolean
  onClose: () => void
  storeName: string
  categoryName: string
  cashbackRate: number
  couponCount: number
}

export function OfferSuccessDialog({
  open,
  onClose,
  storeName,
  categoryName,
  cashbackRate,
  couponCount,
}: OfferSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Offers added successfully</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Store:</span>
            <span className="font-medium">{storeName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <span className="font-medium">{categoryName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cashback Rate:</span>
            <span className="font-medium">{cashbackRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Number of coupons:</span>
            <span className="font-medium">{couponCount}</span>
          </div>
        </div>
        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
            Go back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
