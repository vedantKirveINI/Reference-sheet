import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import SwitchOption from "../../common-settings/switch";
import { DateInput } from "@src/module/date-input";
import AccessKeyInput from "../../common-settings/access-key-input";
import dayjs from "dayjs";

interface DateSettingsProps {
  settings?: any;
  onChange?: (val: any) => void;
  handleOnChange?: (key: string, value: any) => void;
  setQuestion: (question: Record<string, any>) => void;
}

const DateAdvancedSettings = ({
  handleOnChange,
  settings,
  setQuestion,
}: DateSettingsProps) => {
  const { allowPastDate, allowFutureDate, startDate, endDate } = settings || {};

  const settingsDateMinMax = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      minDate: allowPastDate === false ? today : undefined,
      maxDate: allowFutureDate === false ? today : undefined,
    };
  }, [allowPastDate, allowFutureDate]);

  const handleDateSelect = (key: string, value: any) => {
    let startDateError = "";
    let endDateError = "";

    const selectedDate = dayjs(value?.ISOValue).startOf("day");
    const currentDate = dayjs().startOf("day");
    const startISO = startDate?.ISOValue
      ? dayjs(startDate.ISOValue).startOf("day")
      : null;
    const endISO = endDate?.ISOValue
      ? dayjs(endDate.ISOValue).startOf("day")
      : null;

    if (key === "startDate") {
      if (!allowPastDate && selectedDate.isBefore(currentDate)) {
        startDateError = "Start date cannot be in the past";
      } else if (!allowFutureDate && selectedDate.isAfter(currentDate)) {
        startDateError = "Start date cannot be in the future";
      } else if (endISO && selectedDate.isAfter(endISO)) {
        startDateError = "Start date cannot be after End date";
      } else if (endISO && selectedDate.isSame(endISO)) {
        startDateError = "";
      }
    }

    if (key === "endDate") {
      if (!allowPastDate && selectedDate.isBefore(currentDate)) {
        endDateError = "End date cannot be in the past";
      } else if (!allowFutureDate && selectedDate.isAfter(currentDate)) {
        endDateError = "End date cannot be in the future";
      } else if (startISO && selectedDate.isBefore(startISO)) {
        endDateError = "End date cannot be before Start date";
      } else if (startISO && selectedDate.isSame(startISO)) {
        endDateError = "";
      }
    }

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
  };

  const handleAllowDateSelect = (key: string, value: any) => {
    setQuestion((prev) => {
      const prevSettings = prev?.settings || {};
      const prevStart = prevSettings.startDate;
      const prevEnd = prevSettings.endDate;
      const today = dayjs().startOf("day");
      const startISO = prevStart?.ISOValue ? dayjs(prevStart.ISOValue).startOf("day") : null;
      const endISO = prevEnd?.ISOValue ? dayjs(prevEnd.ISOValue).startOf("day") : null;

      let newStartDate = prevStart ?? { value: "", ISOValue: "" };
      let newEndDate = prevEnd ?? { value: "", ISOValue: "" };
      if (key === "allowPastDate" && value === false) {
        if (startISO?.isBefore(today)) newStartDate = { value: "", ISOValue: "" };
        if (endISO?.isBefore(today)) newEndDate = { value: "", ISOValue: "" };
      } else if (key === "allowFutureDate" && value === false) {
        if (startISO?.isAfter(today)) newStartDate = { value: "", ISOValue: "" };
        if (endISO?.isAfter(today)) newEndDate = { value: "", ISOValue: "" };
      }

      return {
        ...prev,
        settings: {
          ...prevSettings,
          [key]: value,
          startDate: newStartDate,
          endDate: newEndDate,
          errors: {
            ...(prevSettings.errors || {}),
            startDateError: "",
            endDateError: "",
          },
        },
      };
    });
  };

  return (
    <div className="my-4 grid grid-cols-1 gap-8 sm:grid-cols-2" data-testid="date-advanced-settings">
      <div className="flex min-w-[20rem] flex-col gap-8">
        <SwitchOption
          key="allow-past"
          variant="black"
          title="Allow Past"
          styles={{ width: "100%" }}
          checked={settings?.allowPastDate}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleAllowDateSelect("allowPastDate", event.target.checked)
          }
          dataTestId="settings-allow-past"
        />

        <SwitchOption
          key="allow-future"
          variant="black"
          title="Allow Future"
          styles={{ width: "100%" }}
          checked={settings?.allowFutureDate}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleAllowDateSelect("allowFutureDate", event.target.checked)
          }
          dataTestId="settings-allow-future"
        />
        <AccessKeyInput
          keyValue={settings?.accessKey}
          onChange={(value) => handleOnChange("accessKey", value)}
          style={{ width: "100%" }}
        />
      </div>
      <div className="flex min-w-[20rem] flex-col justify-between gap-8 sm:flex-row">
        <div
          className="relative flex flex-col gap-3"
          data-testid="settings-start-date"
        >
          <Label className="text-sm font-medium">Accept Date From</Label>
          <DateInput
            key="date-input-start-date"
            format={settings?.dateFormat}
            separator={settings?.separator}
            value={settings?.startDate}
            onChange={(_value) => {
              handleDateSelect("startDate", _value);
            }}
            onSelect={(_value) => {
              handleDateSelect("startDate", _value);
            }}
            enableCalender={true}
            size="sm"
            minDate={settingsDateMinMax.minDate}
            maxDate={settingsDateMinMax.maxDate}
            style={{ width: "100%", height: "2.75em" }}
            disabled={false}
          />
          {settings?.errors?.startDateError && (
            <p
              className="text-sm text-destructive mt-1"
              data-testid="settings-date-select-error"
            >
              {settings?.errors?.startDateError}
            </p>
          )}
        </div>
        <div
          className="relative flex flex-col gap-3"
          data-testid="settings-end-date"
        >
          <Label className="text-sm font-medium">Accept Date Till</Label>
          <DateInput
            key="date-input-end-date"
            format={settings?.dateFormat}
            separator={settings?.separator}
            value={settings?.endDate}
            onChange={(_value) => {
              handleDateSelect("endDate", _value);
            }}
            onSelect={(_value) => {
              handleDateSelect("endDate", _value);
            }}
            enableCalender={true}
            size="sm"
            minDate={settingsDateMinMax.minDate}
            maxDate={settingsDateMinMax.maxDate}
            style={{ width: "100%", height: "2.75em" }}
            disabled={false}
          />
          {settings?.errors?.endDateError && (
            <p
              className="text-sm text-destructive mt-1"
              data-testid="settings-date-select-error"
            >
              {settings?.errors?.endDateError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateAdvancedSettings;
