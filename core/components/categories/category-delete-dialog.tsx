"use client"

import { Button } from "@/components/ui/button"
import { CustomDialog } from "@/components/ui/custom-dialog"
import { Loader } from "lucide-react"

interface CategoryDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  categoryName: string
  isDeleting: boolean
}

export function CategoryDeleteDialog({
  open,
  onClose,
  onConfirm,
  categoryName,
  isDeleting,
}: CategoryDeleteDialogProps) {
  const handleClose = () => {
    if (isDeleting) return
    onClose()
  }

  return (
    <CustomDialog open={open} onClose={handleClose} title="Delete category">
      <div className="py-4">
        <p className="mb-2">
          Are you sure you want to delete <span className="font-medium text-red-600">{categoryName}</span> category?
        </p>
        <p className="text-sm text-gray-500">
          This action cannot be undone. This will permanently delete the category and all related data.
        </p>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white" disabled={isDeleting}>
          {isDeleting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </div>
    </CustomDialog>
  )
}
