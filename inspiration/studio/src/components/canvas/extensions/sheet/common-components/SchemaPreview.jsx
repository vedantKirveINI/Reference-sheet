import React, { useState } from "react";
import {
  getFieldTypeConfig,
  getDataStructureLabel,
  DataStructureType,
  isComplexType,
} from "@/constants/field-type-registry";
import FieldTypeIndicator from "./FieldTypeIndicator";
import styles from "./SchemaPreview.module.css";

const SchemaPreview = ({ fieldType, expanded = false, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const config = getFieldTypeConfig(fieldType);

  if (!config || !isComplexType(fieldType)) {
    return null;
  }

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  const renderKeyList = (keys, isArrayItem = false) => {
    if (!keys || keys.length === 0) return null;

    return (
      <div className={styles.keyList}>
        {isArrayItem && (
          <div className={styles.arrayIndicator}>Each item contains:</div>
        )}
        {keys.map((keyConfig) => (
          <div key={keyConfig.key} className={styles.keyItem}>
            <div className={styles.keyHeader}>
              <code className={styles.keyName}>{keyConfig.key}</code>
              <span className={styles.arrow}>→</span>
              <span className={styles.keyLabel}>{keyConfig.label}</span>
              {keyConfig.required && (
                <span className={styles.requiredBadge}>Required</span>
              )}
            </div>
            {keyConfig.description && (
              <div className={styles.keyDescription}>{keyConfig.description}</div>
            )}
            {keyConfig.placeholder && (
              <div className={styles.keyPlaceholder}>
                Example: <code>{keyConfig.placeholder}</code>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderExample = () => {
    if (!config.example) return null;

    let exampleStr;
    try {
      exampleStr = JSON.stringify(config.example, null, 2);
    } catch {
      exampleStr = String(config.example);
    }

    return (
      <div className={styles.exampleSection}>
        <div className={styles.exampleHeader}>Example Value:</div>
        <pre className={styles.exampleCode}>{exampleStr}</pre>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.toggleButton}
        onClick={handleToggle}
        type="button"
      >
        <FieldTypeIndicator fieldType={fieldType} showLabel size="medium" />
        <span className={styles.toggleIcon}>{isExpanded ? "▼" : "▶"}</span>
        <span className={styles.toggleText}>
          {isExpanded ? "Hide structure" : "View expected structure"}
        </span>
      </button>

      {isExpanded && (
        <div className={styles.previewContent}>
          <div className={styles.header}>
            <span className={styles.typeName}>{config.displayName}</span>
            <span className={styles.structureType}>
              ({getDataStructureLabel(config.dataStructure)})
            </span>
          </div>

          <div className={styles.description}>{config.description}</div>

          {config.dataStructure === DataStructureType.OBJECT && (
            <>
              <div className={styles.structureHint}>
                This field expects an object with the following properties:
              </div>
              {renderKeyList(config.keys)}
            </>
          )}

          {config.dataStructure === DataStructureType.ARRAY_OF_OBJECTS && (
            <>
              <div className={styles.structureHint}>
                This field expects an array of objects:
              </div>
              {renderKeyList(config.arrayItemKeys, true)}
            </>
          )}

          {renderExample()}

          {config.validationHints && config.validationHints.length > 0 && (
            <div className={styles.hintsSection}>
              <div className={styles.hintsHeader}>Tips:</div>
              <ul className={styles.hintsList}>
                {config.validationHints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchemaPreview;
