import React from "react";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import { FormulaBar } from "@src/module/ods";
import CTAEditor from "../../common-settings/cta-editor";
import { ODSLabel } from "@src/module/ods";

interface RankingSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  variables?: any;
  disableQuestionAlignment?: boolean;
}

const RankingSettings = ({
  onChange,
  question,
  mode,
  variables = {},
  disableQuestionAlignment,
}: RankingSettingsProps) => {
  const settings = question?.settings;

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  return (
    <div style={styles.container} data-testid="ranking-general-settings">
      <div style={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <SwitchOption
          key="ranking-required"
          variant="black"
          title="Required"
          dataTestId="question-settings-required-toggle"
          checked={settings?.required}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("required", event.target.checked);
          }}
        />
        <CTAEditor />

        <SwitchOption
          key="ranking-randomize"
          dataTestId="question-settings-randomize-toggle"
          variant="black"
          title="Randomize"
          checked={settings?.randomize}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("randomize", event.target.checked);
          }}
        />

        {/* <SwitchOption
          key="ranking-dynamic-input"
          variant="black"
          dataTestId="settings-ranking-dynamic-input-switch"
          title="Allow Dynamic Input"
          checked={settings?.dynamicInput?.isActive}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("dynamicInput", {
              ...settings?.dynamicInput,
              isActive: event.target.checked,
            });
          }}
        /> */}
        {settings?.dynamicInput?.isActive && (
          <div style={styles.dynamicInputContainer}>
            <ODSLabel
              children={"Dynamic Input"}
              variant="body1"
              data-testid="settings-ranking-dynamic-input-label"
            />
            <FormulaBar
              isReadOnly={false}
              hideInputBorders={false}
              placeholder="Enter dynamic input"
              defaultInputContent={settings?.dynamicInput?.variable?.blocks}
              onInputContentChanged={(content) => {
                updateSettings("dynamicInput", {
                  ...settings?.dynamicInput,
                  variable: {
                    type: "fx",
                    blocks: content,
                  },
                });
              }}
              variables={variables}
              wrapContent
              slotProps={{
                container: {
                  style: {
                    width: "100%",
                    minHeight: "3.25em",
                    maxHeight: "200px",
                    overflow: "auto",
                    borderWidth: "0.075em",
                    borderRadius: "0.375em",
                  },
                  "data-testid": "settings-ranking-dynamic-input",
                },
              }}
            />
            <ODSLabel
              children={
                'Enter a list of strings in array format, such as ["Option1", "Option2", "Option3"]'
              }
              data-testid="settings-ranking-dynamic-input-instruction"
              variant="body2"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingSettings;
