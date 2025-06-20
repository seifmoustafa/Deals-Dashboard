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
import { Loader } from "lucide-react"

interface CashbackBulkActionDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  action: "activate" | "deactivate" | "delete"
  selectedCount: number
  isLoading: boolean
}

export function CashbackBulkActionDialog({
  open,
  onClose,
  onConfirm,
  action,
  selectedCount,
  isLoading,
}: CashbackBulkActionDialogProps) {
  const getActionText = () => {
    switch (action) {
      case "activate":
        return "activate"
      case "deactivate":
        return "deactivate"
      case "delete":
        return "delete"
      default:
        return "update"
    }
  }

  const getActionColor = () => {
    switch (action) {
      case "activate":
        return "bg-green-600 hover:bg-green-700"
      case "deactivate":
        return "bg-amber-600 hover:bg-amber-700"
      case "delete":
        return "bg-red-600 hover:bg-red-700"
      default:
        return "bg-gray-600 hover:bg-gray-700"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="capitalize">{getActionText()} offers</DialogTitle>
          <DialogDescription>
            Are you sure you want to {getActionText()} {selectedCount} selected offer{selectedCount !== 1 ? "s" : ""}?
            {action === "delete" && " This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" className={getActionColor()} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                {getActionText().charAt(0).toUpperCase() + getActionText().slice(1)}ing...
              </>
            ) : (
              getActionText().charAt(0).toUpperCase() + getActionText().slice(1)
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
