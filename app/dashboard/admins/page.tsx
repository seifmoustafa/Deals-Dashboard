import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import AdminsTable from "@/core/components/admins/admins-table"

export default function AdminsPage() {
  return (
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
  )
}
