import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import HelperText from "./HelperText";

interface SettingsTextFieldProps {
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  dataTestId?: string;
  multiline?: boolean;
  rows?: number;
  error?: boolean;
  helperText?: string;
  className?: string;
  maxLength?: number;
  [key: string]: any; // Allow any additional props to be passed through
}

export const SettingsTextField = ({
  label,
  value,
  placeholder,
  onChange,
  dataTestId,
  multiline,
  rows,
  error,
  helperText,
  maxLength,
  className = "default",
  InputProps,
  style,
  ...props
}: SettingsTextFieldProps) => {
  // Only apply error state styling, let shadcn use default theme colors
  const inputClasses = cn(
    error && "border-destructive focus-visible:ring-destructive",
    className
  );

  // Extract style from InputProps.sx if provided
  const inputStyle = InputProps?.sx || style;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      )}
      {multiline ? (
        <Textarea
          value={value || ""}
          placeholder={placeholder || ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          rows={rows}
          maxLength={maxLength}
          data-testid={dataTestId}
          style={inputStyle}
          {...props}
        />
      ) : (
        <Input
          type="text"
          value={value || ""}
          placeholder={placeholder || ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          maxLength={maxLength}
          data-testid={dataTestId}
          style={inputStyle}
          {...props}
        />
      )}
      {helperText && (
        <HelperText error={error}>{helperText}</HelperText>
      )}
    </div>
  );
};

export default SettingsTextField;
