"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatTimeForDisplay(value: string | undefined | null): string {
  if (!value) return ""
  const [h, m] = value.split(":")
  const hour = parseInt(h, 10)
  if (isNaN(hour)) return value
  const hour12 = hour % 12 || 12
  const ampm = hour < 12 ? "AM" : "PM"
  const min = m ?? "00"
  return `${hour12}:${min} ${ampm}`
}

interface TimePickerProps {
  value?: string | null // "HH:mm"
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className,
  disabled,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value ?? "")

  React.useEffect(() => {
    setInternalValue(value ?? "")
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInternalValue(v)
    onChange?.(v)
  }

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open && internalValue) {
      onChange?.(internalValue)
    }
  }

  const displayText = value ? formatTimeForDisplay(value) : null

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
          <span className="shrink-0 mr-2 inline-flex items-center justify-center w-4 h-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          {displayText ? <span>{displayText}</span> : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <Input
          type="time"
          value={internalValue || "09:00"}
          onChange={handleChange}
          className="w-full"
          step={300}
        />
      </PopoverContent>
    </Popover>
  )
}

export { TimePicker }
