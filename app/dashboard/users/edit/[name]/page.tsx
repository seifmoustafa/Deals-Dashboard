import { EditUserForm } from "@/core/components/users/edit-user-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function EditUserPage({ params }: { params: { name: string } }) {
  // The name param is now used instead of id
  return (
    <div className="container mx-auto py-4 sm:py-6 px-4">
      <div className="flex items-center mb-4 sm:mb-6 overflow-x-auto">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/users" className="text-xl sm:text-2xl font-semibold">
                User management
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-gray-500">Edit user</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <EditUserForm userName={params.name} />
    </div>
  )
}
