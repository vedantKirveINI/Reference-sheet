import InputMask from "react-input-mask";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import { DateInput } from "@src/module/date-input";
import { computeISOValueFromDate } from "@src/module/utils/helper/date";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Copy, Calendar, Sliders } from "lucide-react";

dayjs.extend(customParseFormat);

const DATE_FORMAT_OPTIONS = ["DDMMYYYY", "MMDDYYYY", "YYYYMMDD"];

const SEPARATOR_OPTIONS = ["/", ".", "-"];

// Helper function to generate example date based on format and separator
const getExampleDate = (format: string, separator: string): string => {
  if (!format || !separator) return "";
  // Use March 15, 2024 as example date
  const day = "15";
  const month = "03";
  const year = "2024";

  if (format === "DDMMYYYY") return `${day}${separator}${month}${separator}${year}`;
  if (format === "MMDDYYYY") return `${month}${separator}${day}${separator}${year}`;
  if (format === "YYYYMMDD") return `${year}${separator}${month}${separator}${day}`;
  return "";
};

interface DateSettingsProps {
  question: any;
  onChange: (val: any) => void;
  setQuestion?: (val: any) => void;
  viewPort?: any;
  variables?: any;
}

const EMPTY_DATE = Object.freeze({ value: "", ISOValue: "" });
const EMPTY_TIME = Object.freeze({ time: "", meridiem: "AM", ISOValue: "" });

function getISOValueFromTime(time: string, meridiem: string): string {
  if (!time || time.length !== 5 || !meridiem) return "";
  const [hours, minutes] = time.split(":").map(Number);
  let hours24 = hours;
  if (meridiem === "PM" && hours !== 12) hours24 = hours + 12;
  else if (meridiem === "AM" && hours === 12) hours24 = 0;
  const d = new Date();
  d.setHours(hours24, minutes, 0, 0);
  return d.toISOString();
}

