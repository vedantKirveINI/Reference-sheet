import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { WEEKDAYS } from '../constants';
import classes from './ConfigComponents.module.css';

const AdvancedOptions = ({ 
  startDate, 
  endDate, 
  advancedWeekdays = [0, 1, 2, 3, 4, 5, 6],
  scheduleType,
  onStartDateChange, 
  onEndDateChange,
  onAdvancedWeekdaysChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(
    Boolean(startDate || endDate || (advancedWeekdays && advancedWeekdays.length < 7))
  );

  const handleStartDateChange = (newValue) => {
    if (newValue && newValue.isValid()) {
      onStartDateChange(newValue.toISOString());
    } else {
      onStartDateChange(null);
    }
  };

  const handleEndDateChange = (newValue) => {
    if (newValue && newValue.isValid()) {
      onEndDateChange(newValue.toISOString());
    } else {
      onEndDateChange(null);
    }
  };

  const toggleDay = (dayId) => {
    const currentDays = advancedWeekdays || [0, 1, 2, 3, 4, 5, 6];
    const newDays = currentDays.includes(dayId)
      ? currentDays.filter(d => d !== dayId)
      : [...currentDays, dayId].sort((a, b) => a - b);
    
    if (newDays.length > 0) {
      onAdvancedWeekdaysChange(newDays);
    }
  };

  const selectWeekdays = () => {
    onAdvancedWeekdaysChange([1, 2, 3, 4, 5]);
  };

  const selectWeekends = () => {
    onAdvancedWeekdaysChange([0, 6]);
  };

  const selectAll = () => {
    onAdvancedWeekdaysChange([0, 1, 2, 3, 4, 5, 6]);
  };

  const startDateValue = startDate ? dayjs(startDate) : null;
  const endDateValue = endDate ? dayjs(endDate) : null;
  
  const showDayFilter = scheduleType !== 'weekly';
  const currentDays = advancedWeekdays || [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className={classes.advancedContainer}>
      <button
        type="button"
        className={classes.advancedToggle}
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="advanced-options-toggle"
      >
        <span className={classes.advancedToggleIcon}>
          {isExpanded ? '▾' : '▸'}
        </span>
        <span>Advance settings</span>
      </button>

      {isExpanded && (
        <div className={classes.advancedContent}>
          <div className={classes.configSection}>
            <label className={classes.configLabel}>Date Range (Optional)</label>
            <p className={classes.configDescription}>
              Limit when the schedule is active
            </p>
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className={classes.dateRangeRow}>
                <div className={classes.dateRangeField}>
                  <label className={classes.configSubLabel}>Start date</label>
                  <DatePicker
                    value={startDateValue}
                    onChange={handleStartDateChange}
                    sx={{
                      width: '100%',
                      '& .MuiInputBase-root': {
                        height: '2.75rem',
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '0.9375rem',
                        padding: '0 0.75rem',
                      },
                    }}
                    slotProps={{
                      textField: {
                        placeholder: 'No start date',
                        InputProps: {
                          'data-testid': 'advanced-start-date',
                        },
                      },
                      field: {
                        clearable: true,
                      },
                    }}
                  />
                </div>
                <div className={classes.dateRangeField}>
                  <label className={classes.configSubLabel}>End date</label>
                  <DatePicker
                    value={endDateValue}
                    onChange={handleEndDateChange}
                    minDate={startDateValue || undefined}
                    sx={{
                      width: '100%',
                      '& .MuiInputBase-root': {
                        height: '2.75rem',
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '0.9375rem',
                        padding: '0 0.75rem',
                      },
                    }}
                    slotProps={{
                      textField: {
                        placeholder: 'No end date',
                        InputProps: {
                          'data-testid': 'advanced-end-date',
                        },
                      },
                      field: {
                        clearable: true,
                      },
                    }}
                  />
                </div>
              </div>
            </LocalizationProvider>
          </div>

          {showDayFilter && (
            <div className={classes.configSection}>
              <label className={classes.configLabel}>Run on these days</label>
              <p className={classes.configDescription}>
                Filter which days of the week the schedule can run
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
                    className={`${classes.dayChip} ${currentDays.includes(day.id) ? classes.dayChipActive : ''}`}
                    onClick={() => toggleDay(day.id)}
                    title={day.fullLabel}
                    data-testid={`advanced-weekday-toggle-${day.id}`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedOptions;
