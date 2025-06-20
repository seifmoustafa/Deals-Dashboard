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

interface BulkActionDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  action: "activate" | "deactivate" | "delete"
  selectedCount: number
  isLoading: boolean
}

export function BulkActionDialog({
  open,
  onClose,
  onConfirm,
  action,
  selectedCount,
  isLoading,
}: BulkActionDialogProps) {
  const actionText = {
    activate: "activate",
    deactivate: "deactivate",
    delete: "delete",
  }

  const loadingText = {
    activate: "Activating",
    deactivate: "Deactivating",
    delete: "Deleting",
  }

  const buttonVariant = action === "delete" ? "destructive" : "default"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {action === "activate"
              ? "Activate Selected Stores"
              : action === "deactivate"
                ? "Deactivate Selected Stores"
                : "Delete Selected Stores"}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {actionText[action]} {selectedCount} selected stores?
            {action === "delete" && " This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant={buttonVariant} onClick={onConfirm} disabled={isLoading}>
            {isLoading
              ? `${loadingText[action]}...`
              : actionText[action].charAt(0).toUpperCase() + actionText[action].slice(1)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
