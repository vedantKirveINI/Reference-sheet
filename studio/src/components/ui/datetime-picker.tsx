import * as React from "react"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

dayjs.extend(utc)
dayjs.extend(timezone)

interface DateTimePickerProps {
  value?: string | null // ISO string
  onChange?: (isoString: string | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  min?: string // ISO string for minimum date/time
  userTimezone?: string
  "data-testid"?: string
}

function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  className,
  disabled,
  min,
  userTimezone,
  "data-testid": dataTestId,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>()
  const [timeValue, setTimeValue] = React.useState("")

  // Convert ISO string to local date and time
  React.useEffect(() => {
    if (value) {
      try {
        const tz = userTimezone || dayjs.tz.guess()
        const dt = dayjs(value).tz(tz)
        if (dt.isValid()) {
          setSelectedDate(dt.toDate())
          setTimeValue(dt.format("HH:mm"))
        } else {
          setSelectedDate(undefined)
          setTimeValue("")
        }
      } catch (error) {
        setSelectedDate(undefined)
        setTimeValue("")
      }
    } else {
      setSelectedDate(undefined)
      setTimeValue("")
    }
  }, [value, userTimezone])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined)
      setTimeValue("")
      onChange?.(null)
      return
    }

    setSelectedDate(date)
    
    // If time is already set, combine date and time
    if (timeValue) {
      const combinedDateTime = dayjs(date)
        .hour(parseInt(timeValue.split(":")[0]) || 0)
        .minute(parseInt(timeValue.split(":")[1]) || 0)
      
      const tz = userTimezone || dayjs.tz.guess()
      const isoString = combinedDateTime.tz(tz).format()
      onChange?.(isoString)
    } else {
      // Set date with current time as default
      const now = dayjs()
      const combinedDateTime = dayjs(date)
        .hour(now.hour())
        .minute(now.minute())
      
      const tz = userTimezone || dayjs.tz.guess()
      const isoString = combinedDateTime.tz(tz).format()
      setTimeValue(now.format("HH:mm"))
      onChange?.(isoString)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTimeValue(newTime)

    if (selectedDate && newTime) {
      const [hours, minutes] = newTime.split(":").map(Number)
      const combinedDateTime = dayjs(selectedDate)
        .hour(hours || 0)
        .minute(minutes || 0)
      
      const tz = userTimezone || dayjs.tz.guess()
      const isoString = combinedDateTime.tz(tz).format()
      onChange?.(isoString)
    }
  }

  // Format display value
  const displayValue = React.useMemo(() => {
    if (selectedDate && timeValue) {
      const tz = userTimezone || dayjs.tz.guess()
      const dt = dayjs(selectedDate)
        .hour(parseInt(timeValue.split(":")[0]) || 0)
        .minute(parseInt(timeValue.split(":")[1]) || 0)
        .tz(tz)
      return dt.format("MMMM D, YYYY [at] h:mm A")
    } else if (selectedDate) {
      return dayjs(selectedDate).format("MMMM D, YYYY")
    }
    return null
  }, [selectedDate, timeValue, userTimezone])

  const isEmpty = !selectedDate

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          data-empty={isEmpty}
          className={cn(
            "w-full justify-start text-left font-normal",
            "data-[empty=true]:text-muted-foreground",
            className
          )}
          data-testid={dataTestId}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue ? (
            <span>{displayValue}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[999999999]" align="start">
        <div className="p-3 space-y-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            disabled={(date) => {
              if (!min) return false
              try {
                const tz = userTimezone || dayjs.tz.guess()
                // Compare calendar days in user timezone so today is always selectable
                const dateDayStr = dayjs(date).tz(tz).format("YYYY-MM-DD")
                const minDayStr = dayjs(min).tz(tz).format("YYYY-MM-DD")
                return dateDayStr < minDayStr
              } catch {
                return false
              }
            }}
          />
          {selectedDate && (
            <div className="flex items-center gap-2 border-t pt-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="w-full"
                placeholder="HH:mm"
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateTimePicker }
