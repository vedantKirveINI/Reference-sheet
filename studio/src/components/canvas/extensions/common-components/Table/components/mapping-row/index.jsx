import React, { useCallback } from "react";
import classes from "./index.module.css";
import RenderCell from "../cell";

const MappingRow = ({
  row,
  rowIndex,
  columns,
  onChangeCell,
  handleDeleteRow,
  dataTestId,
}) => {
  const hasError = false;

  return (
    <div
      className={`${classes.row} ${hasError ? classes.errorRow : ""}`}
      data-testid={`${dataTestId}-${rowIndex}`}
    >
      {columns?.map((col, i) => {
        return (
          <RenderCell
            value={row?.[col?.valueAccessor]}
            key={`cell-${i}`}
            column={col}
            onChangeCell={onChangeCell}
            rowIndex={rowIndex}
            handleDeleteRow={handleDeleteRow}
          />
        );
      })}
    </div>
  );
};

export default MappingRow;
