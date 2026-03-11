import React, { useCallback } from "react";
import ColumnNameInput from "../column-name-input";
import ColumnValueInput from "../column-value-input";
import DeleteButton from "../delete-button";
import classes from "./index.module.css";
import { validateFormResponsesMapping } from "../../../../../utils/formResponses";

const MappingRow = ({
  row,
  rowIndex,
  questions = [],
  onUpdate,
  onDelete,
  names = [],
  dataTestId,
}) => {
  const handleNameChange = useCallback(
    (value) => {
      onUpdate(rowIndex, { ...row, name: value });
    },
    [rowIndex, row, onUpdate],
  );

  const handleTypeChange = useCallback(
    (value) => {
      onUpdate(rowIndex, {
        ...row,
        columnType: value,
        value: value === "static" ? "" : "",
      });
    },
    [rowIndex, row, onUpdate],
  );

  const handleValueChange = useCallback(
    (value) => {
      if (value?.settings && value?.type) {
        onUpdate(rowIndex, {
          ...row,
          options: value?.settings || {},
          type: value?.type,
          value: value?.key,
        });
      } else {
        onUpdate(rowIndex, {
          ...row,
          value: value,
        });
      }
    },
    [rowIndex, row, onUpdate],
  );

  const handleDelete = useCallback(() => {
    onDelete(rowIndex);
  }, [rowIndex, onDelete]);

  // Validate the row
  // const nameError = validateColumnName(
  //   row.name,
  //   Array.isArray(names) ? names : [],
  //   rowIndex,
  // );
  // const valueError = validateColumnValue(
  //   row.value,
  //   row.columnType,
  //   Array.isArray(questions) ? questions : [],
  // );
  const hasError = validateFormResponsesMapping({
    mappings: [row],
    questions: Array.isArray(questions) ? questions : [],
  });

  return (
    <div
      className={`${classes.row} ${hasError ? classes.errorRow : ""}`}
      data-testid={`${dataTestId}-${rowIndex}`}
    >
      <div className={classes.cell}>
        <ColumnNameInput
          value={row.name}
          onChange={handleNameChange}
          names={Array.isArray(names) ? names : []}
          rowIndex={rowIndex}
          dataTestId={`${dataTestId}-name`}
        />
      </div>

      {/* <div className={classes.cell}>
        <ColumnTypeSelect
          value={row.columnType}
          onChange={handleTypeChange}
          dataTestId={`${dataTestId}-type`}
        />
      </div> */}
      <div className={classes.cell}>
        <ColumnValueInput
          value={row.value}
          columnType={row.columnType}
          questions={Array.isArray(questions) ? questions : []}
          onChange={handleValueChange}
          dataTestId={`${dataTestId}-value`}
        />
      </div>

      <div className={classes.cell}>
        <DeleteButton
          onClick={handleDelete}
          dataTestId={`${dataTestId}-delete`}
        />
      </div>
    </div>
  );
};

export default MappingRow;
