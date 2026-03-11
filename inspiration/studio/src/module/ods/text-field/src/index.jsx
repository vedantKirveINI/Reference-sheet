import React, { forwardRef, useCallback, useState, useId } from "react";
import { ODSIcon, ODSTooltip as Tooltip } from "../../index.js";
import { cn } from "@/lib/utils";
import { icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cva } from "class-variance-authority";

const inputVariants = cva(
  "flex w-full bg-transparent transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        outlined:
          "rounded-md border border-input shadow-sm focus-visible:ring-1 focus-visible:ring-ring",
        underline:
          "border-0 border-b-2 border-input rounded-none focus-visible:ring-0 focus-visible:border-b-primary",
      },
      size: {
        small: "h-8 px-2 text-sm",
        medium: "h-9 px-3 text-base md:text-sm",
      },
    },
    compoundVariants: [
      {
        variant: "underline",
        size: "medium",
        class: "px-0 py-[0.625em]",
      },
      {
        variant: "underline",
        size: "small",
        class: "px-0",
      },
    ],
    defaultVariants: {
      variant: "outlined",
      size: "medium",
    },
  }
);

const textareaVariants = cva(
  "flex w-full bg-transparent transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-y",
  {
    variants: {
      variant: {
        outlined:
          "rounded-md border border-input shadow-sm focus-visible:ring-1 focus-visible:ring-ring",
        underline:
          "border-0 border-b-2 border-input rounded-none focus-visible:ring-0 focus-visible:border-b-primary",
      },
      size: {
        small: "px-2 py-1 text-sm",
        medium: "px-3 py-2 text-base md:text-sm",
      },
    },
    compoundVariants: [
      {
        variant: "underline",
        size: "medium",
        class: "px-0",
      },
      {
        variant: "underline",
        size: "small",
        class: "px-0",
      },
    ],
    defaultVariants: {
      variant: "outlined",
      size: "medium",
    },
  }
);

