import React from 'react';
// import Textfield from 'oute-ds-text-field';
import { ODSTextField as Textfield } from '@src/module/ods';
import classes from './ConfigComponents.module.css';

const TimePickerField = ({ value, onChange, label = 'At time', showLabel = true }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={classes.configSection}>
      {showLabel && (
        <label className={classes.configLabel}>{label}</label>
      )}
      <Textfield
        type="time"
        value={value || '09:00'}
        onChange={handleChange}
        className="black"
        sx={{
          width: '8rem',
          '& .MuiInputBase-root': {
            padding: '0 0.5rem',
          },
        }}
        InputProps={{
          sx: {
            input: {
              height: '2.5rem',
              fontSize: '0.9375rem',
            },
          },
        }}
        data-testid="time-picker-input"
      />
    </div>
  );
};

export default TimePickerField;
