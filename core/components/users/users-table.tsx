"use client"

import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { useState, useEffect, useRef } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/core/hooks/use-debounce"
import type { User, UsersPagination } from "@/domain/entities/user"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit,
  UserX,
  Trash,
  Download,
  Loader2,
  MoreVertical,
} from "lucide-react"
import { format } from "date-fns"
import { fetchAllUsersForExport } from "@/core/utils/export-utils"
import { CustomDialog, CustomDialogAction, CustomDialogCancel, CustomDialogFooter } from "@/components/ui/custom-dialog"
import type { FilterState, UserFilters } from "@/domain/entities/filter"
import { defaultFilterState } from "@/domain/entities/filter"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SimpleDropdown } from "@/core/components/ui/simple-dropdown"
// Import showToast from animated-toast instead of using toast from hooks
import { showToast } from "@/core/components/ui/animated-toast"
// Import directly from the container file
import { userService, exportService, filterUseCases } from "@/infrastructure/di/container"

// Update the existing UsersPaginationParams interface to include filter fields
type UsersPaginationParams = {
  page: number
  limit: number
  sortField?: string
  sortOrder?: "asc" | "dec"
  search?: string
  gender?: string
  isActive?: string
  dateOfBirth?: string
  country?: string
  city?: string
}

// Data for checkboxes to enable mapping
const genderOptions = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "other" },
]

const statusOptions = [
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
]

// Page size options
const pageSizeOptions = [
  { value: 10, label: "10 per page" },
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
]

