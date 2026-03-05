import React, { useState, useCallback } from "react";
import {
  getFieldTypeConfig,
  DataStructureType,
} from "@/constants/field-type-registry";
import {
  getPlaceholderForKey,
  createEmptyValueForType,
} from "@/constants/field-label-utils";
import FieldTypeIndicator from "./FieldTypeIndicator";
import SchemaPreview from "./SchemaPreview";
import ValidationHint from "./ValidationHint";
import styles from "./SmartObjectInput.module.css";

const SmartObjectInput = ({
  fieldType,
  value,
  onChange,
  disabled = false,
  showTypeIndicator = true,
  showSchemaPreview = true,
  showValidation = true,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const config = getFieldTypeConfig(fieldType);

  const handleObjectKeyChange = useCallback(
    (key, newValue) => {
      const currentValue = typeof value === "object" && value !== null ? value : {};
      onChange({
        ...currentValue,
        [key]: newValue,
      });
    },
    [value, onChange]
  );

  const handleArrayItemChange = useCallback(
    (index, key, newValue) => {
      const currentArray = Array.isArray(value) ? [...value] : [];
      if (!currentArray[index]) {
        currentArray[index] = {};
      }
      currentArray[index] = {
        ...currentArray[index],
        [key]: newValue,
      };
      onChange(currentArray);
    },
    [value, onChange]
  );

  const handleAddArrayItem = useCallback(() => {
    const currentArray = Array.isArray(value) ? [...value] : [];
    const emptyItem = {};
    config?.arrayItemKeys?.forEach((k) => {
      emptyItem[k.key] = "";
    });
    currentArray.push(emptyItem);
    onChange(currentArray);
  }, [value, onChange, config]);

  const handleRemoveArrayItem = useCallback(
    (index) => {
      const currentArray = Array.isArray(value) ? [...value] : [];
      currentArray.splice(index, 1);
      onChange(currentArray);
    },
    [value, onChange]
  );

  const initializeValue = useCallback(() => {
    const emptyValue = createEmptyValueForType(fieldType);
    onChange(emptyValue);
  }, [fieldType, onChange]);

  const renderObjectInputs = () => {
    const keys = config?.keys || [];
    const currentValue = typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};

    return (
      <div className={styles.objectInputs}>
        {keys.map((keyConfig) => (
          <div key={keyConfig.key} className={styles.inputRow}>
            <label className={styles.inputLabel}>
              {keyConfig.label}
              {keyConfig.required && <span className={styles.required}>*</span>}
            </label>
            <input
              type="text"
              className={styles.input}
              value={currentValue[keyConfig.key] || ""}
              onChange={(e) => handleObjectKeyChange(keyConfig.key, e.target.value)}
              placeholder={getPlaceholderForKey(fieldType, keyConfig.key)}
              disabled={disabled}
            />
            {keyConfig.description && (
              <span className={styles.inputHint}>{keyConfig.description}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderArrayOfObjectsInputs = () => {
    const keys = config?.arrayItemKeys || [];
    const currentArray = Array.isArray(value) ? value : [];

    return (
      <div className={styles.arrayInputs}>
        {currentArray.map((item, index) => (
          <div key={index} className={styles.arrayItem}>
            <div className={styles.arrayItemHeader}>
              <span className={styles.arrayItemIndex}>Item {index + 1}</span>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => handleRemoveArrayItem(index)}
                disabled={disabled}
              >
                Remove
              </button>
            </div>
            <div className={styles.arrayItemFields}>
              {keys.map((keyConfig) => (
                <div key={keyConfig.key} className={styles.inputRow}>
                  <label className={styles.inputLabel}>
                    {keyConfig.label}
                    {keyConfig.required && <span className={styles.required}>*</span>}
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={item?.[keyConfig.key] || ""}
                    onChange={(e) =>
                      handleArrayItemChange(index, keyConfig.key, e.target.value)
                    }
                    placeholder={keyConfig.placeholder || ""}
                    disabled={disabled}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          className={styles.addButton}
          onClick={handleAddArrayItem}
          disabled={disabled}
        >
          + Add Item
        </button>
      </div>
    );
  };

  const renderPrimitiveInput = () => {
    return (
      <input
        type="text"
        className={styles.input}
        value={typeof value === "string" || typeof value === "number" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config?.placeholder || "Enter value..."}
        disabled={disabled}
      />
    );
  };

  if (!config) {
    return (
      <div className={styles.container}>
        <input
          type="text"
          className={styles.input}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter value..."
          disabled={disabled}
        />
      </div>
    );
  }

  const needsInitialization =
    config.dataStructure !== DataStructureType.PRIMITIVE &&
    (value === undefined || value === null || value === "");

  return (
    <div className={styles.container}>
      {showTypeIndicator && (
        <div className={styles.header}>
          <FieldTypeIndicator fieldType={fieldType} showLabel size="small" />
        </div>
      )}

      {showSchemaPreview && config.dataStructure !== DataStructureType.PRIMITIVE && (
        <SchemaPreview
          fieldType={fieldType}
          expanded={showPreview}
          onToggle={setShowPreview}
        />
      )}

      {needsInitialization ? (
        <div className={styles.initializeSection}>
          <p className={styles.initializeText}>
            This field requires a {config.dataStructure === DataStructureType.OBJECT ? "structured object" : "list of items"}.
          </p>
          <button
            type="button"
            className={styles.initializeButton}
            onClick={initializeValue}
            disabled={disabled}
          >
            Set Up {config.displayName} Fields
          </button>
        </div>
      ) : (
        <div className={styles.inputSection}>
          {config.dataStructure === DataStructureType.PRIMITIVE && renderPrimitiveInput()}
          {config.dataStructure === DataStructureType.OBJECT && renderObjectInputs()}
          {config.dataStructure === DataStructureType.ARRAY_OF_OBJECTS &&
            renderArrayOfObjectsInputs()}
        </div>
      )}

      {showValidation && (
        <ValidationHint fieldType={fieldType} value={value} showAlways={false} />
      )}
    </div>
  );
};

export default SmartObjectInput;
