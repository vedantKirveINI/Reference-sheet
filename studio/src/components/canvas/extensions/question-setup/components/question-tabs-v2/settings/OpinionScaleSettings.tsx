import SettingSwitch from "../components/SettingSwitch";
import { DropdownV2 } from "../components/DropdownV2";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Copy, Gauge, Sliders } from "lucide-react";

const OPINION_SCALE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface OpinionScaleSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const OpinionScaleSettings = ({ question, onChange }: OpinionScaleSettingsProps) => {
  const settings = question?.settings || {};
  const maxValue = settings?.maxValue || 10;

  const filteredOptions = OPINION_SCALE_OPTIONS.filter(
    (option) => Number(option) <= maxValue
  );

  const updateSettings = (
    key: string,
    value: any,
    errors?: Record<string, string>
  ) => {
    let updatedSettings = { ...settings, [key]: value };

    if (key === "maxValue") {
      const newMax = value;
      const currentDefault = settings?.defaultValue;
      if (currentDefault >= newMax) {
        updatedSettings.defaultValue = newMax;
      }
    }

    onChange({
      settings: {
        ...updatedSettings,
        errors: { ...settings?.errors, ...errors },
      },
    });
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
            description="Users must select a value before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-opinion-scale-required"
          />
        </div>

        <div className="space-y-2">
          <Label>Default Value</Label>
          <DropdownV2
            value={settings?.defaultValue || null}
            options={filteredOptions}
            onChange={(value: any) => updateSettings("defaultValue", value)}
            getOptionLabel={(option: any) => option.toString()}
            isOptionEqualToValue={(option: any, value: any) => option === value}
            clearOnEscape
            disableClearable={false}
            placeholder="Select default value..."
            dataTestId="v2-opinion-scale-default"
          />
          <HelperText>
            Pre-select a value when the form loads
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
        title="Scale Options"
        icon={Gauge}
      >
        <div className="space-y-2">
          <Label>Maximum Value</Label>
          <DropdownV2
            value={settings?.maxValue || 10}
            options={OPINION_SCALE_OPTIONS}
            onChange={(value: any) => updateSettings("maxValue", Number(value))}
            getOptionLabel={(option: any) => option.toString()}
            isOptionEqualToValue={(option: any, value: any) => option === value}
            placeholder="Select max value"
            dataTestId="v2-opinion-scale-max"
          />
          <HelperText>
            Highest value on the scale (typically 5, 7, or 10)
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
            placeholder="e.g., 1 = Strongly disagree, 10 = Strongly agree"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-opinion-scale-tooltip"
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
              data-testid="v2-opinion-scale-access-key"
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

export default OpinionScaleSettings;
