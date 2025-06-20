import type React from "react"
import { Sidebar } from "@/core/components/layout/sidebar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Deals Admin",
  description: "Admin dashboard for Deals e-commerce platform",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto pt-0 lg:pt-0">
        {/* Add top padding on mobile to account for the fixed header */}
        <div className="pt-16 lg:pt-0">{children}</div>
      </div>
    </div>
  )
}
