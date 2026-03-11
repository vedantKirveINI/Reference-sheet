import React from "react";
import "./ui.css";

const Label = React.forwardRef(
  (
    {
      children,
      required = false,
      size = "default",
      className = "",
      ...props
    },
    ref
  ) => {
    const sizeClass = `ext-label-${size}`;

    return (
      <label
        ref={ref}
        className={`ext-label ${sizeClass} ${className}`.trim()}
        {...props}
      >
        {children}
        {required && <span className="ext-label-required">*</span>}
      </label>
    );
  }
);

Label.displayName = "ExtLabel";

export default Label;
