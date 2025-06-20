"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CashbackTable } from "@/core/components/cashback/cashback-table"
import { Plus } from "lucide-react"
import { useTranslation } from "@/core/localization/translation-context"
import { useRouter } from "next/navigation"

export default function CashbackPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Cashback & Coupon</h1>
          <p className="text-sm text-gray-600 mt-1">Manage store cashback rates and coupon offers</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/cashback/add-offer")}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add offer
        </Button>
      </div>

      {/* Cashback Table */}
      <CashbackTable refreshTrigger={refreshTrigger} />
    </div>
  )
}
