const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const formatOrdinal = (n) => {
  const num = parseInt(n, 10);
  if (isNaN(num)) return n;
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
};

const formatWeekdays = (weekdays) => {
  if (!weekdays || weekdays.length === 0) return '';
  if (weekdays.length === 7) return 'every day';
  if (weekdays.length === 5 && 
      weekdays.includes(1) && weekdays.includes(2) && 
      weekdays.includes(3) && weekdays.includes(4) && weekdays.includes(5) &&
      !weekdays.includes(0) && !weekdays.includes(6)) {
    return 'weekdays';
  }
  if (weekdays.length === 2 && weekdays.includes(0) && weekdays.includes(6)) {
    return 'weekends';
  }
  const sortedDays = [...weekdays].sort((a, b) => a - b);
  return sortedDays.map(d => DAY_NAMES_SHORT[d]).join(', ');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return dateStr;
  }
};

export const generateScheduleSummary = (config) => {
  if (!config || !config.scheduleType) return '';

  const { scheduleType, interval, time, weekdays, dayOfMonth, customDates, onceDate, timezone } = config;
  const formattedTime = formatTime(time);
  const timezoneNote = timezone ? ` (${timezone})` : '';

  switch (scheduleType) {
    case 'interval': {
      if (!interval) return 'At regular intervals';
      const { value, unit } = interval;
      if (value === 1) {
        return `Every ${unit === 'hours' ? 'hour' : 'minute'}`;
      }
      return `Every ${value} ${unit}`;
    }

    case 'daily': {
      if (!formattedTime) return 'Daily';
      return `Daily at ${formattedTime}${timezoneNote}`;
    }

    case 'weekly': {
      const daysText = formatWeekdays(weekdays);
      if (!daysText) return 'Weekly';
      if (!formattedTime) return `Weekly on ${daysText}`;
      return `${daysText === 'weekdays' ? 'Weekdays' : daysText === 'weekends' ? 'Weekends' : `Every ${daysText}`} at ${formattedTime}${timezoneNote}`;
    }

    case 'monthly': {
      const dayText = dayOfMonth ? formatOrdinal(dayOfMonth) : '1st';
      if (!formattedTime) return `Monthly on the ${dayText}`;
      return `Monthly on the ${dayText} at ${formattedTime}${timezoneNote}`;
    }

    case 'once': {
      if (!onceDate) return 'One time';
      const dateText = formatDate(onceDate);
      if (!formattedTime) return `Once on ${dateText}`;
      return `Once on ${dateText} at ${formattedTime}${timezoneNote}`;
    }

    case 'custom': {
      if (!customDates || customDates.length === 0) return 'Custom schedule';
      if (customDates.length === 1) {
        return `On ${formatDate(customDates[0])}${formattedTime ? ` at ${formattedTime}` : ''}`;
      }
      return `On ${customDates.length} specific dates${formattedTime ? ` at ${formattedTime}` : ''}`;
    }

    default:
      return 'Custom schedule';
  }
};

export const useScheduleSummary = (config) => {
  return generateScheduleSummary(config);
};

export default useScheduleSummary;
