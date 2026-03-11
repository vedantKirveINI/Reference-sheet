import { useState, ChangeEvent, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { ODSLabel } from "@src/module/ods";

dayjs.extend(customParseFormat);
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import { ODSAutocomplete as ODSAutoComplete } from "@src/module/ods";
import { DateInput } from "@src/module/date-input";
import DefaultTime from "../../common-settings/time-component";
import CTAEditor from "../../common-settings/cta-editor";

import { INPUT_HEIGHT } from "../../../constants/constants";
import { CANVAS_MODE, CANVAS_MODES } from "@oute/oute-ds.core.constants";
import { computeISOValueFromDate } from "@oute/oute-ds.common.core.utils";
import { getTimeAndMeridiam } from "./getTimeAndMeridiem";

const dateFormats = ["DDMMYYYY", "MMDDYYYY", "YYYYMMDD"];

const separators = ["/", ".", "-"];

interface DateSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  viewPort?: any;
  mode?: any;
  disableQuestionAlignment?: boolean;
  setQuestion: (question: Record<string, any>) => void;
}

const EMPTY_DATE = Object.freeze({
  value: "",
  ISOValue: "",
});

const EMPTY_TIME = Object.freeze({
  time: "",
  meridiem: "AM",
  ISOValue: "",
});

