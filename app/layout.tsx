import type React from "react"
import type { Metadata } from "next"
import "@/styles/globals.css"
import { ThemeProvider } from "@/core/components/theme-provider"
import { TranslationProvider } from "@/core/localization/translation-context"
import { ToastContainer } from "@/core/components/ui/animated-toast"
import { AuthModal } from "@/core/components/auth/auth-modal"

export const metadata: Metadata = {
  title: "Deals Admin Dashboard",
  description: "E-commerce admin dashboard with clean architecture",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TranslationProvider>{children}</TranslationProvider>
        </ThemeProvider>
        <ToastContainer />
        <AuthModal />
      </body>
    </html>
  )
}
