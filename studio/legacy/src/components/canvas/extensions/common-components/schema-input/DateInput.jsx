import { useState, useEffect } from "react";
import dayjs from "dayjs";
import styles from "./DateInput.module.css";

const DateInput = ({ label, value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState("");

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

  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>{label} (Date)</label>

      <input
        type="datetime-local"
        className={styles.input}
        value={inputValue}
        onChange={handlePickerChange}
        // placeholder={placeholder || "Select date and time"}
      />
    </div>
  );
};

export default DateInput;
