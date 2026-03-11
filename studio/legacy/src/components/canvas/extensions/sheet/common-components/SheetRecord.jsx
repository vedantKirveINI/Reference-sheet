import React, { useState, useEffect, useCallback } from "react";
import styles from "./SheetRecord.module.css";
// import Label from "oute-ds-label";
// import Icon from "oute-ds-icon";
// import ODSCheckbox from "oute-ds-checkbox";
import { ODSLabel as Label, ODSIcon as Icon, ODSCheckbox } from "@src/module/ods";
import { COLUMN_TO_SHOW } from "../../constants/sheet-column-type";
import {
  CREATE_SHEET_RECORD_TYPE,
  FIND_ALL_SHEET_RECORD_TYPE,
  FIND_ONE_SHEET_RECORD_TYPE,
} from "../../constants/types";

const SheetRecord = ({
  fields = [],
  record = [],
  view = {},
  columnsToShow = ["checked", "key", "type", "value"],
  label,
  onChange = () => {},
  variables,
  type,
}) => {
  const [recordData, setRecordData] = useState([]);
  const [localView, setLocalView] = useState(view);
  const [initialized, setInitialized] = useState(false);

  const initializeRowData = useCallback(
    (record, fields) => {
      const rowData = fields.map((field) => {
        const _record = record.find((r) => r.id === field.id);
        let checked = false;
        if (_record?.checked !== null && _record?.checked !== undefined) {
          checked = _record.checked;
        } else if (
          type === FIND_ONE_SHEET_RECORD_TYPE ||
          type === FIND_ALL_SHEET_RECORD_TYPE
        ) {
          checked = true;
        }

        return {
          ...field,
          checked,
          key: field.name,
          type: field.type,
          required:
            type === CREATE_SHEET_RECORD_TYPE
              ? field?.options?.required
              : false,
          value: _record?.value ?? { type: "fx", blocks: [] },
        };
      });

      setRecordData(rowData);
      setInitialized(true);
    },
    [type]
  );

  useEffect(() => {
    if (view?.id !== localView?.id) {
      setInitialized(false);
      setLocalView(view);
      setRecordData([]);
    }
  }, [view, localView?.id]);

  useEffect(() => {
    if (!initialized && fields.length) {
      initializeRowData(record, fields);
    }
  }, [record, fields, initialized, initializeRowData]);

  useEffect(() => {
    onChange(recordData);
  }, [recordData, onChange]);

  const toggleCheckbox = (index) => {
    const updated = [...recordData];
    updated[index].checked = !updated[index].checked;
    setRecordData(updated);
  };

  const handleValueChange = (index, value) => {
    const updated = [...recordData];
    updated[index].value = {
      type: "fx",
      blocks: [{ text: value }],
    };
    updated[index].checked = !!value;
    setRecordData(updated);
  };

  const handleSelectAll = (checked) => {
    setRecordData((prev) => prev.map((r) => ({ ...r, checked })));
  };

  return (
    <div className={styles["sheet-record"]} data-testid="sheet-record">
      <div className={styles.tableHeader}>
        {columnsToShow.includes("checked") && (
          <div className={styles.cell}>
            <ODSCheckbox
              variant="black"
              data-testid="header-checkbox"
              checked={
                recordData.length > 0 && recordData.every((r) => r.checked)
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          </div>
        )}
        {columnsToShow.includes("key") && (
          <div className={styles.cell}>COLUMN NAME</div>
        )}
        {columnsToShow.includes("type") && (
          <div className={styles.cell}>COLUMN TYPE</div>
        )}
        {columnsToShow.includes("value") && (
          <div className={styles.cell}>VALUE</div>
        )}
      </div>

      {recordData.map((row, index) => (
        <div
          key={row.id}
          className={`${styles.tableRow} ${row.checked ? styles.checkedRow : ""}`}
          data-testid={`row-${index}`}
        >
          <div className={styles.cell}>
            <ODSCheckbox
              variant="black"
              data-testid={`row-${index}-checkbox`}
              checked={row.checked}
              onChange={() => toggleCheckbox(index)}
            />
          </div>
          {columnsToShow.includes("key") && (
            <div className={styles.cell}>
              <Label variant="body1" data-testid={`row-${index}-name`}>
                {row.key}{" "}
                {row.required && <span style={{ color: "red" }}>*</span>}
              </Label>
            </div>
          )}
          {columnsToShow.includes("type") && (
            <div
              className={styles.cell}
              style={{ display: "flex", alignItems: "center", gap: "1rem" }}
            >
              {COLUMN_TO_SHOW[row.type]?._src && (
                <Icon
                  imageProps={{
                    src: COLUMN_TO_SHOW[row.type]._src,
                    style: { width: "1.5rem", height: "1.5rem" },
                  }}
                />
              )}
              <Label variant="subtitle1" data-testid={`row-${index}-type`}>
                {COLUMN_TO_SHOW[row.type]?.name || row.type}
              </Label>
            </div>
          )}
          {columnsToShow.includes("value") && (
            <div className={styles.cell}>
              <input
                type="text"
                className={styles.valueInput}
                value={row.value?.blocks?.[0]?.text || ""}
                onChange={(e) => handleValueChange(index, e.target.value)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SheetRecord;
