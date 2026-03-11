import React from "react";
import classes from "./index.module.css";

const Select = ({ value, onChange, options = [] }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={classes.select}
    >
      {options?.map((option) => (
        <option value={option}>{option}</option>
      ))}
    </select>
  );
};

export default Select;
