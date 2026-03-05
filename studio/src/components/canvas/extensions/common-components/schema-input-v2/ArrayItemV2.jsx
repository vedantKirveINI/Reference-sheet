import { useState } from "react";
// import { ODSIcon as Icon } from '@src/module/ods';
import { ODSIcon as Icon } from "@src/module/ods";
import PrimitiveInputV2 from "./PrimitiveInputV2";
import styles from "./ArrayItemV2.module.css";

const ArrayItemV2 = ({
  index,
  value,
  arrayType,
  arraySchema,
  onValueChange,
  onRemove,
  renderInput,
  getActualKey,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handlePrimitiveChange = (newValue) => {
    onValueChange(newValue);
  };

  if (["object", "json"].includes(arrayType)) {
    return (
      <div className={styles.arrayItem}>
        <div className={styles.itemHeader}>
          <div className={styles.itemHeaderContent}>
            <button
              type="button"
              className={styles.itemToggle}
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse item" : "Expand item"}
            >
              <Icon
                outeIconName="OUTEChevronRightIcon"
                outeIconProps={{
                  sx: {
                    color: "#6b7280",
                    width: "1rem",
                    height: "1rem",
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  },
                }}
              />
            </button>
            <span className={styles.itemNumber}>Item {index + 1}</span>
          </div>

          <button
            type="button"
            className={styles.removeButton}
            onClick={onRemove}
            aria-label="Remove item"
          >
            <Icon
              outeIconName="OUTETrashIcon"
              outeIconProps={{
                sx: { color: "#ef4444", width: "1.125rem", height: "1.125rem" },
              }}
            />
          </button>
        </div>

        {isExpanded && (
          <div className={styles.itemContent}>
            {arraySchema.schema?.map((subItem, subIndex) => {
              const subKey = getActualKey(subItem) || `field_${subIndex}`;
              return renderInput(
                subItem,
                subKey,
                value?.[subKey],
                (newValue) => {
                  const updatedValue = { ...value, [subKey]: newValue };
                  onValueChange(updatedValue);
                }
              );
            })}
          </div>
        )}
      </div>
    );
  } else {
    const primitiveType = arrayType === "any" ? "string" : arrayType;

    return (
      <div className={styles.arrayItem}>
        <div className={styles.itemHeader}>
          <div className={styles.itemHeaderContent}>
            <span className={styles.itemNumber}>Item {index + 1}</span>
            <span className={styles.itemTypeBadge}>
              {primitiveType === "any" ? "String" : primitiveType}
            </span>
          </div>

          <button
            type="button"
            className={styles.removeButton}
            onClick={onRemove}
            aria-label="Remove item"
          >
            <Icon
              outeIconName="OUTETrashIcon"
              outeIconProps={{
                sx: { color: "#ef4444", width: "1.125rem", height: "1.125rem" },
              }}
            />
          </button>
        </div>

        <div className={styles.itemContent}>
          <PrimitiveInputV2
            type={primitiveType}
            label="Value"
            value={value}
            onChange={handlePrimitiveChange}
            hideLabel={false}
          />
        </div>
      </div>
    );
  }
};

export default ArrayItemV2;
