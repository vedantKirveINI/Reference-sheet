import { lazy } from "react";
import classes from "./index.module.css";
import { getCanvasTheme } from "../../../../../../module/constants";

const FormulaBar = lazy(() =>
  import("oute-ds-formula-bar").then((module) => ({
    default: module.FormulaBar,
  }))
);

const AdvancedSettings = ({ configs, setConfigs, variables }) => {
  const canvasTheme = getCanvasTheme();
  return (
    <div className={classes["advanced-settings-container"]}>
      <div
        className={classes["advanced-settings-seperator"]}
        style={{
          backgroundColor: canvasTheme.dark,
        }}
      />
      <span className={classes["advanced-settings-title"]}>Schedule At</span>
      <div style={{ background: "white", fontSize: 16, marginTop: 10 }}>
        <FormulaBar
          isReadOnly={false}
          hideInputBorders={false}
          defaultInputContent={configs?.scheduleAt?.blocks || []}
          onInputContentChanged={(content) => {
            setConfigs({
              ...configs,
              scheduleAt: { type: "fx", blocks: content },
            });
          }}
          variables={variables}
          wrapContent
          slotProps={{
            conatiner: {
              style: {
                background: "#FFF",
                border: "1px solid rgba(0, 0, 0, 0.20)",
                borderRadius: "0.75em",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AdvancedSettings;
