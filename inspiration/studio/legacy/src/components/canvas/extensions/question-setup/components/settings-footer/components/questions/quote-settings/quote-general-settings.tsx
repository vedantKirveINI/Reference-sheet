/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import React from "react";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";

interface QuoteSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  disableQuestionAlignment?: boolean;
}

const QuoteSettings = ({
  onChange,
  question,
  mode,
  disableQuestionAlignment,
}: QuoteSettingsProps) => {
  const settings = question?.settings;

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  return (
    <div css={styles.container} data-testid="quote-general-settings">
      <div css={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          style={{ width: "100%" }}
          disabled={disableQuestionAlignment}
        />
        <CTAEditor />
        <SwitchOption
          key="quotation-mark"
          variant="black"
          title="Quotation Mark"
          checked={settings?.quotationMark}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings("quotationMark", event.target.checked)
          }
        />
      </div>
    </div>
  );
};

export default QuoteSettings;
