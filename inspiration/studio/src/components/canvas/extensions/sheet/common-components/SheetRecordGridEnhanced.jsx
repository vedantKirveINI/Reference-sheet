import React from "react";
import { SheetRecordGridV2 } from "./SheetRecordGridV2";
import styles from "./SheetRecord.module.css";

export function SheetRecordGridEnhanced({
  fields = [],
  record = [],
  onChange,
  variables,
  showRequired = true,
  label,
  "data-testid": dataTestId = "sheet-record-grid-enhanced",
}) {
  if (!fields || fields.length === 0) {
    return (
      <div
        className="flex justify-center items-center h-full text-gray-500"
        data-testid="no-fields-overlay"
      >
        Please select a view with fields.
      </div>
    );
  }

  return (
    <div className={styles["sheet-record-v2"]} data-testid={dataTestId}>
      {label && (
        <div className={styles["box"]} data-testid="map-column-note">
          <p className={styles["text"]}>
            <span className={styles["text-bold"]}>Note: </span>
            <span className="font-semibold">{label}</span>
          </p>
        </div>
      )}

      <SheetRecordGridV2
        fields={fields}
        record={record}
        onChange={onChange}
        variables={variables}
        showRequired={showRequired}
        data-testid={`${dataTestId}-grid`}
      />
    </div>
  );
}

export default SheetRecordGridEnhanced;
