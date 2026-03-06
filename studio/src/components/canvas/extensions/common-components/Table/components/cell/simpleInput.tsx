import React from "react";
import classes from "./index.module.css";

const SimpleInput = ({ value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={classes.input}
    />
  );
};

export default SimpleInput;