const ODSTextField = forwardRef(
  (
    {
      onEnter = () => {},
      hideBorders = false,
      allowShowPasswordToggle = true,
      errorType = "default",
      label,
      helperText,
      error,
      className,
      fullWidth,
      InputProps,
      InputLabelProps,
      FormHelperTextProps,
      inputProps,
      variant = "outlined",
      margin,
      color,
      focused,
      hiddenLabel,
      multiline,
      minRows,
      maxRows,
      rows,
      sx,
      size = "medium",
      isDisabled,
      textType,
      isCreator,
      textTransformCase,
      testId,
      isRequired,
      theme,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [type, setType] = useState(props?.type || "text");
    const generatedId = useId();
    const inputId = props.id || generatedId;

    // In creator view: never mask, icon shown but no interaction. In filler: icon toggles mask.
    const isPasswordField = props?.type === "password";
    const effectiveType = isCreator && isPasswordField ? "text" : type;
    const showPasswordIcon = isPasswordField && allowShowPasswordToggle;
    const isPasswordToggleInteractive = showPasswordIcon && !isCreator;

    const showPasswordHandler = useCallback(() => {
      const show = !showPassword;
      setShowPassword(show);
      setType(show ? "text" : props?.type || "text");
      setTimeout(() => ref?.current?.select(), 10);
    }, [props?.type, ref, showPassword]);

    const inputVariant = variant === "underline" ? "underline" : "outlined";
    const isUnderline = variant === "underline";

    // When endAdornment exists: input needs enough right padding so text doesn't collide with adornment (icon + counter both in end-adornment area)
    const hasEndAdornment =
      showPasswordIcon ||
      InputProps?.endAdornment ||
      (errorType === "icon" && error);
    const hasBothIconAndAdornment =
      showPasswordIcon && InputProps?.endAdornment;
    const hasOnlyIcon =
      showPasswordIcon &&
      !InputProps?.endAdornment &&
      !(errorType === "icon" && error);

    // Theme-aware colors for text and placeholder
    // If sx.color is provided (from parent), use it directly (it may already be rgba)
    // Otherwise, use theme colors with original priority (buttons/description first)
    const baseColor =
      theme?.styles?.buttons ||
      theme?.styles?.description ||
      theme?.fonts?.answerColor ||
      "#263238";

    // Convert hex color to rgba with specified opacity (0.7 to match description)
    const hexToRgba = (hex, alpha) => {
      if (!hex || (!hex.startsWith("#") && !hex.startsWith("rgba"))) {
        // If already rgba or other format, return as is
        if (hex.startsWith("rgba")) return hex;
        return hex;
      }
      if (hex.startsWith("rgba")) return hex;
      const normalized = hex.replace("#", "");
      const isShort = normalized.length === 3;
      const r = parseInt(
        isShort ? normalized[0] + normalized[0] : normalized.substring(0, 2),
        16
      );
      const g = parseInt(
        isShort ? normalized[1] + normalized[1] : normalized.substring(2, 4),
        16
      );
      const b = parseInt(
        isShort ? normalized[2] + normalized[2] : normalized.substring(4, 6),
        16
      );
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Use sx.color if provided (parent may have already converted to rgba), otherwise convert baseColor with 0.7 opacity (matching description)
    const textColor =
      sx?.color || (isCreator ? hexToRgba(baseColor, 0.7) : baseColor);
    // Placeholder uses answer color with increased opacity for visibility in ALL modes
    // Use answer color if available, otherwise use a visible gray
    const placeholderBaseColor =
      theme?.styles?.answer || theme?.fonts?.answerColor || "#757575";
    // Always use full opacity for placeholder in ALL modes (creator and non-creator)
    const placeholderColor = placeholderBaseColor;

    const inputClassName = cn(
      inputVariants({ variant: inputVariant, size }),
      hideBorders && "border-none",
      error &&
        errorType === "default" &&
        "border-destructive focus-visible:ring-destructive",
      error && errorType === "default" && isUnderline && "border-b-destructive",
      error && errorType === "icon" && !isUnderline && "border-[#90a4ae]",
      variant === "black" &&
        !isUnderline &&
        "focus-visible:border-[#212121] focus-visible:ring-[#212121]",
      hasBothIconAndAdornment && "pr-32",
      hasOnlyIcon && "pr-5",
      hasEndAdornment && !hasBothIconAndAdornment && !hasOnlyIcon && "pr-16",
      "font-[Inter]",
      className
    );

    const textareaClassName = cn(
      textareaVariants({ variant: inputVariant, size }),
      hideBorders && "border-none",
      error &&
        errorType === "default" &&
        "border-destructive focus-visible:ring-destructive",
      error && errorType === "default" && isUnderline && "border-b-destructive",
      error && errorType === "icon" && !isUnderline && "border-[#90a4ae]",
      variant === "black" &&
        !isUnderline &&
        "focus-visible:border-[#212121] focus-visible:ring-[#212121]",
      // If consumer wants a compact textarea (e.g. long text that expands as user types),
      // don't force a tall min-height.
      (rows === 1 || minRows === 1) && "min-h-0",
      "font-[Inter]",
      className
    );

    const labelStyles = cn(
      "text-[#a4a9ab]",
      "font-[Inter] text-[0.875rem] leading-[1.375rem] tracking-[var(--subtitle2-letter-spacing,0.0063rem)]",
      "mb-0",
      error && errorType === "default" && "text-destructive",
      variant === "black" && "text-[#212121]"
    );

    return (
      <div
        className={cn("relative flex flex-col", fullWidth && "w-full")}
        style={{
          marginTop: label ? "1.25rem" : 0,
          marginBottom: helperText && errorType === "default" ? "1.25rem" : 0,
          ...(sx || {}),
        }}
      >
        <style>{`
          input#${inputId}::placeholder,
          input#${inputId}::-webkit-input-placeholder,
          input#${inputId}::-moz-placeholder,
          input#${inputId}:-ms-input-placeholder,
          textarea#${inputId}::placeholder,
          textarea#${inputId}::-webkit-input-placeholder,
          textarea#${inputId}::-moz-placeholder,
          textarea#${inputId}:-ms-input-placeholder {
            color: ${placeholderColor} !important;
            opacity: 1 !important;
          }
          /* Override any Tailwind placeholder classes */
          input#${inputId}.placeholder\\:text-muted-foreground::placeholder,
          textarea#${inputId}.placeholder\\:text-muted-foreground::placeholder {
            color: ${placeholderColor} !important;
            opacity: 1 !important;
          }
        `}</style>
        {label && (
          <Label
            htmlFor={inputId}
            className={labelStyles}
            style={{
              position: "absolute",
              top: "-1.25rem",
              left: 0,
            }}
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <div className="relative w-full">
          {multiline ? (
            <Textarea
              id={inputId}
              ref={ref}
              autoComplete="off"
              className={textareaClassName}
              rows={rows || minRows || 1}
              disabled={isDisabled || props?.disabled}
              style={{
                color: textColor,
                ...(sx?.color ? {} : {}),
                "--placeholder-color": placeholderColor,
              }}
              data-placeholder-color={placeholderColor}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !multiline) {
                  onEnter(e);
                }
                props?.onKeyDown?.(e);
              }}
              {...inputProps}
              {...props}
            />
          ) : (
            <Input
              id={inputId}
              ref={ref}
              autoComplete="off"
              className={inputClassName}
              disabled={isDisabled || props?.disabled}
              style={{
                color: textColor,
                ...(sx?.color ? {} : {}),
                "--placeholder-color": placeholderColor,
              }}
              data-placeholder-color={placeholderColor}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onEnter(e);
                }
                props?.onKeyDown?.(e);
              }}
              onFocus={(e) => {
                setTimeout(() => ref?.current?.select(), 10);
                props.onFocus?.(e);
              }}
              {...inputProps}
              {...props}
              type={effectiveType}
            />
          )}
          <div
            className="absolute right-[0.625rem] top-0 bottom-0 flex items-center justify-end pointer-events-none"
            style={{
              width: hasBothIconAndAdornment
                ? "8rem"
                : hasEndAdornment
                ? "3.5rem"
                : undefined,
            }}
            data-testid="ods-textfield-end-adornment-container"
            data-has-icon={showPasswordIcon ? "true" : "false"}
            data-has-end-adornment={InputProps?.endAdornment ? "true" : "false"}
          >
            <div className="pointer-events-auto inline-flex items-center shrink-0 min-w-0">
              {showPasswordIcon && (
                <button
                  type="button"
                  onClick={
                    isPasswordToggleInteractive
                      ? showPasswordHandler
                      : undefined
                  }
                  data-testid="show-password-icon"
                  className={cn(
                    "p-0 bg-transparent border-none shrink-0",
                    isPasswordToggleInteractive
                      ? "cursor-pointer hover:opacity-70"
                      : "cursor-default pointer-events-none opacity-70"
                  )}
                  style={{
                    color:
                      theme?.fonts?.answerColor ||
                      theme?.styles?.buttons ||
                      "var(--blue-gray-500)",
                  }}
                >
                  {showPassword ? (
                    <icons.eye
                      className="h-[18px] w-[18px]"
                      style={{ color: "inherit" }}
                    />
                  ) : (
                    <icons.eyeOff
                      className="h-[18px] w-[18px]"
                      style={{ color: "inherit" }}
                    />
                  )}
                </button>
              )}
              {InputProps?.endAdornment}
            </div>
            {errorType === "icon" && error && (
              <Tooltip title={helperText}>
                <div className="pointer-events-auto flex items-center h-full">
                  <ODSIcon
                    outeIconName="OUTEWarningIcon"
                    outeIconProps={{
                      style: {
                        color: "var(--error, #ff5252)",
                        cursor: "default",
                      },
                      "data-testid": "error-icon",
                    }}
                  />
                </div>
              </Tooltip>
            )}
          </div>
        </div>
        {helperText && errorType === "default" && (
          <p
            className={cn(
              "font-[Inter] text-[0.875rem] leading-[1.375rem] tracking-[var(--subtitle2-letter-spacing,0.0063rem)]",
              "m-0 absolute w-[calc(100%-1.5rem)] h-[1.25rem] overflow-x-auto overflow-y-hidden whitespace-nowrap",
              error ? "text-destructive" : "text-[var(--blue-gray-500)]"
            )}
            style={{
              bottom: "-1.5rem",
              left: "0.75rem",
            }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ODSTextField.displayName = "ODSTextField";

export default ODSTextField;