const DateSettings = ({
  question,
  onChange,
  setQuestion,
  viewPort,
  variables = {},
}: DateSettingsProps) => {
  const settings = question?.settings || {};
  const dateFormat = settings?.dateFormat || "DDMMYYYY";
  const separator = settings?.separator || "/";

  const [defaultDate, setDefaultDate] = useState(() => {
    if (settings?.defaultValue?.date) {
      const ISOValue = computeISOValueFromDate({
        dateValue: settings.defaultValue.date,
        format: dateFormat,
        separator: separator,
        timeValue: settings.defaultValue?.time || undefined,
        meridiem: settings.defaultValue?.meridiem || undefined,
      });
      return { value: settings.defaultValue.date, ISOValue: ISOValue || "" };
    }
    return { value: "", ISOValue: "" };
  });

  const [defaultTime, setDefaultTime] = useState(() => {
    if (settings?.defaultValue?.time) {
      return {
        time: settings.defaultValue.time,
        meridiem: settings.defaultValue.meridiem || "AM",
        ISOValue: "",
      };
    }
    return { time: "", meridiem: "AM", ISOValue: "" };
  });

  // Min/max for settings date pickers: respect allow past / allow future so author can't set invalid defaults or bounds
  const settingsDateMinMax = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      minDate: settings?.allowPastDate === false ? today : undefined,
      maxDate: settings?.allowFutureDate === false ? today : undefined,
    };
  }, [settings?.allowPastDate, settings?.allowFutureDate]);

  const updateSettings = (
    key: string,
    value: any,
    errors?: Record<string, string>
  ) => {
    if (setQuestion) {
      setQuestion((prevQuestion: Record<string, any>) => ({
        ...prevQuestion,
        settings: {
          ...prevQuestion?.settings,
          [key]: value,
          errors: {
            ...(prevQuestion?.settings?.errors || {}),
            ...errors,
          },
        },
      }));
    } else {
      onChange({
        settings: {
          ...settings,
          [key]: value,
          errors: { ...settings?.errors, ...errors },
        },
      });
    }
  };

  const onIncludeTimeChange = (isIncludeTime: boolean) => {
    setDefaultTime(EMPTY_TIME);
    if (setQuestion) {
      setQuestion((prevQuestion: Record<string, any>) => ({
        ...prevQuestion,
        settings: {
          ...prevQuestion?.settings,
          includeTime: isIncludeTime,
          defaultValue: {
            ...prevQuestion?.settings?.defaultValue,
            time: "",
            meridiem: "AM",
          },
          errors: {
            ...(prevQuestion?.settings?.errors || {}),
            includeTimeError: "",
          },
        },
      }));
    } else {
      onChange({
        settings: {
          ...settings,
          includeTime: isIncludeTime,
          defaultValue: {
            ...settings?.defaultValue,
            time: "",
            meridiem: "AM",
          },
        },
      });
    }
  };

  const onDateChangeHandler = (newValue: any) => {
    setDefaultDate(newValue);
    if (newValue?.ISOValue) {
      updateSettings(
        "defaultValue",
        {
          ...settings?.defaultValue,
          date: newValue?.value,
        },
        { includeTimeError: "" }
      );
    } else {
      const includeTimeError = settings?.defaultValue?.time
        ? "Please select a date before entering time"
        : "";
      updateSettings(
        "defaultValue",
        {
          ...settings?.defaultValue,
          date: "",
        },
        { includeTimeError }
      );
    }
  };

  const onTimeChangeHandler = (newValue: any) => {
    setDefaultTime(newValue);
    if (newValue?.ISOValue || newValue?.time) {
      const includeTimeError = settings?.defaultValue?.date
        ? ""
        : "Please select a date before entering time";
      updateSettings(
        "defaultValue",
        {
          ...settings?.defaultValue,
          time: newValue?.time,
          meridiem: newValue?.meridiem,
        },
        { includeTimeError }
      );
    } else {
      updateSettings(
        "defaultValue",
        {
          ...settings?.defaultValue,
          time: "",
          meridiem: "AM",
        },
        { includeTimeError: "" }
      );
    }
  };

  const handleDateRangeSelect = (key: string, value: any) => {
    const currentDate = dayjs().startOf("day");
    const newStartISO =
      key === "startDate" && value?.ISOValue
        ? dayjs(value.ISOValue).startOf("day")
        : settings?.startDate?.ISOValue
          ? dayjs(settings.startDate.ISOValue).startOf("day")
          : null;
    const newEndISO =
      key === "endDate" && value?.ISOValue
        ? dayjs(value.ISOValue).startOf("day")
        : settings?.endDate?.ISOValue
          ? dayjs(settings.endDate.ISOValue).startOf("day")
          : null;

    let startDateError = "";
    if (newStartISO) {
      if (!settings?.allowPastDate && newStartISO.isBefore(currentDate)) {
        startDateError = "Start date cannot be in the past";
      } else if (
        !settings?.allowFutureDate &&
        newStartISO.isAfter(currentDate)
      ) {
        startDateError = "Start date cannot be in the future";
      } else if (newEndISO && newStartISO.isAfter(newEndISO)) {
        startDateError = "Start date cannot be after End date";
      }
    }

    let endDateError = "";
    if (newEndISO) {
      if (!settings?.allowPastDate && newEndISO.isBefore(currentDate)) {
        endDateError = "End date cannot be in the past";
      } else if (
        !settings?.allowFutureDate &&
        newEndISO.isAfter(currentDate)
      ) {
        endDateError = "End date cannot be in the future";
      } else if (newStartISO && newEndISO.isBefore(newStartISO)) {
        endDateError = "End date cannot be before Start date";
      }
    }

    if (setQuestion) {
      setQuestion((prevQuestion: Record<string, any>) => ({
        ...prevQuestion,
        settings: {
          ...prevQuestion?.settings,
          [key]: value,
          errors: {
            ...(prevQuestion?.settings?.errors || {}),
            startDateError,
            endDateError,
          },
        },
      }));
    } else {
      onChange({
        settings: {
          ...settings,
          [key]: value,
          errors: {
            ...settings?.errors,
            startDateError,
            endDateError,
          },
        },
      });
    }
  };

  const handleAllowDateChange = (key: string, value: boolean) => {
    const today = dayjs().startOf("day");
    const prevStart = settings?.startDate;
    const prevEnd = settings?.endDate;
    const prevDefault = settings?.defaultValue;
    const startISO = prevStart?.ISOValue ? dayjs(prevStart.ISOValue).startOf("day") : null;
    const endISO = prevEnd?.ISOValue ? dayjs(prevEnd.ISOValue).startOf("day") : null;

    // Build format string to parse default date (display format)
    const formatParts: Record<string, string[]> = {
      DDMMYYYY: ["DD", "MM", "YYYY"],
      MMDDYYYY: ["MM", "DD", "YYYY"],
      YYYYMMDD: ["YYYY", "MM", "DD"],
    };
    const defaultFormatStr = (formatParts[dateFormat] || ["DD", "MM", "YYYY"]).join(separator);
    const defaultDateParsed = prevDefault?.date
      ? dayjs(prevDefault.date, defaultFormatStr, true).startOf("day")
      : null;

    // Only reset start/end/default if they no longer satisfy the new allow-past/allow-future
    let newStartDate = prevStart;
    let newEndDate = prevEnd;
    let newDefaultValue = prevDefault;
    if (key === "allowPastDate" && value === false) {
      if (startISO?.isBefore(today)) newStartDate = EMPTY_DATE;
      if (endISO?.isBefore(today)) newEndDate = EMPTY_DATE;
      if (defaultDateParsed?.isValid() && defaultDateParsed.isBefore(today)) {
        newDefaultValue = { ...prevDefault, date: "", time: "", meridiem: "AM" };
      }
    } else if (key === "allowFutureDate" && value === false) {
      if (startISO?.isAfter(today)) newStartDate = EMPTY_DATE;
      if (endISO?.isAfter(today)) newEndDate = EMPTY_DATE;
      if (defaultDateParsed?.isValid() && defaultDateParsed.isAfter(today)) {
        newDefaultValue = { ...prevDefault, date: "", time: "", meridiem: "AM" };
      }
    }

    if (setQuestion) {
      setQuestion((prev: any) => ({
        ...prev,
        settings: {
          ...prev?.settings,
          [key]: value,
          startDate: newStartDate ?? { value: "", ISOValue: "" },
          endDate: newEndDate ?? { value: "", ISOValue: "" },
          defaultValue: newDefaultValue ?? prev?.settings?.defaultValue,
          errors: {
            ...(prev?.settings?.errors || {}),
            startDateError: "",
            endDateError: "",
          },
        },
      }));
    } else {
      onChange({
        settings: {
          ...settings,
          [key]: value,
          startDate: newStartDate ?? { value: "", ISOValue: "" },
          endDate: newEndDate ?? { value: "", ISOValue: "" },
          defaultValue: newDefaultValue ?? settings?.defaultValue,
          errors: {
            ...settings?.errors,
            startDateError: "",
            endDateError: "",
          },
        },
      });
    }
  };

  const handleCopyKey = () => {
    if (settings?.accessKey) {
      navigator.clipboard.writeText(settings.accessKey);
    }
  };

  return (
    <div className="space-y-4">
      <SettingsCard
        questionType={question?.type}
        title="Basic Settings"
        icon={Settings}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Required"
            description="Users must select a date before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-date-required"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Default Date</Label>
          <div className="flex flex-col gap-2">
            <DateInput
              format={dateFormat}
              separator={separator}
              value={defaultDate}
              onChange={onDateChangeHandler}
              onSelect={onDateChangeHandler}
              enableCalender={true}
              size="sm"
              inputVariant="bordered"
              minDate={settingsDateMinMax.minDate}
              maxDate={settingsDateMinMax.maxDate}
              style={{ width: "100%" }}
              disabled={false}
            />
            {settings?.includeTime && (
              <div className="space-y-2" data-testid="settings-default-time">
                <Label className="text-sm font-medium">Default Time</Label>
                <div className="flex gap-2 items-center w-full">
                  <InputMask
                    mask="99:99"
                    maskChar={null}
                    placeholder="HH:MM"
                    value={defaultTime?.time ?? ""}
                    onChange={(e) => {
                      const _time = e.target.value;
                      const _meridiem = defaultTime?.meridiem ?? "AM";
                      const ISOValue = getISOValueFromTime(_time, _meridiem);
                      onTimeChangeHandler({
                        time: _time,
                        meridiem: _meridiem,
                        ISOValue,
                      });
                    }}
                    data-testid="settings-default-time-input"
                  >
                    {(inputProps: React.ComponentProps<"input">) => (
                      <Input
                        {...inputProps}
                        className={cn(
                          "h-9 min-w-0 flex-1 max-w-[12rem] rounded-md",
                          inputProps.className
                        )}
                      />
                    )}
                  </InputMask>
                  <Select
                    value={defaultTime?.meridiem ?? "AM"}
                    onValueChange={(meridiem) => {
                      const time = defaultTime?.time ?? "";
                      const ISOValue = getISOValueFromTime(time, meridiem);
                      onTimeChangeHandler({
                        time,
                        meridiem,
                        ISOValue,
                      });
                    }}
                    data-testid="settings-default-time-meridiem-autocomplete"
                  >
                    <SelectTrigger
                      className="w-[7.5rem] shrink-0 h-9"
                      data-testid="settings-default-time-meridiem-input"
                    >
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent data-testid="settings-default-time-meridiem-listbox">
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {settings?.errors?.includeTimeError ? (
              <HelperText error>
                {settings.errors.includeTimeError}
              </HelperText>
            ) : (
              <HelperText>
                Pre-filled date when users see this field
              </HelperText>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Button Label</Label>
          <CTAEditor style={{}} hideLabel />
          <HelperText>
            Text shown on the button to proceed to the next question
          </HelperText>
        </div>
      </SettingsCard>

      <SettingsCard
        questionType={question?.type}
        title="Date Options"
        icon={Calendar}
      >
        <div className="space-y-2">
          <Label>Date Format</Label>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Select
                value={settings?.dateFormat || ""}
                onValueChange={(value) => updateSettings("dateFormat", value)}
              >
                <SelectTrigger
                  className="w-full"
                  data-testid="v2-date-format"
                >
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMAT_OPTIONS.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[11rem]">
              <Select
                value={settings?.separator ?? SEPARATOR_OPTIONS[0]}
                onValueChange={(value) => updateSettings("separator", value)}
              >
                <SelectTrigger
                  className="w-full"
                  data-testid="v2-date-separator"
                >
                  <SelectValue placeholder="Select separator">
                    {(() => {
                      const sep = settings?.separator ?? SEPARATOR_OPTIONS[0];
                      return sep ? (
                        <>
                          {sep}
                          <span className="text-muted-foreground ml-2">
                            ({getExampleDate("DDMMYYYY", sep)})
                          </span>
                        </>
                      ) : (
                        "Select separator"
                      );
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SEPARATOR_OPTIONS.map((separator) => {
                    const example = getExampleDate("DDMMYYYY", separator);
                    return (
                      <SelectItem key={separator} value={separator}>
                        {separator}
                        <span className="text-muted-foreground ml-2">
                          ({example})
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <HelperText>
            {settings?.dateFormat && settings?.separator ? (
              <>
                Example: <span className="font-medium">{getExampleDate(settings.dateFormat, settings.separator)}</span>
              </>
            ) : (
              "Select format and separator to see example"
            )}
          </HelperText>
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Use date picker"
            description="Show a calendar popup for date selection"
            checked={settings?.useDatePicker || false}
            onChange={(checked) => updateSettings("useDatePicker", checked)}
            dataTestId="v2-date-use-picker"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Include time"
            description="Also ask for time of day"
            checked={settings?.includeTime || false}
            onChange={(checked) => onIncludeTimeChange(checked)}
            dataTestId="v2-date-include-time"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Allow past dates"
            description="Let users select dates from the past"
            checked={settings?.allowPastDate !== false}
            onChange={(checked) =>
              handleAllowDateChange("allowPastDate", checked)
            }
            dataTestId="v2-date-allow-past"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Allow future dates"
            description="Let users select dates in the future"
            checked={settings?.allowFutureDate !== false}
            onChange={(checked) =>
              handleAllowDateChange("allowFutureDate", checked)
            }
            dataTestId="v2-date-allow-future"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Accept date range (optional)
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <DateInput
                format={dateFormat}
                separator={separator}
                value={settings?.startDate || EMPTY_DATE}
                onChange={(value: any) =>
                  handleDateRangeSelect("startDate", value)
                }
                onSelect={(value: any) =>
                  handleDateRangeSelect("startDate", value)
                }
                enableCalender={true}
                size="sm"
                inputVariant="bordered"
                minDate={settingsDateMinMax.minDate}
                maxDate={settingsDateMinMax.maxDate}
                style={{ width: "100%" }}
                disabled={false}
              />
              {settings?.errors?.startDateError && (
                <HelperText error className="text-xs">
                  {settings.errors.startDateError}
                </HelperText>
              )}
            </div>
            <div className="space-y-1.5">
              <DateInput
                format={dateFormat}
                separator={separator}
                value={settings?.endDate || EMPTY_DATE}
                onChange={(value: any) =>
                  handleDateRangeSelect("endDate", value)
                }
                onSelect={(value: any) =>
                  handleDateRangeSelect("endDate", value)
                }
                enableCalender={true}
                size="sm"
                inputVariant="bordered"
                minDate={settingsDateMinMax.minDate}
                maxDate={settingsDateMinMax.maxDate}
                style={{ width: "100%" }}
                disabled={false}
              />
              {settings?.errors?.endDateError && (
                <HelperText error className="text-xs">
                  {settings.errors.endDateError}
                </HelperText>
              )}
            </div>
          </div>
          <HelperText>
            Restrict date selection to a specific range
          </HelperText>
        </div>
      </SettingsCard>

      <CollapsibleSettingsCard
        questionType={question?.type}
        title="Advanced"
        icon={Sliders}
        defaultOpen={false}
      >
        <div className="space-y-2">
          <Label>Tooltip Text</Label>
          <Textarea
            value={settings?.toolTipText || ""}
            placeholder="e.g., Select your date of birth"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-date-tooltip"
          />
          <HelperText>
            Help text that appears when users hover over the question
          </HelperText>
        </div>

        <div className="space-y-2">
          <Label>Internal Key</Label>
          <div className="flex items-center gap-2">
            <Input
              value={settings?.accessKey || ""}
              placeholder="Enter a key"
              onChange={(e) => updateSettings("accessKey", e.target.value)}
              data-testid="v2-date-access-key"
              className="flex-1"
            />
            {settings?.accessKey && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyKey}
                type="button"
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
          <HelperText>
            Unique identifier for this field in API responses and data exports
          </HelperText>
        </div>
      </CollapsibleSettingsCard>
    </div>
  );
};

export default DateSettings;
