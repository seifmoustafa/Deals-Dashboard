"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader, ImageIcon } from "lucide-react"

interface StoreAddDialogProps {
  open: boolean
  onClose: () => void
  onSave: (title: string, imageUrl: string, storeUrl: string, cashbackRate: number) => void
  isLoading: boolean
  categoryId: string
}

export function StoreAddDialog({ open, onClose, onSave, isLoading, categoryId }: StoreAddDialogProps) {
  const [title, setTitle] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [storeUrl, setStoreUrl] = useState("")
  const [cashbackRate, setCashbackRate] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      // Clear form when dialog closes
      setTitle("")
      setImageUrl("")
      setStoreUrl("")
      setCashbackRate(0)
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(title, imageUrl, storeUrl, cashbackRate)
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, you would upload to a server/cloud storage
    // For now, we'll use a placeholder or mock URL
    setIsUploading(true)

    // Simulate upload delay
    setTimeout(() => {
      // For demo, just use a placeholder image URL
      setImageUrl(
        "https://res.cloudinary.com/dnzqyojor/image/upload/v1742643226/b11fd3d73677e87ff981977ac7a777bf_dnqphm.png",
      )
      setIsUploading(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add store</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="flex justify-center">
              <div className="relative flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg">
                {imageUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="Store"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm"
                      disabled={isLoading}
                    >
                      <span className="sr-only">Remove image</span>×
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                      disabled={isLoading || isUploading}
                    />
                    {isUploading ? (
                      <Loader className="h-8 w-8 text-gray-400 animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">Upload image</span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Store Name</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter store name"
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="store-url">Store URL</Label>
              <Input
                id="store-url"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="Enter store URL"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cashback-rate">Cashback Rate (%)</Label>
              <Input
                id="cashback-rate"
                type="number"
                min="0"
                step="0.1"
                value={cashbackRate}
                onChange={(e) => setCashbackRate(Number.parseFloat(e.target.value) || 0)}
                placeholder="Enter cashback rate"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !imageUrl}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
