"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CustomDialog } from "@/components/ui/custom-dialog"
import { Loader } from "lucide-react"

interface CategoryStatusDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  categoryName: string
  isActivating: boolean
}

export function CategoryStatusDialog({
  open,
  onClose,
  onConfirm,
  categoryName,
  isActivating,
}: CategoryStatusDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const title = isActivating ? "Activate category" : "Inactivate category"
  const actionText = isActivating ? "activate" : "inactivate"
  const buttonText = isActivating ? "Activate" : "Inactivate"
  const loadingText = isActivating ? "Activating..." : "Inactivating..."
  const buttonClass = isActivating ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (isProcessing) return
    onClose()
  }

  return (
    <CustomDialog open={open} onClose={handleClose} title={title}>
      <div className="py-4">
        <p className="mb-2">
          Are you sure you want to {actionText} <span className="font-medium text-green-600">{categoryName}</span>{" "}
          category?
        </p>
        <p className="text-sm text-gray-500">
          If you {actionText} it, all related stores will {isActivating ? "appear" : "disappear"} again.
        </p>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} className={`${buttonClass} text-white`} disabled={isProcessing}>
          {isProcessing ? (
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
