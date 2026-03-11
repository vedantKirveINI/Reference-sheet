import React, { useMemo } from "react";
import { validateColumnName, validateColumnValue } from "../../utils/validation";
import classes from "./index.module.css";

const ErrorSummary = ({ mappings, questions, dataTestId }) => {
  const errors = useMemo(() => {
    const errorList = [];
    const columnNames = mappings.map(row => row.columnName.trim());

    mappings.forEach((row, index) => {
      const columnNameError = validateColumnName(row.columnName, columnNames, index);
      const columnValueError = validateColumnValue(row.mappedValue, row.columnType, questions);

      if (columnNameError) {
        errorList.push({
          rowIndex: index,
          field: "Column Name",
          message: columnNameError
        });
      }

      if (columnValueError) {
        errorList.push({
          rowIndex: index,
          field: "Column Value",
          message: columnValueError
        });
      }
    });

    return errorList;
  }, [mappings, questions]);

  if (errors.length === 0) return null;

  return (
    <div className={classes.container} data-testid={dataTestId}>
      <h4>Validation Errors ({errors.length})</h4>
      <div className={classes.errorList}>
        {errors.map((error, index) => (
          <div key={index} className={classes.errorItem}>
            <span className={classes.errorField}>Row {error.rowIndex + 1} - {error.field}:</span>
            <span className={classes.errorMessage}>{error.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorSummary; 