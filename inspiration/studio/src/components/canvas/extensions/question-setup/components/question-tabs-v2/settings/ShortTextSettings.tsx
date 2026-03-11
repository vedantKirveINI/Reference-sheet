import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import DefaultValueFx from "../../settings-footer/components/common-settings/defaultValueFx";
import { REGEX_CONSTANTS } from "@oute/oute-ds.core.constants";
import { CHARACTERS } from "../../settings-footer/constants/constants";
import { ERROR_MESSAGE } from "../../settings-footer/constants/errorMessages";
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
import { Type, Copy, Settings, Sliders } from "lucide-react";

const TEXT_FORMATTING_OPTIONS = [
  { label: "Keep as entered", value: "none" },
  { label: "ALL UPPERCASE", value: "uppercase" },
  { label: "all lowercase", value: "lowercase" },
  { label: "Title Case", value: "capitalize" },
];

interface ShortTextSettingsProps {
  question: any;
  onChange: (val: any) => void;
  variables?: any;
}

const ShortTextSettings = ({
  question,
  onChange,
  variables = {},
}: ShortTextSettingsProps) => {
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

  const handleCharacterLimit = (type: "min" | "max", value: string) => {
    const regex = REGEX_CONSTANTS.NUMBER_REGEX;
    const minChar = Number(settings.minChar);
    const maxChar = Number(settings.maxChar);
    let error = "";

    if (value?.trim().length > 15) {
      return;
    }

    if (value === "" || regex.test(value)) {
      const numericValue = Number(value);

      if (type === "min" && maxChar && numericValue > maxChar) {
        error = ERROR_MESSAGE.SHORT_TEXT.minChar;
      } else if (type === "max" && minChar && numericValue < minChar) {
        error = ERROR_MESSAGE.SHORT_TEXT.maxChar;
      }

      const isValueZero = Number(value) === 0 && value !== "";
      const finalValue = isValueZero ? "0" : value;
      const key = type === "min" ? CHARACTERS.MIN_CHAR : CHARACTERS.MAX_CHAR;

      updateSettings(key, finalValue, {
        charLimitError: error,
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
            description="Users must answer this question before submitting the form"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-short-text-required"
          />
        </div>

        <div className="space-y-2">
          <Label>Default Value</Label>
          <DefaultValueFx
            settings={settings}
            variables={variables}
            onChange={updateSettings}
            dataTestid="v2-short-text-default-value"
            hideLabel
          />
          <HelperText>
            Pre-fill this field with a value when the form loads
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
        title="Text Options"
        icon={Type}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Mask Response"
            description="Hide input like a password field for sensitive data"
            checked={settings?.maskResponse ?? settings?.mask ?? false}
            onChange={(checked) => updateSettings("maskResponse", checked)}
            dataTestId="v2-short-text-mask"
          />
        </div>

        <div className="space-y-2">
          <Label>Character Limit</Label>
          <div className="flex items-center gap-2">
            <Input
              value={settings?.minChar || ""}
              placeholder="Min"
              onChange={(e) => handleCharacterLimit("min", e.target.value)}
              data-testid="v2-short-text-min-char"
              className="w-20"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              to
            </span>
            <Input
              value={settings?.maxChar || ""}
              placeholder="Max"
              onChange={(e) => handleCharacterLimit("max", e.target.value)}
              data-testid="v2-short-text-max-char"
              className="w-20"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              characters
            </span>
          </div>
          {settings?.errors?.charLimitError ? (
            <HelperText error>{settings.errors.charLimitError}</HelperText>
          ) : (
            <HelperText>
              Limit how many characters users can type (max 255 by default)
            </HelperText>
          )}
        </div>

        <div className="space-y-2">
          <Label>Text Formatting</Label>
          <Select
            value={settings?.textTransformation?.case || "none"}
            onValueChange={(value) => {
              updateSettings("textTransformation", {
                isActive: value !== "none",
                case: value || "none",
              });
            }}
            data-testid="v2-short-text-format"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {TEXT_FORMATTING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <HelperText>
            Automatically convert text to uppercase, lowercase, or title case
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
            placeholder="e.g., Enter your full legal name"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-short-text-tooltip"
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
              data-testid="v2-short-text-access-key"
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

export default ShortTextSettings;
