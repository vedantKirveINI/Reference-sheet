import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Copy, MapPin, Sliders } from "lucide-react";

interface AddressSettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const AddressSettings = ({
  question,
  onChange,
}: AddressSettingsProps) => {
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
          <Label>Button Label</Label>
          <CTAEditor style={{}} hideLabel />
          <HelperText>
            Text shown on the button to proceed to the next question
          </HelperText>
        </div>
      </SettingsCard>

      <SettingsCard
        questionType={question?.type}
        title="Address Options"
        icon={MapPin}
      >
        <div className="space-y-2 pb-2 border-b border-gray-100">
          <Label className="text-sm font-medium">Required Fields</Label>
          <HelperText>
            Select which address fields are mandatory
          </HelperText>
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Full name"
            description="Require users to enter their full name"
            checked={settings?.fullName || false}
            onChange={(checked) => updateSettings("fullName", checked)}
            dataTestId="v2-address-fullname"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Address line 1"
            description="Require the primary street address"
            checked={settings?.addressLineOne || false}
            onChange={(checked) =>
              updateSettings("addressLineOne", checked)
            }
            dataTestId="v2-address-line1"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Address line 2"
            description="Apartment, suite, or unit number"
            checked={settings?.addressLineTwo || false}
            onChange={(checked) =>
              updateSettings("addressLineTwo", checked)
            }
            dataTestId="v2-address-line2"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="City / Town"
            description="Require the city or town name"
            checked={settings?.city || false}
            onChange={(checked) => updateSettings("city", checked)}
            dataTestId="v2-address-city"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="State / Region / Province"
            description="Require the state, region, or province"
            checked={settings?.state || false}
            onChange={(checked) => updateSettings("state", checked)}
            dataTestId="v2-address-state"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Country"
            description="Require the country selection"
            checked={settings?.country || false}
            onChange={(checked) => updateSettings("country", checked)}
            dataTestId="v2-address-country"
          />
        </div>

        <div className="space-y-2">
          <SettingSwitch
            label="Zip / Post code"
            description="Require the postal or zip code"
            checked={settings?.zipCode || false}
            onChange={(checked) => updateSettings("zipCode", checked)}
            dataTestId="v2-address-zipcode"
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
            placeholder="e.g., Enter your mailing address"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-address-tooltip"
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
              data-testid="v2-address-access-key"
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

export default AddressSettings;
