import React from "react";
import "./ui.css";

const Input = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      startAdornment,
      endAdornment,
      fullWidth = true,
      size = "default",
      className = "",
      wrapperClassName = "",
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const sizeClass = `ext-input-${size}`;
    const errorClass = hasError ? "ext-input-error" : "";
    const widthClass = fullWidth ? "ext-input-full" : "";

    return (
      <div className={`ext-input-wrapper ${widthClass} ${wrapperClassName}`.trim()}>
        {label && (
          <label className="ext-input-label">
            {label}
          </label>
        )}
        <div className={`ext-input-container ${errorClass}`.trim()}>
          {startAdornment && (
            <span className="ext-input-adornment ext-input-adornment-start">
              {startAdornment}
            </span>
          )}
          <input
            ref={ref}
            className={`ext-input ${sizeClass} ${className}`.trim()}
            {...props}
          />
          {endAdornment && (
            <span className="ext-input-adornment ext-input-adornment-end">
              {endAdornment}
            </span>
          )}
        </div>
        {(helperText || error) && (
          <span className={`ext-input-helper ${hasError ? "ext-input-helper-error" : ""}`}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "ExtInput";

export default Input;
