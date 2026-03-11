import { useState, useEffect } from "react";
import PrimitiveInput from "./PrimitiveInput";
import DirectJsonInput from "./DirectJsonInput";
// import Autocomplete from "oute-ds-autocomplete";
import { ODSAutocomplete as Autocomplete } from "@src/module/ods";
import dayjs from "dayjs";
import styles from "./AnyInput.module.css";

const typeOptions = [
  { label: "String", value: "string" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
  { label: "Date", value: "date" },
  { label: "Array", value: "array" },
  { label: "Object", value: "object" },
];

const AnyInput = ({ label, value, onChange, placeholder }) => {
  const [selectedType, setSelectedType] = useState("string");
  const [currentValue, setCurrentValue] = useState(value || "");

  useEffect(() => {
    if (value !== undefined && value !== null && value !== "") {
      if (typeof value === "string") {
        // Check if it's a valid ISO date string
        const date = dayjs(value);
        if (date.isValid() && value.includes("T")) {
          setSelectedType("date");
        } else {
          setSelectedType("string");
        }
      } else if (typeof value === "number") {
        setSelectedType("number");
      } else if (typeof value === "boolean") {
        setSelectedType("boolean");
      } else if (Array.isArray(value)) {
        setSelectedType("array");
      } else if (typeof value === "object") {
        setSelectedType("object");
      }
    }
    setCurrentValue(value || "");
  }, [value]);

  const handleTypeChange = (event, newValue) => {
    if (!newValue) return;

    const newType = newValue.value;
    setSelectedType(newType);

    let convertedValue;
    switch (newType) {
      case "string":
        convertedValue = String(currentValue || "");
        break;
      case "number":
        convertedValue = currentValue ? Number(currentValue) || 0 : 0;
        break;
      case "boolean":
        convertedValue = Boolean(currentValue);
        break;
      case "date":
        if (currentValue) {
          const date = dayjs(currentValue);
          convertedValue = date.isValid()
            ? date.toISOString()
            : dayjs().toISOString();
        } else {
          convertedValue = dayjs().toISOString();
        }
        break;
      case "array":
        convertedValue = Array.isArray(currentValue) ? currentValue : [];
        break;
      case "object":
        convertedValue =
          typeof currentValue === "object" && !Array.isArray(currentValue)
            ? currentValue
            : {};
        break;
      default:
        convertedValue = currentValue;
    }

    setCurrentValue(convertedValue);
    onChange(convertedValue);
  };

  const handleValueChange = (newValue) => {
    setCurrentValue(newValue);
    onChange(newValue);
  };

  const renderInputByType = () => {
    switch (selectedType) {
      case "string":
      case "number":
      case "boolean":
      case "date": // Added date to primitive input types
        return (
          <PrimitiveInput
            type={selectedType}
            label=""
            value={currentValue}
            onChange={handleValueChange}
          />
        );
      case "array":
      case "object":
        return (
          <DirectJsonInput
            label=""
            value={currentValue}
            onValueChange={handleValueChange}
            type={selectedType}
          />
        );
      default:
        return (
          <textarea
            className={styles.textarea}
            value={currentValue || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={placeholder || `Enter ${label} (any format)`}
            rows={3}
          />
        );
    }
  };

  return (
    <div className={styles.inputGroup}>
      <div className={styles.headerRow}>
        {/* <label className={styles.label}> */}
        {label === "response" ? "" : label}
        {/* </label> */}
        <Autocomplete
          value={
            typeOptions.find((option) => option.value === selectedType) ||
            typeOptions[0]
          }
          variant="black"
          onChange={handleTypeChange}
          fullWidth
          options={typeOptions}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          //   size="small"
          //   className={styles.typeSelector}
          disableClearable
        />
      </div>
      {renderInputByType()}
    </div>
  );
};

export default AnyInput;
