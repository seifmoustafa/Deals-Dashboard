"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

interface SimpleDatePickerProps {
  date?: Date
  onDateChange: (date?: Date) => void
  disabled?: boolean
}

export function SimpleDatePicker({ date, onDateChange, disabled }: SimpleDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close the calendar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start text-left font-normal h-10 px-3 py-2"
        onClick={(e) => {
          e.preventDefault()
          setIsOpen(!isOpen)
        }}
        disabled={disabled}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP") : "Select date"}
      </Button>

      {isOpen && (
        <div
          className="absolute z-[9999] mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3"
          style={{ width: "auto", minWidth: "300px" }}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate)
              setIsOpen(false)
            }}
            initialFocus
            disabled={(date) => date > new Date()}
          />
        </div>
      )}
    </div>
  )
}
