import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import styles from "../SheetRecordGridV2.module.css";

/**
 * Popover component showing schema help for complex types
 * @param {Object} props
 * @param {Array} props.subFieldSchema - Array of subField schema definitions
 * @param {React.ReactNode} props.children - Child element to trigger the popover
 */
export function SchemaHelpPopover({ subFieldSchema, children }) {
  if (!subFieldSchema || subFieldSchema.length === 0) return children;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-72 p-0"
        sideOffset={4}
      >
        <div className={styles.popoverHeader}>
          <span className={styles.popoverTitle}>Expected Fields</span>
        </div>
        <div className={styles.popoverContent}>
          {subFieldSchema.map((subField) => (
            <div key={subField.key} className={styles.popoverFieldItem}>
              <div className={styles.popoverFieldName}>
                {subField.displayKeyName || subField.key}
              </div>
              {subField.example && (
                <div className={styles.popoverFieldExample}>
                  {String(subField.example)}
                </div>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

