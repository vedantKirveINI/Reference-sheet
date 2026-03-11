import React, { useRef } from "react";
// import Button from "oute-ds-button";
import { ODSButton as Button } from "@src/module/ods";
import InputGridV2 from "@oute/oute-ds.molecule.input-grid-v2";
import styles from "./RunInputs.module.css";
const RunInputsPopover = ({
  schema,
  onCancel = () => {},
  onRun = () => {},
}) => {
  const gridRef = useRef();
  return (
    <div
      style={{
        padding: "1rem",
        boxSizing: "border-box",
        gap: "1rem",
        display: "grid",
        gridTemplateRows: "1fr auto",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          overflow: "auto",
        }}
        className={styles.gridContainer}
      >
        <InputGridV2
          ref={gridRef}
          initialValue={schema}
          isValueMode
          replaceConfigKeyWith="schema"
        />
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "flex-end",
          gap: "1rem",
        }}
      >
        <Button label="Cancel" onClick={onCancel} variant="black-outlined" />
        <Button
          label="Run"
          variant="black"
          onClick={() => {
            onRun(gridRef.current?.getValue());
          }}
        />
      </div>
    </div>
  );
};

export default RunInputsPopover;
