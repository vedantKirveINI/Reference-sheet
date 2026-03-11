import type React from "react";
import { ODSLabel } from "@src/module/ods";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import DefaultValueFx from "../../common-settings/defaultValueFx";
import CTAEditor from "../../common-settings/cta-editor";
import { ERROR_MESSAGE } from "../../../constants/errorMessages";
import { REGEX_CONSTANTS } from "@oute/oute-ds.core.constants";
import { SettingsTextField } from "../../common-settings/settings-textfield";
interface EmailSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  variables?: any;
  disableQuestionAlignment?: boolean;
}

const EmailSettings = ({
  onChange,
  question,
  mode,
  variables = {},
  disableQuestionAlignment = false,
}: EmailSettingsProps) => {
  const settings = question?.settings;

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  const validateDomains = (value) => {
    const domainRegex = REGEX_CONSTANTS.DOMAIN_REGEX;
    const domainList = value?.split(",");
    const allDomainsValid = domainList.every((domain) =>
      domainRegex.test(domain.trim())
    );

    const error =
      allDomainsValid || !value ? "" : ERROR_MESSAGE.EMAIL.domainError;

    onChange({
      settings: {
        ...settings,
        suggestDomains: domainList,
        errors: {
          domainError: error,
        },
      },
    });
  };

  return (
    <div style={styles.container} data-testid="email-general-settings">
      <div style={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          style={{ width: "100%" }}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <SwitchOption
          key="email-required"
          variant="black"
          title="Required"
          styles={{ width: "100%" }}
          checked={settings?.required}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings("required", event.target.checked)
          }
          dataTestId="question-settings-required-toggle"
        />
        <CTAEditor />
        <SwitchOption
          key="email-is-read-only"
          variant="black"
          title="Read Only"
          styles={{ width: "100%" }}
          checked={settings?.isReadOnly}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings("isReadOnly", event.target.checked)
          }
          dataTestId="email-readonly-toggle"
        />
        <SwitchOption
          key="verify-email"
          variant="black"
          title="Email validation using verification code"
          styles={{ width: "100%" }}
          checked={settings?.verifyEmail}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings("verifyEmail", event.target.checked)
          }
          dataTestId="email-validation-toggle"
        />
      </div>

      <div style={styles.wrapperContainer}>
        <DefaultValueFx
          settings={settings}
          variables={variables}
          onChange={updateSettings}
          placeholder="Enter default email id"
          dataTestid="question-settings-default-value"
        />

        <div style={styles.inputContainer}>
          <SettingsTextField
            label="Allowed Domains"
            className="black"
            value={settings?.suggestDomains?.join(",")}
            placeholder="eg. domain1.com, domain2.com"
            onChange={(value) => {
              validateDomains(value);
            }}
            dataTestId="email-allowed-domains"
          />
          <ODSLabel
            variant="body1"
            color="error"
            data-testid="domain-error"
            style={{ position: "absolute", bottom: "-2em" }}
          >
            {settings?.errors?.domainError}
          </ODSLabel>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
