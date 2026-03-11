import React, { useState } from "react";
import classes from './PreviewSection.module.css';

const PreviewSection = ({
  result = { value: null, type: 'unknown' },
  errors = [],
  previewData = null,
  debugMode = false,
  onDebugModeToggle = () => {},
}) => {
  const [selectedPreviewContext, setSelectedPreviewContext] = useState('New page');

  const formatValue = (value, type) => {
    if (value === null || value === undefined) {
      return 'No output';
    }

    if (type === 'boolean') {
      return value ? 'true' : 'false';
    }

    if (type === 'number') {
      return String(value);
    }

    if (type === 'date') {
      try {
        return new Date(value).toLocaleString();
      } catch {
        return String(value);
      }
    }

    if (type === 'array' || Array.isArray(value)) {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }

    return String(value);
  };

  const hasErrors = errors.length > 0;
  const firstError = errors[0];

  return (
    <div className={classes.section}>
      <div className={classes.previewRow}>
        <div className={classes.previewLabel}>
          <span>Preview with</span>
          <button className={classes.contextDropdown}>
            📄 {selectedPreviewContext}
            <span className={classes.dropdownArrow}>▾</span>
          </button>
        </div>
        <div className={classes.debugToggle}>
          <label className={classes.toggleLabel}>
            <input
              type="checkbox"
              checked={debugMode}
              onChange={onDebugModeToggle}
              className={classes.toggleInput}
            />
            <span className={classes.toggleSwitch}></span>
            Debug mode
          </label>
        </div>
      </div>

      <div className={classes.resultRow}>
        {hasErrors ? (
          <div className={classes.errorMessage}>
            <span className={classes.errorText}>
              {firstError.message}
              {firstError.position && (
                <span className={classes.errorPosition}>
                  {' '}[{firstError.position[0]},{firstError.position[1]}]
                </span>
              )}
            </span>
          </div>
        ) : (
          <div className={classes.resultValue}>
            {formatValue(result.value, result.type)}
          </div>
        )}
        
        <div className={classes.typeIndicator}>
          <span className={classes.typeLabel}>
            Type: {hasErrors ? 'unknown' : result.type}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PreviewSection;
