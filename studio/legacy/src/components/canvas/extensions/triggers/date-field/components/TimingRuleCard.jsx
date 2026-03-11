import React, { useState } from "react";
import ODSAutocomplete from "oute-ds-autocomplete";
import ODSIcon from "oute-ds-icon";
import Textfield from "oute-ds-text-field";
import ODSRadio from "oute-ds-radio";
import ODSRadioGroup from "oute-ds-radio-group";
import {
  TIMING_OPTIONS,
  OFFSET_UNITS,
  TIMING_OPTIONS_VALUE,
} from "../constants";
import styles from "./TimingRuleCard.module.css";

const MAX_OFFSET_VALUE = 999; // Conservative max for all units

const TimingRuleCard = ({ rule, index, canRemove, onRemove, onUpdate }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [ruleName, setRuleName] = useState(rule.label || `Rule ${index + 1}`);

  const selectedUnit =
    OFFSET_UNITS.find((u) => u.value === rule.offsetUnit) || OFFSET_UNITS[0];

  const handleTimingChange = (timing) => {
    onUpdate({ timing });
  };

  const handleOffsetValueChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      // Allow empty during editing
      return;
    }
    const value = parseInt(inputValue, 10);
    if (!isNaN(value)) {
      if (value < 1) {
        onUpdate({ offsetValue: 1 });
      } else if (value > MAX_OFFSET_VALUE) {
        onUpdate({ offsetValue: MAX_OFFSET_VALUE });
      } else {
        onUpdate({ offsetValue: value });
      }
    }
  };

  const handleOffsetUnitChange = (_, newValue) => {
    if (newValue) {
      onUpdate({ offsetUnit: newValue.value });
    }
  };

  const handleNameSave = () => {
    onUpdate({ label: ruleName });
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      setRuleName(rule.label || `Rule ${index + 1}`);
      setIsEditingName(false);
    }
  };

  const getTimingDescription = () => {
    switch (rule.timing) {
      case TIMING_OPTIONS_VALUE.BEFORE:
        return "Triggers the workflow before the date in the selected column.";
      case TIMING_OPTIONS_VALUE.EXACT:
        return "Triggers the workflow on the exact date in the selected column.";
      case TIMING_OPTIONS_VALUE.AFTER:
        return "Triggers the workflow after the date in the selected column.";
      default:
        return "Triggers the workflow before the date in the selected column.";
    }
  };

  const getTimingLabel = () => {
    switch (rule.timing) {
      case TIMING_OPTIONS_VALUE.BEFORE:
        return "before the date";
      case TIMING_OPTIONS_VALUE.AFTER:
        return "after the date";
      default:
        return "";
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          {isEditingName ? (
            <Textfield
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              className={`${styles.ruleNameInput} black`}
              autoFocus
              sx={{
                "& .MuiInputBase-root": {
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                  boxSizing: "border-box",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#11389A",
                },
                "& .MuiInputBase-input": {
                  fontSize: "1.25rem",
                  lineHeight: "1.75rem",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  letterSpacing: "0.15px",
                  color: "#263238",
                },
                "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#11389A",
                },
                "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#11389A",
                  },
              }}
            />
          ) : (
            <>
              <span className={styles.ruleName}>
                {rule.label || `Rule ${index + 1}`}
              </span>
              <ODSIcon
                outeIconName="OUTEEditIcon"
                onClick={() => setIsEditingName(true)}
                aria-label="Edit rule name"
                outeIconProps={{
                  sx: {
                    color: "#90A4AE",
                    width: "1.25rem",
                    height: "1.25rem",
                  },
                }}
                buttonProps={{
                  sx: {
                    padding: "0",
                    opacity: 0.8,
                    transition: "opacity 0.15s ease",
                    "&:hover": {
                      opacity: 1,
                    },
                  },
                }}
              />
            </>
          )}
        </div>
        {canRemove && (
          <ODSIcon
            outeIconName="OUTETrashIcon"
            onClick={onRemove}
            aria-label="Delete rule"
            outeIconProps={{
              sx: {
                color: "#607D8B",
                width: "1.5rem",
                height: "1.5rem",
              },
            }}
            buttonProps={{
              sx: {
                padding: "0",
                opacity: 0.8,
                transition: "opacity 0.15s ease",
                "&:hover": {
                  opacity: 1,
                },
              },
            }}
          />
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Trigger Timing</div>
          <ODSRadioGroup
            value={rule.timing}
            onChange={(e, newValue) => handleTimingChange(newValue)}
            row
            className={styles.radioGroup}
          >
            {TIMING_OPTIONS.map((option) => (
              <ODSRadio
                key={option.value}
                labelText={option.label}
                variant="black"
                formControlLabelProps={{
                  value: option.value,
                  sx: {
                    marginLeft: "-0.25rem",
                    marginRight: "1rem",
                  },
                }}
                radioProps={{ disableRipple: false }}
                labelProps={{ variant: "body2" }}
              />
            ))}
          </ODSRadioGroup>
        </div>

        <div className={styles.timingContent}>
          <p className={styles.timingDescription}>{getTimingDescription()}</p>

          <div className={styles.divider} />

          {rule.timing !== TIMING_OPTIONS_VALUE.EXACT && (
            <div className={styles.offsetRow}>
              <span className={styles.offsetLabel}>Trigger</span>
              <div className={styles.offsetInputGroup}>
                <Textfield
                  type="number"
                  value={rule.offsetValue || 1}
                  onChange={handleOffsetValueChange}
                  className={`${styles.offsetValueInput} black`}
                  inputProps={{ min: "1", max: "999" }}
                  sx={{
                    padding: "0",
                    width: "5rem",
                    "& .MuiFormControl-root": {
                      padding: "0",
                    },
                    "& .MuiInputBase-root": {
                      height: "2.75rem",
                      padding: "0.625rem",
                      borderRadius: "0.375rem 0 0 0.375rem",
                      borderRight: "none",
                      display: "flex",
                      alignItems: "center",
                      boxSizing: "border-box",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#CFD8DC",
                      borderRight: "none",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: "1rem",
                      lineHeight: "1.75rem",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 400,
                      letterSpacing: "0.15px",
                      color: "#263238",
                      textAlign: "center",
                    },
                    "& .MuiInputBase-input:focus": {
                      borderColor: "#11389A",
                    },
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        WebkitAppearance: "none",
                        margin: 0,
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                  }}
                />
                <div className={styles.offsetUnitSelect}>
                  <ODSAutocomplete
                    options={OFFSET_UNITS}
                    value={selectedUnit}
                    onChange={handleOffsetUnitChange}
                    disableClearable
                    variant="black"
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.value === value?.value
                    }
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "2.75rem",
                        padding: "0 0.625rem",
                        borderRadius: "0 0.375rem 0.375rem 0",
                        borderLeft: "none",
                        backgroundColor: "#fff",
                        display: "flex",
                        alignItems: "center",
                        boxSizing: "border-box",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#CFD8DC",
                        borderLeft: "none",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "1rem",
                        lineHeight: "1.75rem",
                        color: "#263238",
                        fontFamily: "Inter, sans-serif",
                      },
                    }}
                  />
                </div>
              </div>
              <span className={styles.offsetSuffix}>{getTimingLabel()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimingRuleCard;
