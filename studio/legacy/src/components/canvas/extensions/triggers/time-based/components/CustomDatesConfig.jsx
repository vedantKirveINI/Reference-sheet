import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import TimePickerField from './TimePickerField';
import TimezoneSelector from './TimezoneSelector';
import classes from './ConfigComponents.module.css';

const CustomDatesConfig = ({ 
  customDates = [], 
  time, 
  timezone, 
  onDatesChange, 
  onTimeChange, 
  onTimezoneChange 
}) => {
  const [pickerValue, setPickerValue] = useState(null);

  const handleAddDate = (newValue) => {
    if (newValue && newValue.isValid()) {
      const dateString = newValue.format('YYYY-MM-DD');
      if (!customDates.includes(dateString)) {
        const newDates = [...customDates, dateString].sort();
        onDatesChange(newDates);
      }
      setPickerValue(null);
    }
  };

  const handleRemoveDate = (dateToRemove) => {
    onDatesChange(customDates.filter(d => d !== dateToRemove));
  };

  const formatDisplayDate = (dateString) => {
    return dayjs(dateString).format('MMM D, YYYY');
  };

  return (
    <div className={classes.configContainer}>
      <div className={classes.configSection}>
        <label className={classes.configLabel}>Run on specific dates</label>
        <p className={classes.configDescription}>
          Add dates when the workflow should run
        </p>
        
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={pickerValue}
            onChange={handleAddDate}
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
                placeholder: 'Add a date',
                InputProps: {
                  'data-testid': 'custom-date-picker',
                },
              },
            }}
          />
        </LocalizationProvider>

        {customDates.length > 0 && (
          <div className={classes.selectedDatesContainer}>
            <label className={classes.configSubLabel}>
              Selected dates ({customDates.length})
            </label>
            <div className={classes.dateChipContainer}>
              {customDates.map((date) => (
                <div key={date} className={classes.dateChip}>
                  <span>{formatDisplayDate(date)}</span>
                  <button
                    type="button"
                    className={classes.dateChipRemove}
                    onClick={() => handleRemoveDate(date)}
                    aria-label={`Remove ${formatDisplayDate(date)}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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

export default CustomDatesConfig;
