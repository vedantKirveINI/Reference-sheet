import { useState, useEffect, forwardRef } from "react";
import PrimitiveInputV2 from "./PrimitiveInputV2";
import DirectJsonInputV2 from "./DirectJsonInputV2";
// import Autocomplete from "oute-ds-autocomplete";
import { ODSAutocomplete as Autocomplete } from "@src/module/ods";
import dayjs from "dayjs";
import styles from "./AnyInputV2.module.css";

const typeOptions = [
  { label: "String", value: "string" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
  { label: "Date", value: "date" },
  { label: "Array", value: "array" },
  { label: "Object", value: "object" },
];

function AnyInputV2({ label, value, onChange, placeholder, onEnterKey }, ref) {
  const [selectedType, setSelectedType] = useState("string");
  const [currentValue, setCurrentValue] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value !== undefined && value !== null && value !== "") {
      if (typeof value === "string") {
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
    if (newValue) {
      setSelectedType(newValue.value);
      setCurrentValue("");
      onChange("");
    }
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
      case "date":
        return (
          <PrimitiveInputV2
            ref={ref}
            type={selectedType}
            label=""
            value={currentValue}
            onChange={handleValueChange}
            hideLabel={true}
            onEnterKey={onEnterKey}
          />
        );
      case "array":
      case "object":
        return (
          <DirectJsonInputV2
            label=""
            value={currentValue}
            onValueChange={handleValueChange}
            type={selectedType}
          />
        );
      default:
        return (
          <div className={styles.textareaWrapper}>
            <textarea
              ref={ref}
              className={styles.textarea}
              value={currentValue || ""}
              onChange={(e) => handleValueChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && onEnterKey) {
                  e.preventDefault();
                  onEnterKey();
                }
              }}
              placeholder={placeholder || `Enter ${label} (any format)`}
              rows={3}
            />
            {isFocused && (
              <div className={styles.hintMessage}>
                Press Enter to move to the next field
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={styles.anyInputContainer}>
      <div className={styles.anyInputHeader}>
        <label className={styles.anyInputLabel}>{label}</label>
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
          disableClearable
        />
      </div>
      {renderInputByType()}
    </div>
  );
}

export default forwardRef(AnyInputV2);
