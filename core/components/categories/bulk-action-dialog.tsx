"use client"

import { Button } from "@/components/ui/button"
import { CustomDialog } from "@/components/ui/custom-dialog"
import { Loader } from "lucide-react"

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
  const title =
    action === "activate"
      ? "Activate categories"
      : action === "deactivate"
        ? "Deactivate categories"
        : "Delete categories"

  const actionText = action === "activate" ? "activate" : action === "deactivate" ? "deactivate" : "delete"

  const buttonText = action === "activate" ? "Activate" : action === "deactivate" ? "Deactivate" : "Delete"

  const loadingText =
    action === "activate" ? "Activating..." : action === "deactivate" ? "Deactivating..." : "Deleting..."

  const buttonClass =
    action === "activate"
      ? "bg-green-600 hover:bg-green-700"
      : action === "deactivate"
        ? "bg-amber-600 hover:bg-amber-700"
        : "bg-red-600 hover:bg-red-700"

  const handleClose = () => {
    if (isLoading) return
    onClose()
  }

  return (
    <CustomDialog open={open} onClose={handleClose} title={title}>
      <div className="py-4">
        <p className="mb-2">
          Are you sure you want to {actionText} {selectedCount} selected{" "}
          {selectedCount === 1 ? "category" : "categories"}?
        </p>
        {action === "delete" ? (
          <p className="text-sm text-gray-500">
            This action cannot be undone. This will permanently delete the selected categories and all related data.
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            This will {actionText} all selected categories and their related stores will{" "}
            {action === "activate" ? "appear" : "disappear"} again.
          </p>
        )}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} className={`${buttonClass} text-white`} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              {loadingText}
            </>
          ) : (
            buttonText
          )}
        </Button>
      </div>
    </CustomDialog>
  )
}
