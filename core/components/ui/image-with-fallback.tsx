"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"
import { getImagePath } from "@/core/utils/image-path"

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string
}

export function ImageWithFallback({
  src,
  fallbackSrc = "/abstract-geometric-illustration.png",
  alt,
  ...rest
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)

  // Use the utility function to get the correct path
  const processedSrc = getImagePath((imgSrc as string) || "/placeholder.svg")
  const processedFallback = getImagePath(fallbackSrc)

  return (
    <Image
      {...rest}
      src={processedSrc || "/placeholder.svg"}
      alt={alt}
      onError={() => {
        setImgSrc(fallbackSrc)
      }}
    />
  )
}
