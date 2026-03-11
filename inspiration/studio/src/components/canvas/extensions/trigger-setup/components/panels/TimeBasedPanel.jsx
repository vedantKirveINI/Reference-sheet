import React, { useState, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { THEME } from "../../constants";

const SCHEDULE_TYPES = {
  INTERVAL: "interval",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  ONCE: "once",
  CUSTOM: "custom",
};

const SCHEDULE_TYPE_OPTIONS = [
  { id: SCHEDULE_TYPES.INTERVAL, label: "Interval", description: "Run at regular intervals", iconKey: "refreshCw" },
  { id: SCHEDULE_TYPES.DAILY, label: "Daily", description: "Run every day at a specific time", iconKey: "sun" },
  { id: SCHEDULE_TYPES.WEEKLY, label: "Weekly", description: "Run on specific days of the week", iconKey: "calendarDays" },
  { id: SCHEDULE_TYPES.MONTHLY, label: "Monthly", description: "Run on specific day each month", iconKey: "calendarRange" },
  { id: SCHEDULE_TYPES.ONCE, label: "Once", description: "Run one time at a specific date/time", iconKey: "alarmClock" },
  { id: SCHEDULE_TYPES.CUSTOM, label: "Custom", description: "Run on specific dates you choose", iconKey: "calendarCheck" },
];

const WEEKDAYS = [
  { id: 0, label: "Sun", fullLabel: "Sunday" },
  { id: 1, label: "Mon", fullLabel: "Monday" },
  { id: 2, label: "Tue", fullLabel: "Tuesday" },
  { id: 3, label: "Wed", fullLabel: "Wednesday" },
  { id: 4, label: "Thu", fullLabel: "Thursday" },
  { id: 5, label: "Fri", fullLabel: "Friday" },
  { id: 6, label: "Sat", fullLabel: "Saturday" },
];

const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central European (CET)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Japan (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

const getOrdinalSuffix = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const isArrayEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, idx) => val === arr2[idx]);
};

const getActivePreset = (weekdaysArray) => {
  if (isArrayEqual(weekdaysArray, [0, 1, 2, 3, 4, 5, 6])) return "all";
  if (isArrayEqual(weekdaysArray, [1, 2, 3, 4, 5])) return "weekdays";
  if (isArrayEqual(weekdaysArray, [0, 6])) return "weekends";
  return "custom";
};

