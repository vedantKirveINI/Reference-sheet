import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import CountryPicker from "../../settings-footer/components/common-settings/country-picker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Copy, MapPin, Sliders } from "lucide-react";

interface ZipCodeSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const ZipCodeSettings = ({
  question,
  onChange,
}: ZipCodeSettingsProps) => {
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

  const handleCountryChange = (details: any) => {
    onChange({
      settings: {
        ...settings,
        defaultCountry: {
          countryCode: details?.countryCode,
        },
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
            description="Users must enter a zip code before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-zipcode-required"
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
        title="Zip Code Options"
        icon={MapPin}
      >
        <div className="space-y-2">
          <Label>Default Country</Label>
          <CountryPicker
            value={settings?.defaultCountry}
            onChange={handleCountryChange}
            multiple={false}
            dataTestId="v2-zipcode-default-country"
          />
          <HelperText>
            Country for zip code validation format
          </HelperText>
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Allow changing country"
            description="Let users select a different country"
            checked={settings?.isCountryChangeEnabled || false}
            onChange={(checked) =>
              updateSettings("isCountryChangeEnabled", checked)
            }
            dataTestId="v2-zipcode-allow-country-change"
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
            placeholder="e.g., Enter your zip or postal code"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-zipcode-tooltip"
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
              data-testid="v2-zipcode-access-key"
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

export default ZipCodeSettings;
