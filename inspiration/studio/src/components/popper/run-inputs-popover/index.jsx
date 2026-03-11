import React, { useRef } from "react";
// import { ODSButton as Button } from "@src/module/ods";
import { ODSButton as Button } from "@src/module/ods";
import { ODSInputGridV3 as InputGridV3 } from "@src/module/ods";
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
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          overflow: "auto",
          minHeight: 0,
        }}
        className={styles.gridContainer}
      >
        <InputGridV3
          ref={gridRef}
          initialValue={schema}
          isValueMode
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
            onRun(gridRef.current?.getData());
          }}
        />
      </div>
    </div>
  );
};

export default RunInputsPopover;
