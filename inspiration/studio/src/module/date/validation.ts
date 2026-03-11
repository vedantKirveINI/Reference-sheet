import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { formatConfigs } from "@oute/oute-ds.common.core.utils";

dayjs.extend(customParseFormat);

export const dateValidation = (value, settings) => {
  let error = "";

  if (value === undefined || !value.value) {
    if (settings?.required) {
      error = "This field is required";
    }
  } else {
    if (value === undefined) {
      value = "";
    }

    if (value?.value?.length !== 10) {
      error = "Invalid Date";
      return error;
    }

    const dateValue = value?.value;
    const format = settings?.dateFormat;
    const separator = settings?.separator;

    // let verifyAge = settings?.verifyAge;
    const allowPastDate = settings?.allowPastDate;
    const allowFutureDate = settings?.allowFutureDate;
    const startDate = settings?.startDate;
    const endDate = settings?.endDate;

    const settingsDateFormat = formatConfigs[format].placeholder(separator);

    const isDateValid = dayjs(dateValue, settingsDateFormat, true).isValid();
    if (!isDateValid) {
      return "Invalid Date";
    }

    const today = new Date();
    today.setSeconds(0, 0);

    //if allowpast ifase but has start date
    if (!allowPastDate && startDate?.value?.length > 0) {
      const start = new Date(startDate?.ISOValue);
      if (today < start) {
        if (new Date(value?.ISOValue) < start) {
          error = `Date should be greater than or equal to ${startDate?.value}`;
          return error;
        }
      }

      if (today > start) {
        if (new Date(value?.ISOValue) < today) {
          error = "Date should not be past date";
          return error;
        }
      }
    }

    //if allow future is false but has end date
    if (!allowFutureDate && endDate?.value?.length > 0) {
      const end = new Date(endDate?.ISOValue);
      if (today < end) {
        if (new Date(value?.ISOValue) > today) {
          error = "Date should not be future date";
          return error;
        }
      }

      if (today > end) {
        if (new Date(value?.ISOValue) > end) {
          error = `Date should be less than or equal to ${endDate?.value}`;
          return error;
        }
      }
    }

    //if allowPast is false and dont have start date
    if (!allowPastDate && !startDate?.value) {
      if (new Date(value?.ISOValue) < today) {
        error = "Date should not be past date";
        return error;
      }
    }

    //if allowFuture is false and dont have end date
    if (!allowFutureDate && !endDate?.value) {
      if (new Date(value?.ISOValue) > today) {
        error = "Date should not be future date";
        return error;
      }
    }

    //if allowpast is true and have start date
    if (startDate?.value && allowPastDate) {
      if (new Date(value?.ISOValue) < new Date(startDate?.ISOValue)) {
        error = `Date should be greater than or equal to ${startDate?.value}`;
        return error;
      }
    }

    //if allowfuture is true and have end date
    if (endDate?.value && allowFutureDate) {
      if (new Date(value?.ISOValue) > new Date(endDate?.ISOValue)) {
        error = `Date should be less than or equal to ${endDate?.value}`;
        return error;
      }
    }
  }
  return error;
};
