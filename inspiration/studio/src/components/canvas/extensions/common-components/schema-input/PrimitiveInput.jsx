import DateInput from "./DateInput";
import styles from "./PrimitiveInput.module.css";
import startCase from "lodash/startCase";
import isNil from "lodash/isNil";

const PrimitiveInput = ({ type, label, value, onChange, placeholder }) => {
  switch (type) {
    case "string":
      return (
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            {label === "response" ? "" : startCase(label)} (String)
          </label>
          <input
            type="text"
            className={styles.input}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || `Enter ${label}`}
          />
        </div>
      );

    case "number":
      return (
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            {label === "response" ? "" : startCase(label)} (Number)
          </label>
          <input
            type="number"
            className={styles.input}
            value={isNil(value) ? "" : value}
            onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
            placeholder={placeholder || `Enter ${label}`}
          />
        </div>
      );

    case "boolean":
      return (
        <div className={styles.inputGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
            />
            {label === "response" ? "" : label} (Boolean)
          </label>
        </div>
      );

    case "date":
      return (
        <DateInput
          label={label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      );

    default:
      return null;
  }
};

export default PrimitiveInput;
