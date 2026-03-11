import { useState } from "react";
// import Button from "oute-ds-button";
// import Icon from "oute-ds-icon";
import { ODSButton as Button, ODSIcon as Icon } from "@src/module/ods";
import CollapsibleHeader from "./CollapsibleHeader";
import ArrayItem from "./ArrayItem";
import styles from "./ArrayInput.module.css";

const ArrayInput = ({
  label,
  value = [],
  arraySchema,
  onValueChange,
  renderInput,
  getActualKey,
  getDisplayName,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const arrayType =
    arraySchema?.type?.toLowerCase() || arraySchema?.Type?.toLowerCase();

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

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
          (subItem, idx) =>
            `${getDisplayName(subItem)}: ${subItem.type || subItem.Type}`
        )
        .join(", ");
    }
    return "";
  };

  const createTitle = () => {
    const baseTitle = `${label === "response" ? "" : label} (Array of ${arrayType === "any" ? "String" : arraySchema?.type || arraySchema?.Type || "items"})`;

    if (arrayType === "object" && arraySchema?.schema) {
      return (
        <span className={styles.titleWithInfo}>
          {baseTitle}
          <span
            className={styles.infoIcon}
            title={`Each item will have structure: ${getStructureInfo()}`}
          >
            <Icon outeIconName="OUTEHelpIcon" />
          </span>
        </span>
      );
    }

    return baseTitle;
  };

  return (
    <div className={styles.arrayGroup}>
      <CollapsibleHeader
        isCollapsed={isCollapsed}
        onToggle={handleToggleCollapse}
        title={createTitle()}
        isEmpty={!value.length}
      >
        <div className={styles.arrayControls}>
          <span className={styles.itemCount}>
            {value.length} item{value.length !== 1 ? "s" : ""}
          </span>
          <Icon
            outeIconName="OUTEAddIcon"
            outeIconProps={{ sx: { color: "#212121" } }}
            onClick={(e) => {
              e.stopPropagation();
              addArrayItem();
            }}
          />
        </div>
      </CollapsibleHeader>

      {!isCollapsed && (
        <>
          {value.length > 0 && (
            <div className={styles.arrayItems}>
              {value.map((item, index) => (
                <ArrayItem
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
        </>
      )}
    </div>
  );
};

export default ArrayInput;
