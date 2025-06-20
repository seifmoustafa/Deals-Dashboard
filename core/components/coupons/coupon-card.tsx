"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react"
import type { Coupon } from "@/domain/entities/coupon"
import { format } from "date-fns"

interface CouponCardProps {
  coupon: Coupon
  storeName: string
  categoryName: string
  onEdit: (coupon: Coupon) => void
  onDelete: (coupon: Coupon) => void
}

export function CouponCard({ coupon, storeName, categoryName, onEdit, onDelete }: CouponCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getDiscountText = () => {
    if (coupon.discount_type === "DISCOUNT") {
      return `Extra discount up to ${coupon.discount}%`
    } else if (coupon.discount_type === "CASHBACK") {
      return `Extra cashback up to ${coupon.cashback}%`
    } else {
      return `Extra discount up to ${coupon.discount}%`
    }
  }

  // Custom coupon icon SVG
  const CouponIcon = () => (
    <svg width="20" height="20" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.5994 4.2789L15.0175 2.47047C14.835 1.90318 14.1999 1.62043 13.6562 1.86438L11.9229 2.64205C11.0916 3.01503 10.1359 2.99 9.32522 2.57402L7.63502 1.70671C7.10482 1.43464 6.45583 1.68376 6.24387 2.24072L5.56815 4.01623C5.24407 4.86778 4.55055 5.52591 3.6832 5.80498L1.87476 6.38685C1.30747 6.56937 1.02473 7.20443 1.26868 7.74814L2.04634 9.48142C2.41932 10.3127 2.3943 11.2685 1.97832 12.0791L1.11101 13.7693C0.838938 14.2995 1.08806 14.9485 1.64502 15.1605L3.42053 15.8362C4.27208 16.1603 4.9302 16.8538 5.20927 17.7211L5.79114 19.5296C5.97367 20.0969 6.60873 20.3796 7.15244 20.1357L8.88572 19.358C9.71702 18.985 10.6728 19.01 11.4834 19.426L13.1736 20.2933C13.7038 20.5654 14.3528 20.3163 14.5648 19.7593L15.2405 17.9838C15.5646 17.1323 16.2581 16.4741 17.1254 16.1951L18.9339 15.6132C19.5012 15.4307 19.7839 14.7956 19.54 14.2519L18.7623 12.5186C18.3893 11.6873 18.4143 10.7316 18.8303 9.92092L19.6976 8.23072C19.9697 7.70052 19.7206 7.05154 19.1636 6.83957L17.3881 6.16385C16.5366 5.83977 15.8784 5.14625 15.5994 4.2789ZM15.9694 2.16418C15.6044 1.0296 14.3343 0.46411 13.2468 0.952004L11.5136 1.72967C10.9594 1.97833 10.3222 1.96164 9.78176 1.68432L8.09156 0.817008C7.03116 0.272871 5.7332 0.771114 5.30926 1.88503L4.63354 3.66054C4.41749 4.22824 3.95514 4.66699 3.37691 4.85304L1.56847 5.43491C0.433895 5.79996 -0.131593 7.07007 0.3563 8.1575L1.13397 9.89077C1.38262 10.445 1.36594 11.0821 1.08862 11.6226L0.221305 13.3128C-0.322832 14.3732 0.175411 15.6711 1.28933 16.0951L3.06484 16.7708C3.63254 16.9868 4.07129 17.4492 4.25734 18.0274L4.83921 19.8359C5.20426 20.9704 6.47437 21.5359 7.56179 21.048L9.29507 20.2704C9.84927 20.0217 10.4864 20.0384 11.0269 20.3157L12.7171 21.183C13.7775 21.7272 15.0754 21.2289 15.4994 20.115L16.1751 18.3395C16.3911 17.7718 16.8535 17.333 17.4317 17.147L19.2402 16.5651C20.3747 16.2001 20.9402 14.93 20.4523 13.8425L19.6747 12.1093C19.426 11.5551 19.4427 10.9179 19.72 10.3775L20.5873 8.68726C21.1315 7.62686 20.6332 6.3289 19.5193 5.90497L17.7438 5.22925C17.1761 5.01319 16.7373 4.55085 16.5513 3.97262L15.9694 2.16418Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.51497 15.5723C7.47485 15.6351 7.45235 15.7075 7.44982 15.782C7.44729 15.8566 7.46489 15.9305 7.50077 15.996C7.53666 16.0615 7.58951 16.116 7.65378 16.154C7.71804 16.192 7.79135 16.212 7.86601 16.2119C7.93609 16.212 8.00505 16.1944 8.06652 16.1608C8.12746 16.1274 8.17909 16.0793 8.21671 16.0209L8.21768 16.0194L14.051 6.85276C14.1061 6.75976 14.1231 6.64863 14.0981 6.54346C14.073 6.43816 14.0079 6.34676 13.9166 6.2886C13.8253 6.23044 13.715 6.2101 13.6089 6.23187C13.5029 6.25365 13.4095 6.31583 13.3485 6.40526L7.51497 15.5723ZM5.78268 7.46193C5.78268 8.61026 6.71768 9.54526 7.86601 9.54526C9.01434 9.54526 9.94934 8.61026 9.94934 7.46193C9.94934 6.31359 9.01434 5.37859 7.86601 5.37859C6.71768 5.37859 5.78268 6.31359 5.78268 7.46193ZM6.61601 7.46193C6.61601 6.77276 7.17684 6.21193 7.86601 6.21193C8.55518 6.21193 9.11601 6.77276 9.11601 7.46193C9.11601 8.15109 8.55518 8.71193 7.86601 8.71193C7.17684 8.71193 6.61601 8.15109 6.61601 7.46193ZM11.616 14.9619C11.616 16.1103 12.551 17.0453 13.6993 17.0453C14.8477 17.0453 15.7827 16.1103 15.7827 14.9619C15.7827 13.8136 14.8477 12.8786 13.6993 12.8786C12.551 12.8786 11.616 13.8136 11.616 14.9619ZM12.4493 14.9619C12.4493 14.2728 13.0102 13.7119 13.6993 13.7119C14.3885 13.7119 14.9493 14.2728 14.9493 14.9619C14.9493 15.6511 14.3885 16.2119 13.6993 16.2119C13.0102 16.2119 12.4493 15.6511 12.4493 14.9619Z"
        fill="currentColor"
      />
    </svg>
  )

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CouponIcon />
          <span className="text-sm font-medium">{getDiscountText()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="p-1 h-auto">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(coupon)} className="p-1 h-auto">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(coupon)} className="p-1 h-auto text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t">
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Store :</span>
                <span className="text-sm font-medium">{storeName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Category :</span>
                <span className="text-sm font-medium">{categoryName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Discount rate :</span>
                <span className="text-sm font-medium">{coupon.discount}%</span>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Description :</span>
              <span className="text-sm text-right max-w-[70%]">
                Offer might end before the specialized date and applied only if you purchase above 600$
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Code :</span>
                <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded">{coupon.code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expiry Date :</span>
                <span className="text-sm font-medium">{format(new Date(coupon.expiry_date), "dd/MM/yyyy")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
