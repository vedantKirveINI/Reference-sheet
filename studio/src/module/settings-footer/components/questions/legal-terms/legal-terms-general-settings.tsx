import React from "react";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";
import QuestionAlignment from "../../common-settings/alignment";
import SwitchOption from "../../common-settings/switch";

interface LegalTermsSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  variables?: any;
  mode?: any;
  disableQuestionAlignment?: boolean;
}

const LegalTermsSettings = ({
  question,
  onChange,
  variables = {},
  mode,
  disableQuestionAlignment,
}: LegalTermsSettingsProps) => {
  const settings = question?.settings;
  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  return (
    <div style={styles.container} data-testid="legal-terms-general-settings">
      <div style={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          style={{ width: "100%" }}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <SwitchOption
          key="legal-terms-required"
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
      </div>
    </div>
  );
};

export default LegalTermsSettings;
