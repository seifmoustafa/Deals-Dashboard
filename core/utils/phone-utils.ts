// Maximum phone number lengths by country (excluding country code)
// These are approximate values and may need adjustment for specific countries
export const countryPhoneMaxLengths: Record<string, number> = {
  // Default max length if country not found
  DEFAULT: 15,

  // Common countries with their max phone number lengths (excluding country code)
  US: 10, // United States
  GB: 10, // United Kingdom
  CA: 10, // Canada
  AU: 9, // Australia
  DE: 11, // Germany
  FR: 9, // France
  IT: 10, // Italy
  ES: 9, // Spain
  CN: 11, // China
  JP: 10, // Japan
  IN: 10, // India
  BR: 11, // Brazil
  RU: 10, // Russia
  NG: 10, // Nigeria
  EG: 10, // Egypt
  SA: 9, // Saudi Arabia
  AE: 9, // UAE

  // Add more countries as needed
}

/**
 * Gets the maximum phone number length for a given country code
 * @param countryCode The 2-letter country code
 * @returns Maximum phone number length (excluding country code)
 */
export function getMaxPhoneLength(countryCode: string): number {
  return countryPhoneMaxLengths[countryCode] || countryPhoneMaxLengths.DEFAULT
}

/**
 * Formats a phone number with the country code
 * @param phoneNumber The phone number to format
 * @param dialCode The country dial code (e.g., +1, +44)
 * @returns Formatted phone number with country code
 */
export function formatPhoneWithCountryCode(phoneNumber: string, dialCode: string): string {
  // Remove the dial code if it's already at the beginning of the phone number
  if (phoneNumber.startsWith(dialCode)) {
    return phoneNumber
  }

  // Remove any existing + sign from the dial code
  const cleanDialCode = dialCode.startsWith("+") ? dialCode : `+${dialCode}`

  // Remove any existing + sign from the phone number
  const cleanPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber.substring(1) : phoneNumber

  return `${cleanDialCode}${cleanPhoneNumber}`
}

/**
 * Extracts the national number part from a phone number with country code
 * @param phoneNumber The full phone number with country code
 * @param dialCode The country dial code to remove
 * @returns The national number part without country code
 */
export function extractNationalNumber(phoneNumber: string, dialCode: string): string {
  // Remove any + sign from the dial code for comparison
  const cleanDialCode = dialCode.startsWith("+") ? dialCode : `+${dialCode}`

  // If the phone number starts with the dial code, remove it
  if (phoneNumber.startsWith(cleanDialCode)) {
    return phoneNumber.substring(cleanDialCode.length)
  }

  // If the phone number starts with the dial code without +, remove it
  if (phoneNumber.startsWith(dialCode.replace("+", ""))) {
    return phoneNumber.substring(dialCode.replace("+", "").length)
  }

  return phoneNumber
}
