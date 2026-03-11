import React, { useState, useRef, useEffect } from "react";
// import { ODSTextField as TextField } from "@src/module/ods";
// import { ODSLabel as Label } from "@src/module/ods";
// import { ODSIcon as Icon } from "@src/module/ods";
// import { ODSTooltip as Tooltip } from "@src/module/ods";
import { ODSTextField as TextField, ODSLabel as Label, ODSIcon as Icon, ODSTooltip as Tooltip } from "../../index.js";
import styles from './index.module.css';
const InlineEditor = ({
  value: initialValue = "",
  onChange,
  placeholder = "Click to edit",
  className = "",
  disabled = false,
  showActionButtons = true,
  multiline = false,
  textFieldProps = {},
  variant = "black",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [showWarning, setShowWarning] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const inputRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    setValue(initialValue);
    setCurrentValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) {
      setHasChanges(value !== currentValue);
    }
  }, [value, currentValue, isEditing]);

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true);
      setValue(currentValue);
      setHasChanges(false);
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    if (!showActionButtons) {
      saveChanges();
    } else {
      setIsEditing(false);
      setValue(currentValue);

      if (hasChanges) {
        setShowWarning(true);
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
        warningTimeoutRef.current = setTimeout(() => {
          setShowWarning(false);
        }, 3000);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (multiline && e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        saveChanges();
      }
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const saveChanges = () => {
    setIsEditing(false);
    setCurrentValue(value);
    setHasChanges(false);
    setShowWarning(false);
    if (onChange && value !== currentValue) {
      onChange(value);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setValue(currentValue);
    setHasChanges(false);
    setShowWarning(false);
  };

  return (
    <div className={`${styles.inlineEditor} ${className}`}>
      {isEditing ? (
        <div className={styles.editContainer} ref={editorRef}>
          <TextField
            inputRef={inputRef}
            value={value}
            multiline={multiline}
            onChange={handleChange}
            onBlur={(e) => {
              if (
                e.relatedTarget &&
                e.relatedTarget.closest(`.${styles.actionButtons}`)
              ) {
                e.preventDefault();
              } else {
                handleBlur();
              }
            }}
            onKeyDown={handleKeyDown}
            variant="outlined"
            fullWidth
            autoFocus
            className={`${styles.textField} ${
              !showActionButtons ? styles.noActionButtons : ""
            } ${variant}`}
            placeholder={placeholder}
            
            {...textFieldProps}
          />
          {showActionButtons && (
            <div className={styles.actionButtonsContainer}>
              <div className={styles.actionButtons}>
                <Tooltip title="Save changes">
                  <Icon
                    outeIconName="CheckIcon"
                    onClick={saveChanges}
                    outeIconProps={{
                      sx: {
                        color: "#4caf50",
                      },
                    }}
                    buttonProps={{
                      sx: { padding: "4px" },
                      className: styles.actionButton,
                    }}
                  />
                </Tooltip>
                <Tooltip title="Cancel editing">
                  <Icon
                    outeIconName="OUTECloseIcon"
                    onClick={cancelEdit}
                    outeIconProps={{
                      sx: { color: "#f44336" },
                    }}
                    buttonProps={{
                      sx: { padding: "4px" },
                      className: styles.actionButton,
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.displayWrapper}>
          <div
            onClick={handleClick}
            className={`
              ${styles.textDisplay} 
              ${disabled ? styles.disabled : ""} 
              ${showWarning ? styles.warningState : ""}
            `}
          >
            <span className={styles.textContent}>
              {currentValue || placeholder}
            </span>
          </div>

          {showWarning && (
            <div className={styles.warningIconWrapper}>
              <Tooltip
                arrow={false}
                title={
                  <Label variant="caption" color="#fff">
                    Changes not saved
                  </Label>
                }
              >
                <Icon
                  outeIconName="OUTEWarningIcon"
                  outeIconProps={{
                    sx: { color: "#ff9800" },
                    className: styles.warningIcon,
                  }}
                />
              </Tooltip>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineEditor;
