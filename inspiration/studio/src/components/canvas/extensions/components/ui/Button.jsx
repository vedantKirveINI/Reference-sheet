import React from "react";
import "./ui.css";

const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "default",
      disabled = false,
      loading = false,
      fullWidth = false,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClass = "ext-btn";
    const variantClass = `ext-btn-${variant}`;
    const sizeClass = `ext-btn-${size}`;
    const widthClass = fullWidth ? "ext-btn-full" : "";
    const disabledClass = disabled || loading ? "ext-btn-disabled" : "";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${disabledClass} ${className}`.trim()}
        {...props}
      >
        {loading && <span className="ext-btn-spinner" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "ExtButton";

export default Button;
