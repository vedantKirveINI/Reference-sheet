import { useState } from "react";
import DataRenderer from "./DataRenderer";
import styles from "./ArrayAccordion.module.css";
import { formatKey } from "./utils/formatKey";
import { singularize } from "./utils/singularize";

// import Label from "oute-ds-label";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "@src/module/ods";

const ArrayAccordion = ({ data, depth = 0, keyName, isRecord }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  if (!Array.isArray(data)) {
    return null;
  }

  if (data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyText}>No data</span>
      </div>
    );
  }

  const toggleItem = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const itemLabel = keyName ? formatKey(singularize(keyName)) : "Record";

  return (
    <div className={styles.accordion}>
      {data.map((item, index) => {
        const isExpanded = expandedItems.has(index);
        const isPrimitive =
          typeof item !== "object" || item === null || item === undefined;

        return (
          <div key={index} className={styles.accordionItem}>
            <button
              className={styles.accordionHeader}
              onClick={() => toggleItem(index)}
              type="button"
            >
              <span className={styles.accordionTitle}>
                {/* <Label variant="capital"> */}
                {itemLabel} {index + 1}
                {/* </Label> */}
              </span>
              <span className={styles.accordionIndex}>Index: {index}</span>
              {/* <span className={styles.accordionIcon}>
                {isExpanded ? "−" : "+"}
              </span> */}
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
              <div className={styles.accordionContent}>
                {isPrimitive ? (
                  <div className={styles.primitiveContent}>
                    <DataRenderer
                      data={item}
                      depth={depth + 1}
                      isRecord={isRecord}
                      showCopyIcon={true}
                    />
                  </div>
                ) : (
                  <DataRenderer
                    data={item}
                    depth={depth + 1}
                    isRecord={isRecord}
                    showCopyIcon={true}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ArrayAccordion;
