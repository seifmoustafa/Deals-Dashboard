"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface StoreStatusDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  storeName: string
  isActivating: boolean
  isLoading: boolean
}

export function StoreStatusDialog({
  open,
  onClose,
  onConfirm,
  storeName,
  isActivating,
  isLoading,
}: StoreStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isActivating ? "Activate Store" : "Deactivate Store"}</DialogTitle>
          <DialogDescription>
            Are you sure you want to {isActivating ? "activate" : "deactivate"} {storeName}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={isActivating ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading
              ? isActivating
                ? "Activating..."
                : "Deactivating..."
              : isActivating
                ? "Activate"
                : "Deactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
