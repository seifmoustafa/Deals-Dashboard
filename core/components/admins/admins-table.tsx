"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/core/hooks/use-debounce"
import type { Admin } from "@/domain/entities/admin"
import { adminService } from "@/infrastructure/di/container"
import type React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Download, Loader2, ArrowDown, ArrowUp } from "lucide-react"
import { CustomDialog, CustomDialogAction, CustomDialogCancel, CustomDialogFooter } from "@/components/ui/custom-dialog"
import { SimpleDropdown } from "@/core/components/ui/simple-dropdown"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { showToast } from "@/core/components/ui/animated-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { UserCheck, UserX, Trash } from "lucide-react"
import { fetchAllAdminsForExport } from "@/core/utils/export-utils"
import { exportService } from "@/infrastructure/di/container"

// Admin pagination params interface
type AdminsPaginationParams = {
  page: number
  limit: number
  sortField?: string
  sortOrder?: "asc" | "dec"
  search?: string
}

// Sort field options
const sortFieldOptions = [
  { value: "full_name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "username", label: "Username" },
  { value: "is_active", label: "Status" },
  { value: "role", label: "Role" },
]

// Sort order options
const sortOrderOptions = [
  { value: "asc", label: "Ascending", icon: <ArrowUp className="h-4 w-4" /> },
  { value: "dec", label: "Descending", icon: <ArrowDown className="h-4 w-4" /> },
]

// Page size options
const pageSizeOptions = [
  { value: 10, label: "10 per page" },
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
]

// Mock data for testing when API fails
const mockAdmins: Admin[] = [
  {
    id: "1",
    full_name: "John Doe",
    email: "john@example.com",
    username: "johndoe",
    role: "super",
    is_active: true,
  },
  {
    id: "2",
    full_name: "Jane Smith",
    email: "jane@example.com",
    username: "janesmith",
    role: "regular",
    is_active: true,
  },
  {
    id: "3",
    full_name: "Robert Johnson",
    email: "robert@example.com",
    username: "robertj",
    role: "regular",
    is_active: false,
  },
]

export default function AdminsTable() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAdmins: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [params, setParams] = useState<AdminsPaginationParams>({
    page: 1,
    limit: 10,
    sortField: "full_name",
    sortOrder: "asc",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [isMobile, setIsMobile] = useState(false)
  const [useMockData, setUseMockData] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const filterDialogRef = useRef<HTMLDivElement>(null)

  // Dialog states
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null)
  const [adminToDeactivate, setAdminToDeactivate] = useState<Admin | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Bulk action confirmation dialog state
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false)
  const [bulkActionType, setBulkActionType] = useState<"activate" | "deactivate" | "delete" | null>(null)
  const [isBulkActionProcessing, setIsBulkActionProcessing] = useState(false)

  // Form states for adding admin
  const [newAdmin, setNewAdmin] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
  })

  // Form validation
  const [formErrors, setFormErrors] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
  })

  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)

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

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching admins with params:", params)

        // Include the search parameter in the API request
        const response = await adminService.getAdmins({
          ...params,
          search: debouncedSearchTerm || undefined,
        })

        console.log("API Response:", response)

        // Check if response has the expected structure
        if (!response) {
          console.error("API returned empty response")
          showToast({
            type: "error",
            title: "Error",
            message: "Failed to fetch admins. Empty response received.",
          })
          setAdmins([])
          return
        }

        // Handle different response formats
        let adminData = []
        let paginationData = null

        if (Array.isArray(response)) {
          // If response is an array, use it directly
          console.log("Response is an array, using directly")
          adminData = response
        } else if (response.data && Array.isArray(response.data)) {
          // Standard format with data property
          console.log("Response has data property")
          adminData = response.data
          paginationData = response.pagination
        } else if (response.admins && Array.isArray(response.admins)) {
          // Alternative format with admins property
          console.log("Response has admins property")
          adminData = response.admins
          paginationData = response.pagination
        } else {
          // Try to extract admins from response if it's an object
          console.log("Trying to extract admins from response object")
          const possibleAdmins = Object.values(response).find((val) => Array.isArray(val))
          if (possibleAdmins) {
            adminData = possibleAdmins
          }
        }

        console.log("Extracted admin data:", adminData)

        // If no admins were found and we're on the first fetch, use mock data
        if (adminData.length === 0 && !useMockData && params.page === 1 && !debouncedSearchTerm) {
          console.log("No admins found, using mock data for demonstration")
          setUseMockData(true)
          adminData = mockAdmins
        }

        // Map properties to handle different field names
        adminData = adminData.map((admin) => ({
          id: admin.id || admin._id,
          full_name: admin.full_name || admin.fullName || admin.name,
          email: admin.email,
          role: admin.role,
          is_active:
            admin.is_active !== undefined
              ? admin.is_active
              : admin.isActive !== undefined
                ? admin.isActive
                : admin.active !== undefined
                  ? admin.active
                  : true,
          // Add other properties with fallbacks
          username: admin.username,
          deleted_at: admin.deleted_at || admin.deletedAt,
          createdAt: admin.createdAt || admin.created_at,
          updatedAt: admin.updatedAt || admin.updated_at,
        }))

        console.log("Processed admin data:", adminData)

        // Set admins with fallback to empty array
        setAdmins(adminData || [])

        // Set pagination if available
        if (paginationData) {
          setPagination(paginationData)
        } else {
          // Default pagination if not provided
          setPagination({
            currentPage: params.page,
            totalPages: Math.ceil((adminData?.length || 0) / params.limit),
            totalAdmins: adminData?.length || 0,
            hasNextPage: false,
            hasPrevPage: params.page > 1,
          })
        }

        // Log what we're rendering
        console.log("Admins to render:", adminData)
        console.log("Pagination:", paginationData)
      } catch (error) {
        console.error("Failed to fetch admins:", error)

        // If API fails, use mock data
        if (!useMockData) {
          console.log("API failed, using mock data for demonstration")
          setUseMockData(true)
          setAdmins(mockAdmins)
          setPagination({
            currentPage: params.page,
            totalPages: 1,
            totalAdmins: mockAdmins.length,
            hasNextPage: false,
            hasPrevPage: params.page > 1,
          })
        } else {
          showToast({
            type: "error",
            title: "Error",
            message: "Failed to fetch admins. Please try again.",
          })
          setAdmins([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdmins()
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSortFieldChange = (field: string) => {
    setParams((prev) => ({
      ...prev,
      sortField: field,
      page: 1, // Reset to first page when changing sort
    }))
  }

  const handleSortOrderChange = (order: "asc" | "dec") => {
    setParams((prev) => ({
      ...prev,
      sortOrder: order,
      page: 1, // Reset to first page when changing sort
    }))
  }

  const getInitials = (name: string) => {
    if (!name) return "A"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getSortFieldLabel = (value: string) => {
    return sortFieldOptions.find((option) => option.value === value)?.label || "Name"
  }

  const getSortOrderLabel = (value: string) => {
    return sortOrderOptions.find((option) => option.value === value)?.label || "Ascending"
  }

  const validateForm = () => {
    const errors = {
      full_name: "",
      email: "",
      username: "",
      password: "",
    }
    let isValid = true

    if (!newAdmin.full_name.trim()) {
      errors.full_name = "Full name is required"
      isValid = false
    }

    if (!newAdmin.email.trim()) {
      errors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      errors.email = "Email is invalid"
      isValid = false
    }

    if (!newAdmin.username.trim()) {
      errors.username = "Username is required"
      isValid = false
    }

    if (!newAdmin.password.trim()) {
      errors.password = "Password is required"
      isValid = false
    } else if (newAdmin.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleAddAdmin = async () => {
    if (!validateForm()) return

    try {
      setIsAddingAdmin(true)
      const response = await adminService.registerAdmin({
        full_name: newAdmin.full_name,
        email: newAdmin.email,
        username: newAdmin.username,
        password: newAdmin.password,
      })

      // Show success toast with API message
      showToast({
        type: "success",
        title: "Admin Added",
        message: response.message || "Admin added successfully",
      })

      // Reset form and close dialog
      setNewAdmin({
        full_name: "",
        email: "",
        username: "",
        password: "",
      })
      setShowAddAdminDialog(false)

      // If using mock data, add the new admin to the mock data
      if (useMockData) {
        const newAdminWithId = {
          id: `mock-${Date.now()}`,
          full_name: newAdmin.full_name,
          email: newAdmin.email,
          username: newAdmin.username,
          role: "regular" as const,
          is_active: true,
        }
        setAdmins((prev) => [...prev, newAdminWithId])
      } else {
        // Refresh admins list
        setParams((prev) => ({ ...prev })) // Trigger refetch
      }
    } catch (error: any) {
      console.error("Failed to add admin:", error)

      // If using mock data or API fails, add the admin anyway for demo purposes
      if (useMockData) {
        const newAdminWithId = {
          id: `mock-${Date.now()}`,
          full_name: newAdmin.full_name,
          email: newAdmin.email,
          username: newAdmin.username,
          role: "regular" as const,
          is_active: true,
        }
        setAdmins((prev) => [...prev, newAdminWithId])

        showToast({
          type: "success",
          title: "Admin Added",
          message: "Admin added successfully (mock)",
        })

        // Reset form and close dialog
        setNewAdmin({
          full_name: "",
          email: "",
          username: "",
          password: "",
        })
        setShowAddAdminDialog(false)
      } else {
        showToast({
          type: "error",
          title: "Error",
          message: error.message || "Failed to add admin. Please try again.",
        })
      }
    } finally {
      setIsAddingAdmin(false)
    }
  }

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return

    try {
      setIsDeleting(true)
      const response = await adminService.deleteAdmin(adminToDelete.id)

      // Remove the admin from the local state
      setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== adminToDelete.id))

      // Show success toast with API message
      showToast({
        type: "success",
        title: "Admin Deleted",
        message: response.message || "Admin deleted successfully",
      })
    } catch (error: any) {
      console.error("Failed to delete admin:", error)

      // Show error message
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to delete admin. Please try again.",
      })

      // If using mock data or for demo purposes, remove the admin anyway
      if (useMockData) {
        setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== adminToDelete.id))
        showToast({
          type: "success",
          title: "Admin Deleted",
          message: "Admin deleted successfully (mock)",
        })
      }
    } finally {
      setIsDeleting(false)
      setAdminToDelete(null)
    }
  }

  const handleDeactivateAdmin = async () => {
    if (!adminToDeactivate) return

    try {
      setIsDeactivating(true)
      const response = await adminService.inactivateAdmin(adminToDeactivate.id)

      // Update the admin in the local state
      setAdmins((prevAdmins) =>
        prevAdmins.map((admin) => (admin.id === adminToDeactivate.id ? { ...admin, is_active: false } : admin)),
      )

      // Show success toast with API message
      showToast({
        type: "success",
        title: "Admin Deactivated",
        message: response.message || "Admin deactivated successfully",
      })
    } catch (error: any) {
      console.error("Failed to deactivate admin:", error)

      // Show error message
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to deactivate admin. Please try again.",
      })

      // If using mock data, update the admin anyway for demo purposes
      if (useMockData) {
        setAdmins((prevAdmins) =>
          prevAdmins.map((admin) => (admin.id === adminToDeactivate.id ? { ...admin, is_active: false } : admin)),
        )
        showToast({
          type: "success",
          title: "Admin Deactivated",
          message: "Admin deactivated successfully (mock)",
        })
      }
    } finally {
      setIsDeactivating(false)
      setAdminToDeactivate(null)
    }
  }

  const handleActivateAdmin = async (admin: Admin) => {
    try {
      setIsActivating(true)

      // Then make the API call first (don't update UI optimistically)
      const response = await adminService.activateAdmin(admin.id)

      // After successful API call, update the UI
      setAdmins((prevAdmins) => prevAdmins.map((a) => (a.id === admin.id ? { ...a, is_active: true } : a)))

      // Show success toast with API message
      showToast({
        type: "success",
        title: "Admin Activated",
        message: response.message || "Admin activated successfully",
      })
    } catch (error: any) {
      console.error("Failed to activate admin:", error)

      // Show error message
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to activate admin. Please try again.",
      })

      // If using mock data, show success anyway for demo purposes
      if (useMockData) {
        setAdmins((prevAdmins) => prevAdmins.map((a) => (a.id === admin.id ? { ...a, is_active: true } : a)))
        showToast({
          type: "success",
          title: "Admin Activated",
          message: "Admin activated successfully (mock)",
        })
      }
    } finally {
      setIsActivating(false)
    }
  }

  const handleUpdateRole = async (admin: Admin, role: "super" | "regular") => {
    try {
      // Store the original role for reverting if needed
      const originalRole = admin.role

      // Make the API call first (don't update UI optimistically)
      const response = await adminService.updateRole({
        id: admin.id,
        role,
      })

      // After successful API call, update the UI
      setAdmins((prevAdmins) => prevAdmins.map((a) => (a.id === admin.id ? { ...a, role } : a)))

      // Show success toast with API message
      showToast({
        type: "success",
        title: "Role Updated",
        message: response.message || "Admin role updated successfully",
      })
    } catch (error: any) {
      console.error("Failed to update admin role:", error)

      // Show error message
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to update admin role. Please try again.",
      })

      // If using mock data, update the UI anyway for demo purposes
      if (useMockData) {
        setAdmins((prevAdmins) => prevAdmins.map((a) => (a.id === admin.id ? { ...a, role } : a)))
        showToast({
          type: "success",
          title: "Role Updated",
          message: "Admin role updated successfully (mock)",
        })
      }
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all visible admins
      setSelectedAdmins(admins.map((admin) => admin.id))
      setIsAllSelected(true)
    } else {
      // Deselect all
      setSelectedAdmins([])
      setIsAllSelected(false)
    }
  }

  const handleSelectAdmin = (adminId: string, checked: boolean) => {
    if (checked) {
      setSelectedAdmins((prev) => [...prev, adminId])
    } else {
      setSelectedAdmins((prev) => prev.filter((id) => id !== adminId))
    }
  }

  // Update isAllSelected whenever selectedAdmins changes
  useEffect(() => {
    if (admins.length > 0 && selectedAdmins.length === admins.length) {
      setIsAllSelected(true)
    } else {
      setIsAllSelected(false)
    }

    // Show bulk actions only when at least one admin is selected
    setShowBulkActions(selectedAdmins.length > 0)
  }, [selectedAdmins, admins])

  const handleBulkAction = (action: "activate" | "deactivate" | "delete") => {
    if (selectedAdmins.length === 0) return

    // Set the action type and show the confirmation dialog
    setBulkActionType(action)
    setShowBulkActionDialog(true)
  }

  const performBulkAction = async () => {
    if (!bulkActionType || selectedAdmins.length === 0) return

    try {
      setIsBulkActionProcessing(true)
      let response

      if (bulkActionType === "activate") {
        response = await adminService.activateSelectedAdmins(selectedAdmins)
        // Update UI based on successful activation
        setAdmins((prevAdmins) =>
          prevAdmins.map((admin) => (selectedAdmins.includes(admin.id) ? { ...admin, is_active: true } : admin)),
        )
      } else if (bulkActionType === "deactivate") {
        response = await adminService.inactivateSelectedAdmins(selectedAdmins)
        // Update UI based on successful deactivation
        setAdmins((prevAdmins) =>
          prevAdmins.map((admin) => (selectedAdmins.includes(admin.id) ? { ...admin, is_active: false } : admin)),
        )
      } else if (bulkActionType === "delete") {
        response = await adminService.deleteSelectedAdmins(selectedAdmins)
        // Update UI based on successful deletion
        setAdmins((prevAdmins) => prevAdmins.filter((admin) => !selectedAdmins.includes(admin.id)))
      }

      // Clear selection after bulk action
      setSelectedAdmins([])

      // Show success toast with API message
      showToast({
        type: "success",
        title: "Bulk Action Complete",
        message: response?.message || `Successfully performed bulk ${bulkActionType} action`,
      })
    } catch (error: any) {
      console.error(`Failed to perform bulk ${bulkActionType}:`, error)
      showToast({
        type: "error",
        title: "Bulk Action Failed",
        message: error.message || `An error occurred while trying to ${bulkActionType} the selected admins.`,
      })
    } finally {
      setIsBulkActionProcessing(false)
      setShowBulkActionDialog(false)
      setBulkActionType(null)
    }
  }

  // Export functions
  const exportAllAdmins = async () => {
    try {
      setIsExporting(true)
      showToast({
        type: "info",
        title: "Export Started",
        message: "Fetching all admins for export. This may take a moment...",
      })

      // Fetch all admins
      let adminsToExport: Admin[]
      if (useMockData) {
        // Use mock data for demonstration
        adminsToExport = mockAdmins
      } else {
        // Fetch all admins from API
        adminsToExport = await fetchAllAdminsForExport()
      }

      // Generate Excel file
      const excelBlob = await exportService.exportAdminsToExcel(adminsToExport)

      // Create download link
      const url = URL.createObjectURL(excelBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `admins-export-${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast({
        type: "success",
        title: "Export Complete",
        message: `Successfully exported ${adminsToExport.length} admins.`,
      })
    } catch (error) {
      console.error("Failed to export admins:", error)
      showToast({
        type: "error",
        title: "Export Failed",
        message: "Failed to export admins. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportSelectedAdmins = async () => {
    if (selectedAdmins.length === 0) {
      showToast({
        type: "warning",
        title: "No Admins Selected",
        message: "Please select at least one admin to export.",
      })
      return
    }

    try {
      setIsExporting(true)
      showToast({
        type: "info",
        title: "Export Started",
        message: "Preparing selected admins for export...",
      })

      // Filter selected admins
      const adminsToExport = admins.filter((admin) => selectedAdmins.includes(admin.id))

      // Generate Excel file
      const excelBlob = await exportService.exportAdminsToExcel(adminsToExport)

      // Create download link
      const url = URL.createObjectURL(excelBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `selected-admins-export-${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast({
        type: "success",
        title: "Export Complete",
        message: `Successfully exported ${adminsToExport.length} selected admins.`,
      })
    } catch (error) {
      console.error("Failed to export selected admins:", error)
      showToast({
        type: "error",
        title: "Export Failed",
        message: "Failed to export selected admins. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Mobile card view for admins
  const MobileAdminCard = ({ admin }: { admin: Admin }) => (
    <Card className={`mb-4 ${selectedAdmins.includes(admin.id) ? "bg-muted/40" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          <Checkbox
            checked={selectedAdmins.includes(admin.id)}
            onCheckedChange={(checked) => handleSelectAdmin(admin.id, !!checked)}
            aria-label={`Select ${admin.full_name}`}
            className="mr-2"
          />
          <Avatar className="h-10 w-10 mr-3">
            <AvatarFallback className="bg-green-100 text-green-800">{getInitials(admin.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{admin.full_name}</h3>
            <p className="text-sm text-gray-500">{admin.email}</p>
          </div>
          <div className="ml-auto">
            <SimpleDropdown
              items={[
                ...(admin.is_active
                  ? [
                      {
                        label: "Deactivate Admin",
                        onClick: () => setAdminToDeactivate(admin),
                        icon: <UserX className="h-4 w-4" />,
                      },
                    ]
                  : [
                      {
                        label: "Activate Admin",
                        onClick: () => handleActivateAdmin(admin),
                        icon: <UserCheck className="h-4 w-4" />,
                      },
                    ]),
                {
                  label: "Delete Admin",
                  onClick: () => setAdminToDelete(admin),
                  icon: <Trash className="h-4 w-4" />,
                  className: "text-red-600",
                },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Permission</p>
            <Select value={admin.role} onValueChange={(value: "super" | "regular") => handleUpdateRole(admin, value)}>
              <SelectTrigger className="w-[140px] h-8 mt-1">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super">Super admin</SelectItem>
                <SelectItem value="regular">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <span
              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 mt-2 ${
                admin.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {admin.is_active ? "Active" : "Inactive"}
            </span>
          </div>
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
        </div>
      </CardContent>
    </Card>
  )

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

  return (
    <div className="space-y-4">
      {/* Debug section - only visible in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-gray-100 p-4 rounded-md mb-4 text-xs overflow-auto max-h-40">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <p>Loading: {isLoading ? "true" : "false"}</p>
          <p>Using mock data: {useMockData ? "true" : "false"}</p>
          <p>Admins count: {admins?.length || 0}</p>
          <p>Current page: {pagination?.currentPage}</p>
          <p>Total admins: {pagination?.totalAdmins}</p>
          <details>
            <summary>Raw admin data (click to expand)</summary>
            <pre>{JSON.stringify(admins, null, 2)}</pre>
          </details>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Admins List</h3>
          {showBulkActions && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mx-2">{selectedAdmins.length} selected</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("activate")}
                title="Activate selected admins"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Activate</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("deactivate")}
                title="Deactivate selected admins"
              >
                <UserX className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Deactivate</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleBulkAction("delete")}
                title="Delete selected admins"
              >
                <Trash className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:flex-none">
            <Input
              placeholder="Search for admins"
              className="w-full sm:w-64 pr-8"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search admins"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilterDialog(!showFilterDialog)}
              className={`filter-button hover:bg-primary/10 hover:text-primary hover:border-primary/20 ${
                params.sortField !== "full_name" || params.sortOrder !== "asc" ? "bg-primary/10 text-primary" : ""
              }`}
              aria-label="Filter admins"
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
                  {/* Sort Field Section */}
                  <div className="flex items-center">
                    <div className="w-24 font-medium text-neutrals-800 text-base">Sort By</div>
                    <div className="flex flex-wrap items-center gap-4">
                      {sortFieldOptions.map((option) => (
                        <div key={option.value} className="flex items-center gap-2">
                          <Checkbox
                            id={`sort-field-${option.value}`}
                            checked={params.sortField === option.value}
                            onCheckedChange={() => handleSortFieldChange(option.value)}
                            className="w-4 h-4 rounded-sm border-[1.2px] border-dark-500"
                          />
                          <label
                            htmlFor={`sort-field-${option.value}`}
                            className="font-normal text-neutrals-800 text-sm"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sort Order Section */}
                  <div className="flex items-center">
                    <div className="w-24 font-medium text-neutrals-800 text-base">Sort Order</div>
                    <div className="flex items-center gap-4">
                      {sortOrderOptions.map((option) => (
                        <div key={option.value} className="flex items-center gap-2">
                          <Checkbox
                            id={`sort-order-${option.value}`}
                            checked={params.sortOrder === option.value}
                            onCheckedChange={() => handleSortOrderChange(option.value as "asc" | "dec")}
                            className="w-4 h-4 rounded-sm border-[1.2px] border-dark-500"
                          />
                          <label
                            htmlFor={`sort-order-${option.value}`}
                            className="font-normal text-neutrals-800 text-sm flex items-center gap-1"
                          >
                            {option.icon}
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-8">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setParams((prev) => ({
                          ...prev,
                          sortField: "full_name",
                          sortOrder: "asc",
                          page: 1,
                        }))
                        setShowFilterDialog(false)
                      }}
                      className="h-10 px-4 py-3 font-medium text-neutrals-500 text-sm"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={() => {
                        setShowFilterDialog(false)
                        showToast({
                          type: "success",
                          title: "Filters Applied",
                          message: "Your sorting preferences have been applied.",
                        })
                      }}
                      className="flex-1 h-10 px-4 py-3 font-medium text-white text-sm bg-green-600 hover:bg-green-700"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <Button onClick={() => setShowAddAdminDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
          <SimpleDropdown
            items={[
              {
                label: selectedAdmins.length > 0 ? "Export Selected Admins" : "Export All Admins",
                onClick: selectedAdmins.length > 0 ? exportSelectedAdmins : exportAllAdmins,
                icon: isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />,
                disabled: isExporting,
              },
              {
                label: "Delete all admins",
                onClick: () => {
                  showToast({
                    type: "info",
                    title: "Coming Soon",
                    message: "This feature will be available soon.",
                  })
                },
                icon: <Trash className="h-4 w-4" />,
                className: "text-red-600",
              },
              {
                label: "Deactivate all admins",
                onClick: () => {
                  showToast({
                    type: "info",
                    title: "Coming Soon",
                    message: "This feature will be available soon.",
                  })
                },
                icon: <UserX className="h-4 w-4" />,
              },
            ]}
          />
        </div>
      </div>

      {/* Active filters display */}
      {(params.sortField !== "full_name" || params.sortOrder !== "asc") && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
          <span>Sorting by:</span>
          <span className="font-medium">{getSortFieldLabel(params.sortField || "full_name")}</span>
          <span>•</span>
          <span className="font-medium">{getSortOrderLabel(params.sortOrder || "asc")}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 ml-auto"
            onClick={() => {
              setParams((prev) => ({
                ...prev,
                sortField: "full_name",
                sortOrder: "asc",
                page: 1,
              }))
            }}
          >
            Reset
          </Button>
        </div>
      )}

      {isMobile ? (
        // Mobile view - cards
        <div>
          {showBulkActions && (
            <div className="bg-muted/20 p-3 mb-4 rounded-md flex items-center justify-between">
              <span className="text-sm font-medium">{selectedAdmins.length} selected</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("activate")}
                  title="Activate selected admins"
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("deactivate")}
                  title="Deactivate selected admins"
                >
                  <UserX className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  onClick={() => handleBulkAction("delete")}
                  title="Delete selected admins"
                >
                  <Trash className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectedAdmins.length > 0 ? exportSelectedAdmins : exportAllAdmins}
                  title={selectedAdmins.length > 0 ? "Export selected admins" : "Export all admins"}
                  disabled={isExporting}
                >
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {!isLoading && admins.length > 0 && (
            <div className="flex items-center px-2 py-3 bg-background border rounded-md mb-4">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all admins"
                className="mr-3"
              />
              <span className="text-sm font-medium">Select All</span>
            </div>
          )}

          {isLoading ? (
            // Mobile loading state
            Array.from({ length: 3 }).map((_, index) => <MobileLoadingSkeleton key={index} />)
          ) : admins && admins.length > 0 ? (
            // Mobile admin cards
            admins.map((admin) => <MobileAdminCard key={admin.id} admin={admin} />)
          ) : (
            // Mobile empty state
            <div className="bg-white rounded-lg p-8 text-center">
              {searchTerm ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <p className="text-sm text-gray-500">No admins found matching "{searchTerm}"</p>
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                    Clear search
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No admins found</p>
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
                  <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} aria-label="Select all admins" />
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => {
                      if (params.sortField === "full_name") {
                        handleSortOrderChange(params.sortOrder === "asc" ? "dec" : "asc")
                      } else {
                        handleSortFieldChange("full_name")
                      }
                    }}
                  >
                    Name
                    {params.sortField === "full_name" && (
                      <span>
                        {params.sortOrder === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => {
                      if (params.sortField === "email") {
                        handleSortOrderChange(params.sortOrder === "asc" ? "dec" : "asc")
                      } else {
                        handleSortFieldChange("email")
                      }
                    }}
                  >
                    Email
                    {params.sortField === "email" && (
                      <span>
                        {params.sortOrder === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => {
                      if (params.sortField === "role") {
                        handleSortOrderChange(params.sortOrder === "asc" ? "dec" : "asc")
                      } else {
                        handleSortFieldChange("role")
                      }
                    }}
                  >
                    Permission
                    {params.sortField === "role" && (
                      <span>
                        {params.sortOrder === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => {
                      if (params.sortField === "is_active") {
                        handleSortOrderChange(params.sortOrder === "asc" ? "dec" : "asc")
                      } else {
                        handleSortFieldChange("is_active")
                      }
                    }}
                  >
                    Status
                    {params.sortField === "is_active" && (
                      <span>
                        {params.sortOrder === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-4 rounded" />
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
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : admins && admins.length > 0 ? (
                admins.map((admin) => (
                  <TableRow key={admin.id} className={selectedAdmins.includes(admin.id) ? "bg-muted/40" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedAdmins.includes(admin.id)}
                        onCheckedChange={(checked) => handleSelectAdmin(admin.id, !!checked)}
                        aria-label={`Select ${admin.full_name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarFallback className="bg-green-100 text-green-800">
                            {getInitials(admin.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{admin.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Select
                        value={admin.role}
                        onValueChange={(value: "super" | "regular") => handleUpdateRole(admin, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super">Super admin</SelectItem>
                          <SelectItem value="regular">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          admin.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {admin.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <SimpleDropdown
                        items={[
                          ...(admin.is_active
                            ? [
                                {
                                  label: "Deactivate Admin",
                                  onClick: () => setAdminToDeactivate(admin),
                                  icon: <UserX className="h-4 w-4" />,
                                },
                              ]
                            : [
                                {
                                  label: "Activate Admin",
                                  onClick: () => handleActivateAdmin(admin),
                                  icon: <UserCheck className="h-4 w-4" />,
                                },
                              ]),
                          {
                            label: "Delete Admin",
                            onClick: () => setAdminToDelete(admin),
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
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchTerm ? (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <p className="text-sm text-gray-500">No admins found matching "{searchTerm}"</p>
                        <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                          Clear search
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No admins found</p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination && admins && admins.length > 0 && (
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
              Showing {pagination ? (pagination.currentPage - 1) * params.limit + 1 : 0} to{" "}
              {pagination ? Math.min(pagination.currentPage * params.limit, pagination.totalAdmins) : 0} of{" "}
              {pagination?.totalAdmins || 0} results
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination?.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {!isMobile &&
              Array.from({ length: Math.min(5, pagination?.totalPages || 0) }, (_, i) => {
                let pageNumber: number

                if (pagination?.totalPages <= 5) {
                  pageNumber = i + 1
                } else if (pagination?.currentPage <= 3) {
                  pageNumber = i + 1
                } else if (pagination?.currentPage >= pagination?.totalPages - 2) {
                  pageNumber = pagination?.totalPages - 4 + i
                } else {
                  pageNumber = pagination?.currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNumber}
                    variant="outline"
                    size="sm"
                    className={`w-9 p-0 ${
                      pagination?.currentPage === pageNumber ? "bg-green-50 text-green-600 border-green-200" : ""
                    }`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}

            {!isMobile && pagination?.totalPages > 5 && pagination?.currentPage < pagination?.totalPages - 2 && (
              <>
                <div className="px-2">...</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-9 p-0"
                  onClick={() => handlePageChange(pagination?.totalPages)}
                >
                  {pagination?.totalPages}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination?.currentPage + 1)}
              disabled={!pagination?.hasNextPage}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Admin Dialog */}
      <CustomDialog
        open={showAddAdminDialog}
        onOpenChange={setShowAddAdminDialog}
        title="Add Admin"
        description="Create a new admin account"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="full_name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="full_name"
              value={newAdmin.full_name}
              onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
              placeholder="Enter full name"
            />
            {formErrors.full_name && <p className="text-sm text-red-500">{formErrors.full_name}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              placeholder="Enter email address"
            />
            {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              value={newAdmin.username}
              onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
              placeholder="Enter username"
            />
            {formErrors.username && <p className="text-sm text-red-500">{formErrors.username}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              placeholder="Enter password"
            />
            {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
          </div>
        </div>
        <CustomDialogFooter>
          <CustomDialogCancel onClick={() => setShowAddAdminDialog(false)}>Cancel</CustomDialogCancel>
          <CustomDialogAction onClick={handleAddAdmin} disabled={isAddingAdmin}>
            {isAddingAdmin ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding...
              </div>
            ) : (
              "Add Admin"
            )}
          </CustomDialogAction>
        </CustomDialogFooter>
      </CustomDialog>

      {/* Delete Admin Dialog */}
      <CustomDialog
        open={!!adminToDelete}
        onOpenChange={(open) => !open && setAdminToDelete(null)}
        title="Delete Admin"
        description={`Are you sure you want to delete ${adminToDelete?.full_name}? This action cannot be undone.`}
      >
        <CustomDialogFooter>
          <CustomDialogCancel onClick={() => setAdminToDelete(null)} disabled={isDeleting}>
            Cancel
          </CustomDialogCancel>
          <CustomDialogAction
            onClick={handleDeleteAdmin}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </CustomDialogAction>
        </CustomDialogFooter>
      </CustomDialog>

      {/* Deactivate Admin Dialog */}
      <CustomDialog
        open={!!adminToDeactivate}
        onOpenChange={(open) => !open && setAdminToDeactivate(null)}
        title="Deactivate Admin"
        description={`Are you sure you want to deactivate ${adminToDeactivate?.full_name}? They will no longer be able to access the system.`}
      >
        <CustomDialogFooter>
          <CustomDialogCancel onClick={() => setAdminToDeactivate(null)} disabled={isDeactivating}>
            Cancel
          </CustomDialogCancel>
          <CustomDialogAction
            onClick={handleDeactivateAdmin}
            disabled={isDeactivating}
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
          >
            {isDeactivating ? "Deactivating..." : "Deactivate"}
          </CustomDialogAction>
        </CustomDialogFooter>
      </CustomDialog>

      {/* Bulk Action Confirmation Dialog */}
      <CustomDialog
        open={showBulkActionDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowBulkActionDialog(false)
            setBulkActionType(null)
          }
        }}
        title={`Confirm Bulk ${bulkActionType ? bulkActionType.charAt(0).toUpperCase() + bulkActionType.slice(1) : ""}`}
        description={
          bulkActionType === "delete"
            ? `Are you sure you want to delete ${selectedAdmins.length} admin${selectedAdmins.length !== 1 ? "s" : ""}? This action cannot be undone.`
            : bulkActionType === "deactivate"
              ? `Are you sure you want to deactivate ${selectedAdmins.length} admin${selectedAdmins.length !== 1 ? "s" : ""}? They will no longer be able to access the system.`
              : `Are you sure you want to activate ${selectedAdmins.length} admin${selectedAdmins.length !== 1 ? "s" : ""}?`
        }
      >
        <CustomDialogFooter>
          <CustomDialogCancel
            onClick={() => {
              setShowBulkActionDialog(false)
              setBulkActionType(null)
            }}
            disabled={isBulkActionProcessing}
          >
            Cancel
          </CustomDialogCancel>
          <CustomDialogAction
            onClick={performBulkAction}
            disabled={isBulkActionProcessing}
            className={
              bulkActionType === "delete"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : bulkActionType === "deactivate"
                  ? "bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
                  : ""
            }
          >
            {isBulkActionProcessing
              ? `Processing...`
              : bulkActionType === "delete"
                ? "Delete"
                : bulkActionType === "deactivate"
                  ? "Deactivate"
                  : "Activate"}
          </CustomDialogAction>
        </CustomDialogFooter>
      </CustomDialog>
    </div>
  )
}
