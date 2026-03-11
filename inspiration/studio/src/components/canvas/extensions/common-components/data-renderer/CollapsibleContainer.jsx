import { useState } from "react";
import DataRenderer from "./DataRenderer";
import styles from "./DataRenderer.module.css";

// import { ODSLabel as Label } from '@src/module/ods';
// import { ODSIcon as Icon } from '@src/module/ods';
import { ODSLabel as Label, ODSIcon as Icon } from "@src/module/ods";

const CollapsibleContainerComponent = ({
  title,
  value,
  depth,
  objectAsContainers = false,
  isRecord = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  ) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.collapsibleContainer}>
      <button
        className={styles.collapsibleHeader}
        onClick={toggleExpanded}
        type="button"
      >
        {/* <span className={styles.collapsibleTitle}>{title}</span> */}
        <Label variant="capital">{title}</Label>
        {/* <span className={styles.collapsibleIcon}>{isExpanded ? "−" : "+"}</span> */}
        <Icon
          outeIconName={"OUTEChevronRightIcon"}
          outeIconProps={{
            sx: {
              color: "#212121",
              width: "1.25rem",
              height: "1.25rem",
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            },
          }}
        />
      </button>

      {isExpanded && (
        <div className={styles.collapsibleContent}>
          <DataRenderer
            data={value}
            objectAsContainers={objectAsContainers}
            depth={depth + 1}
            isRecord={isRecord}
          />
        </div>
      )}
    </div>
  );
};

export default CollapsibleContainerComponent;
