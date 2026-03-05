import { ChangeEvent } from "react";
import { ODSLabel } from "@src/module/ods";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";
import { DropdownV2 } from "../../common-settings/dropdown-v2";
const OPTIONS = ["Unlimited", "Exact Number"];

const createArray = (length: number, type?: string, start?: any) => {
  if (type === "min") {
    return Array.from({ length: length - 1 }, (_, index) => index + 1);
  }
  if (type === "max") {
    let array = Array.from({ length }, (_, index) => index + 1);
    for (let i = 0; i < start; i++) {
      array.shift();
    }
    return array;
  }
  return Array.from({ length }, (_, index) => index + 1);
};

interface PictureSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  disableQuestionAlignment?: boolean;
}

const PictureGeneralSettings = ({
  onChange,
  question,
  mode,
  disableQuestionAlignment,
}: PictureSettingsProps) => {
  const settings = question?.settings;

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  return (
    <div style={styles.container} data-testid="picture-general-settings">
      <div style={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <SwitchOption
          key="picture-required"
          title="Required"
          checked={settings?.required}
          variant="black"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            updateSettings("required", event.target.checked);
          }}
        />
        <CTAEditor />
      </div>
      <div style={styles.wrapperContainer}>
        <div style={styles.selectionContainer}>
          <ODSLabel variant="body1">Multiple Selection</ODSLabel>
          <div style={styles.selectionTypeContainer}>
            <DropdownV2
              value={settings?.selection?.type}
              options={OPTIONS}
              onChange={(value) => {
                updateSettings("selection", {
                  ...settings?.selection,
                  type: value,
                });
              }}
              isOptionEqualToValue={(option, value) => {
                return option === value;
              }}
            />
            {settings?.selection?.type === "Exact Number" && (
              <DropdownV2
                value={settings?.selection?.exactNumber}
                options={createArray(question?.options?.length)}
                onChange={(value) => {
                  updateSettings("selection", {
                    ...settings?.selection,
                    exactNumber: value,
                  });
                }}
                isOptionEqualToValue={(option, value) =>
                  Number(option) === Number(value)
                }
                getOptionLabel={(option) => String(option)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PictureGeneralSettings;
