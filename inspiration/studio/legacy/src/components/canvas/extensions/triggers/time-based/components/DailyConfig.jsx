import React from 'react';
import { WEEKDAYS } from '../constants';
import TimePickerField from './TimePickerField';
import TimezoneSelector from './TimezoneSelector';
import classes from './ConfigComponents.module.css';

const DailyConfig = ({ 
  time, 
  timezone, 
  weekdays = [1, 2, 3, 4, 5],
  onTimeChange, 
  onTimezoneChange,
  onWeekdaysChange 
}) => {
  const toggleDay = (dayId) => {
    const currentWeekdays = weekdays || [1, 2, 3, 4, 5];
    const newWeekdays = currentWeekdays.includes(dayId)
      ? currentWeekdays.filter(d => d !== dayId)
      : [...currentWeekdays, dayId].sort((a, b) => a - b);
    if (newWeekdays.length > 0 && onWeekdaysChange) {
      onWeekdaysChange(newWeekdays);
    }
  };

  const currentWeekdays = weekdays || [1, 2, 3, 4, 5];

  return (
    <div className={classes.configContainer}>
      <div className={classes.configSection}>
        <label className={classes.configLabel}>Days</label>
        <p className={classes.configDescription}>
          Select which days to run the scenario
        </p>
        <div className={classes.dayChipGroup}>
          {WEEKDAYS.map((day) => (
            <button
              key={day.id}
              type="button"
              className={`${classes.dayChip} ${currentWeekdays.includes(day.id) ? classes.dayChipActive : ''}`}
              onClick={() => toggleDay(day.id)}
              title={day.fullLabel}
              data-testid={`daily-day-toggle-${day.id}`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className={classes.configSection}>
        <label className={classes.configLabel}>Time</label>
        <div className={classes.timeTimezoneRow}>
          <TimePickerField
            value={time}
            onChange={onTimeChange}
            showLabel={false}
          />
          <TimezoneSelector
            value={timezone}
            onChange={onTimezoneChange}
            showLabel={false}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyConfig;
