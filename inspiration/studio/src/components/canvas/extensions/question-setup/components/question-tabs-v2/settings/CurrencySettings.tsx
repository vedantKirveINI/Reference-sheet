import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import CountryPicker from "../../settings-footer/components/common-settings/country-picker";
import { COUNTRY_SELECTION_FOR } from "../../settings-footer/constants/constants";
import {
  DEFAULT_MAX_CURRENCY_VALUE,
  DEFAULT_MIN_CURRENCY_VALUE,
  REGEX_CONSTANTS,
} from "@oute/oute-ds.core.constants";
import { ERROR_MESSAGE } from "../../settings-footer/constants/errorMessages";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Copy, Receipt, Sliders } from "lucide-react";

interface CurrencySettingsProps {
  question: any;
  onChange: (val: any) => void;
}

const CurrencySettings = ({
  question,
  onChange,
}: CurrencySettingsProps) => {
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

  const handleAllowedCountriesChange = (value: any) => {
    const allowedCountries = Array.isArray(value)
      ? value.map((_v: any) => ({
          countryCode: _v?.countryCode,
          currencyCode: _v?.currencyCode,
          currencySymbol: _v?.currencySymbol,
        }))
      : [];

    if (allowedCountries.length > 0) {
      const defaultCountry = settings?.defaultCountry;
      const defaultCountryIndex = allowedCountries.findIndex(
        (country) => country?.countryCode === defaultCountry?.countryCode
      );

      onChange({
        settings: {
          ...settings,
          allowedCountries: allowedCountries,
          defaultCountry:
            defaultCountryIndex !== -1
              ? allowedCountries[defaultCountryIndex]
              : allowedCountries[0],
        },
      });
    } else {
      onChange({
        settings: {
          ...settings,
          allowedCountries: [settings?.defaultCountry],
        },
      });
    }
  };

  const handleRangeChange = (key: string, value: any) => {
    let error = "";
    const regex = REGEX_CONSTANTS.ALLOW_POSITIVE_NUMBER_REGEX;

    if (value && !regex.test(value)) {
      return;
    }

    const minRange =
      settings?.minRange?.length === 0
        ? DEFAULT_MIN_CURRENCY_VALUE
        : Number(settings?.minRange);
    const maxRange =
      settings?.maxRange?.length === 0
        ? DEFAULT_MAX_CURRENCY_VALUE
        : Number(settings?.maxRange);
    const numericValue = Number(value);

    if (value && key === "minRange" && maxRange !== undefined && numericValue > maxRange) {
      error = ERROR_MESSAGE.CURRENCY.minRangeError;
    } else if (value && key === "maxRange" && minRange !== undefined && numericValue < minRange) {
      error = ERROR_MESSAGE.CURRENCY.maxRangeError;
    }

    onChange({
      settings: {
        ...settings,
        [key]: value,
        errors: { rangeError: error },
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
            description="Users must enter an amount before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-currency-required"
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
        title="Currency Options"
        icon={Receipt}
      >
        <div className="space-y-2">
          <Label>Default Currency</Label>
          <CountryPicker
            type={COUNTRY_SELECTION_FOR.CURRENCY}
            options={settings?.allowedCountries}
            value={settings?.defaultCountry}
            onChange={(_value: any) => {
              updateSettings("defaultCountry", {
                countryCode: _value?.countryCode,
                currencyCode: _value?.currencyCode,
                currencySymbol: _value?.currencySymbol,
              });
            }}
            includeAll={false}
            multiple={false}
            dataTestId="v2-currency-default-country"
          />
          <HelperText>
            Currency shown when users first see this field
          </HelperText>
        </div>

        <div className="space-y-2">
          <Label>Allowed Currencies</Label>
          <CountryPicker
            type={COUNTRY_SELECTION_FOR.CURRENCY}
            value={settings?.allowedCountries}
            includeAll={true}
            onChange={handleAllowedCountriesChange}
            multiple={true}
            dataTestId="v2-currency-allowed-countries"
          />
          <HelperText>
            Which currencies users can select from
          </HelperText>
        </div>

        <div className="space-y-2">
          <Label>Amount Range</Label>
          <div className="flex items-center gap-2">
            <Input
              value={settings?.minRange || ""}
              placeholder="Min"
              onChange={(e) => handleRangeChange("minRange", e.target.value)}
              data-testid="v2-currency-min-range"
              className="w-24"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              to
            </span>
            <Input
              value={settings?.maxRange || ""}
              placeholder="Max"
              onChange={(e) => handleRangeChange("maxRange", e.target.value)}
              data-testid="v2-currency-max-range"
              className="w-24"
            />
          </div>
          {settings?.errors?.rangeError ? (
            <HelperText error>{settings.errors.rangeError}</HelperText>
          ) : (
            <HelperText>
              Minimum and maximum amount allowed
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
            placeholder="e.g., Enter the amount in your local currency"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-currency-tooltip"
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
              data-testid="v2-currency-access-key"
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

export default CurrencySettings;
