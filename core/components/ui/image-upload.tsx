"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, Loader } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  initialImageUrl?: string
  onImageChange: (imageUrl: string) => void
  disabled?: boolean
}

export function ImageUpload({ initialImageUrl, onImageChange, disabled = false }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl || "")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Simulate upload - in a real app, you would upload to your server or cloud storage
    setIsUploading(true)

    // Create a preview URL
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setImageUrl(result)
      onImageChange(result)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)

    // Reset the input
    e.target.value = ""
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 transition-all hover:border-gray-400"
        onClick={handleClick}
      >
        {imageUrl ? (
          <div className="relative h-full w-full overflow-hidden rounded-md">
            <Image src={imageUrl || "/placeholder.svg"} alt="Store logo" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/5 transition-opacity hover:bg-black/10" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <ImageIcon className="h-8 w-8" />
            <span className="mt-1 text-xs">Click to upload</span>
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled || isUploading}
      />
      <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={disabled || isUploading}>
        {imageUrl ? "Change image" : "Upload image"}
      </Button>
    </div>
  )
}
