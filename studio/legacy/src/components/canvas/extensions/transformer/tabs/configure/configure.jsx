import React from "react";
import classes from "../../Transformer.module.css";
// import { FormulaBar } from "oute-ds-formula-bar";
// import ODSLabel from "oute-ds-label";
import { ODSFormulaBar as FormulaBar, ODSLabel } from "@src/module/ods";
import { localStorageConstants } from "../../../../../../module/constants";

const Configure = ({ variables, fxContent, setFxContent }) => {
  return (
    <div className={classes["transformer-container"]}>
      <ODSLabel variant="h6" fontWeight="600">
        Transformer Input
      </ODSLabel>
      <FormulaBar
        variables={variables}
        wrapContent
        placeholder='Enter data to transform (e.g., concat("Hello", "World") or JSON object'
        defaultInputContent={fxContent?.blocks || []}
        onInputContentChanged={(blocks) => {
          setFxContent({ type: "fx", blocks });
        }}
        slotProps={{
          container: {
            style: {
              height: "10rem",
              overflow: "auto",
            },
            "data-testid": "transformer-fx-container",
          },
        }}
        enableObjectMapping={
          localStorage.getItem(localStorageConstants.DEV_MODE) === "true"
        }
      />

      <ODSLabel variant="capital">How to use transformer ?</ODSLabel>
      <div className={classes["grid"]}>
        <div className={classes["grid-item"]}>
          <img
            src="https://cdn-v1.tinycommand.com/1234567890/1765525418393/Transformer%20img%201.svg"
            alt="Step 1"
            draggable={false}
            data-testid="transformer-img-1"
          />
        </div>
        <div
          className={classes["grid-item"]}
          style={{
            display: "grid",
            gridTemplateRows: "1fr 1fr",
            gap: "0.75rem",
          }}
        >
          <img
            src="https://cdn-v1.tinycommand.com/1234567890/1765525422718/Transformer%20img%202.svg"
            alt="Step 2"
            draggable={false}
            data-testid="transformer-img-2"
          />
          <img
            src="https://cdn-v1.tinycommand.com/1234567890/1765525425949/Transformer%20img%203.svg"
            alt="Step 3"
            draggable={false}
            data-testid="transformer-img-3"
          />
        </div>
      </div>
    </div>
  );
};

export default Configure;
