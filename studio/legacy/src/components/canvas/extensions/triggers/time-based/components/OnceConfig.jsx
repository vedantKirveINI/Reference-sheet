import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import TimePickerField from './TimePickerField';
import TimezoneSelector from './TimezoneSelector';
import classes from './ConfigComponents.module.css';

const OnceConfig = ({ 
  onceDate, 
  time, 
  timezone, 
  onDateChange, 
  onTimeChange, 
  onTimezoneChange 
}) => {
  const handleDateChange = (newValue) => {
    if (newValue && newValue.isValid()) {
      onDateChange(newValue.format('YYYY-MM-DD'));
    } else {
      onDateChange(null);
    }
  };

  const dateValue = onceDate ? dayjs(onceDate) : null;

  return (
    <div className={classes.configContainer}>
      <div className={classes.configSection}>
        <label className={classes.configLabel}>Run once on</label>
        <p className={classes.configDescription}>
          The workflow will execute one time at the specified date and time
        </p>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={dateValue}
            onChange={handleDateChange}
            disablePast
            sx={{
              width: '10rem',
              input: {
                height: '2.5rem',
                fontSize: '0.9375rem',
                padding: '0 0.5rem',
              },
            }}
            slotProps={{
              textField: {
                InputProps: {
                  'data-testid': 'once-date-picker',
                },
              },
            }}
          />
        </LocalizationProvider>
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

export default OnceConfig;
