import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import { CANVAS_MODE, CANVAS_MODES } from "@oute/oute-ds.core.constants";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Copy, Table, Sliders } from "lucide-react";

interface KeyValueTableSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const KeyValueTableSettings = ({ question, onChange }: KeyValueTableSettingsProps) => {
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
            description="Users must fill in all values before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-key-value-table-required"
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
        title="Table Options"
        icon={Table}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Use default values"
            description="Pre-populate the table with default key-value pairs"
            checked={settings?.withDefaultValue || false}
            onChange={(checked) => updateSettings("withDefaultValue", checked)}
            dataTestId="v2-key-value-table-default-value"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Allow adding rows"
            description="Let users add new rows to the table"
            checked={settings?.allowAddRow || false}
            onChange={(checked) => updateSettings("allowAddRow", checked)}
            dataTestId="v2-key-value-table-allow-add-row"
          />
        </div>

        {CANVAS_MODE() === CANVAS_MODES.CMS_CANVAS && (
          <>
            <div className="space-y-2">
              <SettingSwitch
                label="Enable map"
                description="Enable map functionality for the key-value table"
                checked={settings?.enableMap || false}
                onChange={(checked) => updateSettings("enableMap", checked)}
                dataTestId="v2-key-value-table-enable-map"
              />
            </div>
            <div className="space-y-2">
              <SettingSwitch
                label="Show only in Advanced Settings"
                description="Hide from main form, show in advanced settings only"
                checked={settings?.isAdvancedField || false}
                onChange={(checked) =>
                  updateSettings("isAdvancedField", checked)
                }
                dataTestId="v2-key-value-table-advanced-field"
              />
            </div>
          </>
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
            placeholder="e.g., Fill in the values for each key"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-key-value-table-tooltip"
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
              data-testid="v2-key-value-table-access-key"
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

export default KeyValueTableSettings;
