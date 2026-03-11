import { forwardRef, useState } from "react";
import DateInputV2 from "./DateInputV2";
import styles from "./PrimitiveInputV2.module.css";
import startCase from "lodash/startCase";

const typeMap = {
  string: "String",
  number: "Number",
  boolean: "Boolean",
  date: "Date",
};

function PrimitiveInputV2(
  { type, label, value, onChange, placeholder, hideLabel = false, onEnterKey },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);

  const getTypeLabel = () => {
    return typeMap[type] || "String";
  };

  const shouldShowLabel = !hideLabel && label && label !== "response";

  switch (type) {
    case "string":
      return (
        <div className={styles.inputWrapper}>
          {shouldShowLabel && (
            <label className={styles.label}>
              <span className={styles.labelText}>{startCase(label)}</span>
              <span className={styles.typeBadge}>{getTypeLabel()}</span>
            </label>
          )}
          <input
            ref={ref}
            type="text"
            className={styles.input}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onEnterKey) {
                e.preventDefault();
                onEnterKey();
              }
            }}
            placeholder={placeholder || `Enter ${label}`}
          />
          {isFocused && (
            <div className={styles.hintMessage}>
              Press Enter to move to the next field
            </div>
          )}
        </div>
      );

    case "number":
      return (
        <div className={styles.inputWrapper}>
          {shouldShowLabel && (
            <label className={styles.label}>
              <span className={styles.labelText}>{startCase(label)}</span>
              <span className={styles.typeBadge}>{getTypeLabel()}</span>
            </label>
          )}
          <input
            ref={ref}
            type="number"
            className={styles.input}
            value={value}
            onChange={(e) => onChange(Number.parseFloat(e.target.value))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onEnterKey) {
                e.preventDefault();
                onEnterKey();
              }
            }}
            placeholder={placeholder || `Enter ${label}`}
          />
          {isFocused && (
            <div className={styles.hintMessage}>
              Press Enter to move to the next field
            </div>
          )}
        </div>
      );

    case "boolean":
      return (
        <div className={styles.inputWrapper}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className={styles.checkboxText}>
              {label === "response" ? "" : startCase(label)}
              <span className={styles.typeBadge}>{getTypeLabel()}</span>
            </span>
          </label>
        </div>
      );

    case "date":
      return (
        <DateInputV2
          ref={ref}
          label={label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onEnterKey={onEnterKey}
        />
      );

    default:
      return null;
  }
}

export default forwardRef(PrimitiveInputV2);
