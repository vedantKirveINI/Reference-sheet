import React, { useMemo } from "react";
import { ODSLabel } from "@src/module/ods";
import { ViewPort } from "@oute/oute-ds.core.constants";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";
import { DropdownV2 } from "../../common-settings/dropdown-v2";
interface MCQSettingsProps {
  viewPort?: ViewPort;
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  disableQuestionAlignment?: boolean;
}

const OTHER_OPTION_VALUE = "Other";

const OPTIONS = ["Unlimited", "Exact Number", "Range"];

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

const MCQSettings = ({
  onChange,
  question,
  viewPort,
  mode,
  disableQuestionAlignment,
}: MCQSettingsProps) => {
  const settings = question?.settings;
  const selectionType = settings?.selection?.type;
  const exactValue = settings?.selection?.exactNumber;
  const maxValue = settings?.selection?.range?.end;
  const defaultValueError = settings?.errors?.defaultValueError;

  const updateSettings = (
    key: string,
    value: any,
    errors?: Record<string, string>
  ) => {
    onChange?.({
      settings: {
        ...settings,
        [key]: value,
        errors: { ...settings?.errors, ...errors },
      },
    });
  };

  const sanitizedQuestionOptions = question?.options?.filter((opt) =>
    opt?.trim()
  );
  const questionOptions = settings?.other
    ? [...sanitizedQuestionOptions, OTHER_OPTION_VALUE]
    : sanitizedQuestionOptions;

  const onDefaultValueChange = (value: string[]) => {
    if (selectionType === "Exact Number" && value.length > exactValue)
      value = value.slice(1, exactValue).concat(value[value.length - 1]);

    if (selectionType === "Range" && value.length > maxValue) {
      value = value.slice(1, maxValue).concat(value[value.length - 1]);
    }
    updateSettings("defaultValue", value, { defaultValueError: "" });
  };

  const onSelectionChange = (value: string) => {
    const updatedDefaultValue =
      value === "Exact Number"
        ? settings?.defaultValue.slice(0, settings?.selection?.exactNumber)
        : value === "Range"
          ? settings?.defaultValue.slice(0, settings?.selection?.range?.end)
          : settings?.defaultValue;

    const updatedSettings = {
      ...settings,
      selection: {
        ...settings?.selection,
        type: value,
      },
      defaultValue: updatedDefaultValue,
    };
    onChange({ settings: updatedSettings });
  };

  const onExactNumberChange = (value: number) => {
    const updatedSettings = {
      ...settings,
      defaultValue: settings?.defaultValue?.slice(0, value),
      selection: {
        ...settings?.selection,
        exactNumber: value,
      },
    };
    onChange({ settings: updatedSettings });
  };

  const onRangeEndChange = (value: number) => {
    const updatedSettings = {
      ...settings,
      defaultValue: settings?.defaultValue.slice(0, value),
      selection: {
        ...settings.selection,
        range: {
          ...settings?.selection?.range,
          end: value,
        },
      },
    };
    onChange({ settings: updatedSettings });
  };

  const updateMcqOptions = (value) => {
    onChange({
      settings: {
        ...settings,
        other: value,
      },
    });
  };

  return (
    <div style={styles.container} data-testid="mcq-general-settings">
      <div style={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <SwitchOption
          key="mcq-required"
          variant="black"
          title="Required"
          checked={settings?.required}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("required", event.target.checked);
          }}
          dataTestId="question-settings-required-toggle"
        />
        <CTAEditor />
        <SwitchOption
          key="mcq-randomize"
          variant="black"
          title="Randomize"
          checked={settings?.randomize}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("randomize", event.target.checked);
          }}
        />
        <SwitchOption
          key="mcq-vertical-alignment"
          variant="black"
          title="Arrange Options Vertically"
          checked={settings?.isAlignmentVertical}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateSettings("isAlignmentVertical", event.target.checked);
          }}
        />
        <SwitchOption
          key="mcq-other"
          variant="black"
          title="Include Other"
          checked={settings?.other}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateMcqOptions(event.target.checked);
          }}
        />
        {settings?.other && (
          <SwitchOption
            key="scq-allowOtherInput"
            variant="black"
            title="Allow other input"
            disabled={!settings?.other}
            checked={settings?.allowOtherInput}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              updateSettings("allowOtherInput", event.target.checked);
            }}
          />
        )}
      </div>

      <div style={styles.wrapperContainer}>
        <div
          style={styles.autocompleteContainer}
          data-testid="settings-mcq-default-value"
        >
          <ODSLabel variant="body1">Default Value</ODSLabel>

          <DropdownV2
            variant="black"
            multiple={true}
            searchable={true}
            options={questionOptions}
            value={settings?.defaultValue}
            disableCloseOnSelect={true}
            onChange={(value) => {
              onDefaultValueChange(value);
            }}
            isOptionEqualToValue={(option, value) => option === value}
            data-testid="mcq-default-value-dropdown"
          />
          {defaultValueError && (
            <ODSLabel
              variant="body1"
              color="error"
              data-testid="mcq-default-value-error"
            >
              {defaultValueError}
            </ODSLabel>
          )}
        </div>
        <div style={styles.autocompleteContainer}>
          <ODSLabel variant="body1">Multiple Selection</ODSLabel>
          <div
            style={styles.multipleAutocompleteContainer}
            data-testid="settings-multiple-selection"
          >
            <DropdownV2
              variant="black"
              options={OPTIONS}
              value={settings?.selection?.type}
              onChange={(newValue) => {
                onSelectionChange(newValue);
              }}
              isOptionEqualToValue={(option, value) => {
                return option === value;
              }}
              data-testid="settings-selection-type-dropdown"
            />

            {settings?.selection?.type === "Exact Number" && (
              <DropdownV2
                variant="black"
                options={createArray(question?.options?.length)}
                value={settings?.selection?.exactNumber}
                onChange={(newValue) => {
                  onExactNumberChange(newValue);
                }}
                isOptionEqualToValue={(option, value) => {
                  return option === value;
                }}
                data-testid="settings-exact-number-dropdown"
              />
            )}
            {settings?.selection?.type === "Range" && (
              <>
                <DropdownV2
                  variant="black"
                  options={createArray(question?.options?.length, "min")}
                  value={settings?.selection?.range?.start}
                  onChange={(newValue) => {
                    updateSettings("selection", {
                      ...settings?.selection,
                      range: {
                        start: newValue,
                        end: maxValue > newValue ? maxValue : newValue + 1,
                      },
                    });
                  }}
                  isOptionEqualToValue={(option, value) => {
                    return option === value;
                  }}
                  data-testid="settings-range-min-dropdown"
                />

                <DropdownV2
                  variant="black"
                  options={createArray(
                    question?.options?.length,
                    "max",
                    settings?.selection?.range?.start
                  )}
                  value={settings?.selection?.range?.end}
                  onChange={(newValue) => {
                    onRangeEndChange(newValue);
                  }}
                  isOptionEqualToValue={(option, value) => {
                    return option === value;
                  }}
                  data-testid="settings-range-max-dropdown"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQSettings;
