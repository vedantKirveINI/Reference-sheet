import React from 'react';
// import Textfield from 'oute-ds-text-field';
import { ODSTextField as Textfield } from '@src/module/ods';
import { INTERVAL_UNITS } from '../constants';
import classes from './ConfigComponents.module.css';

const UNIT_SHORT_LABELS = {
  minutes: 'mins',
  hours: 'hrs',
};

const IntervalConfig = ({ value, unit, onChange }) => {
  const selectedUnit = INTERVAL_UNITS.find(u => u.value === unit) || INTERVAL_UNITS[0];
  const unitShortLabel = UNIT_SHORT_LABELS[selectedUnit.value] || selectedUnit.label.toLowerCase();
  
  const handleValueChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue > 0) {
      onChange({ value: newValue, unit });
    } else if (e.target.value === '') {
      onChange({ value: '', unit });
    }
  };

  const handleUnitChange = (newUnit) => {
    onChange({ value, unit: newUnit });
  };

  return (
    <div className={classes.configSection}>
      <label className={classes.configLabel}>
        {selectedUnit.label}
      </label>
      <p className={classes.configDescription}>
        The time interval in which the scenario should be repeated (in {selectedUnit.label.toLowerCase()})
      </p>
      <div className={classes.intervalInputContainer}>
        <Textfield
          value={value}
          onChange={handleValueChange}
          type="number"
          className="black"
          placeholder="15"
          sx={{
            width: '100%',
            maxWidth: '12rem',
            '& .MuiInputBase-root': {
              padding: '0 0.75rem',
              borderRadius: '0.5rem',
            },
          }}
          InputProps={{
            inputProps: { min: 1, max: selectedUnit.max },
            endAdornment: (
              <span className={classes.intervalUnit}>{unitShortLabel}</span>
            ),
            sx: {
              input: {
                height: '2.75rem',
                fontSize: '1rem',
              },
            },
          }}
          data-testid="interval-value-input"
        />
      </div>
      <div className={classes.unitToggleContainer}>
        {INTERVAL_UNITS.map((unitOption) => (
          <button
            key={unitOption.value}
            type="button"
            className={`${classes.unitToggle} ${unit === unitOption.value ? classes.unitToggleActive : ''}`}
            onClick={() => handleUnitChange(unitOption.value)}
          >
            {unitOption.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IntervalConfig;
