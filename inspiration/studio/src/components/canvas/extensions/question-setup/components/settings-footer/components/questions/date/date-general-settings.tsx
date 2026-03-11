import { useState, ChangeEvent } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

dayjs.extend(customParseFormat);
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { DateInput } from "@src/module/date-input";
import DefaultTime from "../../common-settings/time-component";
import CTAEditor from "../../common-settings/cta-editor";

import { CANVAS_MODE, CANVAS_MODES } from "@src/module/constants";
import { computeISOValueFromDate } from "@src/module/utils/helper/date";
import { getTimeAndMeridiam } from "./getTimeAndMeridiem";

const dateFormats = ["DDMMYYYY", "MMDDYYYY", "YYYYMMDD"];
const separators = ["/", ".", "-"];

interface DateSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  viewPort?: any;
  mode?: any;
  disableQuestionAlignment?: boolean;
  setQuestion: (question: Record<string, any>) => void;
}

const EMPTY_DATE = Object.freeze({
  value: "",
  ISOValue: "",
});

const EMPTY_TIME = Object.freeze({
  time: "",
  meridiem: "AM",
  ISOValue: "",
});

const DateGeneralSettings = ({
  onChange,
  question,
  viewPort,
  mode,
  disableQuestionAlignment = false,
  setQuestion,
}: DateSettingsProps) => {
  const settings = question?.settings;

  const storedDate = settings?.defaultValue?.date || "";
  const storedTime = settings?.defaultValue?.time || "";
  const storedMeridiem = settings?.defaultValue?.meridiem || "";
  const dateFormat = settings?.dateFormat || "DDMMYYYY";
  const separator = settings?.separator || "/";

  const [defaultDate, setDefaultDate] = useState(() => {
    if (settings?.defaultValue?.value) {
      let value = "";
      let ISOValue = "";
      if (settings?.includeTime) {
        const dateValue = settings?.defaultValue?.value?.split?.(" ");
        value = dateValue?.[0] || "";
        ISOValue = settings?.defaultValue?.ISOValue || "";
      } else {
        value = settings?.defaultValue?.value || "";
        ISOValue = settings?.defaultValue?.ISOValue || "";
      }
      return {
        value: value,
        ISOValue: ISOValue,
      };
    } else if (storedDate) {
      const ISOValue = computeISOValueFromDate({
        dateValue: storedDate,
        format: dateFormat as any,
        separator: separator as any,
        timeValue: storedTime || undefined,
        meridiem: storedMeridiem || undefined,
      });
      return {
        value: storedDate,
        ISOValue: ISOValue || "",
      };
    }

    return { value: "", ISOValue: "" };
  });

  const [defaultTime, setDefaultTime] = useState(() => {
    if (settings?.defaultValue?.value) {
      return {
        ...EMPTY_TIME,
        ...getTimeAndMeridiam(settings?.defaultValue || {}),
      };
    } else if (storedTime) {
      return {
        time: storedTime,
        meridiem: storedMeridiem || "AM",
      };
    }
    return {
      time: "",
      meridiem: "AM",
    };
  });

  const updateSettings = (key: string, value: any, errors = {}) => {
    setQuestion((prevQuestion: Record<string, any>) => ({
      ...(prevQuestion || {}),
      settings: {
        ...(prevQuestion?.settings || {}),
        [key]: value,
        errors: {
          ...(prevQuestion?.settings?.errors || {}),
          ...errors,
        },
      },
    }));
  };

  const onIncludeTimeChangeHandler = (isIncludeTime: boolean) => {
    setDefaultTime(EMPTY_TIME);

    setQuestion((prevQuestion: Record<string, any>) => {
      return {
        ...(prevQuestion || {}),
        settings: {
          ...(prevQuestion?.settings || {}),
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
      };
    });
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
      let includeTimeError = settings?.defaultValue?.time
        ? "Please select a date before entering time"
        : "";
      updateSettings(
        "defaultValue",
        {
          ...settings?.defaultValue,
          date: "",
        },
        { includeTimeError: includeTimeError }
      );
    }
  };

  const onTimeChangeHandler = (newValue: any) => {
    setDefaultTime(newValue);

    if (newValue?.ISOValue) {
      let includeTimeError = settings?.defaultValue?.date
        ? ""
        : "Please select a date before entering time";
      updateSettings(
        "defaultValue",
        {
          ...settings?.defaultValue,
          time: newValue?.time,
          meridiem: newValue?.meridiem,
        },
        { includeTimeError: includeTimeError }
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

  return (
    <div className="my-4 grid grid-cols-1 gap-8 sm:grid-cols-2" data-testid="date-general-settings">
      <div className="flex min-w-[20rem] flex-col gap-8">
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          style={{ width: "100%" }}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        {CANVAS_MODE() === CANVAS_MODES.CMS_CANVAS && (
          <div className="flex min-w-[20rem] flex-col gap-8">
            <SwitchOption
              key="date-enable-map"
              variant="black"
              title="Enable Map"
              checked={settings?.enableMap}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                updateSettings("enableMap", event.target.checked);
              }}
            />
            <SwitchOption
              key="date-is-advanced-field"
              title="Show only in Advanced Settings"
              variant="black"
              checked={settings?.isAdvancedField}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                updateSettings("isAdvancedField", event.target.checked);
              }}
            />
          </div>
        )}
        <SwitchOption
          key="date-required"
          variant="black"
          title="Required"
          styles={{ width: "100%" }}
          checked={settings?.required}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateSettings("required", event.target.checked)
          }
          dataTestId="question-settings-required-toggle"
        />
        <CTAEditor />
        <SwitchOption
          key="use-date-picker"
          variant="black"
          title="Use Date Picker"
          styles={{ width: "100%" }}
          checked={settings?.useDatePicker}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateSettings("useDatePicker", event.target.checked)
          }
          dataTestId="settings-use-date-picker-toggle"
        />
        <SwitchOption
          key="include-time"
          variant="black"
          title="Include Time"
          styles={{ width: "100%" }}
          checked={settings?.includeTime}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onIncludeTimeChangeHandler(event.target.checked);
          }}
          dataTestId="settings-include-time-toggle"
        />
      </div>
      <div className="flex min-w-[20rem] flex-col gap-8">
        <div className="flex flex-row flex-wrap items-start gap-4">
          <div className="flex flex-1 flex-col gap-3">
            <Label className="text-sm font-medium">Date Format</Label>
            <Select
              value={settings?.dateFormat ?? ""}
              onValueChange={(newValue) => updateSettings("dateFormat", newValue)}
            >
              <SelectTrigger
                className="h-9"
                data-testid="settings-date-format-input"
              >
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent data-testid="settings-date-format-listbox">
                {dateFormats.map((fmt) => (
                  <SelectItem key={fmt} value={fmt}>
                    {fmt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <Label className="text-sm font-medium">Separator</Label>
            <Select
              value={settings?.separator ?? ""}
              onValueChange={(newValue) => updateSettings("separator", newValue)}
            >
              <SelectTrigger
                className="h-9"
                data-testid="settings-date-separator-input"
              >
                <SelectValue placeholder="Select separator" />
              </SelectTrigger>
              <SelectContent data-testid="settings-date-separator-listbox">
                {separators.map((sep) => (
                  <SelectItem key={sep} value={sep}>
                    {sep}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div
          className="relative flex flex-col gap-3"
          data-testid="settings-date-default-value"
        >
          <Label className="text-sm font-medium">Default Date</Label>
          <DateInput
            format={question?.settings?.dateFormat}
            separator={question?.settings?.separator}
            value={defaultDate}
            onChange={onDateChangeHandler}
            onSelect={onDateChangeHandler}
            enableCalender={true}
            style={{
              width: "100%",
              height: "2.75em",
            }}
            disabled={false}
          />
          {settings?.errors?.includeTimeError && (
            <p
              className="text-sm text-destructive mt-1"
              data-testid="settings-include-time-error"
            >
              {settings?.errors?.includeTimeError || ""}
            </p>
          )}
        </div>
        {settings?.includeTime && (
          <DefaultTime
            value={defaultTime}
            question={question}
            onChange={onTimeChangeHandler}
            viewPort={viewPort}
          />
        )}
      </div>
    </div>
  );
};

export default DateGeneralSettings;
