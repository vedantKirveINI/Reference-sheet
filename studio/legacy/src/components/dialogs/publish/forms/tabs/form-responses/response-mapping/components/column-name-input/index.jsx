import React from "react";
import classes from "./index.module.css";

const ColumnNameInput = ({
  value,
  onChange,
  names,
  rowIndex,
  dataTestId
}) => {
  return (
    <div className={classes.container}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter column name"
        className={classes.input}
        data-testid={`${dataTestId}-${rowIndex}`}
      />
    </div>
  );
};

export default ColumnNameInput; 