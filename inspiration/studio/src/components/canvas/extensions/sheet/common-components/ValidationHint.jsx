import React from "react";
import { getFieldTypeConfig, getValidationHints } from "@/constants/field-type-registry";
import styles from "./ValidationHint.module.css";

const ValidationHint = ({
  fieldType,
  value,
  showAlways = false,
  customErrors = [],
}) => {
  const config = getFieldTypeConfig(fieldType);
  const hints = getValidationHints(fieldType);

  const validateValue = () => {
    if (!config || value === undefined || value === null) {
      return { isValid: true, errors: [] };
    }

    const errors = [];
    const dataStructure = config.dataStructure;

    switch (dataStructure) {
      case "object":
        if (typeof value !== "object" || Array.isArray(value)) {
          errors.push(`This field expects an object, but received ${Array.isArray(value) ? "an array" : typeof value}`);
        }
        break;

      case "array":
        if (!Array.isArray(value)) {
          errors.push(`This field expects a list, but received ${typeof value}`);
        }
        break;

      case "arrayOfObjects":
        if (!Array.isArray(value)) {
          errors.push(`This field expects a list of items, but received ${typeof value}`);
        } else if (value.length > 0 && typeof value[0] !== "object") {
          errors.push("Each item in the list should be an object with the required fields");
        }
        break;

      case "primitive":
        if (typeof value === "object" && value !== null) {
          errors.push(`This field expects a simple value (text, number), but received ${Array.isArray(value) ? "a list" : "an object"}`);
        }
        break;

      default:
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validation = validateValue();
  const allErrors = [...validation.errors, ...customErrors];
  const hasErrors = allErrors.length > 0;

  if (!showAlways && !hasErrors) {
    return null;
  }

  return (
    <div className={styles.container}>
      {hasErrors && (
        <div className={styles.errorsSection}>
          {allErrors.map((error, index) => (
            <div key={index} className={styles.errorItem}>
              <span className={styles.errorIcon}>⚠</span>
              <span className={styles.errorText}>{error}</span>
            </div>
          ))}
        </div>
      )}

      {showAlways && hints.length > 0 && (
        <div className={styles.hintsSection}>
          {hints.map((hint, index) => (
            <div key={index} className={styles.hintItem}>
              <span className={styles.hintIcon}>💡</span>
              <span className={styles.hintText}>{hint}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ValidationHint;
