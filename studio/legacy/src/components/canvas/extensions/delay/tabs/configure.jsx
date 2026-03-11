// import { FormulaBar } from "oute-ds-formula-bar";
import classes from "../Delay.module.css";
// import ODSLabel from "oute-ds-label";
import { ODSFormulaBar as FormulaBar, ODSLabel } from "@src/module/ods";
import { useEffect, useRef } from "react";

const Configure = ({ delayInMs, setDelayInMs, variables }) => {
  const fxRef = useRef(null);
  useEffect(() => {
    setTimeout(() => {
      fxRef?.current?.focus(true);
    }, 1);
  }, []);
  return (
    <div className={classes["delay-container"]}>
      <ODSLabel variant="h6" fontWeight="600">
        Enter Delay In Milliseconds
      </ODSLabel>
      <FormulaBar
        variables={variables}
        wrapContent
        placeholder="e.g. 1500"
        defaultInputContent={delayInMs?.blocks || []}
        onInputContentChanged={(blocks) => setDelayInMs({ type: "fx", blocks })}
        slotProps={{
          container: {
            style: {
              height: "10rem",
              overflow: "auto",
            },
            "data-testid": "delay-fx-container",
          },
        }}
        ref={fxRef}
      />
    </div>
  );
};

export default Configure;
