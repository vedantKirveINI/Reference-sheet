import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Type, Hash, Calendar, Mail, Link, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";

const TYPE_ICONS = {
  text: Type,
  string: Type,
  email: Mail,
  url: Link,
  number: Hash,
  integer: Hash,
  int: Hash,
  date: Calendar,
  datetime: Calendar,
  json: Code,
  object: Code,
  array: Code,
  boolean: null,
};

const TYPE_COLORS = {
  text: "bg-gray-100 text-gray-700",
  string: "bg-gray-100 text-gray-700",
  email: "bg-blue-100 text-blue-700",
  url: "bg-purple-100 text-purple-700",
  number: "bg-green-100 text-green-700",
  integer: "bg-green-100 text-green-700",
  int: "bg-green-100 text-green-700",
  date: "bg-amber-100 text-amber-700",
  datetime: "bg-amber-100 text-amber-700",
  json: "bg-indigo-100 text-indigo-700",
  object: "bg-indigo-100 text-indigo-700",
  array: "bg-pink-100 text-pink-700",
  boolean: "bg-cyan-100 text-cyan-700",
};

const CompactTableMode = ({
  sections,
  values,
  onValueChange,
  fieldConfig = {},
  inputRenderer = null,
  validationErrors = {},
  theme = {},
}) => {
  const renderCompactInput = useCallback(
    (field) => {
      const { key, type = "text", placeholder, label } = field;
      const value = values[key];
      const error = validationErrors[key];

      if (inputRenderer) {
        const custom = inputRenderer(field, null);
        if (custom !== undefined) {
          return custom;
        }
      }

      switch (type) {
        case "boolean":
          return (
            <div className={styles.compactBooleanCell}>
              <Switch
                checked={!!value}
                onCheckedChange={(checked) => onValueChange(key, checked)}
                className={styles.compactSwitch}
              />
              <span className={styles.compactBooleanLabel}>
                {value ? "True" : "False"}
              </span>
            </div>
          );

        case "number":
        case "integer":
        case "int":
          return (
            <Input
              type="number"
              value={value ?? ""}
              onChange={(e) =>
                onValueChange(key, e.target.valueAsNumber || e.target.value)
              }
              placeholder={placeholder || "0"}
              className={cn(styles.compactInput, error && styles.inputError)}
            />
          );

        case "date":
          return (
            <Input
              type="date"
              value={value ?? ""}
              onChange={(e) => onValueChange(key, e.target.value)}
              className={cn(styles.compactInput, error && styles.inputError)}
            />
          );

        case "json":
        case "object":
        case "array":
          return (
            <Textarea
              value={
                typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : value ?? ""
              }
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onValueChange(key, parsed);
                } catch {
                  onValueChange(key, e.target.value);
                }
              }}
              placeholder={placeholder || "{}"}
              className={cn(
                styles.compactTextarea,
                error && styles.inputError
              )}
              rows={2}
            />
          );

        default:
          return (
            <Input
              type="text"
              value={value ?? ""}
              onChange={(e) => onValueChange(key, e.target.value)}
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
              className={cn(styles.compactInput, error && styles.inputError)}
            />
          );
      }
    },
    [values, validationErrors, inputRenderer, onValueChange]
  );

  const allFields = sections.flatMap((section) => section.fields);

  return (
    <div className={styles.compactTableContainer}>
      <table className={styles.compactTable}>
        <thead>
          <tr>
            <th className={styles.compactHeaderField}>Field</th>
            <th className={styles.compactHeaderType}>Type</th>
            <th className={styles.compactHeaderValue}>Value</th>
          </tr>
        </thead>
        <tbody>
          {allFields.map((field) => {
            const TypeIcon = TYPE_ICONS[field.type];
            const typeColorClass = TYPE_COLORS[field.type] || TYPE_COLORS.text;
            const error = validationErrors[field.key];

            return (
              <tr
                key={field.key}
                className={cn(
                  styles.compactRow,
                  error && styles.compactRowError
                )}
              >
                <td className={styles.compactCellField}>
                  <div className={styles.fieldNameWrapper}>
                    <span className={styles.fieldName}>{field.label}</span>
                    {field.required && (
                      <span className={styles.requiredIndicator}>*</span>
                    )}
                  </div>
                  {error && (
                    <div className={styles.compactError}>
                      <AlertCircle className="w-3 h-3" />
                      <span>{error}</span>
                    </div>
                  )}
                </td>
                <td className={styles.compactCellType}>
                  <span className={cn(styles.typeBadge, typeColorClass)}>
                    {TypeIcon && <TypeIcon className="w-3 h-3 mr-1" />}
                    {field.type}
                  </span>
                </td>
                <td className={styles.compactCellValue}>
                  {renderCompactInput(field)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CompactTableMode;
