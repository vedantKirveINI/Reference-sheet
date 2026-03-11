import React from 'react';
import { SCHEDULE_TYPE_OPTIONS } from '../constants';
import classes from './ScheduleTypeSelector.module.css';

const ScheduleTypeSelector = ({ value, onChange }) => {
  return (
    <div className={classes.container}>
      <label className={classes.label}>Run Scenario</label>
      <div className={classes.tabContainer}>
        {SCHEDULE_TYPE_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`${classes.tab} ${value === option.id ? classes.tabActive : ''}`}
            onClick={() => onChange(option.id)}
            title={option.description}
            data-testid={`schedule-type-${option.id}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScheduleTypeSelector;
