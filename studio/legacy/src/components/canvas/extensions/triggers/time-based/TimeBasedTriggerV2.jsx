import { forwardRef, useCallback, useImperativeHandle, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  ScheduleTypeSelector,
  IntervalConfig,
  DailyConfig,
  WeeklyConfig,
  MonthlyConfig,
  OnceConfig,
  CustomDatesConfig,
  AdvancedOptions,
  ScheduleSummary,
} from './components';
import { SCHEDULE_TYPES, DEFAULT_SCHEDULE_CONFIG, LEGACY_RUN_SCENARIO_MAP } from './constants';
import { generateScheduleSummary } from './hooks/useScheduleSummary';
import classes from './TimeBasedTriggerV2.module.css';

function migrateLegacyData(data) {
  if (!data || Object.keys(data).length === 0) {
    return { ...DEFAULT_SCHEDULE_CONFIG };
  }

  if (data.scheduleType) {
    const legacyWeekdays = data.advanced?.businessHoursOnly ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6];
    return {
      scheduleType: data.scheduleType,
      interval: data.interval !== undefined ? data.interval : DEFAULT_SCHEDULE_CONFIG.interval,
      time: data.time !== undefined ? data.time : DEFAULT_SCHEDULE_CONFIG.time,
      timezone: data.timezone !== undefined ? data.timezone : DEFAULT_SCHEDULE_CONFIG.timezone,
      weekdays: data.weekdays !== undefined ? data.weekdays : DEFAULT_SCHEDULE_CONFIG.weekdays,
      dayOfMonth: data.dayOfMonth !== undefined ? data.dayOfMonth : DEFAULT_SCHEDULE_CONFIG.dayOfMonth,
      customDates: data.customDates !== undefined ? data.customDates : DEFAULT_SCHEDULE_CONFIG.customDates,
      onceDate: data.onceDate !== undefined ? data.onceDate : DEFAULT_SCHEDULE_CONFIG.onceDate,
      advanced: {
        startDate: data.advanced?.startDate !== undefined ? data.advanced.startDate : null,
        endDate: data.advanced?.endDate !== undefined ? data.advanced.endDate : null,
        advancedWeekdays: data.advanced?.advancedWeekdays !== undefined ? data.advanced.advancedWeekdays : legacyWeekdays,
      },
    };
  }

  const legacyScenario = data.runScenario;
  const scheduleType = LEGACY_RUN_SCENARIO_MAP[legacyScenario] || SCHEDULE_TYPES.INTERVAL;
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const legacyBusinessHours = data.businessHoursOnly === true || data.advanced?.businessHoursOnly === true;
  return {
    scheduleType,
    interval: {
      value: parseInt(data.minutes, 10) || 15,
      unit: 'minutes',
    },
    time: data.time !== undefined ? data.time : DEFAULT_SCHEDULE_CONFIG.time,
    timezone: data.timezone !== undefined ? data.timezone : detectedTimezone,
    weekdays: data.weekdays !== undefined ? data.weekdays : DEFAULT_SCHEDULE_CONFIG.weekdays,
    dayOfMonth: data.dayOfMonth !== undefined ? data.dayOfMonth : DEFAULT_SCHEDULE_CONFIG.dayOfMonth,
    customDates: data.customDates !== undefined ? data.customDates : [],
    onceDate: data.onceDate !== undefined ? data.onceDate : null,
    advanced: {
      startDate: data.startDate || data.advanced?.startDate || null,
      endDate: data.endDate || data.advanced?.endDate || null,
      advancedWeekdays: data.advanced?.advancedWeekdays !== undefined 
        ? data.advanced.advancedWeekdays 
        : (legacyBusinessHours ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6]),
    },
  };
}

