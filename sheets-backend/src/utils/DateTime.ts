import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export class DateTimeUtils {
  // Static variable holding all acceptable date-only formats
  // Order: Most common first for better performance
  static ACCEPTABLE_FORMATS = [
    'YYYY-MM-DD', // ISO format (most common in databases/APIs)
    'DD/MM/YYYY', // European format (very common)
    'MM/DD/YYYY', // US format (very common)
    'DD-MM-YYYY', // Alternative European
    'YYYY/MM/DD', // Alternative ISO
    'MM-DD-YYYY', // Alternative US
    'DD/MM/YY', // Short year variants
    'MM/DD/YY',
    // Month name formats (date-only) - less common, so later
    'DD MMMM YYYY',
    'MMMM DD YYYY',
    'DD MMM YYYY',
    'MMM DD YYYY',
  ];

  // Static variable holding all acceptable datetime formats (24-hour with seconds)
  // Most common formats first for better performance
  static ACCEPTABLE_DATETIME_FORMATS_WITH_SECONDS = [
    // ISO formats first (most common in APIs/exports)
    'YYYY-MM-DDTHH:mm:ss',
    'YYYY-MM-DDTHH:mm:ssZ',
    'YYYY-MM-DDTHH:mm:ss+HH:mm',
    'YYYY-MM-DDTHH:mm:ss-HH:mm',
    // Space-separated ISO-like
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD HH:mm:ssZ',
    'YYYY-MM-DD HH:mm:ss+HH:mm',
    'YYYY-MM-DD HH:mm:ss-HH:mm',
    // Common date formats with time
    'DD/MM/YYYY HH:mm:ss',
    'MM/DD/YYYY HH:mm:ss',
    'DD-MM-YYYY HH:mm:ss',
    'MM-DD-YYYY HH:mm:ss',
    'YYYY/MM/DD HH:mm:ss',
    // T separator variants
    'YYYY/MM/DDTHH:mm:ss',
    'DD/MM/YYYYTHH:mm:ss',
    'MM/DD/YYYYTHH:mm:ss',
    // 12-hour format with AM/PM (with seconds)
    'DD/MM/YYYY hh:mm:ss A',
    'MM/DD/YYYY hh:mm:ss A',
    'YYYY-MM-DD hh:mm:ss A',
    'YYYY/MM/DD hh:mm:ss A',
    'DD-MM-YYYY hh:mm:ss A',
    'MM-DD-YYYY hh:mm:ss A',
    // Month name formats (full month name, with seconds)
    'DD MMMM YYYY HH:mm:ss',
    'MMMM DD YYYY HH:mm:ss',
    'DD MMM YYYY HH:mm:ss',
    'MMM DD YYYY HH:mm:ss',
    // Month name formats (abbreviated month name, with seconds, 12-hour)
    'DD MMMM YYYY hh:mm:ss A',
    'MMMM DD YYYY hh:mm:ss A',
    'DD MMM YYYY hh:mm:ss A',
    'MMM DD YYYY hh:mm:ss A',
  ];

  // Static variable holding all acceptable datetime formats (24-hour without seconds)
  // Most common formats first for better performance
  static ACCEPTABLE_DATETIME_FORMATS_WITHOUT_SECONDS = [
    // ISO formats first (most common)
    'YYYY-MM-DDTHH:mm',
    'YYYY-MM-DDTHH:mmZ',
    'YYYY-MM-DDTHH:mm+HH:mm',
    'YYYY-MM-DDTHH:mm-HH:mm',
    // Space-separated
    'YYYY-MM-DD HH:mm',
    'YYYY-MM-DD HH:mmZ',
    'YYYY-MM-DD HH:mm+HH:mm',
    'YYYY-MM-DD HH:mm-HH:mm',
    // Common date formats with time
    'DD/MM/YYYY HH:mm',
    'MM/DD/YYYY HH:mm',
    'DD-MM-YYYY HH:mm',
    'MM-DD-YYYY HH:mm',
    'YYYY/MM/DD HH:mm',
    // T separator variants
    'YYYY/MM/DDTHH:mm',
    'DD/MM/YYYYTHH:mm',
    'MM/DD/YYYYTHH:mm',
    // 12-hour format with AM/PM (without seconds)
    'DD/MM/YYYY hh:mm A',
    'MM/DD/YYYY hh:mm A',
    'YYYY-MM-DD hh:mm A',
    'YYYY/MM/DD hh:mm A',
    'DD-MM-YYYY hh:mm A',
    'MM-DD-YYYY hh:mm A',
    // Month name formats (full month name, without seconds, 24-hour)
    'DD MMMM YYYY HH:mm',
    'MMMM DD YYYY HH:mm',
    'DD MMM YYYY HH:mm',
    'MMM DD YYYY HH:mm',
    // Month name formats (abbreviated month name, without seconds, 12-hour with AM/PM)
    'DD MMMM YYYY hh:mm A',
    'MMMM DD YYYY hh:mm A',
    'DD MMM YYYY hh:mm A',
    'MMM DD YYYY hh:mm A',
  ];

  // Combined datetime formats array (with seconds first, then without seconds)
  static ACCEPTABLE_DATETIME_FORMATS = [
    ...DateTimeUtils.ACCEPTABLE_DATETIME_FORMATS_WITH_SECONDS,
    ...DateTimeUtils.ACCEPTABLE_DATETIME_FORMATS_WITHOUT_SECONDS,
  ];

  // Default timezone for dates without timezone information
  static DEFAULT_TIMEZONE = 'Asia/Kolkata';

  /**
   * Validates and converts a datetime string to ISO format
   * Tries datetime formats first, then falls back to date-only formats
   * @param date_str - The date/datetime string to validate and convert
   * @param format - Optional specific format to use
   * @param defaultTimezone - Optional timezone to use if not present in the value (defaults to Asia/Kolkata)
   * @returns ISO string format (YYYY-MM-DDTHH:mm:ssZ) or null if invalid
   */
  validate_and_convert_date(
    date_str: string,
    format?: string,
    defaultTimezone?: string,
  ): string | null {
    if (!date_str || typeof date_str !== 'string') {
      return null;
    }

    // Trim whitespace
    const trimmed = date_str.trim();
    if (!trimmed) {
      return null;
    }

    // Strip surrounding quotes (single or double) as a defensive measure
    // This handles cases where date values come with quotes from CSV import or other sources
    const cleaned = trimmed.replace(/^["']+|["']+$/g, '');
    if (!cleaned) {
      return null;
    }

    // Use provided timezone or fall back to default
    const timezoneToUse = defaultTimezone || DateTimeUtils.DEFAULT_TIMEZONE;

    // If a specific format is provided, try only that format
    if (format) {
      return this._parseWithFormat(cleaned, format, timezoneToUse);
    }

    // Early optimization: Check for ISO-like strings first (most common)
    if (cleaned.includes('T') || cleaned.match(/^\d{4}-\d{2}-\d{2}/)) {
      const isoResult = this._tryISOParse(cleaned, timezoneToUse);
      if (isoResult) {
        return isoResult;
      }
    }

    // Try datetime formats first (with time components)
    for (const current_format of DateTimeUtils.ACCEPTABLE_DATETIME_FORMATS) {
      const result = this._parseWithFormat(
        cleaned,
        current_format,
        timezoneToUse,
      );
      if (result) {
        return result;
      }
    }

    // Fall back to date-only formats
    for (const current_format of DateTimeUtils.ACCEPTABLE_FORMATS) {
      const result = this._parseWithFormat(
        cleaned,
        current_format,
        timezoneToUse,
      );
      if (result) {
        return result;
      }
    }

    return null; // Return null if no valid format is found
  }

  /**
   * Try to parse as ISO string (optimization for common case)
   * @param date_str - The date string to parse
   * @param defaultTimezone - Timezone to use if not present in value
   * @returns ISO string or null if invalid
   */
  private _tryISOParse(
    date_str: string,
    defaultTimezone: string,
  ): string | null {
    // Check if it has timezone info in the value (priority)
    const hasTZInValue =
      date_str.includes('Z') || date_str.match(/[+-]\d{2}:\d{2}$/);

    const parsed = dayjs(date_str);
    if (!parsed.isValid()) {
      return null;
    }

    // Priority: If timezone is in value, use it; otherwise use default
    if (hasTZInValue) {
      // Timezone present in value - parse and respect it, then convert to UTC
      return parsed.utc().toISOString();
    } else {
      // No timezone in value - use default timezone, then convert to UTC
      return parsed.tz(defaultTimezone, true).utc().toISOString();
    }
  }

  /**
   * Internal method to parse a date/datetime string with a specific format
   * Handles timezone conversion appropriately
   * Priority: Timezone in value > Default timezone
   * @param date_str - The date/datetime string to parse
   * @param format - The format to use for parsing
   * @param defaultTimezone - Timezone to use if not present in value
   * @returns ISO string format (YYYY-MM-DDTHH:mm:ssZ) or null if invalid
   */
  private _parseWithFormat(
    date_str: string,
    format: string,
    defaultTimezone: string,
  ): string | null {
    // Check if format includes timezone information
    const formatHasTimezone =
      format.includes('Z') ||
      format.includes('+HH:mm') ||
      format.includes('-HH:mm');

    // Check if value itself has timezone information (this takes priority)
    const valueHasTimezone =
      date_str.includes('Z') || date_str.match(/[+-]\d{2}:\d{2}$/);

    // Try parsing with the format using customParseFormat
    const parsed_date = dayjs(date_str, format, true); // Strict parsing

    if (!parsed_date.isValid()) {
      return null;
    }

    // Handle timezone conversion with priority
    // Priority 1: If timezone is present in the VALUE, use it
    if (valueHasTimezone || formatHasTimezone) {
      // Timezone present in value or format - parse and respect it, then convert to UTC
      return parsed_date.utc().toISOString();
    } else {
      // Priority 2: No timezone in value - use default timezone, then convert to UTC
      // Use tz(timezone, true) to keep the same time but interpret it in the given timezone
      const localDate = parsed_date.tz(defaultTimezone, true);
      return localDate.utc().toISOString();
    }
  }
}
