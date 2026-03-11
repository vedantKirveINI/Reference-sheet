import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { IDateInputValue, DateInput } from "@src/module/date-input";
import { Mode, ViewPort } from "@src/module/constants";
import { Time } from "@src/module/time";
import { getMaxDate, getMinDate } from "./utils/getMinMaxDate";
import { getTimeAndMeridian } from "./utils/getTimeAndMeridian";
import { dateValidation } from "./validation";
import dayjs from "dayjs";

/** Time-specific error messages (when Include time is on). Only the time field should show these. */
const TIME_ERROR_MESSAGES = ["Invalid Time", "Time is required"];

const isTimeOnlyError = (error?: string) =>
  Boolean(error && TIME_ERROR_MESSAGES.some((msg) => error === msg));
import { formatConfigs } from "@src/module/utils/helper/date";
import { processDefaultValue } from "./utils/process-default-value";

export type DateProps = {
  isCreator?: boolean;
  value?: IDateInputValue;
  onChange?: any;
  question?: any;
  error?: string | undefined;
  autoFocus?: boolean;
  theme?: any;
  viewPort?: string;
  disabled?: boolean;
  mode?: string;
  isAnswered?: boolean;
  dataTestId?: string;
};

export const Date = forwardRef(
  (
    {
      value,
      onChange,
      autoFocus,
      isCreator,
      theme = {},
      viewPort,
      question,
      error,
      disabled = false,
      mode,
      isAnswered = false,
      dataTestId,
    }: DateProps,
    ref
  ) => {
    const defaultValue = question?.settings?.defaultValue;
    const includeTime = question?.settings?.includeTime;
    const questionAlignment = question?.settings?.questionAlignment;
    const minDate = getMinDate(question);
    const maxDate = getMaxDate(question);
    const format = question?.settings?.dateFormat;
    const separator = question?.settings?.separator;
    const placeholder = formatConfigs[format].placeholder(separator);
    // const placeholder = useMemo(
    //   () => getPlaceholder({ format, separator }) || "",
    //   [format, separator]
    // );

    const [timeValue, setTimeValue] = useState({
      time: "",
      meridiem: "AM",
      ...getTimeAndMeridian(value)
    });
    const [dateValue, setDateValue] = useState("");

    useImperativeHandle(
      ref,
      () => ({
        validate: () => dateValidation(value, question?.settings),
      }),
      [value, question?.settings]
    );

    useEffect(() => {
      if (!isCreator && !isAnswered && defaultValue) {
        const processedDefaultValue = processDefaultValue({
          defaultValue,
          format,
          separator,
          includeTime,
        });

        if (processedDefaultValue) {
          if (defaultValue?.date) {
            setDateValue(defaultValue?.date);
            setTimeValue({
              time: defaultValue?.time || "",
              meridiem: defaultValue?.meridiem || "AM",
            });
            onChange({
              value: processedDefaultValue?.value,
              ISOValue: processedDefaultValue?.ISOValue,
            });
          } else if (defaultValue?.value) {
            const [date] = defaultValue?.value?.split?.(" ");
            setDateValue(date);
            setTimeValue(getTimeAndMeridian(defaultValue));
            onChange({
              value: processedDefaultValue?.value,
              ISOValue: processedDefaultValue?.ISOValue,
            });
          }
        }
      }
      if (value?.value) {
        const [date, time, meridiem] = value?.value?.split(" ");
        if (includeTime) {
          setDateValue(date);
          setTimeValue({ time, meridiem });
        } else {
          setDateValue(date);
        }
      }
    }, []);

    const handleChange = ({ date, time }: any) => {
      const _date = date ?? dateValue;
      const _time = time ?? timeValue;

      let dateString = "";
      let timeString = "";
      const valueLength = format?.length + separator?.length * 2;

      if (_date?.length === valueLength) {
        dateString = _date;
      }
      if (!includeTime) {
        if (!dateString) {
          onChange({
            value: _date,
          });
          return;
        }

        const ISOValue = dayjs(
          `${dateString} 00:00 AM`,
          format + " " + "hh:mm A"
        ).format("YYYY-MM-DDTHH:mm:ssZ");
        onChange({
          value: dateString,
          ISOValue,
        });

        return;
      }

      if (_time?.time?.length === 5) {
        timeString = _time?.time;
      }

      if (!dateString && !timeString) {
        onChange({
          value: "",
          ISOValue: "",
        });
        return;
      }

      if (!dateString || !timeString) {
        onChange({
          value: `${_date} ${_time?.time} ${_time?.meridiem}`,
        });
        return;
      }

      const ISOValue = dayjs(
        `${dateString} ${timeString} ${_time?.meridiem}`,
        placeholder + " " + "hh:mm A"
      ).format("YYYY-MM-DDTHH:mm:ssZ");

      onChange({
        value: `${dateString} ${timeString} ${_time?.meridiem}`,
        ISOValue,
      });
    };

    const rowHeight = "2.65em";

    const isTimeError = includeTime && isTimeOnlyError(error);
    const dateFieldError = error && !isTimeError ? error : undefined;
    const timeFieldError = isTimeError ? error : undefined;

    const shouldConstrainDateTimeRow =
      includeTime &&
      ((viewPort === ViewPort.MOBILE &&
        (mode === Mode.CHAT || mode === Mode.CLASSIC)) ||
        (viewPort === ViewPort.DESKTOP && mode === Mode.CHAT));

    return (
      <div
        style={{
          width:
            shouldConstrainDateTimeRow
              ? "100%"
              : includeTime
                ? "max-content"
                : "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          gap: "1.5em",
          alignItems: "stretch",
          justifyContent: questionAlignment,
          ...(includeTime ? { height: rowHeight } : {}),
        }}
        className="date_input_wrapper"
        data-testid={
          dataTestId ? dataTestId + "-container" : "date-question-type-wrapper"
        }
      >
        <DateInput
          dataTestId={dataTestId}
          disabled={isCreator || disabled}
          format={format}
          separator={separator}
          value={{
            value: dateValue,
            ISOValue: value?.ISOValue,
          }}
          onChange={(e) => {
            if (isCreator) return;
            setDateValue(e?.value);
            handleChange({ date: e?.value });
          }}
          onSelect={(_value) => {
            if (isCreator) return;
            setDateValue(_value.value);
            handleChange({ date: _value?.value });
          }}
          enableCalender={question?.settings?.useDatePicker}
          autoFocus={autoFocus}
          theme={theme}
          minDate={minDate}
          maxDate={maxDate}
          style={{
            maxWidth:
              includeTime
                ? "33.0625em"
                : viewPort === ViewPort.DESKTOP && mode === Mode.CARD
                  ? "33.0625em"
                  : "100%",
            minWidth: shouldConstrainDateTimeRow ? "10em" : "13em",
            flex: shouldConstrainDateTimeRow ? "1 1 0%" : undefined,
            flexShrink: shouldConstrainDateTimeRow ? 1 : 0,
            width: includeTime ? "auto" : undefined,
            ...(includeTime
              ? {
                  height: "100%",
                  boxSizing: "border-box",
                  ...(shouldConstrainDateTimeRow ? { minWidth: 0 } : {}),
                }
              : {}),
          }}
          error={dateFieldError}
        />
        {includeTime && (
          <div
            style={{
              flexShrink: 0,
              height: "100%",
              display: "flex",
              alignItems: "stretch",
              minWidth: shouldConstrainDateTimeRow ? "13em" : 0,
            }}
          >
            <Time
              dataTestId={dataTestId}
              isCreator={isCreator}
              disabled={disabled}
              value={timeValue}
              onChange={(_value) => {
                if (isCreator) return;
                setTimeValue(_value);
                handleChange({ time: _value });
              }}
              question={question}
              theme={theme}
              error={timeFieldError}
              autoFocus={false}
              mode={mode}
              isAnswered={isAnswered}
              style={{
                containerStyle: { height: "100%", minHeight: rowHeight },
                inputStyle: {
                  width: "100%",
                  maxWidth: shouldConstrainDateTimeRow ? "5em" : "100%",
                },
              }}
            />
          </div>
        )}
      </div>
    );
  }
);
