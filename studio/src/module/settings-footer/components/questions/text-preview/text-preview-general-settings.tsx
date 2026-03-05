import React from "react";
import SwitchOption from "../../common-settings/switch";
// import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import DefaultValueFx from "../../common-settings/defaultValueFx";
import CTAEditor from "../../common-settings/cta-editor";

interface TextPreviewSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  variables?: any;
}

const TextPreviewSettings = ({
  question,
  // onChange,
  // variables = {},
}: TextPreviewSettingsProps) => {
  const settings = question?.settings;
  // const updateSettings = (key: string, value: any) => {
  //   onChange?.({ settings: { ...settings, [key]: value } });
  // };

  return (
    <div style={styles.container} data-testid="text-preview-general-settings">
      <div style={styles.wrapperContainer}>
        <CTAEditor />
        {/* <QuestionAlignment
        settings={settings}
        onChange={handleSettingsChange}
        mode={mode}
      /> */}

        {/* <SwitchOption
          key="text-preview-required"
          title="Required"
          checked={settings?.required}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            handleSettingsChange("required", event.target.checked);
          }}
        /> */}

        {/* <SwitchOption
          key="prefill"
          variant="black"
          title="Prefill"
          checked={settings?.prefill}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("prefill", event.target.checked);
          }}
        />
        <DefaultValueFx
          settings={settings}
          variables={variables}
          onChange={updateSettings}
          isReadOnly={!settings?.prefill}
        /> */}
      </div>
    </div>
  );
};

export default TextPreviewSettings;