const DateGeneralSettings = ({
  onChange,
  question,
  viewPort,
  mode,
  disableQuestionAlignment = false,
  setQuestion,
}: DateSettingsProps) => {
  const settings = question?.settings;

  const storedDate = settings?.defaultValue?.date || "";
  const storedTime = settings?.defaultValue?.time || "";
  const storedMeridiem = settings?.defaultValue?.meridiem || "";
  const dateFormat = settings?.dateFormat || "DDMMYYYY";
  const separator = settings?.separator || "/";

  const [defaultDate, setDefaultDate] = useState(() => {
    if (settings?.defaultValue?.value) {
      let value = "";
      let ISOValue = "";
      if (settings?.includeTime) {
        const dateValue = settings?.defaultValue?.value?.split?.(" ");
        value = dateValue?.[0] || "";
        ISOValue = settings?.defaultValue?.ISOValue || "";
      } else {
        value = settings?.defaultValue?.value || "";
        ISOValue = settings?.defaultValue?.ISOValue || "";
      }
      return {
        value: value,
        ISOValue: ISOValue,
      };
    } else if (storedDate) {
      const ISOValue = computeISOValueFromDate({
        dateValue: storedDate,
        format: dateFormat as any,
        separator: separator as any,
        timeValue: storedTime || undefined,
        meridiem: storedMeridiem || undefined,
      });
      return {
        value: storedDate,
        ISOValue: ISOValue || "",
      };
    }

    return { value: "", ISOValue: "" };
  });

  const [defaultTime, setDefaultTime] = useState(() => {
    if (settings?.defaultValue?.value) {
      return {
        ...EMPTY_TIME,
        ...getTimeAndMeridiam(settings?.defaultValue || {})
      };
    } else if (storedTime) {
      return {
        time: storedTime,
        meridiem: storedMeridiem || "AM",
      };
    }
    return {
      time: "",
      meridiem: "AM",
    };
  });

  const updateSettings = (key: string, value: any, errors = {}) => {
    setQuestion((prevQuestion: Record<string, any>) => ({
      ...(prevQuestion || {}),
      settings: {
        ...(prevQuestion?.settings || {}),
        [key]: value,
        errors: {
          ...(prevQuestion?.settings?.errors || {}),
          ...errors,
        },
      },
    }));
  };

  const onIncludeTimeChangeHandler = (isIncludeTime: boolean) => {
    setDefaultTime(EMPTY_TIME);

    setQuestion((prevQuestion: Record<string, any>) => {
      return {
        ...(prevQuestion || {}),
        settings: {
          ...(prevQuestion?.settings || {}),
          includeTime: isIncludeTime,
          defaultValue: {
            ...prevQuestion?.settings?.defaultValue,
            time: "",
            meridiem: "AM",
          },
          errors: {
            ...(prevQuestion?.settings?.errors || {}),
            includeTimeError: "",
          },
        },
      };
    });
  };

  const onDateChangeHandler = (newValue: any) => {
    setDefaultDate(newValue);
    if (newValue?.ISOValue) {
      updateSettings(
        "defaultValue",
        {
          ...settings?.defaultValue,
          date: newValue?.value,
        },
        { includeTimeError: "" }
      );
    } else {
      let includeTimeError = settings?.defaultValue?.time
        ? "Please select a date before entering time"
        : "";
      updateSettings(
        "defaultValue",
        {
          ...settings?.defaultValue,
          date: "",
        },
        { includeTimeError: includeTimeError }
      );
    }
  };

  const onTimeChangeHandler = (newValue: any) => {
    setDefaultTime(newValue);

    if (newValue?.ISOValue) {
      let includeTimeError = settings?.defaultValue?.date
        ? ""
        : "Please select a date before entering time";
      updateSettings(
        "defaultValue",
        {
          ...settings?.defaultValue,
          time: newValue?.time,
          meridiem: newValue?.meridiem,
        },
        { includeTimeError: includeTimeError }
      );
    } else {
      updateSettings(
        "defaultValue",
        {
          ...settings?.defaultValue,
          time: "",
          meridiem: "AM",
        },
        { includeTimeError: "" }
      );
    }
  };

  return (
    <div style={styles.container} data-testid="date-general-settings">
      <div style={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          style={{ width: "100%" }}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        {CANVAS_MODE() === CANVAS_MODES.CMS_CANVAS && (
          <div style={styles.wrapperContainer}>
            <SwitchOption
              key="date-enable-map"
              variant="black"
              title="Enable Map"
              checked={settings?.enableMap}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                updateSettings("enableMap", event.target.checked);
              }}
            />
            <SwitchOption
              key="date-is-advanced-field"
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
          key="date-required"
          variant="black"
          title="Required"
          styles={{ width: "100%" }}
          checked={settings?.required}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateSettings("required", event.target.checked)
          }
          dataTestId="question-settings-required-toggle"
        />
        <CTAEditor />
        <SwitchOption
          key="use-date-picker"
          variant="black"
          title="Use Date Picker"
          styles={{ width: "100%" }}
          checked={settings?.useDatePicker}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateSettings("useDatePicker", event.target.checked)
          }
          dataTestId="settings-use-date-picker-toggle"
        />
        <SwitchOption
          key="include-time"
          variant="black"
          title="Include Time"
          styles={{ width: "100%" }}
          checked={settings?.includeTime}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onIncludeTimeChangeHandler(event.target.checked);
          }}
          dataTestId="settings-include-time-toggle"
        />
      </div>
      <div style={styles.wrapperContainer}>
        <div style={styles.dateFormatWrapper}>
          <div style={styles.autocompleteWrapper}>
            <ODSLabel variant="body1">Date Format</ODSLabel>
            <ODSAutoComplete
              options={dateFormats}
              value={settings?.dateFormat}
              onChange={(event, newValue) => {
                updateSettings("dateFormat", newValue);
              }}
              
              slotProps={{
                paper: {
                  sx: {
                    ...styles?.paper,
                  },
                },
              }}
              textFieldProps={{
                size: "small",
                inputProps: { "data-testid": "settings-date-format-input" },
              }}
              ListboxProps={{
                "data-testid": "settings-date-format-listbox",
              }}
              data-testid="settings-date-format-autocomplete"
            />
          </div>

          <div style={styles.autocompleteWrapper}>
            <ODSLabel variant="body1">Separator</ODSLabel>
            <ODSAutoComplete
              options={separators}
              value={settings?.separator}
              onChange={(event, newValue) => {
                updateSettings("separator", newValue);
              }}
              
              slotProps={{
                paper: {
                  sx: {
                    ...styles?.paper,
                  },
                },
              }}
              textFieldProps={{
                size: "small",
                inputProps: {
                  "data-testid": "settings-date-separator-input",
                },
              }}
              ListboxProps={{
                "data-testid": "settings-date-separator-listbox",
              }}
              data-testid="settings-date-separator-autocomplete"
            />
          </div>
        </div>
        <div
          style={styles.inputContainer}
          data-testid="settings-date-default-value"
        >
          <ODSLabel variant="body1">Default Date</ODSLabel>
          <DateInput
            format={question?.settings?.dateFormat}
            separator={question?.settings?.separator}
            value={defaultDate}
            onChange={onDateChangeHandler}
            onSelect={onDateChangeHandler}
            enableCalender={true}
            style={{
              ...styles.dateInput,
              height: INPUT_HEIGHT,
            }}
            disabled={false}
          />
          {settings?.errors?.includeTimeError && (
            <ODSLabel
              variant="body1"
              color="error"
              data-testid="settings-include-time-error"
              style={{ position: "absolute", bottom: "-2em" }}
            >
              {settings?.errors?.includeTimeError || ""}
            </ODSLabel>
          )}
        </div>
        {settings?.includeTime && (
          <DefaultTime
            value={defaultTime}
            question={question}
            onChange={(_value) => {
              onTimeChangeHandler(_value);
            }}
            viewPort={viewPort}
            style={{
              inputStyle: {
                width: "20.5em",
                height: "3.251em",
                input: {
                  minWidth: "12em !important",
                  maxWidth: "10em !important",
                  borderRadius: "0.375em !important",
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DateGeneralSettings;
