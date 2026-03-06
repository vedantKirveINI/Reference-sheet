import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export type DateFormat = "DDMMYYYY" | "MMDDYYYY" | "YYYYMMDD";

export type DateFormatSeparator = "/" | "-" | "." | "," | " ";

export type FormattedDateString<S extends DateFormatSeparator> =
  | `MM${S}DD${S}YYYY`
  | `DD${S}MM${S}YYYY`
  | `YYYY${S}MM${S}DD`;

interface FormatConfig {
  placeholder: (
    separator: DateFormatSeparator
  ) => FormattedDateString<DateFormatSeparator>;
  mask: (separator: DateFormatSeparator) => string;
}

export const formatConfigs: Record<DateFormat, FormatConfig> = {
  YYYYMMDD: {
    placeholder: (separator) => `YYYY${separator}MM${separator}DD`,
    mask: (separator) => `9999${separator}99${separator}99`,
  },
  MMDDYYYY: {
    placeholder: (separator) => `MM${separator}DD${separator}YYYY`,
    mask: (separator) => `99${separator}99${separator}9999`,
  },
  DDMMYYYY: {
    placeholder: (separator) => `DD${separator}MM${separator}YYYY`,
    mask: (separator) => `99${separator}99${separator}9999`,
  },
};

interface GetConfigParams {
  format: DateFormat;
  separator: DateFormatSeparator;
}

export const getPlaceholder = ({
  format,
  separator,
}: GetConfigParams): FormattedDateString<DateFormatSeparator> => {
  return formatConfigs[format].placeholder(separator);
};

export const getMask = ({ format, separator }: GetConfigParams): string => {
  return formatConfigs[format].mask(separator);
};

export const computeISOValueFromDate = ({
  dateValue,
  format,
  separator,
  timeValue,
  meridiem,
}: {
  dateValue: string;
  format: DateFormat;
  separator: DateFormatSeparator;
  timeValue?: string;
  meridiem?: string;
}): string => {
  if (!dateValue || !format || !separator) {
    return "";
  }

  const placeholder = getPlaceholder({
    format: format as DateFormat,
    separator: separator as DateFormatSeparator,
  });
  try {
    const parsedDate = dayjs(dateValue, placeholder, true);
    if (parsedDate.isValid()) {
      let hours = 0;
      let minutes = 0;

      // If timeValue and meridiem are provided, use them; otherwise use current time
      if (timeValue && timeValue.length === 5 && meridiem) {
        // Parse the time value (format: "hh:mm")
        const [hoursStr, minutesStr] = timeValue.split(":");
        hours = parseInt(hoursStr, 10);
        minutes = parseInt(minutesStr, 10);

        // Convert to 24-hour format using meridiem
        if (meridiem === "PM" && hours !== 12) {
          hours = hours + 12;
        } else if (meridiem === "AM" && hours === 12) {
          hours = 0; // Midnight case (12 AM is 00:00 in 24-hour format)
        }
      } else {
        // Use current time if timeValue/meridiem not provided
        const currentTime = dayjs();
        hours = currentTime.hour();
        minutes = currentTime.minute();
      }

      const newDateWithTime = parsedDate.hour(hours).minute(minutes);
      return newDateWithTime.toISOString();
    }
  } catch (error) {
    return "";
  }
  return "";
};
