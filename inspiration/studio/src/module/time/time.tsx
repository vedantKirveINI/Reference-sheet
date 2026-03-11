import { useEffect, useState } from "react";
import InputMask from "react-input-mask";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Mode } from "@/module/constants";
import { isEmpty } from "lodash-es";

export type TimeProps = {
  value?: { time: string; meridiem: string };
  onChange?: (value: any) => void;
  question?: any;
  theme?: any;
  error?: any;
  autoFocus?: boolean;
  isCreator?: boolean;
  mode?: string;
  disabled?: boolean;
  isAnswered?: boolean;
  style?: any;
  dataTestId?: string;
};

export const Time = ({
  value,
  onChange,
  question,
  theme,
  error,
  autoFocus,
  isCreator,
  mode,
  disabled = false,
  isAnswered = false,
  style = {
    containerStyle: {},
    inputStyle: {},
    dropdownStyle: {},
  },
  dataTestId,
}: TimeProps) => {
  const [focus, setFocus] = useState(false);
  const isTwentyFourHour = question?.settings?.isTwentyFourHour;
  const isDisabled = isCreator || disabled;
  const { settings } = question;
  const questionAlignment = question?.settings?.questionAlignment;

  //to get timezone
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZoneName: "short",
  };
  const timeWithZone = date.toLocaleString(undefined, options);
  const timeZone = timeWithZone?.split(" ").pop();

  useEffect(() => {
    if (!isEmpty(settings?.defaultTime) && !isAnswered && !isCreator) {
      onChange(settings?.defaultTime);
    }
  }, []);

  const handleTimeChange = (timeValue: any, meridiemValue: any) => {
    let ISOValue = "";
    if (timeValue.length === 5 && meridiemValue !== "") {
      const [hours, minutes] = timeValue.split(":").map(Number);
      let hours24 = hours;

      //converting to 24 hour format
      if (meridiemValue === "PM" && hours !== 12) {
        hours24 = hours + 12;
      } else if (meridiemValue === "AM" && hours === 12) {
        hours24 = 0; // Midnight case (12 AM is 00:00 in 24-hour format)
      }

      const currentDate = new Date();
      currentDate.setHours(hours24, minutes, 0, 0);
      ISOValue = currentDate.toISOString();
    }

    onChange({
      time: timeValue,
      meridiem: meridiemValue,
      timeZone: timeZone,
      ISOValue: ISOValue,
    });
  };

  const justifyClass =
    mode === Mode.CARD && questionAlignment === "center"
      ? "justify-center"
      : mode === Mode.CARD && questionAlignment === "right"
        ? "justify-end"
        : "justify-start";

  const borderColor =
    theme?.styles?.buttons != null ? theme.styles.buttons : "hsl(var(--border))";
  const textColor =
    theme?.styles?.buttons != null
      ? theme.styles.buttons
      : "hsl(var(--foreground))";
  const fontFamily = theme?.styles?.fontFamily ?? "Helvetica Neue";

  return (
    <div
      className={cn(
        "flex h-[2.65em] w-full items-stretch gap-2 box-border",
        justifyClass
      )}
      style={style?.containerStyle}
      data-testid={
        dataTestId
          ? dataTestId + "-time-input-container"
          : "time-input-container"
      }
    >
      <InputMask
        placeholder="HH:MM"
        mask="99:99"
        maskChar={null}
        value={value?.time || ""}
        onChange={(e) => {
          handleTimeChange(e.target.value, value?.meridiem);
        }}
        autoFocus={autoFocus}
        disabled={isDisabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className={cn(
          "time_input h-full max-w-[10em] rounded-none border-0 border-b bg-transparent px-0 py-0 text-[1.15em] outline-none placeholder:text-muted-foreground shadow-none focus:ring-0 focus:ring-offset-0",
          mode === Mode.CHAT && "max-w-full",
          "box-border opacity-95",
          isDisabled && "cursor-not-allowed opacity-50"
        )}
        style={{
          borderBottomWidth: error ? 2 : focus ? 2 : 1,
          borderBottomStyle: "solid",
          borderBottomColor: error
            ? "rgba(200, 60, 60, 1)"
            : focus
              ? borderColor
              : borderColor,
          color: textColor,
          fontFamily,
          ...style.inputStyle,
        }}
        data-testid={dataTestId ? dataTestId + "-time-input" : "time-input"}
      />
      {!isTwentyFourHour && (
        <Select
          value={value?.meridiem || settings?.defaultTime?.meridiem || ""}
          onValueChange={(newValue) => {
            handleTimeChange(value?.time, newValue);
          }}
          disabled={isDisabled}
        >
          <SelectTrigger
            data-testid={
              dataTestId
                ? dataTestId + "-meridiem-input-dropdown"
                : "meridiem-input-dropdown"
            }
            className={cn(
              "h-full min-w-[5.5rem] w-[5.5rem] rounded-none border-0 border-b bg-transparent pl-2 pr-1.5 py-0 shadow-none focus:ring-0 focus:ring-offset-0 [&>span]:flex [&>span]:items-center",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-b-2 border-destructive"
                : "border-b data-[state=open]:border-b-2"
            )}
            style={{
              borderBottomColor: error
                ? "rgba(200, 60, 60, 1)"
                : borderColor,
              color: textColor,
              fontSize: "1.15em",
              fontFamily,
              opacity: isDisabled ? 0.5 : 0.95,
              ...style.dropdownStyle,
            }}
          >
            <SelectValue
              placeholder="AM/PM"
              data-testid={
                dataTestId
                  ? dataTestId + "-meridiem-input"
                  : "meridiem-input"
              }
            />
          </SelectTrigger>
          <SelectContent className="min-w-[5.5rem] w-[5.5rem]">
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
