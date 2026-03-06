import React from "react";
import { ODSLabel } from "@src/module/ods";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import { FILE_TYPES } from "./fileTypes";
import CTAEditor from "../../common-settings/cta-editor";
import { DropdownV2 } from "../../common-settings/dropdown-v2";
import { CANVAS_MODE, CANVAS_MODES } from "@oute/oute-ds.core.constants";

interface FilePickerSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  viewPort?: any;
  mode?: any;
  disableQuestionAlignment?: boolean;
}

const FilePickerSettings = ({
  question,
  onChange,
  viewPort,
  mode,
  disableQuestionAlignment,
}: FilePickerSettingsProps) => {
  const settings = question?.settings;
  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  return (
    <div style={styles.container} data-testid="file-picker-general-settings">
      <div style={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          style={{ width: "100%" }}
          disabled={disableQuestionAlignment}
        />

        {CANVAS_MODE() === CANVAS_MODES.CMS_CANVAS && (
          <SwitchOption
            key="file-is-advanced-field"
            title="Show only in Advanced Settings"
            variant="black"
            checked={settings?.isAdvancedField}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              updateSettings("isAdvancedField", event.target.checked);
            }}
          />
        )}

        <SwitchOption
          key="file-required"
          variant="black"
          title="Required"
          styles={{ width: "100%" }}
          checked={settings?.required}
          dataTestId="question-settings-required-toggle"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings("required", event.target.checked)
          }
        />
        <CTAEditor />

        <div
          style={styles.getInputWrapperContainerStyle()}
          data-testid="settings-file-picker-file-types"
        >
          <ODSLabel variant="body1">File Types Allowed</ODSLabel>
          <DropdownV2
            multiple={true}
            searchable={true}
            variant="black"
            isOptionEqualToValue={(option, value) =>
              option.label === value.label
            }
            options={FILE_TYPES}
            value={settings?.allowedFileTypes || []}
            onChange={(value) => {
              updateSettings("allowedFileTypes", value);
            }}
            renderTagKey="label"
            disableCloseOnSelect={true}
            data-testid="file-picker-file-types-dropdown"
          />
        </div>
      </div>

      <div style={styles.wrapperContainer}>
        <div
          style={styles.getInputWrapperContainerStyle()}
          data-testid="settings-file-picker-no-of-files-allowed"
        >
          <DropdownV2
            label="No. of Files Allowed"
            variant="black"
            options={["1", "2", "3", "4", "5"]}
            value={settings?.noOfFilesAllowed}
            onChange={(value) => {
              updateSettings("noOfFilesAllowed", value);
            }}
            isOptionEqualToValue={(option, value) => {
              return option === value;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FilePickerSettings;
