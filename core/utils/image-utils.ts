import type React from "react"
/**
 * Utility function to handle image loading with fallbacks
 * @param src The primary image source
 * @param fallbackSrc The fallback image source if the primary fails
 * @returns An object with the src and onError handler
 */
export function withImageFallback(src: string, fallbackSrc = "/placeholder.png") {
  return {
    src,
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.src = fallbackSrc
    },
  }
}
