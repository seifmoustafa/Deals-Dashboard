import { TokenStorage } from "@/infrastructure/storage/token-storage"
import { AdminStorage } from "@/infrastructure/storage/admin-storage"
import { setCookie } from "cookies-next"

// Global flag to prevent multiple auth modals
let isShowingAuthModal = false

// Function to handle unauthorized responses
export const handleUnauthorized = () => {
  // Don't show the modal if we're already on the login page
  if (isShowingAuthModal || window.location.pathname === "/login") return

  isShowingAuthModal = true

  // Show the auth modal
  const event = new CustomEvent("show-auth-modal")
  window.dispatchEvent(event)
}

// Function to logout the user
export const logoutUser = () => {
  // Clear token and admin data
  const tokenStorage = new TokenStorage()
  const adminStorage = new AdminStorage()

  tokenStorage.removeToken()
  adminStorage.removeAdmin()

  // Remove auth cookie
  setCookie("auth_token", "", {
    maxAge: 0,
    path: "/",
  })

  // Redirect to login page
  window.location.href = "/login"
}

// Check if the response is unauthorized (401) and specifically for invalid token
export const checkUnauthorized = (status: number, responseData: any) => {
  // Only trigger for 401 status codes
  if (status !== 401) return false

  // Check if we're on the login page
  if (window.location.pathname === "/login") return false

  // Check if the error message specifically mentions invalid token
  const errorMessage = responseData?.message || ""
  if (errorMessage.includes("Invalid token") || errorMessage.includes("Unauthorized")) {
    handleUnauthorized()
    return true
  }

  return false
}
