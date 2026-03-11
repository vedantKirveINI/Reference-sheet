/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import React, { useState } from "react";
import { styles } from "./styles";
import SwitchOption from "../../common-settings/switch";
import { DateInput } from "@oute/oute-ds.atom.date-input";
import { ODSLabel } from "@src/module/ods";
import AccessKeyInput from "../../common-settings/access-key-input";
import dayjs from "dayjs";
import { INPUT_HEIGHT } from "../../../constants/constants";

interface DateSettingsProps {
  settings?: any;
  onChange?: (val: any) => void;
  handleOnChange?: (key: string, value: any) => void;
  setQuestion: (question: Record<string, any>) => void;
}

const DateAdvancedSettings = ({
  onChange,
  handleOnChange,
  settings,
  setQuestion,
}: DateSettingsProps) => {
  const { allowPastDate, allowFutureDate, startDate, endDate } = settings || {};

  const handleDateSelect = (key: string, value: any) => {
    let startDateError = "";
    let endDateError = "";

    const selectedDate = dayjs(value?.ISOValue).startOf("day");
    const currentDate = dayjs().startOf("day");
    const startISO = startDate?.ISOValue
      ? dayjs(startDate.ISOValue).startOf("day")
      : null;
    const endISO = endDate?.ISOValue
      ? dayjs(endDate.ISOValue).startOf("day")
      : null;

    if (key === "startDate") {
      if (!allowPastDate && selectedDate.isBefore(currentDate)) {
        startDateError = "Start date cannot be in the past";
      } else if (!allowFutureDate && selectedDate.isAfter(currentDate)) {
        startDateError = "Start date cannot be in the future";
      } else if (endISO && selectedDate.isAfter(endISO)) {
        startDateError = "Start date cannot be after End date";
      } else if (endISO && selectedDate.isSame(endISO)) {
        // Allow equal start and end dates
        startDateError = "";
      }
    }

    if (key === "endDate") {
      if (!allowPastDate && selectedDate.isBefore(currentDate)) {
        endDateError = "End date cannot be in the past";
      } else if (!allowFutureDate && selectedDate.isAfter(currentDate)) {
        endDateError = "End date cannot be in the future";
      } else if (startISO && selectedDate.isBefore(startISO)) {
        endDateError = "End date cannot be before Start date";
      } else if (startISO && selectedDate.isSame(startISO)) {
        // Allow equal start and end dates
        endDateError = "";
      }
    }

    setQuestion((prevQuestion: Record<string, any>) => ({
      ...prevQuestion,
      settings: {
        ...prevQuestion?.settings,
        [key]: value,
        errors: {
          ...(prevQuestion?.settings?.errors || {}),
          startDateError,
          endDateError,
        },
      },
    }));
  };

  const handleAllowDateSelect = (key: string, value: any) => {
    setQuestion((prev) => ({
      ...prev,
      settings: {
        ...prev?.settings,

        [key]: value,
        startDate: {
          value: "",
          ISOValue: "",
        },
        endDate: {
          value: "",
          ISOValue: "",
        },
        errors: {
          ...(prev?.settings?.errors || {}),
          startDateError: "",
          endDateError: "",
        },
      },
    }));
  };

  return (
    <div css={styles.container} data-testid="date-advanced-settings">
      <div css={styles.wrapperContainer}>
        <SwitchOption
          key="allow-past"
          variant="black"
          title="Allow Past"
          styles={{ width: "100%" }}
          checked={settings?.allowPastDate}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleAllowDateSelect("allowPastDate", event.target.checked)
          }
          dataTestId="settings-allow-past"
        />

        <SwitchOption
          key="allow-future"
          variant="black"
          title="Allow Future"
          styles={{ width: "100%" }}
          checked={settings?.allowFutureDate}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleAllowDateSelect("allowFutureDate", event.target.checked)
          }
          dataTestId="settings-allow-future"
        />
        <AccessKeyInput
          keyValue={settings?.accessKey}
          onChange={(value) => handleOnChange("accessKey", value)}
          style={{ width: "100%" }}
        />
      </div>
      <div
        css={{ ...styles.wrapperContainer, justifyContent: "space-between" }}
      >
        <div css={styles.inputContainer} data-testid="settings-start-date">
          <ODSLabel variant="body1">Accept Date From</ODSLabel>
          <DateInput
            key="date-input-start-date"
            format={settings?.dateFormat}
            separator={settings?.separator}
            value={settings?.startDate}
            onChange={(_value) => {
              handleDateSelect("startDate", _value);
            }}
            onSelect={(_value) => {
              handleDateSelect("startDate", _value);
            }}
            enableCalender={true}
            style={{ ...styles.dateInput, height: INPUT_HEIGHT }}
            disabled={false}
          />
          {settings?.errors?.startDateError && (
            <ODSLabel
              variant="body1"
              color="error"
              data-testid="settings-date-select-error"
              style={{ position: "absolute", bottom: "-2em" }}
            >
              {settings?.errors?.startDateError}
            </ODSLabel>
          )}
        </div>
        <div css={styles.inputContainer} data-testid="settings-end-date">
          <ODSLabel variant="body1">Accept Date Till</ODSLabel>
          <DateInput
            key="date-input-end-date"
            format={settings?.dateFormat}
            separator={settings?.separator}
            value={settings?.endDate}
            onChange={(_value) => {
              handleDateSelect("endDate", _value);
            }}
            onSelect={(_value) => {
              handleDateSelect("endDate", _value);
            }}
            enableCalender={true}
            style={{ ...styles.dateInput, height: INPUT_HEIGHT }}
            disabled={false}
          />
          {settings?.errors?.endDateError && (
            <ODSLabel
              variant="body1"
              color="error"
              data-testid="settings-date-select-error"
              style={{ position: "absolute", bottom: "-2em" }}
            >
              {settings?.errors?.endDateError}
            </ODSLabel>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateAdvancedSettings;
