import React, { useState } from "react";
import InputMask from "react-input-mask";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimeSettingsProps {
  value?: any;
  question?: any;
  setQuestion?: any;
  onChange?: ({ time, meridiem, timeZone, ISOValue }: any) => void;
  viewPort?: any;
  style?: any;
  /** Use compact styling to match theme (e.g. in date settings) */
  compact?: boolean;
}

const DefaultTime = ({
  question,
  onChange,
  value,
  compact = false,
}: TimeSettingsProps) => {
  const settings = question?.settings;
  const [timeValue, setTimeValue] = useState({
    time: "",
    meridiem: "AM",
    ...value,
  });

  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZoneName: "short",
  };
  const timeWithZone = date.toLocaleString(undefined, options);
  const timeZone = timeWithZone?.split(" ").pop();

  const handleTimeChange = ({ _time, _meridiem }) => {
    let ISOValue = "";
    if (_time?.length === 5 && _meridiem !== "") {
      const [hours, minutes] = _time.split(":").map(Number);
      let hours24 = hours;

      if (_meridiem === "PM" && hours !== 12) {
        hours24 = hours + 12;
      } else if (_meridiem === "AM" && hours === 12) {
        hours24 = 0;
      }

      const currentDate = new Date();
      currentDate.setHours(hours24, minutes, 0, 0);
      ISOValue = currentDate.toISOString();
    }

    onChange({
      time: _time,
      meridiem: _meridiem,
      timeZone: timeZone,
      ISOValue: ISOValue,
    });
  };

  return (
    <div
      className="flex w-full flex-col items-start justify-start gap-3"
      data-testid="settings-default-time"
    >
      <Label
        className={cn(
          "text-foreground font-normal",
          compact ? "text-xs" : "text-sm"
        )}
      >
        Default Time
      </Label>
      <div className="flex w-full gap-2 items-center">
        <InputMask
          placeholder="HH:MM"
          mask="99:99"
          maskChar={null}
          value={timeValue?.time}
          onChange={(e) => {
            handleTimeChange({
              _time: e.target.value,
              _meridiem: timeValue?.meridiem,
            });
            setTimeValue({ ...timeValue, time: e.target.value });
          }}
          data-testid="settings-default-time-input"
        >
          {(inputProps: React.ComponentProps<"input">) => (
            <Input
              {...inputProps}
              className={cn(
                "h-9 min-w-0 flex-1 max-w-[12rem] rounded-md",
                compact && "h-8 max-w-[10rem] text-sm",
                inputProps.className
              )}
            />
          )}
        </InputMask>
        {!settings?.isTwentyFourHour && (
          <Select
            value={timeValue?.meridiem}
            onValueChange={(newValue) => {
              handleTimeChange({
                _time: timeValue.time,
                _meridiem: newValue,
              });
              setTimeValue({ ...timeValue, meridiem: newValue });
            }}
            data-testid="settings-default-time-meridiem-autocomplete"
          >
            <SelectTrigger
              className="w-[5.5rem] shrink-0 h-9 min-w-[5.5rem]"
              data-testid="settings-default-time-meridiem-input"
            >
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent data-testid="settings-default-time-meridiem-listbox">
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {settings?.errors?.defaultTimeError && (
        <p
          className="text-sm text-destructive mt-1"
          data-testid="settings-default-time-error"
        >
          {settings?.errors?.defaultTimeError}
        </p>
      )}
    </div>
  );
};

export default DefaultTime;
