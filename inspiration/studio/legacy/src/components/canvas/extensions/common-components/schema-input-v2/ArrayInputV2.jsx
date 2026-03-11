import { useState } from "react";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "@src/module/ods";
import ArrayItemV2 from "./ArrayItemV2";
import styles from "./ArrayInputV2.module.css";
import startCase from "lodash/startCase";
import lowerCase from "lodash/lowerCase";

const getDataTypeLabel = ({ arrayType, arraySchema }) => {
  if (arrayType === "any") return "String";
  return startCase(lowerCase(arraySchema?.type || arraySchema?.Type || "Item"));
};

const ArrayInputV2 = ({
  label,
  value = [],
  arraySchema,
  onValueChange,
  renderInput,
  getActualKey,
  getDisplayName,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const arrayType =
    arraySchema?.type?.toLowerCase() || arraySchema?.Type?.toLowerCase();

  const addArrayItem = () => {
    let newItem;
    if (["object", "json"].includes(arrayType)) {
      newItem = {};
    } else if (arrayType === "string" || arrayType === "any") {
      newItem = "";
    } else if (arrayType === "number") {
      newItem = 0;
    } else if (arrayType === "boolean") {
      newItem = false;
    } else {
      newItem = "";
    }

    const newArray = [...value, newItem];
    onValueChange(newArray);
  };

  const removeArrayItem = (index) => {
    const newArray = value.filter((_, i) => i !== index);
    onValueChange(newArray);
  };

  const handleArrayItemChange = (index, itemValue) => {
    const newArray = [...value];
    newArray[index] = itemValue;
    onValueChange(newArray);
  };

  const getStructureInfo = () => {
    if (arrayType === "object" && arraySchema?.schema) {
      return arraySchema.schema
        .map(
          (subItem) =>
            `${getDisplayName(subItem)}: ${subItem.type || subItem.Type}`
        )
        .join(", ");
    }
    return "";
  };

  return (
    <div className={styles.arrayContainer}>
      {/* Header */}
      <div className={styles.arrayHeader}>
        <div className={styles.arrayHeaderContent}>
          <div className={styles.arrayTitleRow}>
            {/* <h4 className={styles.arrayTitle}>{label}</h4> */}

            <span className={styles.arrayTitle}>
              Array of {getDataTypeLabel({ arrayType, arraySchema })}
            </span>
          </div>

          {arrayType === "object" && arraySchema?.schema && (
            <p className={styles.arrayDescription}>
              Each item contains: {getStructureInfo()}
            </p>
          )}
        </div>

        <div className={styles.arrayActions}>
          <button
            type="button"
            className={styles.addButton}
            onClick={addArrayItem}
            aria-label="Add new item"
          >
            <Icon
              outeIconName="OUTEAddIcon"
              outeIconProps={{
                sx: { color: "#ffffff", width: "1.25rem", height: "1.25rem" },
              }}
            />
            <span>Add Item</span>
          </button>

          {value.length > 0 && (
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse" : "Expand"}
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
          )}
        </div>
      </div>

      {/* Items Count Badge */}
      {value.length > 0 && (
        <div className={styles.itemsCountBadge}>
          <span className={styles.itemsCountText}>
            {value.length} {value.length === 1 ? "item" : "items"}
          </span>
        </div>
      )}

      {/* Items List */}
      {isExpanded && value.length > 0 && (
        <div className={styles.arrayItems}>
          {value.map((item, index) => (
            <ArrayItemV2
              key={index}
              index={index}
              value={item}
              arrayType={arrayType}
              arraySchema={arraySchema}
              onValueChange={(newValue) =>
                handleArrayItemChange(index, newValue)
              }
              onRemove={() => removeArrayItem(index)}
              renderInput={renderInput}
              getActualKey={getActualKey}
              getDisplayName={getDisplayName}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <div className={styles.emptyState}>
          <Icon
            outeIconName="OUTEInfoIcon"
            outeIconProps={{
              sx: { color: "#9ca3af", width: "2rem", height: "2rem" },
            }}
          />
          <p className={styles.emptyStateText}>
            No items yet. Click &quot;Add Item&quot; to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default ArrayInputV2;
