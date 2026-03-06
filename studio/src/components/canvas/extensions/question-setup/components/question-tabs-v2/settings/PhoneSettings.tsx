import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import DefaultValueFx from "../../settings-footer/components/common-settings/defaultValueFx";
import CountryPicker from "../../settings-footer/components/common-settings/country-picker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Copy, Smartphone, Sliders } from "lucide-react";

interface PhoneSettingsProps {
  question: any;
  onChange: (val: any) => void;
  variables?: any;
}

const PhoneSettings = ({
  question,
  onChange,
  variables = {},
}: PhoneSettingsProps) => {
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
            description="Users must enter a phone number before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-phone-required"
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
        title="Phone Options"
        icon={Smartphone}
      >
        <div className="space-y-2">
          <Label>Default Country</Label>
          <CountryPicker
            value={settings?.defaultCountry || null}
            onChange={(value: any) => updateSettings("defaultCountry", value)}
            multiple={false}
            type="PHONE"
            dataTestId="v2-phone-country-picker"
          />
          <HelperText>
            Country code shown by default
          </HelperText>
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Allow changing country"
            description="Let users change the country code"
            checked={settings?.isCountryChangeEnabled || false}
            onChange={(checked) =>
              updateSettings("isCountryChangeEnabled", checked)
            }
            dataTestId="v2-phone-allow-country-change"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Verify phone number"
            description="Send a verification code via SMS"
            checked={settings?.isPhoneValidationEnabled || false}
            onChange={(checked) =>
              updateSettings("isPhoneValidationEnabled", checked)
            }
            dataTestId="v2-phone-verify"
          />
          {settings?.isPhoneValidationEnabled && (
            <HelperText>
              Verification is only supported for Indian phone numbers
            </HelperText>
          )}
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
            placeholder="e.g., Include country code"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-phone-tooltip"
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
              data-testid="v2-phone-access-key"
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

export default PhoneSettings;
