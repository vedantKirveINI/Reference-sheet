import { useMemo } from 'react';
import { SCHEDULE_TYPES, WEEKDAYS, COMMON_TIMEZONES } from '../constants';
import dayjs from 'dayjs';

export function useScheduleSummary(config) {
  return useMemo(() => generateScheduleSummary(config), [
    config.scheduleType,
    config.interval?.value,
    config.interval?.unit,
    config.time,
    config.timezone,
    JSON.stringify(config.weekdays),
    config.dayOfMonth,
    JSON.stringify(config.customDates),
    config.onceDate,
    config.advanced?.startDate,
    config.advanced?.endDate,
    config.advanced?.businessHoursOnly,
  ]);
}

export function generateScheduleSummary(config) {
  const {
    scheduleType,
    interval,
    time,
    timezone,
    weekdays,
    dayOfMonth,
    customDates,
    onceDate,
    advanced,
  } = config;

  const timezoneLabel = getTimezoneShortLabel(timezone);
  const timeFormatted = formatTime(time);
  
  let summary = '';

  switch (scheduleType) {
    case SCHEDULE_TYPES.INTERVAL:
      summary = generateIntervalSummary(interval);
      break;
    case SCHEDULE_TYPES.DAILY:
      summary = `Runs daily at ${timeFormatted} (${timezoneLabel})`;
      break;
    case SCHEDULE_TYPES.WEEKLY:
      summary = generateWeeklySummary(weekdays, timeFormatted, timezoneLabel);
      break;
    case SCHEDULE_TYPES.MONTHLY:
      summary = generateMonthlySummary(dayOfMonth, timeFormatted, timezoneLabel);
      break;
    case SCHEDULE_TYPES.ONCE:
      summary = generateOnceSummary(onceDate, timeFormatted, timezoneLabel);
      break;
    case SCHEDULE_TYPES.CUSTOM:
      summary = generateCustomSummary(customDates, timeFormatted, timezoneLabel);
      break;
    default:
      summary = 'No schedule configured';
  }

  if (advanced?.businessHoursOnly && 
      scheduleType !== SCHEDULE_TYPES.WEEKLY && 
      scheduleType !== SCHEDULE_TYPES.ONCE) {
    summary += ', weekdays only';
  }

  if (advanced?.startDate || advanced?.endDate) {
    summary += generateDateRangeSuffix(advanced.startDate, advanced.endDate);
  }

  return summary;
}

function generateIntervalSummary(interval) {
  const { value, unit } = interval || { value: 15, unit: 'minutes' };
  const unitLabel = value === 1 ? unit.slice(0, -1) : unit;
  return `Runs every ${value} ${unitLabel}`;
}

function generateWeeklySummary(weekdays, timeFormatted, timezoneLabel) {
  if (!weekdays || weekdays.length === 0) {
    return 'No days selected';
  }

  const sortedDays = [...weekdays].sort((a, b) => a - b);
  
  if (sortedDays.length === 7) {
    return `Runs every day at ${timeFormatted} (${timezoneLabel})`;
  }

  if (arraysEqual(sortedDays, [1, 2, 3, 4, 5])) {
    return `Runs every weekday at ${timeFormatted} (${timezoneLabel})`;
  }

  if (arraysEqual(sortedDays, [0, 6])) {
    return `Runs every weekend at ${timeFormatted} (${timezoneLabel})`;
  }

  const dayNames = sortedDays.map(d => WEEKDAYS.find(w => w.id === d)?.fullLabel);
  const formattedDays = formatList(dayNames);
  
  return `Runs every ${formattedDays} at ${timeFormatted} (${timezoneLabel})`;
}

function generateMonthlySummary(dayOfMonth, timeFormatted, timezoneLabel) {
  const ordinal = getOrdinalSuffix(dayOfMonth || 1);
  return `Runs on the ${dayOfMonth}${ordinal} of every month at ${timeFormatted} (${timezoneLabel})`;
}

function generateOnceSummary(onceDate, timeFormatted, timezoneLabel) {
  if (!onceDate) {
    return 'Select a date for the one-time run';
  }
  const formattedDate = dayjs(onceDate).format('MMMM D, YYYY');
  return `Runs once on ${formattedDate} at ${timeFormatted} (${timezoneLabel})`;
}

function generateCustomSummary(customDates, timeFormatted, timezoneLabel) {
  if (!customDates || customDates.length === 0) {
    return 'No dates selected';
  }

  const count = customDates.length;
  if (count === 1) {
    const formattedDate = dayjs(customDates[0]).format('MMMM D, YYYY');
    return `Runs on ${formattedDate} at ${timeFormatted} (${timezoneLabel})`;
  }

  return `Runs on ${count} selected dates at ${timeFormatted} (${timezoneLabel})`;
}

function generateDateRangeSuffix(startDate, endDate) {
  if (startDate && endDate) {
    const start = dayjs(startDate).format('MMM D, YYYY');
    const end = dayjs(endDate).format('MMM D, YYYY');
    return ` (from ${start} to ${end})`;
  }
  if (startDate) {
    const start = dayjs(startDate).format('MMM D, YYYY');
    return ` (starting ${start})`;
  }
  if (endDate) {
    const end = dayjs(endDate).format('MMM D, YYYY');
    return ` (until ${end})`;
  }
  return '';
}

function formatTime(time) {
  if (!time) return '9:00 AM';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getTimezoneShortLabel(timezone) {
  const found = COMMON_TIMEZONES.find(tz => tz.value === timezone);
  if (found) {
    const match = found.label.match(/\(([^)]+)\)/);
    return match ? match[1] : timezone;
  }
  return timezone || 'UTC';
}

function getOrdinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
}

function formatList(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  
  const last = items[items.length - 1];
  const rest = items.slice(0, -1);
  return `${rest.join(', ')}, and ${last}`;
}

export default useScheduleSummary;
