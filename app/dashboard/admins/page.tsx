import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import AdminsTable from "@/core/components/admins/admins-table"
import { SuperAdminGuard } from "@/core/components/auth/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function AdminsPage() {
  return (
    <SuperAdminGuard
      fallbackComponent={
        <div className="space-y-6 p-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                You don't have permission to access the Admins page. Only Super Administrators can manage admin accounts.
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Admins</h1>
          <Breadcrumb className="mt-2">
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Admins</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
        <AdminsTable />
      </div>
    </SuperAdminGuard>
  )
}
