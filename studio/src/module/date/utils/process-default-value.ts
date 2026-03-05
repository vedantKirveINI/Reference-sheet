import { computeISOValueFromDate } from "@oute/oute-ds.common.core.utils";

interface DefaultValue {
  date: string;
  time: string;
  meridiem: string;
  value?: string;
  ISOValue?: string;
}

export type ProcessDefaultValueParams = {
  defaultValue: DefaultValue;
  format: string;
  separator: string;
  includeTime: boolean;
};

export const processDefaultValue = ({
  defaultValue,
  format,
  separator,
  includeTime,
}: ProcessDefaultValueParams): {
  value: string;
  ISOValue: string;
} | null => {
  if (defaultValue?.date) {
    const ISOValue = computeISOValueFromDate({
      dateValue: defaultValue?.date,
      format: format as any,
      separator: separator as any,
      timeValue: defaultValue?.time || undefined,
      meridiem: defaultValue?.meridiem || undefined,
    });

    const value = includeTime
      ? `${defaultValue?.date} ${defaultValue?.time} ${defaultValue?.meridiem}`
      : defaultValue?.date;

    return {
      value,
      ISOValue,
    };
  }

  // To support the old value format
  if (defaultValue?.value) {
    return {
      value: defaultValue?.value,
      ISOValue: defaultValue?.ISOValue || "",
    };
  }

  return null;
};
