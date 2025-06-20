"use client"
import { Edit, UserMinus, Trash2 } from "lucide-react"
import { SimpleDropdown } from "@/core/components/ui/simple-dropdown"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface AdminRowActionsProps {
  adminId: string
  adminName: string
  isActive: boolean
}

export function AdminRowActions({ adminId, adminName, isActive }: AdminRowActionsProps) {
  const { toast } = useToast()
  const router = useRouter()

  const handleEdit = () => {
    // This would navigate to edit page in a real application
    toast({
      title: "Edit Admin",
      description: `Editing ${adminName}'s details.`,
    })
  }

  const handleToggleStatus = () => {
    // This would be an API call in a real application
    const newStatus = !isActive
    const action = newStatus ? "activated" : "deactivated"

    toast({
      title: `Admin ${action}`,
      description: `${adminName} has been ${action} successfully.`,
    })
  }

  const handleDelete = () => {
    // This would be an API call in a real application
    toast({
      title: "Admin deleted",
      description: `${adminName} has been deleted successfully.`,
    })
  }

  const items = [
    {
      label: "Edit Admin",
      onClick: handleEdit,
      icon: <Edit className="h-4 w-4" />,
    },
    {
      label: isActive ? "Deactivate Admin" : "Activate Admin",
      onClick: handleToggleStatus,
      icon: <UserMinus className="h-4 w-4" />,
      className: isActive ? "text-amber-600" : "text-green-600",
    },
    {
      label: "Delete Admin",
      onClick: handleDelete,
      icon: <Trash2 className="h-4 w-4" />,
      className: "text-red-600",
    },
  ]

  return <SimpleDropdown items={items} />
}
