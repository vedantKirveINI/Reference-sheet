import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

/**
 * The function uses the dayjs library to convert the given timestamp into a human-readable string
 * representing the time elapsed since the timestamp.
 * It does this by updating the locale of dayjs to customize the relative time strings used in the conversion.
 * Finally, it returns the converted timestamp as a string.
 *
 * @param {string | Date} timestamp - The timestamp to convert.
 * @param {string} dateformat - The date format to use. Defaults to "YYYY-MM-DDTHH:mm:ss.SSSZ"
 * @returns {string}
 */
export const convertTimestampToAgo = (
  timestamp,
  dateformat = "YYYY-MM-DDTHH:mm:ss.SSSZ"
) => {
  dayjs.updateLocale("en", {
    relativeTime: {
      future: "in %s",
      past: "%s ago",
      s: "few seconds",
      ss: "%d seconds",
      m: "1 minute",
      mm: "%d minutes",
      h: "1 hour",
      hh: "%d hours",
      d: "1 day",
      dd: "%d days",
      M: "1 month",
      MM: "%d months",
      y: "1 year",
      yy: "%d years",
    },
  });

  return dayjs(timestamp, dateformat).fromNow();
};

/**
 *
 * @param {string} outputFormat The format in which timestamp should be formatted.
 * @param {Date|string} timestamp The timestamp to be formatted.
 * @param {string} inputFormat The format of the timestamp.
 * @returns {string}
 */
export const formatDate = (
  outputFormat = "DD-MM-YY HH:mm",
  timestamp = new Date(),
  inputFormat = ""
) => {
  return dayjs(timestamp, inputFormat).format(outputFormat);
};
