import { useState } from "react";
import styles from "./DataTraversal.module.css";
// import { ODSIcon as Icon } from '@src/module/ods';
import { ODSIcon as Icon } from "@src/module/ods";

const DataDisplay = ({
  data,
  title = null,
  maxDepth = 10,
  currentDepth = 0,
}) => {
  const [collapsedItems, setCollapsedItems] = useState(new Map());

  const formatKey = (key) => {
    if (!key) return key;

    // Handle array indices - keep them as is
    if (key.startsWith("[") && key.endsWith("]")) {
      return key;
    }

    // Split camelCase, snake_case, kebab-case, and PascalCase
    const words = key
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase -> camel Case
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // PascalCase -> Pascal Case
      .replace(/[_-]/g, " ") // snake_case, kebab-case -> spaces
      .split(" ")
      .filter((word) => word.length > 0);

    // Capitalize first letter of first word, keep others as they are
    if (words.length > 0) {
      words[0] =
        words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
      for (let i = 1; i < words.length; i++) {
        words[i] = words[i].toLowerCase();
      }
    }

    return words.join(" ");
  };

  const toggleCollapse = (itemKey) => {
    setCollapsedItems((prev) => {
      const newMap = new Map(prev);
      newMap.set(itemKey, !newMap.get(itemKey));
      return newMap;
    });
  };

  const isItemCollapsed = (itemKey) => {
    return collapsedItems.get(itemKey) || false;
  };

  if (currentDepth >= maxDepth) {
    return <span className={styles.maxDepth}>... (max depth reached)</span>;
  }

  const renderValue = (value, key = null, depth = 0) => {
    const itemKey = `${key || "root"}-${depth}-${typeof value}`;
    const displayKey = formatKey(key);

    if (value === null) {
      return (
        <div className={styles.keyValuePair}>
          {key && <div className={styles.keyBox}>{displayKey}</div>}
          <div className={styles.separator}>:</div>
          <div className={styles.valueBox}>
            <span className={styles.null}>null</span>
          </div>
        </div>
      );
    }

    if (value === undefined) {
      return (
        <div className={styles.keyValuePair}>
          {key && <div className={styles.keyBox}>{displayKey}</div>}
          <div className={styles.separator}>:</div>
          <div className={styles.valueBox}>
            <span className={styles.undefined}>undefined</span>
          </div>
        </div>
      );
    }

    if (typeof value === "string") {
      return (
        <div className={styles.keyValuePair}>
          {key && <div className={styles.keyBox}>{displayKey}</div>}
          <div className={styles.separator}>:</div>
          <div className={styles.valueBox}>
            <span className={styles.string}>
              {value === "" ? "(empty)" : value}
            </span>
          </div>
        </div>
      );
    }

    if (typeof value === "number") {
      return (
        <div className={styles.keyValuePair}>
          {key && <div className={styles.keyBox}>{displayKey}</div>}
          <div className={styles.separator}>:</div>
          <div className={styles.valueBox}>
            <span className={styles.number}>{value}</span>
          </div>
        </div>
      );
    }

    if (typeof value === "boolean") {
      return (
        <div className={styles.keyValuePair}>
          {key && <div className={styles.keyBox}>{displayKey}</div>}
          <div className={styles.separator}>:</div>
          <div className={styles.valueBox}>
            <span className={styles.boolean}>{value.toString()}</span>
          </div>
        </div>
      );
    }

    if (typeof value === "function") {
      return (
        <div className={styles.keyValuePair}>
          {key && <div className={styles.keyBox}>{displayKey}</div>}
          <div className={styles.separator}>:</div>
          <div className={styles.valueBox}>
            <span className={styles.function}>
              function {value.name || "anonymous"}()
            </span>
          </div>
        </div>
      );
    }

    if (Array.isArray(value)) {
      const collapsed = isItemCollapsed(itemKey);

      return (
        <div className={styles.nestedContainer}>
          {key && (
            <div className={styles.cardContainer}>
              <div className={styles.cardHeader}>
                <div className={styles.keyBox}>
                  {/* <button
                    className={styles.collapseButton}
                    onClick={() => toggleCollapse(itemKey)}
                    aria-label={collapsed ? "Expand array" : "Collapse array"}
                  >
                    {collapsed ? "▶" : "▼"}
                  </button> */}
                  <Icon
                    outeIconName={"OUTEChevronRightIcon"}
                    outeIconProps={{
                      sx: {
                        color: "#212121",
                        width: "1.25rem",
                        height: "1.25rem",
                        transform: collapsed ? "rotate(0deg)" : "rotate(90deg)",
                      },
                    }}
                    onClick={() => toggleCollapse(itemKey)}
                  />
                  {displayKey}
                </div>
              </div>
              {!collapsed && (
                <div className={styles.cardContent}>
                  {value.length === 0 ? (
                    <div className={styles.keyValuePair}>
                      <div className={styles.valueBox}>
                        <span className={styles.empty}>Empty array</span>
                      </div>
                    </div>
                  ) : (
                    value.map((item, index) => (
                      <div key={index}>
                        {renderValue(item, `[${index}]`, depth + 1)}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          {!key && !collapsed && (
            <div className={styles.nestedContent}>
              {value.length === 0 ? (
                <div className={styles.keyValuePair}>
                  <div className={styles.valueBox}>
                    <span className={styles.empty}>Empty array</span>
                  </div>
                </div>
              ) : (
                value.map((item, index) => (
                  <div key={index}>
                    {renderValue(item, `[${index}]`, depth + 1)}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === "object") {
      const collapsed = isItemCollapsed(itemKey);
      const entries = Object.entries(value).filter(
        ([objKey]) => !objKey.startsWith("_")
      );

      return (
        <div className={styles.nestedContainer}>
          {key && (
            <div className={styles.cardContainer}>
              <div className={styles.cardHeader}>
                <div className={styles.keyBox}>
                  {/* <button
                    className={styles.collapseButton}
                    onClick={() => toggleCollapse(itemKey)}
                    aria-label={collapsed ? "Expand object" : "Collapse object"}
                  >
                    {collapsed ? "▶" : "▼"}
                  </button> */}
                  <Icon
                    outeIconName={"OUTEChevronRightIcon"}
                    outeIconProps={{
                      sx: {
                        color: "#212121",
                        width: "1.25rem",
                        height: "1.25rem",
                        transform: collapsed ? "rotate(0deg)" : "rotate(90deg)",
                      },
                    }}
                    onClick={() => toggleCollapse(itemKey)}
                  />
                  {displayKey}
                </div>
              </div>
              {!collapsed && (
                <div className={styles.cardContent}>
                  {entries.length === 0 ? (
                    <div className={styles.keyValuePair}>
                      <div className={styles.valueBox}>
                        <span className={styles.empty}>Empty object</span>
                      </div>
                    </div>
                  ) : (
                    entries.map(([objKey, objValue]) => (
                      <div key={objKey}>
                        {renderValue(objValue, objKey, depth + 1)}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          {!key && !collapsed && (
            <div className={styles.nestedContent}>
              {entries.length === 0 ? (
                <div className={styles.keyValuePair}>
                  <div className={styles.valueBox}>
                    <span className={styles.empty}>Empty object</span>
                  </div>
                </div>
              ) : (
                entries.map(([objKey, objValue]) => (
                  <div key={objKey}>
                    {renderValue(objValue, objKey, depth + 1)}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={styles.keyValuePair}>
        {key && <div className={styles.keyBox}>{displayKey}</div>}
        <div className={styles.separator}>:</div>
        <div className={styles.valueBox}>
          <span className={styles.unknown}>{String(value)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.content}>
        {renderValue(data, null, currentDepth)}
      </div>
    </div>
  );
};

export default DataDisplay;
