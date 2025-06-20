"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { authService } from "@/infrastructure/di/container"
import type { LoginCredentials } from "@/domain/entities/admin"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/core/localization/translation-context"

export default function LoginForm() {
  const router = useRouter()
  const { t } = useTranslation()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.login(credentials)

      // Show success toast
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.admin.fullName}!`,
      })

      // Redirect directly to users page
      router.push("/dashboard/users")
    } catch (error) {
      console.error("Login failed:", error)
      setError(error instanceof Error ? error.message : "Login failed. Please try again.")

      // Show error toast
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full px-4 sm:px-0">
      <h1 className="text-xl sm:text-2xl font-medium mb-6 sm:mb-8">{t("auth.welcome")}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

        <div className="space-y-2">
          <Label htmlFor="username">{t("auth.username") || "Username"}</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="username"
            value={credentials.username}
            onChange={handleChange}
            required
            className="h-10 sm:h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="password"
            value={credentials.password}
            onChange={handleChange}
            required
            className="h-10 sm:h-12"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <Label htmlFor="remember" className="text-sm font-normal">
            {t("auth.rememberMe")}
          </Label>
        </div>

        <Button type="submit" className="w-full h-10 sm:h-12 bg-[#037b2a] hover:bg-[#026622]" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("auth.loggingIn")}
            </>
          ) : (
            t("auth.login")
          )}
        </Button>
      </form>
    </div>
  )
}
