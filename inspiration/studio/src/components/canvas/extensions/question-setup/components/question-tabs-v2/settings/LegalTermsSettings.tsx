import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Sliders } from "lucide-react";

interface LegalTermsSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const LegalTermsSettings = ({ question, onChange }: LegalTermsSettingsProps) => {
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
            description="Users must accept the terms before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-legal-terms-required"
          />
        </div>

        <div className="space-y-2">
          <Label>Button Label</Label>
          <CTAEditor
            style={{}}
            hideLabel
            question={question}
            onQuestionChange={(partial) => onChange({ ...question, ...partial })}
          />
          <HelperText>
            Text shown on the button to proceed to the next question
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
            placeholder="e.g., Please read and accept the terms"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-legal-terms-tooltip"
          />
          <HelperText>
            Help text that appears when users hover over the question
          </HelperText>
        </div>
      </CollapsibleSettingsCard>
    </div>
  );
};

export default LegalTermsSettings;
