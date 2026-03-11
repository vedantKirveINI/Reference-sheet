import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { formatConfigs } from "@oute/oute-ds.common.core.utils";
import { VALIDATION_MESSAGE } from "../constant/validationMessages";

dayjs.extend(customParseFormat);

/** Get YYYY-MM-DD from an ISO date string for calendar-day-only comparison (avoids timezone/time-of-day bugs). */
function getDatePart(isoString: string | undefined): string | undefined {
  if (!isoString || typeof isoString !== "string") return undefined;
  const part = isoString.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(part) ? part : undefined;
}

export const dateValidation = (answer, node) => {
  let error = "";
  const answerObj = answer[node?._id];
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

    // Normalize today to start of day (00:00:00.000) to ensure proper comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDatePart =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    // Create end of today (start of tomorrow) for future date comparison
    const todayEnd = new Date(today);
    todayEnd.setDate(todayEnd.getDate() + 1);

    //if allowpast false but has start date (compare calendar days to avoid timezone issues)
    if (!allowPastDate && startDate?.value?.length > 0) {
      const answerDatePart = getDatePart(answerObj["response"]?.ISOValue);
      const startDatePart = getDatePart(startDate?.ISOValue);

      if (startDatePart != null && todayDatePart < startDatePart) {
        if (
          answerDatePart != null &&
          answerDatePart < startDatePart
        ) {
          error = VALIDATION_MESSAGE.DATE.MIN_DATE(startDate?.value);
          return error;
        }
      }

      if (startDatePart != null && todayDatePart >= startDatePart) {
        if (answerDatePart != null && answerDatePart < todayDatePart) {
          error = VALIDATION_MESSAGE.DATE.PAST_DATE;
          return error;
        }
      }
    }

    //if allow future is false but has end date (compare calendar days)
    if (!allowFutureDate && endDate?.value?.length > 0) {
      const answerDatePart = getDatePart(answerObj["response"]?.ISOValue);
      const endDatePart = getDatePart(endDate?.ISOValue);

      if (endDatePart != null && todayDatePart <= endDatePart) {
        // Still within range: reject if answer is after today (future date)
        if (answerDatePart != null && answerDatePart > todayDatePart) {
          error = VALIDATION_MESSAGE.DATE.FUTURE_DATE;
          return error;
        }
      }

      if (endDatePart != null && todayDatePart > endDatePart) {
        // Past end date: reject if answer is after end
        if (
          answerDatePart != null &&
          answerDatePart > endDatePart
        ) {
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
      // Compare against start of tomorrow to accept any time on today
      if (new Date(answerObj["response"]?.ISOValue) >= todayEnd) {
        error = VALIDATION_MESSAGE.DATE.FUTURE_DATE;
        return error;
      }
    }

    //if allowpast is true and have start date (compare calendar days only to avoid timezone/time-of-day issues)
    if (startDate?.value && allowPastDate) {
      const answerDatePart = getDatePart(answerObj["response"]?.ISOValue);
      const startDatePart = getDatePart(startDate?.ISOValue);
      if (
        answerDatePart != null &&
        startDatePart != null &&
        answerDatePart < startDatePart
      ) {
        error = VALIDATION_MESSAGE.DATE.MIN_DATE(startDate?.value);
        return error;
      }
    }

    //if allowfuture is true and have end date
    // Compare calendar days only to avoid timezone/time-of-day issues
    if (endDate?.value && allowFutureDate) {
      const answerDatePart = getDatePart(answerObj["response"]?.ISOValue);
      const endDatePart = getDatePart(endDate?.ISOValue);
      if (
        answerDatePart != null &&
        endDatePart != null &&
        answerDatePart > endDatePart
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
  return error;
};
