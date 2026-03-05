import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import DefaultValueFx from "../../settings-footer/components/common-settings/defaultValueFx";
import { REGEX_CONSTANTS } from "@src/module/constants/regexConstants";
import { ERROR_MESSAGE } from "../../settings-footer/constants/errorMessages";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Copy, Calculator, Sliders } from "lucide-react";

interface NumberSettingsProps {
  question: any;
  onChange: (val: any) => void;
  variables?: any;
}

const NumberSettings = ({
  question,
  onChange,
  variables = {},
}: NumberSettingsProps) => {
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

  const handleNumberLimit = (type: "min" | "max", value: string) => {
    let error = "";
    const allowNegative = settings?.allowNegative;
    const minNumber = Number(settings.minValue);
    const maxNumber = Number(settings.maxValue);
    const validRegex = allowNegative
      ? REGEX_CONSTANTS.ALLOW_NEGATIVE_NUMBER_REGEX
      : REGEX_CONSTANTS.ALLOW_POSITIVE_NUMBER_REGEX;

    if (value === "" || value === "-") {
      const key = type === "min" ? "minValue" : "maxValue";
      updateSettings(key, value, { minMaxNumberError: "" });
      return;
    }

    if (!validRegex.test(value)) {
      return;
    }

    const numericValue = Number(value);

    if (
      type === "min" &&
      maxNumber &&
      !isNaN(maxNumber) &&
      numericValue >= maxNumber
    ) {
      error = ERROR_MESSAGE.NUMBER.minNumberError;
    } else if (
      type === "max" &&
      minNumber &&
      !isNaN(minNumber) &&
      numericValue <= minNumber
    ) {
      error = ERROR_MESSAGE.NUMBER.maxNumberError;
    }

    if (settings?.allowFraction && value.includes(".")) {
      const [, decimals] = value.split(".");
      if (decimals && decimals.length > 2) {
        error = ERROR_MESSAGE.NUMBER.allowFraction;
      }
    }

    const numericPart = value.replace(/[^0-9]/g, "");
    if (numericPart.length > 15) {
      return;
    }

    const key = type === "min" ? "minValue" : "maxValue";
    const finalValue = numericValue === 0 && value !== "" ? "0" : value;
    updateSettings(key, finalValue, { minMaxNumberError: error });
  };

  const handleAllowNegativeChange = (checked: boolean) => {
    const updatedSettings = { ...settings, allowNegative: checked };
    if (!checked) {
      if (Number(settings.minValue) < 0) {
        updatedSettings.minValue = "";
      }
      if (Number(settings.maxValue) < 0) {
        updatedSettings.maxValue = "";
      }
    }
    onChange({ settings: updatedSettings });
  };

  const handleAllowFractionChange = (checked: boolean) => {
    const updatedSettings = { ...settings, allowFraction: checked };
    if (checked) {
      if (settings.minValue || settings.minValue === 0) {
        updatedSettings.minValue = parseFloat(settings.minValue).toFixed(2);
      }
      if (settings.maxValue || settings.maxValue === 0) {
        updatedSettings.maxValue = parseFloat(settings.maxValue).toFixed(2);
      }
    } else {
      if (settings.minValue?.toString().includes(".")) {
        updatedSettings.minValue = Math.floor(
          Number(settings.minValue)
        ).toString();
      }
      if (settings.maxValue?.toString().includes(".")) {
        updatedSettings.maxValue = Math.floor(
          Number(settings.maxValue)
        ).toString();
      }
    }
    onChange({ settings: updatedSettings });
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
            description="Users must enter a number before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-number-required"
          />
        </div>

        <div className="space-y-2">
          <Label>Default Value</Label>
          <DefaultValueFx
            settings={settings}
            variables={variables}
            onChange={updateSettings}
            dataTestid="v2-number-default-value"
            hideLabel
          />
          <HelperText>
            Pre-fill this field with a number when the form loads
          </HelperText>
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
        title="Number Options"
        icon={Calculator}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Allow Negative"
            description="Allow users to enter negative numbers (e.g., -100)"
            checked={settings?.allowNegative || false}
            onChange={handleAllowNegativeChange}
            dataTestId="v2-number-allow-negative"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Allow Decimals"
            description="Allow decimal numbers with up to 2 decimal places"
            checked={settings?.allowFraction || false}
            onChange={handleAllowFractionChange}
            dataTestId="v2-number-allow-fraction"
          />
        </div>

        <div className="space-y-2">
          <Label>Value Range</Label>
          <div className="flex items-center gap-2">
            <Input
              value={
                settings?.minValue === 0 ? "0" : settings?.minValue || ""
              }
              placeholder="Min"
              onChange={(e) => handleNumberLimit("min", e.target.value)}
              data-testid="v2-number-min-value"
              className="w-24"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              to
            </span>
            <Input
              value={
                settings?.maxValue === 0 ? "0" : settings?.maxValue || ""
              }
              placeholder="Max"
              onChange={(e) => handleNumberLimit("max", e.target.value)}
              data-testid="v2-number-max-value"
              className="w-24"
            />
          </div>
          {settings?.errors?.minMaxNumberError ? (
            <HelperText error>{settings.errors.minMaxNumberError}</HelperText>
          ) : (
            <HelperText>
              Limit the range of numbers users can enter
            </HelperText>
          )}
        </div>

        <div className="space-y-2">
          <Label>Decimal Places</Label>
          <Input
            value={settings?.decimalPlaces || ""}
            placeholder="e.g., 2"
            onChange={(e) => {
              if (
                e.target.value === "" ||
                REGEX_CONSTANTS.NUMBER_REGEX.test(e.target.value)
              ) {
                updateSettings("decimalPlaces", e.target.value);
              }
            }}
            data-testid="v2-number-decimals"
            className="w-24"
          />
          <HelperText>
            Number of decimal places allowed (leave empty for no limit). When
            set, this takes priority over &quot;Allow decimals&quot; and controls
            the exact limit.
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
            placeholder="e.g., Enter amount in USD"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-number-tooltip"
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
              data-testid="v2-number-access-key"
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

export default NumberSettings;
