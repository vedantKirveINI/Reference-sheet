import SettingSwitch from "../components/SettingSwitch";
import CTAEditor from "../../settings-footer/components/common-settings/cta-editor";
import DefaultValueFx from "../../settings-footer/components/common-settings/defaultValueFx";
import { REGEX_CONSTANTS } from "@oute/oute-ds.core.constants";
import { ERROR_MESSAGE } from "../../settings-footer/constants/errorMessages";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HelperText from "../components/HelperText";
import SettingsCard from "../components/SettingsCard";
import CollapsibleSettingsCard from "../components/CollapsibleSettingsCard";
import { Settings, Copy, Mail, Sliders } from "lucide-react";

interface EmailSettingsProps {
  question: any;
  onChange: (val: any) => void;
  variables?: any;
}

const EmailSettings = ({
  question,
  onChange,
  variables = {},
}: EmailSettingsProps) => {
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

  const handleAllowedDomainsChange = (raw: string) => {
    const domainRegex = REGEX_CONSTANTS.DOMAIN_REGEX;
    const domainList = raw
      ?.split(",")
      .map((d) => d.trim())
      .filter((d) => d);
    const allDomainsValid =
      domainList.length === 0 ||
      domainList.every((domain) => domainRegex.test(domain));

    const error = allDomainsValid ? "" : ERROR_MESSAGE.EMAIL.domainError;

    onChange({
      settings: {
        ...settings,
        suggestDomains: domainList,
        suggestDomainsInput: raw,
        errors: { ...settings?.errors, domainError: error },
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
            description="Users must enter an email before submitting"
            checked={settings?.required || false}
            onChange={(checked) => updateSettings("required", checked)}
            dataTestId="v2-email-required"
          />
        </div>

        <div className="space-y-2">
          <Label>Default Value</Label>
          <DefaultValueFx
            settings={settings}
            variables={variables}
            onChange={updateSettings}
            placeholder="Enter default email"
            dataTestid="v2-email-default-value"
            hideLabel
          />
          <HelperText>
            Pre-fill with an email address when the form loads
          </HelperText>
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
        title="Email Options"
        icon={Mail}
      >
        {/* <div className="space-y-2">
          <SettingSwitch
            label="Validate email format"
            description="Check that the entered text is a valid email address"
            checked={settings?.validateEmail !== false}
            onChange={(checked) => updateSettings("validateEmail", checked)}
            dataTestId="v2-email-validate"
          />
        </div> */}

        {/* <div className="space-y-2">
          <SettingSwitch
            label="Confirm email"
            description="Ask users to type their email again for verification"
            checked={settings?.confirmEmail || false}
            onChange={(checked) => updateSettings("confirmEmail", checked)}
            dataTestId="v2-email-confirm"
          />
        </div> */}

        <div className="space-y-2">
          <SettingSwitch
            label="Verify with code"
            description="Send a verification code to confirm the email address"
            checked={settings?.verifyEmail || false}
            onChange={(checked) => updateSettings("verifyEmail", checked)}
            dataTestId="v2-email-verify"
          />
        </div>

        {/* <div className="space-y-2">
          <SettingSwitch
            label="Block duplicates"
            description="Prevent the same email from being submitted twice"
            checked={settings?.noDuplicates || false}
            onChange={(checked) => updateSettings("noDuplicates", checked)}
            dataTestId="v2-email-no-duplicates"
          />
        </div> */}

        {/* <div className="space-y-2">
          <SettingSwitch
            label="Block personal emails"
            description="Only allow work emails (block Gmail, Yahoo, etc.)"
            checked={settings?.noFreeEmails || false}
            onChange={(checked) => updateSettings("noFreeEmails", checked)}
            dataTestId="v2-email-no-free"
          />
        </div> */}

        <div className="space-y-2">
          <SettingSwitch
            label="Read only"
            description="Users cannot modify the pre-filled email"
            checked={settings?.isReadOnly || false}
            onChange={(checked) => updateSettings("isReadOnly", checked)}
            dataTestId="v2-email-readonly"
          />
        </div>

        <div className="space-y-2">
          <Label>Allowed Domains</Label>
          <Input
            value={
              settings?.suggestDomainsInput ??
              settings?.suggestDomains?.join(", ") ??
              ""
            }
            placeholder="e.g. domain1.com, domain2.com"
            onChange={(e) => handleAllowedDomainsChange(e.target.value)}
            data-testid="v2-email-allowed-domains"
          />
          {settings?.errors?.domainError ? (
            <HelperText error>{settings.errors.domainError}</HelperText>
          ) : (
            <HelperText>
              Only allow emails from these domains (comma-separated)
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
            placeholder="e.g., Use your work email address"
            onChange={(e) => updateSettings("toolTipText", e.target.value)}
            data-testid="v2-email-tooltip"
          />
          <HelperText>
            Help text that appears when users hover over the question
          </HelperText>
        </div>

        <div className="space-y-2">
          <Label>Custom Validation (Regex)</Label>
          <Input
            value={settings?.regex?.value || ""}
            placeholder="e.g. ^[a-zA-Z0-9]+@company\.com$"
            onChange={(e) =>
              updateSettings("regex", {
                value: e.target.value,
                error: settings?.regex?.error || "",
              })
            }
            data-testid="v2-email-regex"
          />
          <HelperText>
            Enforce a specific pattern (leave empty to disable)
          </HelperText>
        </div>

        {settings?.regex?.value && (
          <div className="space-y-2">
            <Label>Validation Error Message</Label>
            <Input
              value={settings?.regex?.error || ""}
              placeholder="Message when validation fails"
              onChange={(e) =>
                updateSettings("regex", {
                  value: settings?.regex?.value || "",
                  error: e.target.value,
                })
              }
              data-testid="v2-email-regex-error"
            />
            <HelperText>
              Shown when the user's input doesn't match the pattern
            </HelperText>
          </div>
        )}

        <div className="space-y-2">
          <Label>Internal Key</Label>
          <div className="flex items-center gap-2">
            <Input
              value={settings?.accessKey || ""}
              placeholder="Enter a key"
              onChange={(e) => updateSettings("accessKey", e.target.value)}
              data-testid="v2-email-access-key"
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

export default EmailSettings;
