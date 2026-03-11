import { useState } from "react";
import CollapsibleHeader from "./CollapsibleHeader";
import styles from "./ObjectInput.module.css";

const ObjectInput = ({
  label,
  value = {},
  schema,
  onValueChange,
  renderInput,
  getActualKey,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNestedValueChange = (key, newValue) => {
    const updatedValue = { ...value, [key]: newValue };
    onValueChange(updatedValue);
  };

  return (
    <div className={styles.objectGroup}>
      <CollapsibleHeader
        isCollapsed={isCollapsed}
        onToggle={handleToggleCollapse}
        title={`${label} (Object)`}
        className={styles.objectHeader}
      />

      {!isCollapsed && (
        <div className={styles.nestedInputs}>
          {schema?.map((subItem, index) => {
            const subKey = getActualKey(subItem) || `field_${index}`;
            return renderInput(subItem, subKey, value[subKey], (newValue) =>
              handleNestedValueChange(subKey, newValue)
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ObjectInput;
