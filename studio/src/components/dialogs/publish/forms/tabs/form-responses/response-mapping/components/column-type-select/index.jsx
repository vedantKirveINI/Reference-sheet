import React from "react";
import { COLUMN_TYPES } from "../../constants";
import classes from "./index.module.css";

const ColumnTypeSelect = ({
  value = COLUMN_TYPES.QUESTION,
  onChange,
  dataTestId,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={classes.select}
      data-testid={`${dataTestId}-${value}`}
    >
      <option value={COLUMN_TYPES.QUESTION}>Question</option>
      <option value={COLUMN_TYPES.STATIC}>Static</option>
    </select>
  );
};

export default ColumnTypeSelect;
