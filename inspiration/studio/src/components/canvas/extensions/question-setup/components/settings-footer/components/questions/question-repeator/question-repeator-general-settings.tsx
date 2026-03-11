import React from "react";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import { QuestionType, ViewPort } from "@oute/oute-ds.core.constants";
import SwitchOption from "../../common-settings/switch";
import { ODSLabel, ODSButton, ODSIcon as Icon, ODSTextField as TextField } from "@src/module/ods";
import { SettingsTextField } from "../../common-settings/settings-textfield";

interface QuestionRepeatorGeneralSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  viewPort?: ViewPort;
  mode?: any;
  disableQuestionAlignment?: boolean;
}

const QuestionRepeatorGeneralSettings = ({
  disableQuestionAlignment,
  mode,
  onChange,
  question,
  viewPort,
}: QuestionRepeatorGeneralSettingsProps) => {
  const settings = question?.settings || {};

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  return (
    <div
      className="my-4 grid grid-cols-2 gap-[3.31em]"
      data-testid="question-repeator-general-settings"
    >
      <div className="flex flex-col gap-[3em]">
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          viewPort={viewPort}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <SwitchOption
          key="question-repeator-required"
          title="Required"
          checked={settings?.required}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("required", event.target.checked);
          }}
        />
      </div>
      <div className="flex flex-col gap-[3em]">
        <SettingsTextField
          label="Group Name"
          value={settings?.groupName || ""}
          placeholder="Enter a group title..."
          onChange={(val) => updateSettings("groupName", val)}
          dataTestId="group-title"
        />
      </div>
    </div>
  );
};

export default QuestionRepeatorGeneralSettings;
