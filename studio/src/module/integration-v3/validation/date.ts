import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { formatConfigs } from "@oute/oute-ds.common.core.utils";
import { VALIDATION_MESSAGE } from "../utils/constants";

dayjs.extend(customParseFormat);

export const dateValidation = (answer, node) => {
  let error = "";
  const answerObj = answer[node?._id];
  try {
    if (answerObj === undefined || !answerObj?.response?.value) {
      if (node?.config?.settings?.required) {
        error = VALIDATION_MESSAGE.COMMON.REQUIRED;
      }
    } else {
      if (answerObj["response"] === undefined) {
        answerObj["response"] = "";
      }

      // if (answerObj["response"]?.value?.length >= 10) {
      //   error = VALIDATION_MESSAGE.DATE.INVALID_DATE;
      //   return error;
      // }

      const dateValue = answerObj["response"]?.value;
      const format = node?.config?.settings?.dateFormat;
      const separator = node?.config?.settings?.separator;
      const includeTime = node?.config?.settings?.includeTime;
      // let verifyAge = node?.config?.settings?.verifyAge;
      const allowPastDate = node?.config?.settings?.allowPastDate;
      const allowFutureDate = node?.config?.settings?.allowFutureDate;
      const startDate = node?.config?.settings?.startDate;
      const endDate = node?.config?.settings?.endDate;

      let settingsDateFormat = formatConfigs[format].placeholder(separator);
      const timeFormat = " hh:mm A";
      settingsDateFormat = includeTime
        ? settingsDateFormat + timeFormat
        : settingsDateFormat;

      // First validate the date part
      const dateOnlyFormat = formatConfigs[format].placeholder(separator);
      try {
        const dateOnlyValue = includeTime
          ? dateValue.split(" ")[0] // Extract date part before time
          : dateValue;

        const isDateOnlyValid = dayjs(
          dateOnlyValue,
          dateOnlyFormat,
          true
        ).isValid();

        if (!isDateOnlyValid) {
          return VALIDATION_MESSAGE.DATE.INVALID_DATE;
        }
      } catch (error) {
      }

      // If time is included, validate time separately
      if (includeTime) {
        try {
          const time = dateValue?.split?.(" ")?.[1]?.trim?.();
          if (!time) {
            return VALIDATION_MESSAGE.TIME.TIME_REQUIRED;
          }
          const timeOnlyValue = dateValue.split(" ").slice(1).join(" "); // Extract time part
          const isTimeValid = dayjs(
            timeOnlyValue,
            timeFormat.trim(),
            true
          ).isValid();

          if (!isTimeValid) {
            return VALIDATION_MESSAGE.TIME.INVALID_TIME;
          }
        } catch (error) {
        }
      }

      // Finally validate the complete date+time string
      const isDateValid = dayjs(dateValue, settingsDateFormat, true).isValid();
      if (!isDateValid) {
        return VALIDATION_MESSAGE.DATE.INVALID_DATE;
      }

      const today = new Date();
      today.setSeconds(0, 0);

      //if allowpast ifase but has start date
      if (!allowPastDate && startDate?.value?.length > 0) {
        const start = new Date(startDate?.ISOValue);
        if (today < start) {
          if (new Date(answerObj["response"]?.ISOValue) < start) {
            error = VALIDATION_MESSAGE.DATE.MIN_DATE(startDate?.value);
            return error;
          }
        }

        if (today > start) {
          if (new Date(answerObj["response"]?.ISOValue) < today) {
            error = VALIDATION_MESSAGE.DATE.PAST_DATE;
            return error;
          }
        }
      }

      //if allow future is false but has end date
      if (!allowFutureDate && endDate?.value?.length > 0) {
        const end = new Date(endDate?.ISOValue);
        if (today < end) {
          if (new Date(answerObj["response"]?.ISOValue) > today) {
            error = VALIDATION_MESSAGE.DATE.FUTURE_DATE;
            return error;
          }
        }

        if (today > end) {
          if (new Date(answerObj["response"]?.ISOValue) > end) {
            error = VALIDATION_MESSAGE.DATE.MAX_DATE(endDate?.value);
            return error;
          }
        }
      }

      //if allowPast is false and dont have start date
      if (!allowPastDate && !startDate?.value) {
        if (new Date(answerObj["response"]?.ISOValue) < today) {
          error = VALIDATION_MESSAGE.DATE.PAST_DATE;
          return error;
        }
      }

      //if allowFuture is false and dont have end date
      if (!allowFutureDate && !endDate?.value) {
        if (new Date(answerObj["response"]?.ISOValue) > today) {
          error = VALIDATION_MESSAGE.DATE.FUTURE_DATE;
          return error;
        }
      }

      //if allowpast is true and have start date
      if (startDate?.value && allowPastDate) {
        if (
          new Date(answerObj["response"]?.ISOValue) <
          new Date(startDate?.ISOValue)
        ) {
          error = VALIDATION_MESSAGE.DATE.MIN_DATE(startDate?.value);
          return error;
        }
      }

      //if allowfuture is true and have end date
      if (endDate?.value && allowFutureDate) {
        if (
          new Date(answerObj["response"]?.ISOValue) >
          new Date(endDate?.ISOValue)
        ) {
          error = VALIDATION_MESSAGE.DATE.MAX_DATE(endDate?.value);
          return error;
        }
      }

      // if (verifyAge) {
      //   const age =
      //     new Date().getFullYear() -
      //     new Date(answerObj["response"]).getFullYear();
      //   if (age < verifyAge) {
      //     error = `Age should be greator than ${verifyAge}`;
      //   }
      // }
    }
  } catch (error) {
  }
  return error;
};
