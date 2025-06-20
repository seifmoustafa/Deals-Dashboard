"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange: (date?: Date) => void
  disabled?: boolean
}

export function DatePicker({ date, onDateChange, disabled }: DatePickerProps) {
  // Prevent the popover from closing when selecting a date
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button" // Explicitly set type to button to prevent form submission
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            "h-10 px-3 py-2",
          )}
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault() // Prevent any form submission
            setOpen(true)
          }}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : "Select date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[9999]" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            onDateChange(date)
            setOpen(false)
          }}
          initialFocus
          disabled={(date) => date > new Date()}
          className="rounded-md border shadow-md bg-white"
        />
      </PopoverContent>
    </Popover>
  )
}
