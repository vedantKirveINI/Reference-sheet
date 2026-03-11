import React from 'react';
// import Textfield from 'oute-ds-text-field';
// import ODSAutocomplete from 'oute-ds-autocomplete';
import { ODSTextField as Textfield, ODSAutocomplete } from '@src/module/ods';
import { DAYS_OF_MONTH } from '../constants';
import TimePickerField from './TimePickerField';
import TimezoneSelector from './TimezoneSelector';
import classes from './ConfigComponents.module.css';

const MonthlyConfig = ({ 
  dayOfMonth, 
  time, 
  timezone, 
  onDayChange, 
  onTimeChange, 
  onTimezoneChange 
}) => {
  const selectedDay = DAYS_OF_MONTH.find(d => d.value === dayOfMonth) || DAYS_OF_MONTH[0];

  const handleDayChange = (_, newValue) => {
    if (newValue) {
      onDayChange(newValue.value);
    }
  };

  return (
    <div className={classes.configContainer}>
      <div className={classes.configSection}>
        <label className={classes.configLabel}>Run on day of month</label>
        <p className={classes.configDescription}>
          The workflow will run on this day every month
        </p>
        <ODSAutocomplete
          options={DAYS_OF_MONTH}
          value={selectedDay}
          onChange={handleDayChange}
          disableClearable
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value?.value}
          renderInput={(params) => (
            <Textfield
              {...params}
              className="black"
              placeholder="Select day"
            />
          )}
          sx={{
            width: '6rem',
            '& .MuiInputBase-root': {
              padding: '0 0.5rem',
            },
            input: {
              height: '2.5rem',
              fontSize: '0.9375rem',
            },
          }}
          data-testid="day-of-month-dropdown"
        />
        <p className={classes.configHint}>
          Note: If the month has fewer days, it will run on the last day of the month.
        </p>
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

export default MonthlyConfig;
