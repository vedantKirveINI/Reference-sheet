import React, { useState, useEffect, useCallback } from "react";
import classes from "./SheetGroupBy.module.css";
// import { ODSCheckbox } from '@src/module/ods';
import { ODSCheckbox } from "@src/module/ods";
import cloneDeep from "lodash/cloneDeep";

const SheetGroupBy = ({ schema, groupByRowData, onChange = () => {} }) => {
  const [rowData, setRowData] = useState([]);

  const generateGroupByClause = useCallback((data) => {
    let clause = "GROUP BY";
    data?.forEach((row, index) => {
      if (row?.column && row?.checked) {
        clause += `${index === 0 ? " " : ","} ${row.column}`;
      }
    });
    return clause;
  }, []);

  const initializeRowData = useCallback((schema, existingData) => {
    const copy = cloneDeep(existingData);
    schema.forEach((col) => {
      const exists = copy.some((item) => item.column === col.name);
      if (!exists) {
        copy.push({ column: col.name, checked: false });
      }
    });
    setRowData(copy);
  }, []);

  const toggleCheckbox = (index) => {
    const updated = [...rowData];
    updated[index].checked = !updated[index].checked;
    setRowData(updated);
  };

  useEffect(() => {
    if (!schema?.length && !groupByRowData?.length) {
      setRowData([]);
    }
  }, [groupByRowData?.length, schema?.length]);

  useEffect(() => {
    if (!rowData.length && schema?.length) {
      initializeRowData(schema, groupByRowData);
    }
  }, [groupByRowData, initializeRowData, rowData.length, schema]);

  useEffect(() => {
    const clause = generateGroupByClause(rowData);
    onChange(rowData, clause);
  }, [rowData, generateGroupByClause, onChange]);

  return (
    <div className={classes["sheet-group-by-container"]}>
      <div className={`${classes.row} ${classes.header}`}>
        <div className={classes.cell}>
          <ODSCheckbox
            variant="black"
            inputRef={(ref) => {
              if (!ref) return;
              const allChecked = rowData.every((r) => r.checked);
              const someChecked = rowData.some((r) => r.checked);
              ref.indeterminate = someChecked && !allChecked;
            }}
            checked={rowData.length > 0 && rowData.every((r) => r.checked)}
            onChange={(e) => {
              const checked = e.target.checked;
              setRowData((prev) => prev.map((r) => ({ ...r, checked })));
            }}
          />
        </div>
        <div className={classes.cell}>COLUMNS</div>
      </div>

      {rowData.map((row, index) => (
        <div
          key={row.column}
          className={`${classes.row} ${row.checked ? classes.checkedRow : ""}`}
        >
          <div className={classes.cell}>
            <ODSCheckbox
              variant="black"
              checked={row.checked}
              onChange={() => toggleCheckbox(index)}
            />
          </div>
          <div className={classes.cell}>{row.column}</div>
        </div>
      ))}
    </div>
  );
};

export default SheetGroupBy;
