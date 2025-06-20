"use client"

import { useEffect, useState } from "react"
import { logoutUser } from "@/core/auth/auth-interceptor"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function AuthModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Listen for the custom event to show the modal
    const handleShowModal = () => {
      setIsOpen(true)
    }

    window.addEventListener("show-auth-modal", handleShowModal)

    return () => {
      window.removeEventListener("show-auth-modal", handleShowModal)
    }
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    logoutUser()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Only allow closing via the button
        if (!open) return
        setIsOpen(open)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
          <DialogDescription>
            Your session has expired or is invalid. Please log in again to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleConfirm} className="w-full bg-[#037b2a] hover:bg-[#026622]">
            Log in again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
