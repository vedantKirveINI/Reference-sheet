import React from "react";
import { Clock, Calendar, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FREQUENCY_OPTIONS, DAY_OPTIONS, TIMEZONE_OPTIONS } from "../constants";

const ConfigureTab = ({ state }) => {
  const {
    frequency,
    setFrequency,
    minute,
    setMinute,
    hour,
    setHour,
    dayOfWeek,
    setDayOfWeek,
    dayOfMonth,
    setDayOfMonth,
    timezone,
    setTimezone,
    validation,
  } = state;

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    id: String(i),
    label: i.toString().padStart(2, "0") + ":00",
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    id: String(i),
    label: i.toString().padStart(2, "0"),
  }));

  const dayOfMonthOptions = Array.from({ length: 31 }, (_, i) => ({
    id: String(i + 1),
    label: String(i + 1),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#F59E0B]" />
          Frequency
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {FREQUENCY_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setFrequency(option.id)}
              className={cn(
                "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1",
                frequency === option.id
                  ? "border-[#F59E0B] bg-[#F59E0B]/5"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                frequency === option.id ? "text-[#F59E0B]" : "text-gray-700"
              )}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {(frequency === "week") && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#F59E0B]" />
            Day of Week
          </Label>
          <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {DAY_OPTIONS.map((day) => (
                <SelectItem key={day.id} value={day.id}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {frequency === "month" && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#F59E0B]" />
            Day of Month
          </Label>
          <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {dayOfMonthOptions.map((day) => (
                <SelectItem key={day.id} value={day.id}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(frequency === "day" || frequency === "week" || frequency === "month") && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">Time</Label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs text-gray-500 mb-1 block">Hour</Label>
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {hourOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs text-gray-500 mb-1 block">Minute</Label>
              <Select value={minute} onValueChange={setMinute}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Minute" />
                </SelectTrigger>
                <SelectContent>
                  {minuteOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {frequency === "hour" && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">Minute</Label>
          <div className="flex-1">
            <Label className="text-xs text-gray-500 mb-1 block">Run at minute</Label>
            <Select value={minute} onValueChange={setMinute}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent>
                {minuteOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#F59E0B]" />
          Timezone
        </Label>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONE_OPTIONS.map((tz) => (
              <SelectItem key={tz.id} value={tz.id}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-[#F59E0B]/10 rounded-xl p-4 space-y-2">
        <h4 className="font-medium text-gray-900 text-sm">Schedule Summary</h4>
        <p className="text-sm text-gray-700">
          {getScheduleSummary(frequency, minute, hour, dayOfWeek, dayOfMonth, timezone)}
        </p>
      </div>

      {!validation.isValid && (
        <div className="bg-red-50 rounded-xl p-4">
          <ul className="text-sm text-red-600 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const getScheduleSummary = (frequency, minute, hour, dayOfWeek, dayOfMonth, timezone) => {
  const formatHour = (h) => {
    const hour12 = h % 12 || 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${hour12}:${minute.padStart(2, "0")} ${ampm}`;
  };

  switch (frequency) {
    case "minute":
      return `Runs every minute in ${timezone} timezone`;
    case "hour":
      return `Runs every hour at :${minute.padStart(2, "0")} minutes in ${timezone} timezone`;
    case "day":
      return `Runs daily at ${formatHour(parseInt(hour))} in ${timezone} timezone`;
    case "week":
      return `Runs every ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)} at ${formatHour(parseInt(hour))} in ${timezone} timezone`;
    case "month":
      return `Runs on the ${dayOfMonth}${getOrdinalSuffix(parseInt(dayOfMonth))} of every month at ${formatHour(parseInt(hour))} in ${timezone} timezone`;
    default:
      return "Configure your schedule above";
  }
};

const getOrdinalSuffix = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

export default ConfigureTab;
