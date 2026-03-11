/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import React from "react";
import { ODSLabel } from "@src/module/ods";
import { ColorPicker } from "@oute/oute-ds.atom.color-picker";
import { styles } from "./styles";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import CTAEditor from "../../common-settings/cta-editor";

const SignatureGeneralSettings = ({
  question,
  onChange,
  mode,
  disableQuestionAlignment,
}: any) => {
  const settings = question?.settings;
  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  return (
    <div css={styles.container} data-testid="signature-general-settings">
      <div css={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <div css={styles.colorPickerContainer}>
          <ODSLabel variant="body1">Pen Color</ODSLabel>
          <ColorPicker
            value={settings?.penColor}
            onChange={(e, val) => {
              updateSettings("penColor", val);
            }}
            dataTestId="settings-signature-pen-color"
          />
        </div>
      </div>

      <div css={styles.wrapperContainer}>
        <SwitchOption
          key="signature-required"
          variant="black"
          title="Required"
          checked={settings?.required}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("required", event.target.checked);
          }}
        />
        <CTAEditor />
      </div>
      <div css={styles.wrapperContainer}>
        <div css={styles.colorPickerContainer}>
          <ODSLabel variant="body1">Background Color</ODSLabel>
          <ColorPicker
            value={settings?.backgroundColor}
            onChange={(e, val) => {
              updateSettings("backgroundColor", val);
            }}
            dataTestId="settings-signature-background-color"
          />
        </div>
      </div>
    </div>
  );
};

export default SignatureGeneralSettings;