export function UsersTable() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<UsersPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [params, setParams] = useState<UsersPaginationParams>({
    page: 1,
    limit: 10,
    sortField: "full_name",
    sortOrder: "asc",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [isMobile, setIsMobile] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null)
  const [userToActivate, setUserToActivate] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [isActivating, setIsActivating] = useState(false)

  // Add these state variables after the other state declarations
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [showInactivateDialog, setShowInactivateDialog] = useState(false)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isProcessingBulkAction, setIsProcessingBulkAction] = useState(false)

  // Add state for selected users
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Filter state
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState)
  const filterDialogRef = useRef<HTMLDivElement>(null)
  const [filteredCount, setFilteredCount] = useState(24) // Default count for "Show X Results"

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Close filter dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showFilterDialog &&
        filterDialogRef.current &&
        !filterDialogRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".filter-button")
      ) {
        setShowFilterDialog(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showFilterDialog])

  // Extract the fetchUsers function from the useEffect to make it reusable
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      // Include the search parameter in the API request
      const response = await userService.getUsers({
        ...params,
        search: debouncedSearchTerm || undefined,
      })
      setUsers(response.data)
      setPagination(response.pagination)

      // Update filtered count based on total users
      setFilteredCount(response.pagination.totalUsers)

      // Reset selection when data changes
      setSelectedUsers([])
      setSelectAll(false)
    } catch (error) {
      console.error("Failed to fetch users:", error)

      // Show error toast
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to fetch users. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update the useEffect to use the fetchUsers function
  useEffect(() => {
    fetchUsers()
  }, [params, debouncedSearchTerm])

  // When search term changes, reset to page 1
  useEffect(() => {
    if (params.page !== 1) {
      setParams((prev) => ({ ...prev, page: 1 }))
    }
  }, [debouncedSearchTerm])

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      limit: pageSize,
      page: 1, // Reset to first page when changing page size
    }))
  }

  const handleSortChange = (field: string) => {
    setParams((prev) => ({
      ...prev,
      sortField: field,
      sortOrder: prev.sortField === field && prev.sortOrder === "asc" ? "dec" : "asc",
    }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return format(date, "dd/MM/yyyy")
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const handleEditUser = (user: User) => {
    // Create a URL-friendly version of the name
    const nameSlug = user.fullName.toLowerCase().replace(/\s+/g, "-")
    router.push(`/dashboard/users/edit/${nameSlug}`)
  }

  const handleDeactivateUser = (user: User) => {
    setUserToDeactivate(user)
  }

  const handleActivateUser = (user: User) => {
    setUserToActivate(user)
  }

  // Update the confirmDeactivateUser function to show toast notifications after the API response
  const confirmDeactivateUser = async () => {
    if (!userToDeactivate) return

    try {
      setIsDeactivating(true)
      // Call the API to deactivate the user
      const userData: Partial<User> = {
        isActive: false,
      }

      await userService.updateUser(userToDeactivate.firebaseUid, userData)

      // Update the user in the local state to show as inactive
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userToDeactivate.id ? { ...user, isActive: false } : user)),
      )

      // Show success toast
      showToast({
        type: "success",
        title: "Success",
        message: `${userToDeactivate.fullName} has been deactivated successfully.`,
      })
    } catch (error) {
      console.error("Failed to deactivate user:", error)

      // Show error toast with the specific error message
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to deactivate user. Please try again.",
      })
    } finally {
      setIsDeactivating(false)
      setUserToDeactivate(null)
    }
  }

  // Add confirmActivateUser function
  const confirmActivateUser = async () => {
    if (!userToActivate) return

    try {
      setIsActivating(true)
      // Call the API to activate the user
      const userData: Partial<User> = {
        isActive: true,
      }

      await userService.updateUser(userToActivate.firebaseUid, userData)

      // Update the user in the local state to show as active
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userToActivate.id ? { ...user, isActive: true } : user)),
      )

      // Show success toast
      showToast({
        type: "success",
        title: "Success",
        message: `${userToActivate.fullName} has been activated successfully.`,
      })
    } catch (error) {
      console.error("Failed to activate user:", error)

      // Show error toast with the specific error message
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to activate user. Please try again.",
      })
    } finally {
      setIsActivating(false)
      setUserToActivate(null)
    }
  }

  // Update the handleDeleteUser function to show toast notifications after the API response
  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setIsDeleting(true)
      const response = await userService.deleteUser(userToDelete.firebaseUid || userToDelete.id)

      // Remove the user from the local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete.id))

      // Show success toast with the message from the API response
      showToast({
        type: "success",
        title: "Success",
        message: response.message || "User deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete user:", error)

      // Show error toast with the specific error message from the API
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to delete user. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setUserToDelete(null)
    }
  }

  // Update the handleExportAllUsers function to show toast notifications after the API response
  const handleExportAllUsers = async () => {
    try {
      // Show loading state
      setIsExporting(true)

      // Show loading toast
      showToast({
        type: "info",
        title: "Exporting users",
        message: "Preparing Excel file for download...",
      })

      // Fetch all users for export or just selected ones
      const usersToExport = selectedUsers.length > 0 ? await fetchSelectedUsers() : await fetchAllUsersForExport()

      // Export users to Excel using the export service
      const blob = await exportService.exportUsersToExcel(usersToExport)

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `users_export_${new Date().toISOString().split("T")[0]}.xlsx`

      // Append to document, trigger click and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Revoke the object URL to free up memory
      URL.revokeObjectURL(url)

      // Show success toast
      showToast({
        type: "success",
        title: "Success",
        message: `${usersToExport.length} users have been exported to Excel.`,
      })
    } catch (error) {
      console.error("Failed to export users:", error)

      // Show error toast with the specific error message
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to export users. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Function to get selected users
  const fetchSelectedUsers = async () => {
    // For now, just return the selected users from the current page
    return users.filter((user) => selectedUsers.includes(user.id))
  }

  // Update the handleDeleteUsers function to fetch users again after successful deletion
  // Replace the existing handleDeleteUsers function with this updated version:

  const handleDeleteUsers = async () => {
    try {
      setIsProcessingBulkAction(true)

      if (selectedUsers.length > 0) {
        // Delete selected users - make sure we're using the MongoDB IDs, not Firebase UIDs
        const response = await userService.deleteSelectedUsers(selectedUsers)

        // Reset selection
        setSelectedUsers([])
        setSelectAll(false)

        // Show success toast
        showToast({
          type: "success",
          title: "Success",
          message: response.message || `${selectedUsers.length} users have been deleted successfully.`,
        })

        // Fetch users again to refresh the data
        fetchUsers()
      } else {
        // Delete all users
        const response = await userService.deleteAllUsers()

        // Reset selection
        setSelectedUsers([])
        setSelectAll(false)

        // Show success toast
        showToast({
          type: "success",
          title: "Success",
          message: response.message || "All users have been deleted successfully.",
        })

        // Fetch users again to refresh the data
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to delete users:", error)

      // Show error toast with the specific error message
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to delete users. Please try again.",
      })
    } finally {
      setIsProcessingBulkAction(false)
      setShowDeleteAllDialog(false)
    }
  }

  // Update the handleInactivateUsers function to show toast notifications after the API response
  const handleInactivateUsers = async () => {
    try {
      setIsProcessingBulkAction(true)

      if (selectedUsers.length > 0) {
        // Inactivate selected users
        const response = await userService.inactivateSelectedUsers(selectedUsers)

        // Update selected users to inactive
        setUsers((prevUsers) =>
          prevUsers.map((user) => (selectedUsers.includes(user.id) ? { ...user, isActive: false } : user)),
        )

        // Reset selection
        setSelectedUsers([])
        setSelectAll(false)

        // Show success toast
        showToast({
          type: "success",
          title: "Success",
          message: response.message || `${selectedUsers.length} users have been inactivated successfully.`,
        })
      } else {
        // Inactivate all users
        const response = await userService.inactivateAllUsers()

        setUsers((prevUsers) => prevUsers.map((user) => ({ ...user, isActive: false })))

        // Show success toast
        showToast({
          type: "success",
          title: "Success",
          message: response.message || "All users have been inactivated successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to inactivate users:", error)

      // Show error toast with the specific error message
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to inactivate users. Please try again.",
      })
    } finally {
      setIsProcessingBulkAction(false)
      setShowInactivateDialog(false)
    }
  }

  // Add handleActivateUsers function
  const handleActivateUsers = async () => {
    try {
      setIsProcessingBulkAction(true)

      if (selectedUsers.length > 0) {
        // Activate selected users
        const response = await userService.activateSelectedUsers(selectedUsers)

        // Update selected users to active
        setUsers((prevUsers) =>
          prevUsers.map((user) => (selectedUsers.includes(user.id) ? { ...user, isActive: true } : user)),
        )

        // Reset selection
        setSelectedUsers([])
        setSelectAll(false)

        // Show success toast
        showToast({
          type: "success",
          title: "Success",
          message: response.message || `${selectedUsers.length} users have been activated successfully.`,
        })
      } else {
        // Activate all users
        const response = await userService.activateAllUsers()

        setUsers((prevUsers) => prevUsers.map((user) => ({ ...user, isActive: true })))

        // Show success toast
        showToast({
          type: "success",
          title: "Success",
          message: response.message || "All users have been activated successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to activate users:", error)

      // Show error toast with the specific error message
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to activate users. Please try again.",
      })
    } finally {
      setIsProcessingBulkAction(false)
      setShowActivateDialog(false)
    }
  }

  // Update the applyFilters function to show toast notifications after the API response
  const applyFilters = () => {
    try {
      // Close the filter dialog first
      setShowFilterDialog(false)

      // Use setTimeout to ensure dialog is fully closed before proceeding
      setTimeout(() => {
        // Apply filters using the use case
        const newParams = filterUseCases.applyFiltersToParams(filterState.filters, params)

        // Update params state to trigger API call
        setParams(newParams)

        // Count active filters for toast notification
        const activeFilters = filterUseCases.countActiveFilters(filterState.filters)

        // Show success toast
        showToast({
          type: "success",
          title: "Filters applied",
          message: `${activeFilters} filter${activeFilters !== 1 ? "s" : ""} applied to user list.`,
        })
      }, 10)
    } catch (error) {
      console.error("Failed to apply filters:", error)

      // Show error toast with the specific error message
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to apply filters. Please try again.",
      })
    }
  }

  const toggleFilterDialog = () => {
    if (showFilterDialog) {
      // When closing, use setTimeout to ensure clean removal
      setShowFilterDialog(false)
    } else {
      setShowFilterDialog(true)
    }
  }

  const handleFilterChange = (category: keyof UserFilters, field: string, checked: boolean) => {
    setFilterState((prev) => ({
      ...prev,
      filters: filterUseCases.updateFilterCategory(prev.filters, category, field, checked),
    }))
  }

  const toggleBirthDateFilter = () => {
    setFilterState((prev) => ({
      ...prev,
      showBirthDateFilter: !prev.showBirthDateFilter,
    }))
  }

  const toggleLocationFilter = () => {
    setFilterState((prev) => ({
      ...prev,
      showLocationFilter: !prev.showLocationFilter,
    }))
  }

  const resetFilters = () => {
    setFilterState({
      ...defaultFilterState,
      filters: filterUseCases.resetFilters(),
    })
  }

  // Handle bulk selection
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      // Select all users on current page
      setSelectedUsers(users.map((user) => user.id))
    } else {
      // Deselect all
      setSelectedUsers([])
    }
  }

  // Handle individual user selection
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId])
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId))
    }
  }

  // Update selectAll state when individual selections change
  useEffect(() => {
    // If no users are loaded yet, don't update selectAll
    if (users.length === 0) return

    // If all users on the current page are selected, set selectAll to true
    if (selectedUsers.length === users.length) {
      setSelectAll(true)
    }
    // If not all users are selected, but selectAll is true, set it to false
    else if (selectAll) {
      setSelectAll(false)
    }
  }, [selectedUsers, users.length, selectAll])

  // Mobile card view for users
  const MobileUserCard = ({ user }: { user: User }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          <div className="mr-3">
            <Checkbox
              checked={selectedUsers.includes(user.id)}
              onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
              className="mr-2"
            />
          </div>
          <Avatar className="h-10 w-10 mr-3">
            {user.profileImage?.url ? (
              <AvatarImage
                src={user.profileImage.url || "/placeholder.png"}
                alt={user.fullName}
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            ) : null}
            <AvatarFallback className="bg-green-100 text-green-800">{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{user.fullName}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div className="ml-auto">
            <SimpleDropdown
              items={[
                {
                  label: "Edit User",
                  onClick: () => handleEditUser(user),
                  icon: <Edit className="h-4 w-4" />,
                },
                user.isActive
                  ? {
                      label: "Deactivate User",
                      onClick: () => handleDeactivateUser(user),
                      icon: <UserX className="h-4 w-4" />,
                    }
                  : {
                      label: "Activate User",
                      onClick: () => handleActivateUser(user),
                      icon: <UserX className="h-4 w-4" />,
                      className: "text-green-600",
                    },
                {
                  label: "Delete User",
                  onClick: () => setUserToDelete(user),
                  icon: <Trash className="h-4 w-4" />,
                  className: "text-red-600",
                },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Phone</p>
            <p>{user.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500">Country</p>
            <p>{user.country || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500">City</p>
            <p>{user.city || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500">Birth Date</p>
            <p>{user.dateOfBirth ? formatDate(user.dateOfBirth) : "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500">Gender</p>
            <p>{user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "N/A"}</p>
          </div>
        </div>

        <div className="mt-3">
          <span
            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
              user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </CardContent>
    </Card>
  )

  // Mobile loading skeleton
  const MobileLoadingSkeleton = () => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          <Skeleton className="h-10 w-10 rounded-full mr-3" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>

        <Skeleton className="h-6 w-16 mt-3 rounded-full" />
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-medium">Users List</h3>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:flex-none">
            <Input
              placeholder="Search for users"
              className="w-full sm:w-64 pr-8"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search users"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFilterDialog}
              className="filter-button hover:bg-primary/10 hover:text-primary hover:border-primary/20"
              aria-label="Filter users"
            >
              <Filter className="h-4 w-4" />
            </Button>

            {showFilterDialog && (
              <Card
                ref={filterDialogRef}
                className="absolute right-0 top-full mt-2 w-[510px] rounded-lg shadow-lg z-50 border border-gray-200"
              >
                <div className="py-3.5 border-b border-neutrals-200 text-center">
                  <h2 className="font-medium text-neutrals-800 text-lg">Filter</h2>
                </div>

                <CardContent className="p-6 space-y-8">
                  {/* Gender Section */}
                  <div className="flex items-center">
                    <div className="w-24 font-medium text-neutrals-800 text-base">Gender</div>
                    <div className="flex items-center gap-4">
                      {genderOptions.map((option) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <Checkbox
                            id={option.id}
                            checked={filterState.filters.gender[option.id as keyof typeof filterState.filters.gender]}
                            onCheckedChange={(checked) => handleFilterChange("gender", option.id, checked as boolean)}
                            className="w-4 h-4 rounded-sm border-[1.2px] border-dark-500"
                          />
                          <label htmlFor={option.id} className="font-normal text-neutrals-800 text-sm">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Section */}
                  <div className="flex items-center">
                    <div className="w-24 font-medium text-neutrals-800 text-base">Status</div>
                    <div className="flex items-center gap-4">
                      {statusOptions.map((option) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <Checkbox
                            id={option.id}
                            checked={filterState.filters.status[option.id as keyof typeof filterState.filters.status]}
                            onCheckedChange={(checked) => handleFilterChange("status", option.id, checked as boolean)}
                            className="w-4 h-4 rounded-sm border-[1.2px] border-dark-500"
                          />
                          <label htmlFor={option.id} className="font-normal text-neutrals-800 text-sm">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add birth date button */}
                  {!filterState.showBirthDateFilter ? (
                    <Button
                      variant="ghost"
                      onClick={toggleBirthDateFilter}
                      className="flex items-center gap-2.5 p-2.5 h-auto bg-neutrals-100 rounded-lg w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="font-medium text-neutrals-800 text-base">Add birth date</span>
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <h5 className="font-medium text-neutrals-800 text-base">Birth Date</h5>
                      <Input
                        type="date"
                        className="w-full"
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null
                          setFilterState((prev) => ({
                            ...prev,
                            filters: {
                              ...prev.filters,
                              birthDate: date,
                            },
                          }))
                        }}
                        value={filterState.filters.birthDate ? format(filterState.filters.birthDate, "yyyy-MM-dd") : ""}
                      />
                    </div>
                  )}

                  {/* Add location button */}
                  {!filterState.showLocationFilter ? (
                    <Button
                      variant="ghost"
                      onClick={toggleLocationFilter}
                      className="flex items-center gap-2.5 p-2.5 h-auto bg-neutrals-100 rounded-lg w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="font-medium text-neutrals-800 text-base">Add location</span>
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <h5 className="font-medium text-neutrals-800 text-base">Location</h5>
                      <div className="space-y-2">
                        <Input
                          placeholder="Country"
                          className="w-full"
                          value={filterState.filters.location.country}
                          onChange={(e) =>
                            setFilterState((prev) => ({
                              ...prev,
                              filters: {
                                ...prev.filters,
                                location: {
                                  ...prev.filters.location,
                                  country: e.target.value,
                                },
                              },
                            }))
                          }
                        />
                        <Input
                          placeholder="City"
                          className="w-full"
                          value={filterState.filters.location.city}
                          onChange={(e) =>
                            setFilterState((prev) => ({
                              ...prev,
                              filters: {
                                ...prev.filters,
                                location: {
                                  ...prev.filters.location,
                                  city: e.target.value,
                                },
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-8">
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="h-10 px-4 py-3 font-medium text-neutrals-500 text-sm"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={applyFilters}
                      className="flex-1 h-10 px-4 py-3 font-medium text-white text-sm bg-green-600 hover:bg-green-700"
                    >
                      Show Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <SimpleDropdown
            items={[
              {
                label: selectedUsers.length > 0 ? "Export selected users" : "Export all users",
                onClick: () => setShowExportDialog(true),
                icon: <Download className="h-4 w-4" />,
              },
              {
                label: selectedUsers.length > 0 ? "Delete selected users" : "Delete all users",
                onClick: () => setShowDeleteAllDialog(true),
                icon: <Trash className="h-4 w-4" />,
                className: "text-red-600",
              },
              {
                label: selectedUsers.length > 0 ? "Inactivate selected users" : "Inactivate all users",
                onClick: () => setShowInactivateDialog(true),
                icon: <UserX className="h-4 w-4" />,
              },
              {
                label: selectedUsers.length > 0 ? "Activate selected users" : "Activate all users",
                onClick: () => setShowActivateDialog(true),
                icon: <UserX className="h-4 w-4" />,
                className: "text-green-600",
              },
            ]}
          />
        </div>
      </div>

      {isMobile ? (
        // Mobile view - cards
        <div>
          {isLoading ? (
            // Mobile loading state
            Array.from({ length: 3 }).map((_, index) => <MobileLoadingSkeleton key={index} />)
          ) : users.length > 0 ? (
            // Mobile user cards
            users.map((user) => <MobileUserCard key={user.id} user={user} />)
          ) : (
            // Mobile empty state
            <div className="bg-white rounded-lg p-8 text-center">
              {searchTerm ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <p className="text-sm text-gray-500">No users found matching "{searchTerm}"</p>
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                    Clear search
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No users found</p>
              )}
            </div>
          )}
        </div>
      ) : (
        // Desktop view - table
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={selectAll} onCheckedChange={(checked) => handleSelectAll(!!checked)} />
                </TableHead>
                <TableHead>Full name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Birth date</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox disabled />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "N/A"}</TableCell>
                    <TableCell>{user.country || "N/A"}</TableCell>
                    <TableCell>{user.city || "N/A"}</TableCell>
                    <TableCell>{user.dateOfBirth ? formatDate(user.dateOfBirth) : "N/A"}</TableCell>
                    <TableCell>
                      {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <SimpleDropdown
                        trigger={
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        }
                        items={[
                          {
                            label: "Edit User",
                            onClick: () => handleEditUser(user),
                            icon: <Edit className="h-4 w-4" />,
                          },
                          user.isActive
                            ? {
                                label: "Deactivate User",
                                onClick: () => handleDeactivateUser(user),
                                icon: <UserX className="h-4 w-4" />,
                              }
                            : {
                                label: "Activate User",
                                onClick: () => handleActivateUser(user),
                                icon: <UserX className="h-4 w-4" />,
                                className: "text-green-600",
                              },
                          {
                            label: "Delete User",
                            onClick: () => setUserToDelete(user),
                            icon: <Trash className="h-4 w-4" />,
                            className: "text-red-600",
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    {searchTerm ? (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <p className="text-sm text-gray-500">No users found matching "{searchTerm}"</p>
                        <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                          Clear search
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No users found</p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination && users.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Select
              value={params.limit.toString()}
              onValueChange={(value) => handlePageSizeChange(Number.parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500">
              Showing {(pagination.currentPage - 1) * params.limit + 1} to{" "}
              {Math.min(pagination.currentPage * params.limit, pagination.totalUsers)} of {pagination.totalUsers}{" "}
              results
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {!isMobile &&
              Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNumber: number

                if (pagination.totalPages <= 5) {
                  pageNumber = i + 1
                } else if (pagination.currentPage <= 3) {
                  pageNumber = i + 1
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNumber = pagination.totalPages - 4 + i
                } else {
                  pageNumber = pagination.currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNumber}
                    variant="outline"
                    size="sm"
                    className={`w-9 p-0 ${
                      pagination.currentPage === pageNumber ? "bg-green-50 text-green-600 border-green-200" : ""
                    }`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}

            {!isMobile && pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
              <>
                <div className="px-2">...</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-9 p-0"
                  onClick={() => handlePageChange(pagination.totalPages)}
                >
                  {pagination.totalPages}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      <CustomDialog
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Delete User"
        description="This action cannot be undone. This will permanently delete the user account and all associated data."
      >
        <CustomDialogFooter>
          <CustomDialogCancel onClick={() => setUserToDelete(null)} disabled={isDeleting}>
            Cancel
          </CustomDialogCancel>
          <CustomDialogAction
            onClick={handleDeleteUser}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </div>
            ) : (
              "Delete"
            )}
          </CustomDialogAction>
        </CustomDialogFooter>
      </CustomDialog>

      {/* Export Users Dialog */}
      <CustomDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        title={selectedUsers.length > 0 ? "Export selected users" : "Export all users"}
        description={`Are you sure you want to export ${selectedUsers.length > 0 ? "selected" : "all"} users?`}
      >
        <CustomDialogFooter>
          <CustomDialogCancel onClick={() => setShowExportDialog(false)}>Cancel</CustomDialogCancel>
          <CustomDialogAction
            onClick={() => {
              setShowExportDialog(false)
              handleExportAllUsers()
            }}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
            disabled={isExporting}
          >
            {isExporting ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </div>
            ) : (
              "Export"
            )}
          </CustomDialogAction>
        </CustomDialogFooter>
      </CustomDialog>

      {/* Delete Users Dialog */}
      <CustomDialog
        open={showDeleteAllDialog}
        onClose={() => setShowDeleteAllDialog(false)}
        title={selectedUsers.length > 0 ? "Delete selected users" : "Delete all users"}
        description={`Are you sure you want to delete ${selectedUsers.length > 0 ? "selected" : "all"} users?`}
      >
        <CustomDialogFooter>
          <CustomDialogCancel onClick={() => setShowDeleteAllDialog(false)} disabled={isProcessingBulkAction}>
            Cancel
          </CustomDialogCancel>
          <CustomDialogAction
            onClick={handleDeleteUsers}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isProcessingBulkAction}
          >
            {isProcessingBulkAction ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </div>
            ) : (
              "Delete"
            )}
          </CustomDialogAction>
        </CustomDialogFooter>
      </CustomDialog>

      {/* Inactivate Users Dialog */}
      <CustomDialog
        open={showInactivateDialog}
        onClose={() => setShowInactivateDialog(false)}
        title={selectedUsers.length > 0 ? "Inactivate selected users" : "Inactivate all users"}
        description={`Are you sure you want to inactivate ${selectedUsers.length > 0 ? "selected" : "all"} users?`}
      >
        <CustomDialogFooter>
          <CustomDialogCancel onClick={() => setShowInactivateDialog(false)} disabled={isProcessingBulkAction}>
            Cancel
          </CustomDialogCancel>
          <CustomDialogAction
            onClick={handleInactivateUsers}
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
            disabled={isProcessingBulkAction}
          >
            {isProcessingBulkAction ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inactivating...
              </div>
            ) : (
              "Inactivate"
            )}
          </CustomDialogAction>
        </CustomDialogFooter>
      </CustomDialog>

      {/* Activate Users Dialog */}
      <CustomDialog
        open={showActivateDialog}
        onClose={() => setShowActivateDialog(false)}
        title={selectedUsers.length > 0 ? "Activate selected users" : "Activate all users"}
        description={`Are you sure you want to activate ${selectedUsers.length > 0 ? "selected" : "all"} users?`}
      >
        <CustomDialogFooter>
          <CustomDialogCancel onClick={() => setShowActivateDialog(false)} disabled={isProcessingBulkAction}>
            Cancel
          </CustomDialogCancel>
          <CustomDialogAction
            onClick={handleActivateUsers}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
            disabled={isProcessingBulkAction}
          >
            {isProcessingBulkAction ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activating...
              </div>
            ) : (
              "Activate"
            )}
          </CustomDialogAction>
        </CustomDialogFooter>
      </CustomDialog>

      {/* Deactivate User Confirmation Dialog */}
      <CustomDialog
        open={!!userToDeactivate}
        onClose={() => setUserToDeactivate(null)}
        title="Deactivate User"
        description={`Are you sure you want to deactivate ${userToDeactivate?.fullName}? They will no longer be able to access the system.`}
      >
        <CustomDialogFooter>
          <CustomDialogCancel onClick={() => setUserToDeactivate(null)} disabled={isDeactivating}>
            Cancel
          </CustomDialogCancel>
          <CustomDialogAction
            onClick={confirmDeactivateUser}
            disabled={isDeactivating}
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
          >
            {isDeactivating ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deactivating...
              </div>
            ) : (
              "Deactivate"
            )}
          </CustomDialogAction>
        </CustomDialogFooter>
      </CustomDialog>

      {/* Activate User Confirmation Dialog */}
      <CustomDialog
        open={!!userToActivate}
        onClose={() => setUserToActivate(null)}
        title="Activate User"
        description={`Are you sure you want to activate ${userToActivate?.fullName}? They will be able to access the system again.`}
      >
        <CustomDialogFooter>
          <CustomDialogCancel onClick={() => setUserToActivate(null)} disabled={isActivating}>
            Cancel
          </CustomDialogCancel>
          <CustomDialogAction
            onClick={confirmActivateUser}
            disabled={isActivating}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
          >
            {isActivating ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activating...
              </div>
            ) : (
              "Activate"
            )}
          </CustomDialogAction>
        </CustomDialogFooter>
      </CustomDialog>
    </div>
  )
}
