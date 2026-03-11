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
import { Settings, Copy, Sliders, ToggleLeft } from "lucide-react";

interface YesNoSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const DEFAULT_CHOICE_OPTIONS = ["Yes", "No"];

const YesNoSettings = ({ question, onChange }: YesNoSettingsProps) => {
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
            description="Users must choose Yes or No before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-yesno-required"
          />
        </div>

        <div className="space-y-2">
          <Label>Default Choice</Label>
          <DropdownV2
            value={settings?.defaultChoice || null}
            onChange={(value: any) => updateSettings("defaultChoice", value)}
            options={DEFAULT_CHOICE_OPTIONS}
            isOptionEqualToValue={(option: any, value: any) => option === value}
            clearOnEscape
            disableClearable={false}
            placeholder="Select default choice..."
            dataTestId="v2-yesno-default-choice"
          />
          <HelperText>
            Pre-select Yes or No when the form loads
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
        title="Display Options"
        icon={ToggleLeft}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Stack vertically"
            description="Display Yes and No in a vertical stack"
            checked={settings?.vertical || false}
            onChange={(checked) => updateSettings("vertical", checked)}
            dataTestId="v2-yesno-vertical"
          />
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
            placeholder="e.g., Choose Yes or No"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-yesno-tooltip"
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
              data-testid="v2-yesno-access-key"
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

export default YesNoSettings;
