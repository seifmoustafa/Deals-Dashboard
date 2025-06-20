"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomDialog } from "@/components/ui/custom-dialog"
import { useTranslation } from "@/core/localization/translation-context"

interface CategoryAddDialogProps {
  open: boolean
  onClose: () => void
  onSave: (title: string) => Promise<void>
  isLoading: boolean
}

export function CategoryAddDialog({ open, onClose, onSave, isLoading }: CategoryAddDialogProps) {
  const [title, setTitle] = useState("")
  const { t } = useTranslation()

  const handleSave = async () => {
    if (!title.trim()) return
    await onSave(title)
    setTitle("") // Reset the input after saving
  }

  const handleClose = () => {
    if (!isLoading) {
      setTitle("") // Clear form when closing
      onClose()
    }
  }

  return (
    <CustomDialog open={open} onClose={handleClose} title={t("categories.addCategory")}>
      <div className="py-6">
        <div className="space-y-3">
          <label htmlFor="categoryName" className="block text-sm font-medium">
            {t("categories.categoryName")}
          </label>
          <Input
            id="categoryName"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 rounded-md"
            placeholder="category"
            autoFocus
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pb-6">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isLoading}
          className="bg-gray-100 hover:bg-gray-200 border-0 h-10 px-5 rounded-md"
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          className="bg-green-500 hover:bg-green-600 h-10 px-5 rounded-md"
          disabled={isLoading || !title.trim()}
        >
          {isLoading ? t("common.loading") : t("common.save")}
        </Button>
      </div>
    </CustomDialog>
  )
}
