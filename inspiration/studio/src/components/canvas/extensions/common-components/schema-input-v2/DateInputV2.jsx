import { forwardRef } from "react";
import dayjs from "dayjs";
import styles from "./DateInputV2.module.css";
import { useEffect, useState } from "react";

function DateInputV2({ label, value, onChange, placeholder, onEnterKey }, ref) {
  const shouldShowLabel = label && label !== "response";

  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handlePickerChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue) {
      // Convert datetime-local to ISO string
      const isoString = dayjs(newValue).toISOString();
      onChange(isoString);
    } else {
      onChange("");
    }
  };

  useEffect(() => {
    if (value) {
      // Convert ISO string to datetime-local format for input
      const date = dayjs(value);
      if (date.isValid()) {
        setInputValue(date.format("YYYY-MM-DDTHH:mm"));
      } else {
        setInputValue("");
      }
    } else {
      setInputValue("");
    }
  }, [value]);

  return (
    <div className={styles.dateInputWrapper}>
      {shouldShowLabel && (
        <label className={styles.label}>
          <span className={styles.labelText}>{label}</span>
          <span className={styles.typeBadge}>Date</span>
        </label>
      )}
      <input
        ref={ref}
        type="datetime-local"
        className={styles.input}
        value={inputValue || ""}
        onChange={handlePickerChange}
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
}

export default forwardRef(DateInputV2);