const TimeBasedPanel = ({ state }) => {
  const {
    scheduleType = SCHEDULE_TYPES.INTERVAL,
    setScheduleType,
    interval = { value: 15, unit: "minutes" },
    setInterval,
    time = "09:00",
    setTime,
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    setTimezone,
    weekdays = [1, 2, 3, 4, 5],
    setWeekdays,
    dayOfMonth = "1",
    setDayOfMonth,
    customDates = [],
    setCustomDates,
    onceDate = "",
    setOnceDate,
    advanced = {
      startDate: null,
      endDate: null,
      advancedWeekdays: [0, 1, 2, 3, 4, 5, 6],
    },
    setAdvanced,
  } = state;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newCustomDate, setNewCustomDate] = useState("");

  const handleIntervalChange = useCallback(
    (key, value) => {
      if (setInterval) {
        setInterval({ ...interval, [key]: value });
      }
    },
    [interval, setInterval],
  );

  const handleAdvancedChange = useCallback(
    (key, value) => {
      if (setAdvanced) {
        setAdvanced({ ...advanced, [key]: value });
      }
    },
    [advanced, setAdvanced],
  );

  const toggleWeekday = useCallback(
    (dayId) => {
      if (!setWeekdays) return;
      const newWeekdays = weekdays.includes(dayId)
        ? weekdays.filter((d) => d !== dayId)
        : [...weekdays, dayId].sort((a, b) => a - b);
      if (newWeekdays.length > 0) {
        setWeekdays(newWeekdays);
      }
    },
    [weekdays, setWeekdays],
  );

  const selectWeekdayPreset = useCallback(
    (preset) => {
      if (!setWeekdays) return;
      if (preset === "weekdays") setWeekdays([1, 2, 3, 4, 5]);
      else if (preset === "weekends") setWeekdays([0, 6]);
      else if (preset === "all") setWeekdays([0, 1, 2, 3, 4, 5, 6]);
    },
    [setWeekdays],
  );

  const addCustomDate = useCallback(() => {
    if (!newCustomDate || !setCustomDates) return;
    if (!customDates.includes(newCustomDate)) {
      setCustomDates([...customDates, newCustomDate].sort());
    }
    setNewCustomDate("");
  }, [newCustomDate, customDates, setCustomDates]);

  const removeCustomDate = useCallback(
    (dateToRemove) => {
      if (!setCustomDates) return;
      setCustomDates(customDates.filter((d) => d !== dateToRemove));
    },
    [customDates, setCustomDates],
  );

  const getScheduleSummary = useMemo(() => {
    const formatTime = (t) => {
      if (!t) return "9:00 AM";
      const [h, m] = t.split(":");
      const hour = parseInt(h, 10);
      const hour12 = hour % 12 || 12;
      const ampm = hour < 12 ? "AM" : "PM";
      return `${hour12}:${m} ${ampm}`;
    };

    const tz = timezone || "UTC";
    switch (scheduleType) {
      case SCHEDULE_TYPES.INTERVAL:
        return `Runs every ${interval?.value || 15} ${interval?.unit || "minutes"}`;
      case SCHEDULE_TYPES.DAILY:
        return `Runs every day at ${formatTime(time)} (${tz})`;
      case SCHEDULE_TYPES.WEEKLY:
        const weekdayNames = weekdays
          ?.map((d) => WEEKDAYS.find((w) => w.id === d)?.label)
          .join(", ");
        return `Runs weekly on ${weekdayNames || "selected days"} at ${formatTime(time)} (${tz})`;
      case SCHEDULE_TYPES.MONTHLY:
        return `Runs on day ${dayOfMonth}${getOrdinalSuffix(parseInt(dayOfMonth))} of each month at ${formatTime(time)} (${tz})`;
      case SCHEDULE_TYPES.ONCE:
        return `Runs once on ${onceDate || "selected date"} at ${formatTime(time)} (${tz})`;
      case SCHEDULE_TYPES.CUSTOM:
        return `Runs on ${customDates?.length || 0} custom date(s) at ${formatTime(time)} (${tz})`;
      default:
        return "Configure your schedule";
    }
  }, [
    scheduleType,
    interval,
    time,
    timezone,
    weekdays,
    dayOfMonth,
    customDates,
    onceDate,
  ]);

  const dayOfMonthOptions = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}${getOrdinalSuffix(i + 1)}`,
  }));

  return (
    <div className="space-y-6">
      {/* Schedule Type Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          {icons.clock && <icons.clock className="w-4 h-4" style={{ color: THEME.accentColor }} />}
          Schedule Type
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {SCHEDULE_TYPE_OPTIONS.map((option) => {
            const Icon = icons[option.iconKey];
            const isSelected = scheduleType === option.id;
            return (
              <Button
                key={option.id}
                type="button"
                variant="outline"
                onClick={() => setScheduleType?.(option.id)}
                className={cn(
                  "h-auto p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2.5 text-center",
                  "hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-md hover:bg-primary/15 hover:text-primary"
                    : "border-border bg-background text-foreground hover:bg-muted/50 hover:border-muted-foreground/30 hover:text-foreground",
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isSelected ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                )}
                <span className={cn("text-xs font-semibold leading-tight", isSelected ? "text-primary" : "text-foreground")}>
                  {option.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Interval Config */}
      {scheduleType === SCHEDULE_TYPES.INTERVAL && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Run Every</Label>
          <div className="flex gap-3">
            <Input
              type="number"
              min={1}
              max={interval?.unit === "minutes" ? 59 : 23}
              value={interval?.value || 15}
              onChange={(e) =>
                handleIntervalChange("value", parseInt(e.target.value, 10) || 1)
              }
              className="w-24"
            />
            <ToggleGroup
              type="single"
              value={interval?.unit ?? "minutes"}
              onValueChange={(v) => v && handleIntervalChange("unit", v)}
              className="inline-flex rounded-lg border overflow-hidden bg-muted/30 p-0.5"
            >
              <ToggleGroupItem value="minutes" className="rounded-md px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                Minutes
              </ToggleGroupItem>
              <ToggleGroupItem value="hours" className="rounded-md px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                Hours
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      )}

      {/* Daily Config */}
      {scheduleType === SCHEDULE_TYPES.DAILY && (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time</Label>
              <TimePicker
                value={time || "09:00"}
                onChange={(v) => setTime?.(v)}
                placeholder="Select time"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                {icons.globe && <icons.globe className="w-4 h-4" style={{ color: THEME.accentColor }} />}
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
      )}

      {/* Weekly Config */}
      {scheduleType === SCHEDULE_TYPES.WEEKLY && (
        <>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Presets</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all-days", label: "Every day", preset: "all" },
                { id: "all-weekdays", label: "Weekdays", preset: "weekdays" },
                { id: "weekends", label: "Weekends", preset: "weekends" },
                { id: "custom", label: "Custom", preset: "custom" },
              ].map((preset) => {
                const isActive = getActivePreset(weekdays) === preset.preset;
                return (
                  <Button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      if (preset.preset !== "custom") selectWeekdayPreset(preset.preset);
                    }}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={cn("transition-all", isActive && "ring-2 ring-offset-2 ring-primary")}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Days to Run</Label>
            <div className="flex gap-1.5">
              {WEEKDAYS.map((day) => (
                <Button
                  key={day.id}
                  type="button"
                  variant={weekdays?.includes(day.id) ? "default" : "outline"}
                  size="icon"
                  onClick={() => toggleWeekday(day.id)}
                  className="w-10 h-10 rounded-full text-xs font-medium shrink-0"
                  title={day.fullLabel}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time</Label>
              <TimePicker
                value={time || "09:00"}
                onChange={(v) => setTime?.(v)}
                placeholder="Select time"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                {icons.globe && <icons.globe className="w-4 h-4" style={{ color: THEME.accentColor }} />}
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {/* Monthly Config */}
      {scheduleType === SCHEDULE_TYPES.MONTHLY && (
        <>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              {icons.calendar && <icons.calendar className="w-4 h-4" style={{ color: THEME.accentColor }} />}
              Day of Month
            </Label>
            <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {dayOfMonthOptions.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time</Label>
              <TimePicker
                value={time || "09:00"}
                onChange={(v) => setTime?.(v)}
                placeholder="Select time"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                {icons.globe && <icons.globe className="w-4 h-4" style={{ color: THEME.accentColor }} />}
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {/* Once Config */}
      {scheduleType === SCHEDULE_TYPES.ONCE && (
        <>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              {icons.calendar && <icons.calendar className="w-4 h-4" style={{ color: THEME.accentColor }} />}
              Date
            </Label>
            <DatePicker
              value={onceDate ? dayjs(onceDate) : null}
              onChange={(d) => setOnceDate?.(d ? d.format("YYYY-MM-DD") : "")}
              placeholder="Pick a date"
              format="MMMM D, YYYY"
              fromDate={(() => {
                const d = new Date();
                d.setHours(0, 0, 0, 0);
                return d;
              })()}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time</Label>
              <TimePicker
                value={time || "09:00"}
                onChange={(v) => setTime?.(v)}
                placeholder="Select time"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                {icons.globe && <icons.globe className="w-4 h-4" style={{ color: THEME.accentColor }} />}
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {/* Custom Dates Config */}
      {scheduleType === SCHEDULE_TYPES.CUSTOM && (
        <>
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              {icons.calendar && <icons.calendar className="w-4 h-4" style={{ color: THEME.accentColor }} />}
              Custom Dates
            </Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <DatePicker
                  value={newCustomDate ? dayjs(newCustomDate) : null}
                  onChange={(d) => {
                    if (d) {
                      const str = d.format("YYYY-MM-DD");
                      if (!customDates.includes(str)) setCustomDates?.([...customDates, str].sort());
                      setNewCustomDate("");
                    } else {
                      setNewCustomDate("");
                    }
                  }}
                  placeholder="Pick a date to add"
                  format="MMMM D, YYYY"
                  fromDate={(() => {
                    const d = new Date();
                    d.setHours(0, 0, 0, 0);
                    return d;
                  })()}
                />
              </div>
            </div>
            {customDates?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customDates.map((date) => (
                  <div
                    key={date}
                    className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm border border-primary/20"
                  >
                    {date}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 shrink-0 hover:bg-primary/20"
                      onClick={() => removeCustomDate(date)}
                      aria-label={`Remove ${date}`}
                    >
                      {icons.x && <icons.x className="w-3 h-3" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time</Label>
              <TimePicker
                value={time || "09:00"}
                onChange={(v) => setTime?.(v)}
                placeholder="Select time"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                {icons.globe && <icons.globe className="w-4 h-4" style={{ color: THEME.accentColor }} />}
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {/* Advanced Options */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full justify-start">
            {showAdvanced ? (icons.chevronUp && <icons.chevronUp className="w-4 h-4" />) : (icons.chevronDown && <icons.chevronDown className="w-4 h-4" />)}
            Advanced Options
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Start Date (Optional)</Label>
              <DatePicker
                value={advanced?.startDate ? dayjs(advanced.startDate) : null}
                onChange={(d) => handleAdvancedChange("startDate", d ? d.format("YYYY-MM-DD") : null)}
                placeholder="Pick start date"
                format="MMMM D, YYYY"
                fromDate={(() => {
                  const d = new Date();
                  d.setHours(0, 0, 0, 0);
                  return d;
                })()}
              />
              <p className="text-xs text-muted-foreground">
                Schedule won&apos;t run before this date
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">End Date (Optional)</Label>
              <DatePicker
                value={advanced?.endDate ? dayjs(advanced.endDate) : null}
                onChange={(d) => handleAdvancedChange("endDate", d ? d.format("YYYY-MM-DD") : null)}
                placeholder="Pick end date"
                format="MMMM D, YYYY"
                fromDate={(() => {
                  const startOfToday = new Date();
                  startOfToday.setHours(0, 0, 0, 0);
                  if (!advanced?.startDate) return startOfToday;
                  const [y, m, d] = advanced.startDate.split("-").map(Number);
                  return new Date(y, m - 1, d);
                })()}
              />
              <p className="text-xs text-muted-foreground">
                Schedule won&apos;t run after this date
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Schedule Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium">Schedule Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">{getScheduleSummary}</p>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            {icons.info && <icons.info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
            <p className="text-xs text-muted-foreground">
              Scheduled triggers run automatically based on your configuration.
              Make sure to deploy your workflow for the schedule to take effect.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeBasedPanel;
