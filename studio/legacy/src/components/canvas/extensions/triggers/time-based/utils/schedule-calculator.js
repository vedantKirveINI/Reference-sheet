import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { SCHEDULE_TYPES } from '../constants';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export function calculateNextRuns(config, count = 5) {
  const { scheduleType, timezone: tz = 'UTC' } = config;
  const now = dayjs().tz(tz);
  const runs = [];

  switch (scheduleType) {
    case SCHEDULE_TYPES.INTERVAL:
      return calculateIntervalRuns(config, now, count);
    case SCHEDULE_TYPES.DAILY:
      return calculateDailyRuns(config, now, count);
    case SCHEDULE_TYPES.WEEKLY:
      return calculateWeeklyRuns(config, now, count);
    case SCHEDULE_TYPES.MONTHLY:
      return calculateMonthlyRuns(config, now, count);
    case SCHEDULE_TYPES.ONCE:
      return calculateOnceRun(config, now);
    case SCHEDULE_TYPES.CUSTOM:
      return calculateCustomRuns(config, now, count);
    default:
      return runs;
  }
}

function calculateIntervalRuns(config, now, count) {
  const { interval, advanced } = config;
  const { value, unit } = interval || { value: 15, unit: 'minutes' };
  const runs = [];
  
  let nextRun = now.add(value, unit);
  
  if (advanced?.startDate && dayjs(advanced.startDate).isAfter(now)) {
    nextRun = dayjs(advanced.startDate).tz(config.timezone);
  }

  let iterations = 0;
  const maxIterations = count * 10;

  while (runs.length < count && iterations < maxIterations) {
    iterations++;
    
    if (advanced?.endDate && nextRun.isAfter(dayjs(advanced.endDate))) {
      break;
    }
    
    if (advanced?.businessHoursOnly && !isBusinessDay(nextRun)) {
      nextRun = skipToNextBusinessDay(nextRun, true);
      continue;
    }
    
    runs.push(nextRun.toISOString());
    nextRun = nextRun.add(value, unit);
  }

  return runs;
}

function calculateDailyRuns(config, now, count) {
  const { time, timezone: tz, advanced } = config;
  const [hours, minutes] = (time || '09:00').split(':').map(Number);
  const runs = [];

  let nextRun = now.hour(hours).minute(minutes).second(0);
  
  if (nextRun.isSameOrBefore(now)) {
    nextRun = nextRun.add(1, 'day');
  }

  if (advanced?.startDate && dayjs(advanced.startDate).isAfter(nextRun)) {
    nextRun = dayjs(advanced.startDate).tz(tz).hour(hours).minute(minutes).second(0);
  }

  let iterations = 0;
  const maxIterations = count * 10;

  while (runs.length < count && iterations < maxIterations) {
    iterations++;
    
    if (advanced?.endDate && nextRun.isAfter(dayjs(advanced.endDate))) {
      break;
    }

    if (advanced?.businessHoursOnly && !isBusinessDay(nextRun)) {
      nextRun = nextRun.add(1, 'day');
      continue;
    }

    runs.push(nextRun.toISOString());
    nextRun = nextRun.add(1, 'day');
  }

  return runs;
}

function calculateWeeklyRuns(config, now, count) {
  const { time, timezone: tz, weekdays = [], advanced } = config;
  const [hours, minutes] = (time || '09:00').split(':').map(Number);
  const runs = [];

  if (weekdays.length === 0) return runs;

  let effectiveWeekdays = [...weekdays].sort((a, b) => a - b);
  
  if (advanced?.businessHoursOnly) {
    effectiveWeekdays = effectiveWeekdays.filter(day => day !== 0 && day !== 6);
    if (effectiveWeekdays.length === 0) return runs;
  }

  let current = now.hour(hours).minute(minutes).second(0);

  if (advanced?.startDate && dayjs(advanced.startDate).isAfter(current)) {
    current = dayjs(advanced.startDate).tz(tz).hour(hours).minute(minutes).second(0);
  }

  let iterations = 0;
  const maxIterations = count * 14;

  while (runs.length < count && iterations < maxIterations) {
    iterations++;
    
    if (effectiveWeekdays.includes(current.day())) {
      if (current.isAfter(now)) {
        if (advanced?.endDate && current.isAfter(dayjs(advanced.endDate))) {
          break;
        }
        runs.push(current.toISOString());
      }
    }
    
    current = current.add(1, 'day');
  }

  return runs;
}

