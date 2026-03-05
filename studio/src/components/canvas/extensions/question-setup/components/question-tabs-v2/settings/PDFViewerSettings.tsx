import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import SettingSwitch from "../components/SettingSwitch";
import { Settings, Sliders } from "lucide-react";

interface PDFViewerSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const PDFViewerSettings = ({ question, onChange }: PDFViewerSettingsProps) => {
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
          <Label>Button Label</Label>
          <CTAEditor style={{}} hideLabel />
          <HelperText>
            Text shown on the button to proceed to the next question
          </HelperText>
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Show Toolbar"
            description="Display the PDF viewer toolbar with navigation controls"
            checked={settings?.showToolbar ?? true}
            onChange={(checked) => updateSettings("showToolbar", checked)}
            dataTestId="v2-pdf-viewer-show-toolbar"
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
            placeholder="e.g., Please review the document below"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-pdf-viewer-tooltip"
          />
          <HelperText>
            Help text that appears when users hover over the question
          </HelperText>
        </div>
      </CollapsibleSettingsCard>
    </div>
  );
};

export default PDFViewerSettings;
