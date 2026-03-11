import React from "react";
import {
  getFieldTypeConfig,
  getDataStructureBadge,
  getDataStructureLabel,
  DataStructureType,
} from "@/constants/field-type-registry";
import styles from "./FieldTypeIndicator.module.css";

const FieldTypeIndicator = ({ fieldType, showLabel = false, size = "small" }) => {
  const config = getFieldTypeConfig(fieldType);

  if (!config) {
    return null;
  }

  const badge = getDataStructureBadge(config.dataStructure);
  const label = getDataStructureLabel(config.dataStructure);

  const getColorClass = () => {
    switch (config.dataStructure) {
      case DataStructureType.PRIMITIVE:
        return styles.primitive;
      case DataStructureType.OBJECT:
        return styles.object;
      case DataStructureType.ARRAY:
        return styles.array;
      case DataStructureType.ARRAY_OF_OBJECTS:
        return styles.arrayOfObjects;
      default:
        return styles.primitive;
    }
  };

  return (
    <div
      className={`${styles.indicator} ${getColorClass()} ${styles[size]}`}
      title={`${config.displayName}: ${label}`}
    >
      <span className={styles.badge}>{badge}</span>
      {showLabel && <span className={styles.label}>{label}</span>}
    </div>
  );
};

export default FieldTypeIndicator;
