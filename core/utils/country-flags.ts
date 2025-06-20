import { withImageFallback } from "./image-utils"

// This function returns the URL for a country flag based on the country code
export function getCountryFlag(countryCode: string): string {
  if (!countryCode) return "/placeholder.png"

  // Convert country code to lowercase for the URL
  const code = countryCode.toLowerCase()

  // Return the URL for the flag from flagcdn.com
  return `https://flagcdn.com/w40/${code}.png`
}

// This function returns the URL with fallback handling
export function getCountryFlagWithFallback(countryCode: string) {
  return withImageFallback(getCountryFlag(countryCode))
}
