/**
 * Formats text with RTL support
 * This is useful for numbers, dates, and other text that should not be reversed in RTL mode
 *
 * @param text The text to format
 * @param dir The current direction (ltr or rtl)
 * @returns Formatted text with appropriate direction markers
 */
export function formatWithRtl(text: string, dir: "ltr" | "rtl"): string {
  if (dir === "rtl") {
    // Add RLM (Right-to-Left Mark) for proper display in RTL context
    return `\u200F${text}\u200F`
  }
  return text
}

/**
 * Formats a number with RTL support
 *
 * @param num The number to format
 * @param dir The current direction (ltr or rtl)
 * @param options Intl.NumberFormat options
 * @returns Formatted number with appropriate direction markers
 */
export function formatNumberWithRtl(num: number, dir: "ltr" | "rtl", options?: Intl.NumberFormatOptions): string {
  const formatted = new Intl.NumberFormat(dir === "rtl" ? "ar" : "en", options).format(num)

  return formatWithRtl(formatted, dir)
}

/**
 * Formats a date with RTL support
 *
 * @param date The date to format
 * @param dir The current direction (ltr or rtl)
 * @param options Intl.DateTimeFormat options
 * @returns Formatted date with appropriate direction markers
 */
export function formatDateWithRtl(
  date: Date | string,
  dir: "ltr" | "rtl",
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  const formatted = new Intl.DateTimeFormat(
    dir === "rtl" ? "ar" : "en",
    options || {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).format(dateObj)

  return formatWithRtl(formatted, dir)
}
