/**
 * Utility function to ensure image paths work correctly in both development and production
 * @param path The relative path to the image (e.g., '/login.png')
 * @returns The correct path for the current environment
 */
export function getImagePath(path: string): string {
  // If the path is already a full URL, return it as is
  if (path.startsWith("http")) {
    return path
  }

  // Make sure the path starts with a slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  // In production, we need to handle the path differently
  if (process.env.NODE_ENV === "production") {
    // Remove the leading slash for production
    return normalizedPath.startsWith("/") ? normalizedPath.substring(1) : normalizedPath
  }

  return normalizedPath
}
