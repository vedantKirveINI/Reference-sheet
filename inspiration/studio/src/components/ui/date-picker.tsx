"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import dayjs from "dayjs"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: dayjs.Dayjs | null
  onChange?: (date: dayjs.Dayjs | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  format?: string
  /** Minimum selectable date (that date and later are enabled). Uses native Date. */
  fromDate?: Date
}

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
  format: dateFormat = "MMMM Do, YYYY",
  fromDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(dayjs(date))
    } else {
      onChange?.(null)
    }
    setOpen(false)
  }

  const selectedDate = value?.toDate()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? value.format(dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
          disabled={fromDate ? { before: fromDate } : undefined}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }

