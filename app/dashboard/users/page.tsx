import { Header } from "@/core/components/layout/header"
import { UsersTable } from "@/core/components/users/users-table"
import { Icons } from "@/core/components/icons"

export default function UsersPage() {
  return (
    <div className="container mx-auto py-4 sm:py-6 px-4">
      <Header
        title="User Management"
        actionButton={{
          label: "Add user",
          icon: <Icons.add className="h-4 w-4" />,
          href: "/dashboard/users/add",
        }}
      />

      <div className="mt-6 sm:mt-8">
        <UsersTable />
      </div>
    </div>
  )
}
