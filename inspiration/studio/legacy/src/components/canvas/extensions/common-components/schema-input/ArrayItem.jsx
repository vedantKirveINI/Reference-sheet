import { useState } from "react";
import CollapsibleHeader from "./CollapsibleHeader";
import PrimitiveInput from "./PrimitiveInput";
import styles from "./ArrayItem.module.css";

const ArrayItem = ({
  index,
  value,
  arrayType,
  arraySchema,
  onValueChange,
  onRemove,
  renderInput,
  getActualKey,
  getDisplayName,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handlePrimitiveChange = (newValue) => {
    onValueChange(newValue);
  };

  if (["object", "json"].includes(arrayType)) {
    return (
      <div className={styles.arrayItem}>
        <CollapsibleHeader
          isCollapsed={isCollapsed}
          onToggle={handleToggleCollapse}
          title={`Item ${index + 1}`}
          showRemoveButton={true}
          onRemove={onRemove}
        />
        {!isCollapsed && (
          <div className={styles.nestedInputs}>
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
        <CollapsibleHeader
          isCollapsed={isCollapsed}
          onToggle={handleToggleCollapse}
          title={`Item ${index + 1}`}
          showRemoveButton={true}
          onRemove={onRemove}
        />
        {!isCollapsed && (
          <div className={styles.primitiveItemContent}>
            <PrimitiveInput
              type={primitiveType}
              label="Value"
              value={value}
              onChange={handlePrimitiveChange}
            />
          </div>
        )}
      </div>
    );
  }
};

export default ArrayItem;
