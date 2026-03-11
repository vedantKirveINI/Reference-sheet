import React, { useMemo } from 'react';
// import Textfield from 'oute-ds-text-field';
// import ODSAutocomplete from 'oute-ds-autocomplete';
import { ODSTextField as Textfield, ODSAutocomplete } from '@src/module/ods';
import { COMMON_TIMEZONES } from '../constants';
import classes from './ConfigComponents.module.css';

const TimezoneSelector = ({ value, onChange, showLabel = true }) => {
  const detectedTimezone = useMemo(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);

  const options = useMemo(() => {
    const hasDetected = COMMON_TIMEZONES.some(tz => tz.value === detectedTimezone);
    if (!hasDetected && detectedTimezone) {
      return [
        { value: detectedTimezone, label: `${detectedTimezone} (Detected)`, offset: '' },
        ...COMMON_TIMEZONES,
      ];
    }
    return COMMON_TIMEZONES.map(tz => ({
      ...tz,
      label: tz.value === detectedTimezone ? `${tz.label} (Detected)` : tz.label,
    }));
  }, [detectedTimezone]);

  const selectedTimezone = options.find(tz => tz.value === value) || options[0];

  const handleChange = (_, newValue) => {
    if (newValue) {
      onChange(newValue.value);
    }
  };

  return (
    <div className={classes.configSection}>
      {showLabel && (
        <>
          <label className={classes.configLabel}>Timezone</label>
          <p className={classes.configDescription}>
            All times will be based on this timezone
          </p>
        </>
      )}
      <ODSAutocomplete
        options={options}
        value={selectedTimezone}
        onChange={handleChange}
        disableClearable
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value?.value}
        renderInput={(params) => (
          <Textfield
            {...params}
            className="black"
            placeholder="Select timezone"
          />
        )}
        slotProps={{
          popper: {
            sx: {
              minWidth: '16rem',
            },
            placement: 'bottom-start',
          },
          paper: {
            sx: {
              minWidth: '16rem',
            },
          },
        }}
        sx={{
          width: '12rem',
          '& .MuiInputBase-root': {
            padding: '0 0.5rem',
          },
          input: {
            height: '2.5rem',
            fontSize: '0.875rem',
            textOverflow: 'ellipsis',
          },
        }}
        data-testid="timezone-dropdown"
      />
    </div>
  );
};

export default TimezoneSelector;
