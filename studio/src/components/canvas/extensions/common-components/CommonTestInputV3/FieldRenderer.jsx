import React, { useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Mail, Link, Hash, Type, Code, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";

const TYPE_ICONS = {
  text: Type,
  string: Type,
  email: Mail,
  url: Link,
  number: Hash,
  integer: Hash,
  date: Calendar,
  datetime: Calendar,
  json: Code,
  object: Code,
  array: Code,
};

const FieldRenderer = ({
  field,
  value,
  onChange,
  customRenderer = null,
  error = null,
  theme = {},
}) => {
  const {
    key,
    label,
    type = "text",
    placeholder,
    required = false,
    description,
    options,
  } = field;

  const TypeIcon = TYPE_ICONS[type] || Type;

  const handleChange = useCallback(
    (newValue) => {
      onChange(newValue);
    },
    [onChange]
  );

  const defaultRenderer = useMemo(() => {
    switch (type) {
      case "boolean":
        return (
          <div className={styles.booleanField}>
            <Switch
              id={key}
              checked={!!value}
              onCheckedChange={handleChange}
            />
            <Label htmlFor={key} className={styles.booleanLabel}>
              {value ? "True" : "False"}
            </Label>
          </div>
        );

      case "number":
      case "integer":
      case "int":
        return (
          <Input
            id={key}
            type="number"
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.valueAsNumber || e.target.value)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className={cn(styles.input, error && styles.inputError)}
          />
        );

      case "date":
        return (
          <Input
            id={key}
            type="date"
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            className={cn(styles.input, error && styles.inputError)}
          />
        );

      case "datetime":
        return (
          <Input
            id={key}
            type="datetime-local"
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            className={cn(styles.input, error && styles.inputError)}
          />
        );

      case "email":
        return (
          <Input
            id={key}
            type="email"
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder || "email@example.com"}
            className={cn(styles.input, error && styles.inputError)}
          />
        );

      case "url":
        return (
          <Input
            id={key}
            type="url"
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder || "https://"}
            className={cn(styles.input, error && styles.inputError)}
          />
        );

      case "json":
      case "object":
      case "array":
        return (
          <Textarea
            id={key}
            value={typeof value === "object" ? JSON.stringify(value, null, 2) : value ?? ""}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleChange(parsed);
              } catch {
                handleChange(e.target.value);
              }
            }}
            placeholder={placeholder || '{\n  "key": "value"\n}'}
            className={cn(styles.textarea, styles.jsonInput, error && styles.inputError)}
            rows={4}
          />
        );

      case "textarea":
      case "long_text":
        return (
          <Textarea
            id={key}
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className={cn(styles.textarea, error && styles.inputError)}
            rows={3}
          />
        );

      case "select":
        return (
          <select
            id={key}
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            className={cn(styles.select, error && styles.inputError)}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options?.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        );

      case "text":
      case "string":
      default:
        return (
          <Input
            id={key}
            type="text"
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className={cn(styles.input, error && styles.inputError)}
          />
        );
    }
  }, [type, key, value, handleChange, placeholder, label, options, error]);

  if (customRenderer) {
    const customResult = customRenderer(field, () => defaultRenderer);
    if (customResult !== undefined) {
      return customResult;
    }
  }

  return (
    <div className={styles.fieldContainer}>
      <div className={styles.labelRow}>
        <Label htmlFor={key} className={styles.fieldLabel}>
          <TypeIcon className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
          {label}
          {required && <span className={styles.required}>*</span>}
        </Label>
        {type !== "boolean" && (
          <span className={styles.typeHint}>{type}</span>
        )}
      </div>

      {description && (
        <p className={styles.description}>{description}</p>
      )}

      <div className={styles.inputWrapper}>
        {defaultRenderer}
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FieldRenderer;