const TimeBasedTriggerV2 = forwardRef(({ data = {}, onSave }, ref) => {
  const initialConfig = useMemo(() => migrateLegacyData(data), []);
  
  const [scheduleType, setScheduleType] = useState(initialConfig.scheduleType);
  const [interval, setInterval] = useState(initialConfig.interval);
  const [time, setTime] = useState(initialConfig.time);
  const [timezone, setTimezone] = useState(initialConfig.timezone);
  const [weekdays, setWeekdays] = useState(initialConfig.weekdays);
  const [dayOfMonth, setDayOfMonth] = useState(initialConfig.dayOfMonth);
  const [customDates, setCustomDates] = useState(initialConfig.customDates);
  const [onceDate, setOnceDate] = useState(initialConfig.onceDate);
  const [advanced, setAdvanced] = useState(initialConfig.advanced);
  const [errors, setErrors] = useState([]);

  const currentConfig = useMemo(() => ({
    scheduleType,
    interval,
    time,
    timezone,
    weekdays,
    dayOfMonth,
    customDates,
    onceDate,
    advanced,
  }), [scheduleType, interval, time, timezone, weekdays, dayOfMonth, customDates, onceDate, advanced]);

  const handleAdvancedChange = useCallback((key, value) => {
    setAdvanced(prev => ({ ...prev, [key]: value }));
  }, []);

  const validateData = useCallback(() => {
    const newErrors = [];
    const now = dayjs();

    switch (scheduleType) {
      case SCHEDULE_TYPES.INTERVAL:
        if (!interval?.value || interval.value <= 0) {
          newErrors.push('Please enter a positive interval');
        }
        break;
      case SCHEDULE_TYPES.WEEKLY:
        if (!weekdays || weekdays.length === 0) {
          newErrors.push('Please select at least one day');
        }
        break;
      case SCHEDULE_TYPES.ONCE:
        if (!onceDate) {
          newErrors.push('Please select a date for the one-time run');
        } else if (dayjs(onceDate).isBefore(now, 'day')) {
          newErrors.push('The selected date is in the past');
        }
        break;
      case SCHEDULE_TYPES.CUSTOM:
        if (!customDates || customDates.length === 0) {
          newErrors.push('Please select at least one date');
        } else {
          const futureDates = customDates.filter(d => dayjs(d).isSameOrAfter(now, 'day'));
          if (futureDates.length === 0) {
            newErrors.push('All selected dates are in the past');
          }
        }
        break;
    }

    if (advanced.startDate && advanced.endDate) {
      if (dayjs(advanced.endDate).isBefore(dayjs(advanced.startDate))) {
        newErrors.push('End date cannot be before start date');
      }
    }

    setErrors(newErrors);
    return newErrors;
  }, [scheduleType, interval, weekdays, onceDate, customDates, advanced]);

  useImperativeHandle(
    ref,
    () => ({
      getData: () => {
        const summary = generateScheduleSummary(currentConfig);
        
        return {
          ...currentConfig,
          summary,
          runScenario: scheduleType === SCHEDULE_TYPES.INTERVAL 
            ? 'AT_REGULAR_INTERVALS' 
            : scheduleType.toUpperCase(),
          minutes: interval?.value || 15,
          startDate: advanced.startDate,
          endDate: advanced.endDate,
          errors,
        };
      },
      validateData,
    }),
    [currentConfig, scheduleType, interval, advanced, errors, validateData]
  );

  const renderScheduleConfig = () => {
    switch (scheduleType) {
      case SCHEDULE_TYPES.INTERVAL:
        return (
          <IntervalConfig
            value={interval?.value}
            unit={interval?.unit}
            onChange={setInterval}
          />
        );
      case SCHEDULE_TYPES.DAILY:
        return (
          <DailyConfig
            time={time}
            timezone={timezone}
            weekdays={weekdays}
            onTimeChange={setTime}
            onTimezoneChange={setTimezone}
            onWeekdaysChange={setWeekdays}
          />
        );
      case SCHEDULE_TYPES.WEEKLY:
        return (
          <WeeklyConfig
            weekdays={weekdays}
            time={time}
            timezone={timezone}
            onWeekdaysChange={setWeekdays}
            onTimeChange={setTime}
            onTimezoneChange={setTimezone}
          />
        );
      case SCHEDULE_TYPES.MONTHLY:
        return (
          <MonthlyConfig
            dayOfMonth={dayOfMonth}
            time={time}
            timezone={timezone}
            onDayChange={setDayOfMonth}
            onTimeChange={setTime}
            onTimezoneChange={setTimezone}
          />
        );
      case SCHEDULE_TYPES.ONCE:
        return (
          <OnceConfig
            onceDate={onceDate}
            time={time}
            timezone={timezone}
            onDateChange={setOnceDate}
            onTimeChange={setTime}
            onTimezoneChange={setTimezone}
          />
        );
      case SCHEDULE_TYPES.CUSTOM:
        return (
          <CustomDatesConfig
            customDates={customDates}
            time={time}
            timezone={timezone}
            onDatesChange={setCustomDates}
            onTimeChange={setTime}
            onTimezoneChange={setTimezone}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={classes.container} data-testid="time-based-trigger-v2">
      <ScheduleTypeSelector
        value={scheduleType}
        onChange={setScheduleType}
      />

      <div className={classes.configArea}>
        {renderScheduleConfig()}
      </div>

      <AdvancedOptions
        startDate={advanced.startDate}
        endDate={advanced.endDate}
        advancedWeekdays={advanced.advancedWeekdays}
        scheduleType={scheduleType}
        onStartDateChange={(val) => handleAdvancedChange('startDate', val)}
        onEndDateChange={(val) => handleAdvancedChange('endDate', val)}
        onAdvancedWeekdaysChange={(val) => handleAdvancedChange('advancedWeekdays', val)}
      />

      <ScheduleSummary config={currentConfig} />

      {errors.length > 0 && (
        <div className={classes.errorsContainer}>
          {errors.map((error, index) => (
            <p key={index} className={classes.errorText}>
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
});

TimeBasedTriggerV2.displayName = 'TimeBasedTriggerV2';

export default TimeBasedTriggerV2;
