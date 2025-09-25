"use client"

import Link from "next/link"
import { Icons } from "../icons"
import { DealsLogo } from "../ui/deals-logo"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { authService } from "@/infrastructure/di/container"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/core/localization/translation-context"
import { useAdminRole } from "@/core/hooks/use-admin-role"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { admin, isSuperAdmin } = useAdminRole()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { t, dir } = useTranslation()

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const navItems = [
    {
      title: t("sidebar.users"),
      href: "/dashboard/users",
      icon: Icons.users,
    },
    {
      title: t("sidebar.categories"),
      href: "/dashboard/categories",
      icon: Icons.categories,
    },
    {
      title: t("sidebar.cashbackCoupon"),
      href: "/dashboard/cashback",
      icon: Icons.cashback,
    },
    {
      title: t("sidebar.profile"),
      href: "/dashboard/profile",
      icon: Icons.profile,
    },
    // Only show Admins link for superAdmin users
    ...(isSuperAdmin ? [{
      title: t("sidebar.admins"),
      href: "/dashboard/admins",
      icon: Icons.admins,
    }] : []),
  ]

  const handleLogout = () => {
    authService.logout()
    window.location.href = "/login"
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Get initials from full name
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .slice(0, 2)
      .map((name) => name[0])
      .join("")
      .toUpperCase()
  }

  // Mobile menu overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile header with menu button */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-30 flex items-center justify-between px-4">
          <DealsLogo />
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="lg:hidden">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile sidebar - slide in from left */}
        <div
          className={cn(
            "fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out lg:hidden",
            isMobileMenuOpen ? "translate-x-0" : dir === "ltr" ? "-translate-x-full" : "translate-x-full",
          )}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />

          {/* Sidebar content */}
          <div
            className={`absolute top-0 ${dir === "ltr" ? "left-0" : "right-0"} bottom-0 w-64 bg-white shadow-xl flex flex-col`}
          >
            <div className="p-4 border-b">
              <DealsLogo />
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                      isActive ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        `${dir === "ltr" ? "mr-3" : "ml-3"} h-5 w-5`,
                        isActive ? "text-green-600" : "text-gray-400",
                      )}
                    />
                    {item.title}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t p-4">
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-green-100 text-green-800">
                    {admin?.fullName ? getInitials(admin.fullName) : "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className={`${dir === "ltr" ? "ml-3" : "mr-3"}`}>
                  <p className="text-sm font-medium">{admin?.fullName || "Admin User"}</p>
                  <p className="text-xs text-gray-500">{admin?.username || ""}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`mt-4 flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50`}
              >
                <Icons.logout className={`${dir === "ltr" ? "mr-3" : "ml-3"} h-5 w-5`} />
                {t("sidebar.logout")}
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div
      className={cn(`hidden lg:flex h-screen w-64 flex-col border-${dir === "ltr" ? "r" : "l"} bg-white`, className)}
    >
      <div className="p-6">
        <DealsLogo />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                isActive ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <item.icon
                className={cn(
                  `${dir === "ltr" ? "mr-3" : "ml-3"} h-5 w-5`,
                  isActive ? "text-green-600" : "text-gray-400",
                )}
              />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-green-100 text-green-800">
              {admin?.fullName ? getInitials(admin.fullName) : "AD"}
            </AvatarFallback>
          </Avatar>
          <div className={`${dir === "ltr" ? "ml-3" : "mr-3"}`}>
            <p className="text-sm font-medium">{admin?.fullName || "Admin User"}</p>
            <p className="text-xs text-gray-500">{admin?.username || ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={`mt-4 flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50`}
        >
          <Icons.logout className={`${dir === "ltr" ? "mr-3" : "ml-3"} h-5 w-5`} />
          {t("sidebar.logout")}
        </button>
      </div>
    </div>
  )
}
