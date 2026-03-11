import React from "react";
// import { FormulaBar } from "@src/module/ods";
// import { ODSLabel } from '@src/module/ods';
import { ODSFormulaBar as FormulaBar, ODSLabel } from "@src/module/ods";
import classes from "../../Iterator.module.css";
import { localStorageConstants } from "../../../../../../module/constants";

const Configure = ({ fxContent = {}, setFxContent, variables }) => {
  return (
    <div
      className={classes["iterator-container"]}
      data-testid="iterator-container"
    >
      <ODSLabel variant="h6" fontWeight="600">
        Iterator Input
      </ODSLabel>

      <FormulaBar
        variables={variables}
        wrapContent
        placeholder="Choose an array to iterate"
        defaultInputContent={fxContent?.blocks || []}
        onInputContentChanged={(blocks) => setFxContent({ type: "fx", blocks })}
        slotProps={{
          container: {
            style: { height: "10rem", overflow: "auto" },
            "data-testid": "iterator-fx-container",
          },
        }}
        enableObjectMapping={
          localStorage.getItem(localStorageConstants.DEV_MODE) === "true"
        }
      />

      <ODSLabel variant="capital">
        How Iterator works? Let’s understand with an example
      </ODSLabel>

      {/* updated grid markup */}
      <div className={classes["iterator-grid"]}>
        <div className={classes["iterator-step-grid"]}>
          <div className={classes["iterator-step-cell"]}>
            <img
              src="https://cdn-v1.tinycommand.com/1234567890/1749727784819/Aggregator%201%20img.webp"
              alt="Step 1"
              data-testid="iterator-img-1"
            />
          </div>
          <div className={classes["iterator-step-cell"]}>
            <img
              src="https://cdn-v1.tinycommand.com/1234567890/1749727788162/Aggregator%202%20img.webp"
              alt="Step 2"
              data-testid="iterator-img-2"
            />
          </div>
        </div>
        <div className={classes["iterator-step-cell"]}>
          <img
            src="https://cdn-v1.tinycommand.com/1234567890/1749727791328/Aggregator%203%20img.webp"
            alt="Step 3"
            data-testid="iterator-img-3"
          />
        </div>
      </div>
    </div>
  );
};

export default Configure;
