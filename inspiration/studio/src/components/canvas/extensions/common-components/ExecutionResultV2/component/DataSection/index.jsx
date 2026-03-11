import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import CopyContent from "../../../CopyContent";
import styles from "./styles.module.css";

function formatPreview(value) {
  if (Array.isArray(value)) {
    return `[${value.length}]`;
  }
  if (typeof value === "object" && value !== null) {
    return `{${Object.keys(value).length}}`;
  }
  return null;
}

function DataSection({ label, value, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(depth < 1);
  
  const isPrimitive =
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean";

  const nestedEntries = useMemo(() => {
    if (Array.isArray(value)) {
      return value.map((item, idx) => [`[${idx}]`, item]);
    }
    if (value && typeof value === "object") {
      return Object.entries(value);
    }
    return [];
  }, [value]);

  const preview = formatPreview(value);

  if (isPrimitive) {
    const displayValue = value === null ? "null" : value === undefined ? "undefined" : String(value);
    const valueClass = 
      typeof value === "string" ? styles.stringValue :
      typeof value === "number" ? styles.numberValue :
      typeof value === "boolean" ? styles.boolValue :
      styles.nullValue;

    return (
      <div className={styles.row} style={{ paddingLeft: depth * 16 }}>
        <span className={styles.key}>{label}</span>
        <span className={styles.colon}>:</span>
        <span className={`${styles.value} ${valueClass}`}>{displayValue}</span>
        <span className={styles.copyTrigger}>
          <CopyContent data={displayValue} />
        </span>
      </div>
    );
  }

  return (
    <div className={styles.node} style={{ paddingLeft: depth * 16 }}>
      <div 
        className={styles.nodeHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronRight 
          size={14} 
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        />
        <span className={styles.key}>{label}</span>
        <span className={styles.preview}>{preview}</span>
        <span className={styles.copyTrigger}>
          <CopyContent data={JSON.stringify(value, null, 2)} />
        </span>
      </div>
      
      {isOpen && (
        <div className={styles.nodeContent}>
          {nestedEntries.length === 0 ? (
            <span className={styles.empty}>empty</span>
          ) : (
            nestedEntries.map(([nestedKey, nestedValue]) => (
              <DataSection
                key={nestedKey}
                label={nestedKey}
                value={nestedValue}
                depth={depth + 1}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default DataSection;
