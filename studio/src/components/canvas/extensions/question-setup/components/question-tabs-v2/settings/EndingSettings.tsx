import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import { REGEX_CONSTANTS } from "@oute/oute-ds.core.constants";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, LogOut, Sliders } from "lucide-react";
import { useMemo } from "react";

interface EndingSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const EndingSettings = ({ question, onChange }: EndingSettingsProps) => {
  const settings = question?.settings || {};
  const regex = REGEX_CONSTANTS.URL_REGEX;

  const showCta = useMemo(() => {
    if (
      settings?.showCTA === undefined ||
      settings?.showCTA === null
    ) {
      return true;
    }
    return settings?.showCTA;
  }, [settings?.showCTA]);

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

  const isInvalidURL = settings?.redirectURL
    ? !regex.test(settings.redirectURL)
    : false;

  return (
    <div className="space-y-4">
      <SettingsCard
        questionType={question?.type}
        title="Basic Settings"
        icon={Settings}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Show CTA"
            description="Display the call-to-action button"
            checked={showCta}
            onChange={(checked) => updateSettings("showCTA", checked)}
            dataTestId="v2-ending-show-cta"
          />
        </div>

        <div className="space-y-2">
          <Label>Button Label</Label>
          <div style={{ opacity: showCta ? 1 : 0.5, pointerEvents: showCta ? "auto" : "none" }}>
            <CTAEditor style={{}} hideLabel />
          </div>
          <HelperText>
            Text shown on the button to proceed
          </HelperText>
        </div>
      </SettingsCard>

      <SettingsCard
        questionType={question?.type}
        title="Ending Options"
        icon={LogOut}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Show social share icons"
            description="Display social media sharing buttons"
            checked={settings?.socialShareIcons || false}
            onChange={(checked) => updateSettings("socialShareIcons", checked)}
            dataTestId="v2-ending-social-share"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Allow another response"
            description="Show a button for users to submit again"
            checked={settings?.submitAnotherResponse || false}
            onChange={(checked) =>
              updateSettings("submitAnotherResponse", checked)
            }
            dataTestId="v2-ending-submit-another"
          />
        </div>

        <div className="space-y-2">
          <Label>Redirect URL</Label>
          <Input
            value={settings?.redirectURL || ""}
            placeholder="https://example.com"
            onChange={(e) => updateSettings("redirectURL", e.target.value)}
            data-testid="v2-ending-redirect-url"
            className={isInvalidURL ? "border-destructive" : ""}
            disabled={!showCta}
          />
          {isInvalidURL ? (
            <HelperText error>Invalid URL format</HelperText>
          ) : (
            <HelperText>
              Redirect users to this URL after form completion
            </HelperText>
          )}
        </div>

        
          <div className="space-y-2">
            <Label>Promotional Message</Label>
            <Textarea
              value={settings?.promotionalText || ""}
              placeholder="Enter text to show above submit again button"
              onChange={(e) => updateSettings("promotionalText", e.target.value)}
              data-testid="v2-ending-promotional-text"
              rows={3}
            />
            <HelperText>
              Text displayed above the "Submit Another Response" button
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
            placeholder="e.g., Thank you for completing the survey"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-ending-tooltip"
          />
          <HelperText>
            Help text that appears when users hover over the question
          </HelperText>
        </div>
      </CollapsibleSettingsCard>
    </div>
  );
};

export default EndingSettings;
