import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Copy, Sliders, Code } from "lucide-react";

interface FormulaBarSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const FormulaBarSettings = ({ question, onChange }: FormulaBarSettingsProps) => {
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
            description="Users must enter a formula before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-formula-bar-required"
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
        title="Formula Options"
        icon={Code}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Show only in Advanced Settings"
            description="Hide from main form, show in advanced settings only"
            checked={settings?.isAdvancedField || false}
            onChange={(checked) => updateSettings("isAdvancedField", checked)}
            dataTestId="v2-formula-bar-advanced-field"
          />
        </div>

        <div className="space-y-2">
          <Label>Custom Validation (Regex)</Label>
          <Input
            value={settings?.regex?.value || ""}
            placeholder="e.g ^[A-Za-z]{5}\\d{4}[A-Za-z]{1}$"
            onChange={(e) =>
              updateSettings("regex", {
                value: e.target.value,
                error: settings?.regex?.error || "",
              })
            }
            data-testid="v2-formula-bar-regex"
          />
          <HelperText>
            Regular expression pattern to validate input
          </HelperText>
        </div>

        {settings?.regex?.value && (
          <div className="space-y-2">
            <Label>Validation Error Message</Label>
            <Input
              value={settings?.regex?.error || ""}
              placeholder="Message when validation fails"
              onChange={(e) =>
                updateSettings("regex", {
                  value: settings?.regex?.value || "",
                  error: e.target.value,
                })
              }
              data-testid="v2-formula-bar-regex-error"
            />
            <HelperText>
              Shown when input doesn't match the pattern
            </HelperText>
          </div>
        )}
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
            placeholder="e.g., Enter your formula"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-formula-bar-tooltip"
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
              data-testid="v2-formula-bar-access-key"
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

export default FormulaBarSettings;
