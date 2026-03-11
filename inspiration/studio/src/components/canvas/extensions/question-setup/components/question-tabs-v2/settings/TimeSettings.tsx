import InputMask from "react-input-mask";
import { REGEX_CONSTANTS } from "@oute/oute-ds.core.constants";
import { ERROR_MESSAGE } from "../../settings-footer/constants/errorMessages";
import { icons } from "@/components/icons";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import { cn } from "@/lib/utils";

const CopyIcon = icons.copy;

interface TimeSettingsProps {
  question: any;
  onChange: (val: any) => void;
  viewPort?: any;
}

const TimeSettings = ({
  question,
  onChange,
  viewPort,
}: TimeSettingsProps) => {
  const settings = question?.settings || {};

  const updateSettings = (
    key: string,
    value: any,
    errors?: Record<string, string>
  ) => {
    onChange({
      settings: {
        ...settings,
        [key]: value,
        errors: { ...settings?.errors, ...errors },
      },
    });
  };

  const handleCopyKey = () => {
    if (settings?.accessKey) {
      navigator.clipboard.writeText(settings.accessKey);
    }
  };

  const getTimeZone = () => {
    const date = new Date();
    const timeWithZone = date.toLocaleString(undefined, {
      timeZoneName: "short",
    });
    return timeWithZone?.split(" ").pop() ?? "";
  };

  const getISOValue = (time: string, meridiem: string) => {
    if (!time || time.length !== 5 || !meridiem) return "";
    const [hours, minutes] = time.split(":").map(Number);
    let hours24 = hours;
    if (meridiem === "PM" && hours !== 12) hours24 = hours + 12;
    else if (meridiem === "AM" && hours === 12) hours24 = 0;
    const d = new Date();
    d.setHours(hours24, minutes, 0, 0);
    return d.toISOString();
  };

  const convert12hTo24h = (time: string, meridiem: string): string => {
    if (!time || !meridiem) return "";
    const [hours, minutes] = time.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";
    let hours24 = hours;
    if (meridiem === "PM" && hours !== 12) hours24 = hours + 12;
    else if (meridiem === "AM" && hours === 12) hours24 = 0;
    const h = String(hours24).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");
    return `${h}:${m}`;
  };

  const convert24hTo12h = (
    time: string
  ): { time: string; meridiem: "AM" | "PM" } => {
    if (!time) return { time: "", meridiem: "AM" };
    const [hours24, minutes] = time.split(":").map(Number);
    if (Number.isNaN(hours24) || Number.isNaN(minutes)) return { time: "", meridiem: "AM" };
    let hours12 = hours24;
    let meridiem: "AM" | "PM" = "AM";
    if (hours24 === 0) {
      hours12 = 12;
      meridiem = "AM";
    } else if (hours24 >= 1 && hours24 <= 11) {
      hours12 = hours24;
      meridiem = "AM";
    } else if (hours24 === 12) {
      hours12 = 12;
      meridiem = "PM";
    } else {
      hours12 = hours24 - 12;
      meridiem = "PM";
    }
    const h = String(hours12).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");
    const timeStr = `${h}:${m}`;
    return { time: timeStr, meridiem };
  };

  const getISOValueFrom24h = (time24: string): string => {
    if (!time24 || time24.length !== 5) return "";
    const [hours24, minutes] = time24.split(":").map(Number);
    if (Number.isNaN(hours24) || Number.isNaN(minutes)) return "";
    const d = new Date();
    d.setHours(hours24, minutes, 0, 0);
    return d.toISOString();
  };

  const handleTimeChange = (value: any) => {
    const timeValue = value?.time;
    const meridiemValue = value?.meridiem ?? settings?.defaultTime?.meridiem ?? "AM";
    const timeZone = value?.timeZone ?? getTimeZone();
    const ISOValue = value?.ISOValue ?? getISOValue(timeValue ?? "", meridiemValue);
    const regexForTwelveHour = REGEX_CONSTANTS.TWELVE_HOUR_REGEX;
    const regexForTwentyFourHour = REGEX_CONSTANTS.TWENTY_FOUR_HOUR_REGEX;
    let error = "";

    if (timeValue && settings?.isTwentyFourHour && !regexForTwentyFourHour.test(timeValue)) {
      error = ERROR_MESSAGE.TIME.defaultTimeError;
    }
    if (timeValue && !settings?.isTwentyFourHour && !regexForTwelveHour.test(timeValue)) {
      error = ERROR_MESSAGE.TIME.defaultTimeError;
    }

    onChange({
      settings: {
        ...settings,
        defaultTime: {
          time: timeValue,
          meridiem: meridiemValue,
          timeZone,
          ISOValue,
        },
        errors: {
          ...settings?.errors,
          defaultTimeError: error,
        },
      },
    });
  };

  const handleTwentyFourHourToggle = (value: boolean) => {
    const was24 = settings?.isTwentyFourHour ?? false;
    const currentTime = settings?.defaultTime?.time ?? "";
    const currentMeridiem = settings?.defaultTime?.meridiem ?? "AM";
    const twelveHourRegex = REGEX_CONSTANTS.TWELVE_HOUR_REGEX;
    const twentyFourHourRegex = REGEX_CONSTANTS.TWENTY_FOUR_HOUR_REGEX;

    const emptyDefaultTime = () => ({
      time: "",
      meridiem: "AM" as const,
      timeZone: "",
      ISOValue: "",
    });

    let nextDefaultTime: {
      time: string;
      meridiem: string;
      timeZone: string;
      ISOValue: string;
    };

    if (value === true) {
      if (!was24 && currentTime && (currentMeridiem === "AM" || currentMeridiem === "PM") && twelveHourRegex.test(currentTime)) {
        const newTime24 = convert12hTo24h(currentTime, currentMeridiem);
        const newISO = getISOValueFrom24h(newTime24);
        nextDefaultTime = {
          time: newTime24,
          meridiem: "AM",
          timeZone: getTimeZone(),
          ISOValue: newISO,
        };
      } else {
        nextDefaultTime = emptyDefaultTime();
      }
    } else {
      if (was24 && currentTime && twentyFourHourRegex.test(currentTime)) {
        const { time: newTime12, meridiem: newMeridiem } = convert24hTo12h(currentTime);
        const newISO = getISOValue(newTime12, newMeridiem);
        nextDefaultTime = {
          time: newTime12,
          meridiem: newMeridiem,
          timeZone: getTimeZone(),
          ISOValue: newISO,
        };
      } else {
        nextDefaultTime = emptyDefaultTime();
      }
    }

    onChange({
      settings: {
        ...settings,
        isTwentyFourHour: value,
        defaultTime: nextDefaultTime,
        errors: {
          ...settings?.errors,
          defaultTimeError: "",
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      <SettingsCard
        questionType={question?.type}
        title="Basic Settings"
        icon={icons.settings}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Required"
            description="Users must enter a time before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-time-required"
          />
        </div>

        <div className="space-y-2" data-testid="settings-default-time">
          <Label>Default Time</Label>
          <div className="flex gap-2 items-center w-full">
            <InputMask
              mask="99:99"
              maskChar={null}
              placeholder="HH:MM"
              value={settings?.defaultTime?.time ?? ""}
              onChange={(e) => {
                const _time = e.target.value;
                const _meridiem = settings?.defaultTime?.meridiem ?? "AM";
                handleTimeChange({
                  time: _time,
                  meridiem: _meridiem,
                  timeZone: getTimeZone(),
                  ISOValue: getISOValue(_time, _meridiem),
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
            {!settings?.isTwentyFourHour && (
              <Select
                value={settings?.defaultTime?.meridiem ?? "AM"}
                onValueChange={(meridiem) => {
                  const time = settings?.defaultTime?.time ?? "";
                  handleTimeChange({
                    time,
                    meridiem,
                    timeZone: getTimeZone(),
                    ISOValue: getISOValue(time, meridiem),
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
            )}
          </div>
          {settings?.errors?.defaultTimeError ? (
            <HelperText error>
              {settings.errors.defaultTimeError}
            </HelperText>
          ) : (
            <HelperText>
              Pre-filled time when users see this field
            </HelperText>
          )}
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
        title="Time Options"
        icon={icons.clock}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Use 24-hour format"
            description="Display time as 14:30 instead of 2:30 PM"
            checked={settings?.isTwentyFourHour || false}
            onChange={(checked) => handleTwentyFourHourToggle(checked)}
            dataTestId="v2-time-24hour"
          />
        </div>
      </SettingsCard>

      <CollapsibleSettingsCard
        questionType={question?.type}
        title="Advanced"
        icon={icons.settings}
        defaultOpen={false}
      >
        <div className="space-y-2">
          <Label>Tooltip Text</Label>
          <Textarea
            value={settings?.toolTipText || ""}
            placeholder="e.g., Enter the meeting time"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-time-tooltip"
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
              data-testid="v2-time-access-key"
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
                <CopyIcon className="h-4 w-4" />
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

export default TimeSettings;
