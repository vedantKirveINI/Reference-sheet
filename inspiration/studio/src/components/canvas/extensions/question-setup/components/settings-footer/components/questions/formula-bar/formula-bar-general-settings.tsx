import React from "react";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import { ViewPort } from "@oute/oute-ds.core.constants";

interface IFormulaBarGeneralSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  viewPort?: ViewPort;
  mode?: any;
  disableQuestionAlignment?: boolean;
}

const FormulaBarGeneralSettings = ({
  onChange,
  question,
  viewPort,
  mode,
  disableQuestionAlignment = false,
}: IFormulaBarGeneralSettingsProps) => {
  const settings = question?.settings;
  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  return (
    <div className="my-4 grid grid-cols-2 gap-[3.31em]" data-testid="yes-no-general-settings">
      <div className="flex flex-col gap-[3em]">
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          viewPort={viewPort}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <SwitchOption
          key="formula-bar-required"
          variant="black"
          title="Required"
          checked={settings?.required}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("required", event.target.checked);
          }}
        />
        <SwitchOption
          key="formula-bar-is-advanced-field"
          title="Show only in Advanced Settings"
          variant="black"
          checked={settings?.isAdvancedField}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("isAdvancedField", event.target.checked);
          }}
        />
      </div>
    </div>
  );
};

export default FormulaBarGeneralSettings;
