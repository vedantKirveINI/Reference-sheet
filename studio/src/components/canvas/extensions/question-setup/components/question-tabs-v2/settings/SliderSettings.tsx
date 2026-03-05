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
import { Settings, Copy, SlidersHorizontal, Sliders } from "lucide-react";

const MIN_VALUE_OPTIONS = [0, 1];
const MAX_VALUE_OPTIONS = [5, 6, 7, 8, 9, 10];

interface SliderSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const SliderSettings = ({ question, onChange }: SliderSettingsProps) => {
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
            dataTestId="v2-slider-required"
          />
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
        title="Slider Options"
        icon={SlidersHorizontal}
      >
        <div className="space-y-2">
          <Label>Slider Range</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              From
            </span>
            <DropdownV2
              options={MIN_VALUE_OPTIONS}
              value={settings?.minValue ?? 0}
              onChange={(value: any) =>
                updateSettings("minValue", Number(value))
              }
              getOptionLabel={(option: any) => String(option)}
              isOptionEqualToValue={(option: any, value: any) => option === value}
              disableClearable
              dataTestId="v2-slider-min"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              to
            </span>
            <DropdownV2
              options={MAX_VALUE_OPTIONS}
              value={settings?.maxValue ?? 10}
              onChange={(value: any) =>
                updateSettings("maxValue", Number(value))
              }
              getOptionLabel={(option: any) => String(option)}
              isOptionEqualToValue={(option: any, value: any) => option === value}
              disableClearable
              dataTestId="v2-slider-max"
            />
          </div>
          <HelperText>
            Minimum and maximum values for the slider
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
            placeholder="e.g., Drag the slider to select a value"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-slider-tooltip"
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
              data-testid="v2-slider-access-key"
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

export default SliderSettings;
