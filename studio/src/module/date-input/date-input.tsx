import InputMask from "react-input-mask";
import { useEffect, useMemo, useRef } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getPlaceholder, getMask } from "./utils/date-formatters";
import { DateInputProps } from "./types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
dayjs.extend(customParseFormat);

// const inputFormats = [
//   "DD.MM.YYYY",
//   "MM.DD.YYYY",
//   "YYYY.MM.DD",
//   "DD/MM/YYYY",
//   "MM/DD/YYYY",
//   "YYYY/MM/DD",
//   "DD-MM-YYYY",
//   "MM-DD-YYYY",
//   "YYYY-MM-DD",
// ];

export const DateInput = ({
  value,
  onChange,
  onSelect,
  error,
  autoFocus,
  theme = {},
  format = "DDMMYYYY",
  separator = "/",
  enableCalender,
  style,
  disabled,
  minDate,
  maxDate,
  dataTestId,
  size = "default",
  inputVariant = "underline",
}: DateInputProps) => {

  const placeholder = useMemo(
    () => getPlaceholder({ format, separator }) || "",
    [format, separator]
  );
  const previousPlaceholderRef = useRef(placeholder);

  const mask = useMemo(
    () => getMask({ format, separator }) || "",
    [format, separator]
  );

  useEffect(() => {
    if (value?.value) {
      const parsedDate = dayjs(
        value?.value,
        previousPlaceholderRef.current,
        true
      );

      if (parsedDate.isValid()) {
        const formattedDate = parsedDate.format(placeholder);
        previousPlaceholderRef.current = placeholder;

        onChange({ value: formattedDate, ISOValue: value.ISOValue });
      }
    }
  }, [format, separator]);

  const handleDateInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const SEPARATOR_COUNT = 2;
    const DATE_LENGTH = 8 + SEPARATOR_COUNT;

    if (value.length !== DATE_LENGTH) {
      onChange({ value, ISOValue: "" });
      return;
    }

    try {
      const parsedDate = dayjs(value, placeholder, true);
      if (parsedDate.isValid()) {
        // Get the current time (hours, minutes)
        const currentTime = dayjs();
        // Set the parsedDate with the current time
        const newDateWithTime = parsedDate
          .hour(currentTime.hour())
          .minute(currentTime.minute());
        const newDate = newDateWithTime.toISOString();

        onChange({ value: value, ISOValue: newDate });
        return;
      }

      onChange({ value: value, ISOValue: "" });
    } catch (error) {
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    const formattedDate = dayjs(date).format(placeholder);
    const parsedDate = dayjs(formattedDate, placeholder, true);
    // Get the current time (hours, minutes)
    const currentTime = dayjs();
    // Set the parsedDate with the current time
    const newDateWithTime = parsedDate
      .hour(currentTime.hour())
      .minute(currentTime.minute());
    const newDate = newDateWithTime.toISOString();

    onSelect?.({ value: formattedDate, ISOValue: newDate });
  };

  // Parse value.value to Date for Calendar component
  const parsedDate = useMemo(() => {
    if (!value?.value) return undefined;
    const date = dayjs(value.value, placeholder, true);
    return date.isValid() ? date.toDate() : undefined;
  }, [value?.value, placeholder]);

  // Convert minDate/maxDate strings to Date objects
  const minDateObj = useMemo(() => {
    if (!minDate) return undefined;
    // Try parsing as ISO first, then as formatted date
    const date = dayjs(minDate).isValid() ? dayjs(minDate).toDate() : undefined;
    return date;
  }, [minDate]);

  const maxDateObj = useMemo(() => {
    if (!maxDate) return undefined;
    // Try parsing as ISO first, then as formatted date
    const date = dayjs(maxDate).isValid() ? dayjs(maxDate).toDate() : undefined;
    return date;
  }, [maxDate]);

  // Apply theme-specific styles if provided (match Time component: 1.15em, Helvetica Neue)
  const inputStyle = theme?.styles
    ? {
        fontFamily: theme.styles.fontFamily || "Helvetica Neue",
        fontSize: "1.15em",
        color: theme.styles.buttons || undefined,
      }
    : undefined;

  const hasExplicitHeight = Boolean(style?.height);
  const isCompact = size === "sm";

  return (
    <div
      className={cn(
        "relative w-full",
        style && "custom-date-input-container",
        hasExplicitHeight && "flex flex-col min-h-0"
      )}
      style={style}
      data-testid={
        dataTestId
          ? dataTestId + "-date-input-container"
          : "date-input-question-type"
      }
    >
      <div className={cn(hasExplicitHeight && "flex-1 min-h-0 flex flex-col")}>
      <InputMask
        placeholder={placeholder}
        mask={mask}
        maskChar={null}
        value={value?.value}
        onChange={handleDateInputChange}
        autoFocus={autoFocus}
        disabled={disabled}
        data-testid={dataTestId ? dataTestId + "-date-input" : "date-input"}
      >
        {(inputProps: any) => (
          <div className="relative h-full">
            <input
              {...inputProps}
              disabled={disabled}
              className={cn(
                "flex w-full bg-transparent transition-colors",
                style?.height ? "h-full" : isCompact ? "h-8" : "h-9",
                isCompact ? "text-sm" : "text-[1.15em]",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                inputVariant === "bordered"
                  ? cn(
                      "rounded-md border border-input px-3 py-2 shadow-sm focus-visible:ring-1 focus-visible:ring-ring",
                      error &&
                        "border-destructive focus-visible:ring-destructive",
                      enableCalender && (isCompact ? "pr-8" : "pr-9")
                    )
                  : cn(
                      "rounded-none border-0 px-0 py-2",
                      error
                        ? "border-b-2 border-[rgba(200,60,60,1)] focus-visible:border-b-2 focus-visible:border-[rgba(200,60,60,1)]"
                        : "border-b focus-visible:border-b-2",
                      enableCalender && (isCompact ? "pr-8" : "pr-9")
                    ),
                inputProps.className
              )}
              style={
                inputVariant === "bordered"
                  ? { ...inputStyle, ...inputProps.style }
                  : {
                      ...inputStyle,
                      borderBottomColor: error
                        ? "rgba(200, 60, 60, 1)"
                        : theme?.styles?.buttons || "hsl(var(--border))",
                      ...inputProps.style,
                    }
              }
            />
            {enableCalender && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute right-0 top-1/2 -translate-y-1/2 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
                      isCompact ? "h-7 w-7" : "h-8 w-8"
                    )}
                    disabled={disabled}
                    type="button"
                    data-testid={
                      dataTestId
                        ? dataTestId + "-calendar-trigger"
                        : "calendar-trigger"
                    }
                  >
                    {<icons.calendar />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[999999999999]" align="start">
                  <Calendar
                    mode="single"
                    selected={parsedDate}
                    onSelect={handleCalendarSelect}
                    disabled={(date) => {
                      if (minDateObj && date < minDateObj) return true;
                      if (maxDateObj && date > maxDateObj) return true;
                      return false;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
      </InputMask>
      </div>
    </div>
  );
};
