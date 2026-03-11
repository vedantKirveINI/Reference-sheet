import React from "react";
import { InputGrid } from "@src/module/input-grid";
import classes from "./index.module.css";

export const InputTab = ({ variables, inputs, onInputsChange }) => {
  return (
    <div className={classes["input-component-container"]}>
      <InputGrid
        variables={variables}
        initialValue={inputs}
        onChange={onInputsChange}
      />
    </div>
  );
};
