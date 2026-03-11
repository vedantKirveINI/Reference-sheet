/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import type React from "react";
import { ODSLabel } from "@src/module/ods";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";

import DefaultTime from "../../common-settings/time-component";
import CTAEditor from "../../common-settings/cta-editor";
import { ERROR_MESSAGE } from "../../../constants/errorMessages";
import { REGEX_CONSTANTS } from "@oute/oute-ds.core.constants";

const TIME_ZONES = ["UTC", "PST", "MST", "CST"]; //will be chnage when get complte list

interface TimeSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  viewPort?: any;
  mode?: any;
  disableQuestionAlignment?: boolean;
}

const TimeSettings = ({
  question,
  onChange,
  viewPort,
  mode,
  disableQuestionAlignment,
}: TimeSettingsProps) => {
  const settings = question?.settings;

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  const handleTimeChange = (value) => {
    const timeValue = value?.time;
    const meridiemValue = value?.meridiem;
    const regexForTwelveHour = REGEX_CONSTANTS.TWELVE_HOUR_REGEX;
    const regexForTwentyFourHour = REGEX_CONSTANTS.TWENTY_FOUR_HOUR_REGEX;
    let error = "";
    if (
      timeValue &&
      settings?.isTwentyFourHour &&
      !regexForTwentyFourHour.test(timeValue)
    ) {
      error = ERROR_MESSAGE.TIME.defaultTimeError;
    }
    if (
      timeValue &&
      !settings?.isTwentyFourHour &&
      !regexForTwelveHour.test(timeValue)
    ) {
      error = ERROR_MESSAGE.TIME.defaultTimeError;
    }

    onChange({
      settings: {
        ...settings,
        defaultTime: {
          time: timeValue,
          meridiem: meridiemValue,
          timeZone: value?.timeZone,
          ISOValue: value?.ISOValue,
        },
        errors: {
          ...question?.errors,
          defaultTimeError: error,
        },
      },
    });
  };

  const handleTwentyFourHourSwitchToggle = (value) => {
    onChange({
      settings: {
        ...settings,
        isTwentyFourHour: value,
        defaultTime: {
          time: "",
          meridiem: "AM",
          timeZone: "",
          ISOValue: "",
        },
        errors: {
          ...question?.errors,
          defaultTimeError: "",
        },
      },
    });
  };
  return (
    <div css={styles.container} data-testid="time-general-settings">
      <div css={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <SwitchOption
          key="time-required"
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
          key="time-24-hours"
          variant="black"
          title="24 Hours"
          checked={settings?.isTwentyFourHour}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            handleTwentyFourHourSwitchToggle(event.target.checked);
          }}
          dataTestId="allow-24-hours-toggle"
        />
      </div>

      <div css={styles.wrapperContainer}>
        <div
          css={styles.inputWrapperContainer()}
          data-testid="settings-default-time-input-wrapper"
        >
          <DefaultTime
            value={settings?.defaultTime}
            question={question}
            onChange={(_value) => {
              handleTimeChange(_value);
            }}
            viewPort={viewPort}
            style={{
              inputStyle: {
                width: "23em",
                height: "3.251em",
                input: {
                  minWidth: "12em !important",
                  maxWidth: "10em !important",
                  borderRadius: "0.375em !important",
                },
              },
            }}
          />
          {settings?.errors?.defaultTimeError && (
            <ODSLabel
              variant="body1"
              color="error"
              data-testid="settings-time-default-value-error"
              style={{ position: "absolute", bottom: "-2em" }}
            >
              {settings.errors.defaultTimeError}
            </ODSLabel>
          )}
        </div>

        {/* <div
          css={styles.inputWrapperContainer()}
          data-testid="settings-time-zone-input-wrapper"
        >
          <ODSLabel variant="body1">Display Time Zone</ODSLabel>
          <Dropdown
            multiple={false}
            options={TIME_ZONES}
            isSearchable={true}
            value={settings?.timeZone || "UTC"}
            onChange={(value) => {
              updateSettings("timeZone", value);
            }}
            viewPort={viewPort}
            style={{
              containerStyle: { maxWidth: "23em" },
              labelStyle: { maxWidth: "23em" },
            }}
          />
        </div> */}
      </div>
    </div>
  );
};

export default TimeSettings;
