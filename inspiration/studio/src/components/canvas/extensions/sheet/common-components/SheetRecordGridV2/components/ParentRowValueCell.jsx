import React from "react";
import { Info } from "lucide-react";
import { SchemaHelpPopover } from "./SchemaHelpPopover";
import styles from "../SheetRecordGridV2.module.css";

/**
 * Value cell component for parent rows (complex types)
 * @param {Object} props
 * @param {Object} props.data - Row data object
 * @param {Function} props.onToggle - Function to toggle expand/collapse
 */
export function ParentRowValueCell({ data, onToggle }) {
  return (
    <div className={styles.parentValueWrapper}>
      <button
        type="button"
        onClick={onToggle}
        className={styles.statusButton}
      >
        <span className={styles.configuredCount}>
          {data.filledSubFieldCount}/{data.subFieldCount}
        </span>
        <span className={styles.configuredText}>
          {data.isCollapsed ? 'configured — expand' : 'configured'}
        </span>
      </button>

      <SchemaHelpPopover subFieldSchema={data.subFieldSchema}>
        <button type="button" className={styles.helpButton}>
          <Info className="w-3.5 h-3.5" />
        </button>
      </SchemaHelpPopover>
    </div>
  );
}

