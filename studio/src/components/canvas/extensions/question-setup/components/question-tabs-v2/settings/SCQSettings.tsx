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
import { Settings, Copy, List, Sliders } from "lucide-react";

const OTHER_OPTION_VALUE = "Other";

interface SCQSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const SCQSettings = ({ question, onChange }: SCQSettingsProps) => {
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

  const sanitizedQuestionOptions = question?.options?.filter((opt: string) => opt?.trim()) || [];
  const questionOptions = settings?.other
    ? [...sanitizedQuestionOptions, OTHER_OPTION_VALUE]
    : sanitizedQuestionOptions;

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
            description="Users must select an option before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-scq-required"
          />
        </div>

        <div className="space-y-2">
          <Label>Default Selected Option</Label>
          <DropdownV2
            searchable={true}
            multiple={false}
            clearOnEscape
            disableClearable={false}
            options={questionOptions.filter((option: string) => option?.trim())}
            value={settings?.defaultValue || null}
            onChange={(value: any) => {
              updateSettings("defaultValue", value, { defaultValueError: "" });
            }}
            isOptionEqualToValue={(option: any, value: any) => {
              return option?.toLowerCase?.() === value?.toLowerCase?.();
            }}
            placeholder="Select default option..."
            dataTestId="v2-scq-default-value"
          />
          {settings?.errors?.defaultValueError ? (
            <HelperText error>
              {settings.errors.defaultValueError}
            </HelperText>
          ) : (
            <HelperText>
              Pre-select an option when the form loads
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
        title="Choice Options"
        icon={List}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Shuffle options"
            description="Randomize the order of options each time"
            checked={settings?.randomize || false}
            onChange={(checked) => updateSettings("randomize", checked)}
            dataTestId="v2-scq-randomize"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Stack vertically"
            description="Display options in a vertical list"
            checked={settings?.isAlignmentVertical || false}
            onChange={(checked) => updateSettings("isAlignmentVertical", checked)}
            dataTestId="v2-scq-vertical"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Include 'Other' option"
            description="Add an 'Other' option for custom answers"
            checked={settings?.other || false}
            onChange={(checked) => updateSettings("other", checked)}
            dataTestId="v2-scq-other"
          />
        </div>

        {settings?.other && (
          <div className="space-y-2 pl-4 border-l-2 border-gray-200">
            <SettingSwitch
              label="Allow custom text input"
              description="Let users type their answer when selecting 'Other'"
              checked={settings?.allowOtherInput || false}
              onChange={(checked) => updateSettings("allowOtherInput", checked)}
              dataTestId="v2-scq-allow-other-input"
            />
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
            placeholder="e.g., Choose the best option"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-scq-tooltip"
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
              data-testid="v2-scq-access-key"
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

export default SCQSettings;
