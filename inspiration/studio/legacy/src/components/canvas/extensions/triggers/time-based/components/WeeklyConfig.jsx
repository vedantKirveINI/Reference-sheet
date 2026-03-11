import React from 'react';
import { WEEKDAYS } from '../constants';
import TimePickerField from './TimePickerField';
import TimezoneSelector from './TimezoneSelector';
import classes from './ConfigComponents.module.css';

const WeeklyConfig = ({ 
  weekdays = [], 
  time, 
  timezone, 
  onWeekdaysChange, 
  onTimeChange, 
  onTimezoneChange 
}) => {
  const toggleDay = (dayId) => {
    const newWeekdays = weekdays.includes(dayId)
      ? weekdays.filter(d => d !== dayId)
      : [...weekdays, dayId].sort((a, b) => a - b);
    onWeekdaysChange(newWeekdays);
  };

  const selectWeekdays = () => {
    onWeekdaysChange([1, 2, 3, 4, 5]);
  };

  const selectWeekends = () => {
    onWeekdaysChange([0, 6]);
  };

  const selectAll = () => {
    onWeekdaysChange([0, 1, 2, 3, 4, 5, 6]);
  };

  return (
    <div className={classes.configContainer}>
      <div className={classes.configSection}>
        <label className={classes.configLabel}>Run on these days</label>
        <p className={classes.configDescription}>
          Select which days of the week to run
        </p>
        
        <div className={classes.quickSelectRow}>
          <button 
            type="button" 
            className={classes.quickSelectButton}
            onClick={selectWeekdays}
          >
            Weekdays
          </button>
          <button 
            type="button" 
            className={classes.quickSelectButton}
            onClick={selectWeekends}
          >
            Weekends
          </button>
          <button 
            type="button" 
            className={classes.quickSelectButton}
            onClick={selectAll}
          >
            Every day
          </button>
        </div>

        <div className={classes.dayChipGroup}>
          {WEEKDAYS.map((day) => (
            <button
              key={day.id}
              type="button"
              className={`${classes.dayChip} ${weekdays.includes(day.id) ? classes.dayChipActive : ''}`}
              onClick={() => toggleDay(day.id)}
              title={day.fullLabel}
              data-testid={`weekday-toggle-${day.id}`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className={classes.configSection}>
        <label className={classes.configLabel}>At time</label>
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

export default WeeklyConfig;
