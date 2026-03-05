import { ODSLabel } from "@src/module/ods";
import { ODSTooltip as Tooltip } from "@src/module/ods";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import React from "react";
import { isEmpty } from "lodash";
import CTAEditor from "../../common-settings/cta-editor";
import { CANVAS_MODE, CANVAS_MODES } from "@oute/oute-ds.core.constants";
import { DropdownV2 } from "../../common-settings/dropdown-v2";
interface DropDownSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  viewPort?: any;
  disableQuestionAlignment?: boolean;
}

const OPTIONS = ["Single", "Unlimited", "Exact Number", "Range"];

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

const DropDownSettings = ({
  question,
  onChange,
  mode,
  viewPort,
  disableQuestionAlignment,
}: DropDownSettingsProps) => {
  const settings = question?.settings;

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  const selectionType = settings?.selectionType;
  const exactValue = settings?.exactNumber;
  const minValue = settings?.minNumber;
  const maxValue = settings?.maxNumber;

  const handleRangeChange = (key: string, value: any) => {
    let error = "";
    let defaultChoice = settings?.defaultChoice;
    if (key === "selectionType") {
      if (value === "Single") {
        defaultChoice = defaultChoice?.[0] ? { ...defaultChoice[0] } : {};
      }
      if (
        (value === "Unlimited" ||
          value === "Exact Number" ||
          value === "Range") &&
        !Array.isArray(defaultChoice)
      ) {
        defaultChoice = isEmpty(defaultChoice) ? [] : [defaultChoice];
      }
    }
    if (key === "exactNumber") {
      const exactNumber = Number(value);
      if (exactNumber && defaultChoice?.length > exactNumber) {
        error = `Default Value should be less than or equal to ${exactNumber}`;
      }
    }
    if (key === "minNumber") {
      const minNumber = Number(value);
      if (minNumber && defaultChoice?.length > minNumber) {
        error = `Default Value should be greater than or equal to ${minNumber}`;
      }
    }
    if (key === "maxNumber") {
      const maxNumber = Number(value);
      if (maxNumber && defaultChoice?.length > maxNumber) {
        error = `Default Value should be less than or equal to ${maxNumber}`;
      }
    }
    onChange({
      settings: {
        ...question?.settings,
        [key]: value,
        defaultChoice,
        errors: {
          ...question?.errors,
          defaultChoiceError: error,
        },
      },
    });
  };

  const getDefaultValue = () => {
    if (!Array.isArray(settings?.defaultChoice)) {
      return isEmpty(settings?.defaultChoice) ? [] : settings?.defaultChoice;
    }
    if (selectionType === "Single") {
      return settings?.defaultChoice[0];
    }
    return settings?.defaultChoice;
  };

  return (
    <div style={styles.container} data-testid="drop-down-general-settings">
      <div style={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          style={{ width: "100%" }}
          disabled={disableQuestionAlignment}
        />
        {CANVAS_MODE() === CANVAS_MODES.CMS_CANVAS && (
          <div style={styles.wrapperContainer}>
            <SwitchOption
              key="enable-map"
              title="Enable Map"
              variant="black"
              styles={{ width: "100%" }}
              checked={settings?.enableMap}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                updateSettings("enableMap", event.target.checked);
              }}
            />
            <SwitchOption
              key={"drop-down-is-advanced-field"}
              title="Show only in Advanced Settings"
              variant="black"
              checked={settings?.isAdvancedField}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                updateSettings("isAdvancedField", event.target.checked);
              }}
            />
          </div>
        )}
        <SwitchOption
          key="drop-down-required"
          variant="black"
          title="Required"
          styles={{ width: "100%" }}
          checked={settings?.required}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("required", event.target.checked);
          }}
          dataTestId="question-settings-required-toggle"
        />
        <CTAEditor />
        <Tooltip
          title={
            !settings?.randomize &&
            settings.isAlphabeticallyArranged &&
            "Arrange Alphabetically’s on. Turn off to enable."
          }
          placement="top-start"
          arrow={false}
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -14],
                  },
                },
              ],
            },
          }}
        >
          <SwitchOption
            key="drop-down-randomize"
            variant="black"
            title="Randomize"
            switchProps={{
              disabled: settings?.isAlphabeticallyArranged || false,
            }}
            checked={settings?.randomize}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              onChange?.({
                settings: {
                  ...settings,
                  randomize: event.target.checked,
                  isAlphabeticallyArranged: event.target.checked
                    ? false
                    : settings.isAlphabeticallyArranged,
                },
              });
            }}
            dataTestId="settings-dynamic-randomize-option-switch"
          />
        </Tooltip>

        <Tooltip
          title={
            !settings?.isAlphabeticallyArranged &&
            settings.randomize &&
            "Randomize’s on. Turn off to enable."
          }
          placement="top-start"
          arrow={false}
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -12],
                  },
                },
              ],
            },
          }}
        >
          <SwitchOption
            key="drop-down-isAlphabeticallyArranged"
            variant="black"
            title="Arrange Alphabetically"
            switchProps={{
              disabled: settings?.randomize || false,
            }}
            checked={settings?.isAlphabeticallyArranged}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              onChange?.({
                settings: {
                  ...settings,
                  isAlphabeticallyArranged: event.target.checked,
                  randomize: event.target.checked ? false : settings.randomize,
                },
              });
            }}
            dataTestId="settings-dynamic-arrange-alphabetically-option-switch"
          />
        </Tooltip>
      </div>
      <div style={styles.wrapperContainer}>
        <div style={styles.wrapper}>
          <ODSLabel variant="body1">Selection Type</ODSLabel>
          <div style={styles.selectContainer}>
            <DropdownV2
              variant="black"
              options={OPTIONS}
              value={selectionType}
              onChange={(newValue) => {
                handleRangeChange("selectionType", newValue);
              }}
              isOptionEqualToValue={(option, value) => option === value}
              data-testid="settings-dynamic-dropdown-selection-type"
            />

            {selectionType === "Exact Number" && (
              <DropdownV2
                variant="black"
                options={createArray(21)}
                value={settings?.exactNumber}
                onChange={(newValue) => {
                  handleRangeChange("exactNumber", newValue);
                }}
                isOptionEqualToValue={(option, value) => option === value}
              />
            )}

            {selectionType === "Range" && (
              <>
                <DropdownV2
                  variant="black"
                  options={createArray(21, "min")}
                  value={settings?.minNumber}
                  onChange={(newValue) => {
                    onChange({
                      settings: {
                        ...question?.settings,
                        minNumber: newValue,
                        maxNumber:
                          maxValue > newValue ? maxValue : newValue + 1,
                      },
                    });
                  }}
                  isOptionEqualToValue={(option, value) => {
                    return option === value;
                  }}
                />

                <DropdownV2
                  variant="black"
                  options={createArray(21, "max", settings?.minNumber)}
                  value={settings?.maxNumber}
                  onChange={(newValue) => {
                    handleRangeChange("maxNumber", newValue);
                  }}
                  isOptionEqualToValue={(option, value) => {
                    return option === value;
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropDownSettings;
