"use client"
import { Edit, UserMinus, Trash2 } from "lucide-react"
import { SimpleDropdown } from "@/core/components/ui/simple-dropdown"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ApiClient } from "@/data/api/api-client"

interface UserRowActionsProps {
  userId: string
  userName: string
  isActive: boolean
  onUserDeleted?: () => void
  onStatusChanged?: () => void
}

export function UserRowActions({ userId, userName, isActive, onUserDeleted, onStatusChanged }: UserRowActionsProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const apiClient = new ApiClient()

  const handleEdit = () => {
    router.push(`/dashboard/users/edit/${userName}`)
  }

  const handleToggleStatus = async () => {
    try {
      setIsLoading(true)
      // This would be an API call in a real application
      const newStatus = !isActive
      const action = newStatus ? "activated" : "deactivated"

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: `User ${action}`,
        description: `${userName} has been ${action} successfully.`,
      })

      // Notify parent component to refresh data
      if (onStatusChanged) {
        onStatusChanged()
      }
    } catch (error) {
      console.error("Error toggling user status:", error)
      toast({
        title: "Error",
        description: `Failed to update status for ${userName}.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)

      // Make the actual API call to delete the user
      console.log(`Deleting user with ID: ${userId}`)
      const response = await apiClient.delete(`/users/${userId}`)

      console.log("Delete user response:", response)

      toast({
        title: "User deleted",
        description: response.message || `${userName} has been deleted successfully.`,
      })

      // Notify parent component to refresh data
      if (onUserDeleted) {
        onUserDeleted()
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: `Failed to delete ${userName}.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const items = [
    {
      label: "Edit User",
      onClick: handleEdit,
      icon: <Edit className="h-4 w-4" />,
      disabled: isLoading,
    },
    {
      label: isActive ? "Deactivate User" : "Activate User",
      onClick: handleToggleStatus,
      icon: <UserMinus className="h-4 w-4" />,
      className: isActive ? "text-amber-600" : "text-green-600",
      disabled: isLoading,
    },
    {
      label: "Delete User",
      onClick: handleDelete,
      icon: <Trash2 className="h-4 w-4" />,
      className: "text-red-600",
      disabled: isLoading,
    },
  ]

  return <SimpleDropdown items={items} />
}
