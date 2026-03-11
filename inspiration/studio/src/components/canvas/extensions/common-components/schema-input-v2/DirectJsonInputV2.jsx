import { useState } from "react";
import styles from "./DirectJsonInputV2.module.css";

const DirectJsonInputV2 = ({
  label,
  value,
  onValueChange,
  type = "object",
}) => {
  const [inputValue, setInputValue] = useState(
    value ? JSON.stringify(value, null, 2) : ""
  );
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setError("");

    if (newValue.trim() === "") {
      onValueChange(type === "array" ? [] : {});
      return;
    }

    try {
      const parsed = JSON.parse(newValue);
      if (type === "array" && !Array.isArray(parsed)) {
        setError("Value must be a valid JSON array");
        return;
      }
      if (type === "object" && Array.isArray(parsed)) {
        setError("Value must be a valid JSON object");
        return;
      }
      onValueChange(parsed);
    } catch (err) {
      setError("Invalid JSON format");
    }
  };

  return (
    <div className={styles.jsonInputContainer}>
      {label && (
        <label className={styles.jsonLabel}>
          <span className={styles.jsonLabelText}>{label}</span>
          <span className={styles.jsonTypeBadge}>
            {type === "array" ? "Array" : "Object"} (JSON)
          </span>
        </label>
      )}

      <textarea
        className={`${styles.jsonTextarea} ${error ? styles.error : ""}`}
        value={inputValue}
        onChange={handleChange}
        placeholder={`Enter a valid JSON ${type}...`}
        rows={8}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default DirectJsonInputV2;
