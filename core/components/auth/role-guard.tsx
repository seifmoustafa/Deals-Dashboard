"use client"

import { useRouter } from "next/navigation"
import { useAdminRole } from "@/core/hooks/use-admin-role"
import { Loader2 } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ("super" | "regular")[]
  fallbackPath?: string
  fallbackComponent?: React.ReactNode
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = "/dashboard/users",
  fallbackComponent 
}: RoleGuardProps) {
  const { admin, isLoading, hasAnyRole } = useAdminRole()
  const router = useRouter()

  // Show loading spinner while checking access
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-600">Checking access permissions...</p>
        </div>
      </div>
    )
  }

  // No admin found, redirect to login
  if (!admin) {
    router.push("/login")
    return null
  }

  // Check if admin's role is in allowed roles
  if (!hasAnyRole(allowedRoles)) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>
    }
    // Redirect to fallback path if no custom fallback component
    router.push(fallbackPath)
    return null
  }

  // If admin has required role, show the protected content
  return <>{children}</>
}

// Convenience component specifically for superAdmin access
export function SuperAdminGuard({ 
  children, 
  fallbackPath = "/dashboard/users",
  fallbackComponent 
}: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard 
      allowedRoles={["super"]} 
      fallbackPath={fallbackPath}
      fallbackComponent={fallbackComponent}
    >
      {children}
    </RoleGuard>
  )
}

// Convenience component for regular admin access
export function RegularAdminGuard({ 
  children, 
  fallbackPath = "/dashboard/users",
  fallbackComponent 
}: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard 
      allowedRoles={["regular", "super"]} 
      fallbackPath={fallbackPath}
      fallbackComponent={fallbackComponent}
    >
      {children}
    </RoleGuard>
  )
}