function calculateMonthlyRuns(config, now, count) {
  const { time, timezone: tz, dayOfMonth = 1, advanced } = config;
  const [hours, minutes] = (time || '09:00').split(':').map(Number);
  const runs = [];

  let nextRun = now.date(Math.min(dayOfMonth, now.daysInMonth())).hour(hours).minute(minutes).second(0);

  if (nextRun.isSameOrBefore(now)) {
    let nextMonth = nextRun.add(1, 'month');
    nextRun = nextMonth.date(Math.min(dayOfMonth, nextMonth.daysInMonth())).hour(hours).minute(minutes).second(0);
  }

  if (advanced?.startDate && dayjs(advanced.startDate).isAfter(nextRun)) {
    nextRun = dayjs(advanced.startDate).tz(tz);
    nextRun = nextRun.date(Math.min(dayOfMonth, nextRun.daysInMonth())).hour(hours).minute(minutes).second(0);
    if (nextRun.isSameOrBefore(dayjs(advanced.startDate))) {
      let nextMonth = nextRun.add(1, 'month');
      nextRun = nextMonth.date(Math.min(dayOfMonth, nextMonth.daysInMonth())).hour(hours).minute(minutes).second(0);
    }
  }

  let iterations = 0;
  const maxIterations = count * 15;

  while (runs.length < count && iterations < maxIterations) {
    iterations++;
    
    if (advanced?.endDate && nextRun.isAfter(dayjs(advanced.endDate))) {
      break;
    }

    let runToAdd = nextRun;
    if (advanced?.businessHoursOnly && !isBusinessDay(nextRun)) {
      runToAdd = skipToNextBusinessDay(nextRun, true);
    }

    runs.push(runToAdd.toISOString());
    
    let nextMonth = nextRun.add(1, 'month');
    nextRun = nextMonth.date(Math.min(dayOfMonth, nextMonth.daysInMonth())).hour(hours).minute(minutes).second(0);
  }

  return runs;
}

function calculateOnceRun(config, now) {
  const { onceDate, time, timezone: tz } = config;
  
  if (!onceDate) return [];

  const [hours, minutes] = (time || '09:00').split(':').map(Number);
  const runDate = dayjs(onceDate).tz(tz).hour(hours).minute(minutes).second(0);

  if (runDate.isAfter(now)) {
    return [runDate.toISOString()];
  }

  return [];
}

function calculateCustomRuns(config, now, count) {
  const { customDates = [], time, timezone: tz, advanced } = config;
  const [hours, minutes] = (time || '09:00').split(':').map(Number);

  const futureDates = customDates
    .map(date => dayjs(date).tz(tz).hour(hours).minute(minutes).second(0))
    .filter(date => date.isAfter(now))
    .filter(date => {
      if (advanced?.endDate && date.isAfter(dayjs(advanced.endDate))) {
        return false;
      }
      if (advanced?.businessHoursOnly && (date.day() === 0 || date.day() === 6)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.valueOf() - b.valueOf())
    .slice(0, count)
    .map(date => date.toISOString());

  return futureDates;
}

function skipToNextBusinessDay(date, preserveTime = true) {
  let result = date;
  const originalHour = result.hour();
  const originalMinute = result.minute();
  
  while (result.day() === 0 || result.day() === 6) {
    result = result.add(1, 'day');
  }
  
  if (preserveTime) {
    result = result.hour(originalHour).minute(originalMinute).second(0);
  }
  
  return result;
}

function isBusinessDay(date) {
  const day = date.day();
  return day !== 0 && day !== 6;
}

export function formatRunDate(isoString, userTimezone) {
  const date = dayjs(isoString).tz(userTimezone);
  return {
    full: date.format('ddd, MMM D [at] h:mm A'),
    date: date.format('MMM D, YYYY'),
    time: date.format('h:mm A'),
    day: date.format('dddd'),
    relative: getRelativeDay(date),
  };
}

function getRelativeDay(date) {
  const today = dayjs().startOf('day');
  const targetDay = date.startOf('day');
  const diff = targetDay.diff(today, 'day');

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 7) return date.format('dddd');
  return date.format('MMM D');
}
