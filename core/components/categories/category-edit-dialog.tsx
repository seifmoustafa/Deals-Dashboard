"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomDialog } from "@/components/ui/custom-dialog"
import { Loader } from "lucide-react"

interface CategoryEditDialogProps {
  open: boolean
  onClose: () => void
  onSave: (title: string) => void
  initialTitle: string
}

export function CategoryEditDialog({ open, onClose, onSave, initialTitle }: CategoryEditDialogProps) {
  const [title, setTitle] = useState(initialTitle)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(title)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (isSaving) return
    setTitle(initialTitle) // Reset to initial value
    onClose()
  }

  return (
    <CustomDialog open={open} onClose={handleClose} title="Edit category">
      <div className="py-4">
        <div className="space-y-2">
          <label htmlFor="categoryName" className="text-sm font-medium">
            Category Name
          </label>
          <Input
            id="categoryName"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
            autoFocus
            disabled={isSaving}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={handleClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={isSaving || !title.trim()}
        >
          {isSaving ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </CustomDialog>
  )
}
