import { useEffect, useCallback } from "react";
import { isEmpty } from "lodash-es";
import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import DefaultValueFx from "../../settings-footer/components/common-settings/defaultValueFx";
import { ERROR_MESSAGE } from "../../settings-footer/constants/errorMessages";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Copy, Search, Sliders, Database } from "lucide-react";

interface AutocompleteSettingsProps {
  question: any;
  onChange: (val: any) => void;
  variables?: any;
}

const AutocompleteSettings = ({
  question,
  onChange,
  variables = {},
}: AutocompleteSettingsProps) => {
  const settings = question?.settings || {};

  const computeErrors = useCallback(
    (curlCmd: any, labelVal: string, idVal: string) => ({
      curlCommandError: isEmpty(curlCmd)
        ? ERROR_MESSAGE.AUTOCOMPLETE?.curlCommandError ||
          "Please provide API cURL"
        : "",
      labelError: !labelVal
        ? ERROR_MESSAGE.AUTOCOMPLETE?.labelError ||
          "Please provide Label Accessor"
        : "",
      idError: !idVal
        ? ERROR_MESSAGE.AUTOCOMPLETE?.idError || "Please provide ID Accessor"
        : "",
    }),
    []
  );

  const handleCopyKey = () => {
    if (settings?.accessKey) {
      navigator.clipboard.writeText(settings.accessKey);
    }
  };

  useEffect(() => {
    const errors = computeErrors(settings?.curlCommand, settings?.label, settings?.id);
    if (
      errors.curlCommandError !== settings?.errors?.curlCommandError ||
      errors.labelError !== settings?.errors?.labelError ||
      errors.idError !== settings?.errors?.idError
    ) {
      onChange({
        settings: {
          ...settings,
          errors: { ...settings?.errors, ...errors },
        },
      });
    }
  }, [settings?.curlCommand, settings?.label, settings?.id]);

  const updateSettings = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    const errors = computeErrors(
      key === "curlCommand" ? value : newSettings.curlCommand,
      key === "label" ? value : newSettings.label,
      key === "id" ? value : newSettings.id
    );
    onChange({
      settings: {
        ...newSettings,
        errors: { ...newSettings?.errors, ...errors },
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
            description="Users must select an option before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-autocomplete-required"
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
        title="API Configuration"
        icon={Search}
      >
        <div className="space-y-2">
          <Label>
            cURL Command <span className="text-destructive">*</span>
          </Label>
          <DefaultValueFx
            label=""
            settings={settings}
            variables={variables}
            onChange={(_key: string, value: any) =>
              updateSettings("curlCommand", value)
            }
            placeholder="Enter cURL Command"
            dataTestid="v2-autocomplete-curl-command"
            hideLabel
          />
          {settings?.errors?.curlCommandError ? (
            <HelperText error>
              {settings.errors.curlCommandError}
            </HelperText>
          ) : (
            <HelperText>
              API endpoint that provides autocomplete suggestions
            </HelperText>
          )}
        </div>

        <div className="space-y-2">
          <Label>Data Path</Label>
          <Input
            value={settings?.optionsPath || ""}
            placeholder="e.g., response.data"
            onChange={(e) => updateSettings("optionsPath", e.target.value)}
            data-testid="v2-autocomplete-options-path"
          />
          <HelperText>
            Path to the array of options in the API response
          </HelperText>
        </div>
      </SettingsCard>

      <SettingsCard
        questionType={question?.type}
        title="Data Mapping"
        icon={Database}
      >
        <div className="space-y-2">
          <SettingSwitch
            label="Map all object items"
            description="Map all properties from API response objects"
            checked={settings?.mapAllObjectsItems || false}
            onChange={(checked) =>
              updateSettings("mapAllObjectsItems", checked)
            }
            dataTestId="v2-autocomplete-map-all"
          />
        </div>

        <div className="space-y-2">
          <Label>
            ID Accessor <span className="text-destructive">*</span>
          </Label>
          <Input
            value={settings?.id || ""}
            placeholder="e.g., id or _id"
            onChange={(e) => updateSettings("id", e.target.value)}
            data-testid="v2-autocomplete-id-accessor"
          />
          {settings?.errors?.idError ? (
            <HelperText error>{settings.errors.idError}</HelperText>
          ) : (
            <HelperText>
              Property containing the unique identifier
            </HelperText>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Label Accessor <span className="text-destructive">*</span>
          </Label>
          <Input
            value={settings?.label || ""}
            placeholder="e.g., name or title"
            onChange={(e) => updateSettings("label", e.target.value)}
            data-testid="v2-autocomplete-label-accessor"
          />
          {settings?.errors?.labelError ? (
            <HelperText error>{settings.errors.labelError}</HelperText>
          ) : (
            <HelperText>
              Property containing the display text
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
            placeholder="e.g., Start typing to see suggestions"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-autocomplete-tooltip"
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
              data-testid="v2-autocomplete-access-key"
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

export default AutocompleteSettings;
