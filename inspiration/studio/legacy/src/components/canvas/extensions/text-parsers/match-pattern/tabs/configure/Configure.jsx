import React from "react";
// import { FormulaBar } from "oute-ds-formula-bar";
// import ODSAdvancedLabel from "oute-ds-advanced-label";
// import ODSSwitch from "oute-ds-switch";
import { ODSFormulaBar as FormulaBar, ODSAdvancedLabel, ODSSwitch } from "@src/module/ods";
import classes from "../../MatchPattern.module.css";

const Configure = ({
  globalMatch,
  caseSensitive,
  multiline,
  singleline,
  continueExecutionIfNoMatch,
  variables,
  pattern,
  setPattern,
  text,
  setText,
  setGlobalMatch,
  setCaseSensitive,
  setMultiline,
  setSingleline,
  setContinueExecutionIfNoMatch,
}) => {
  return (
    <div className={classes["match-pattern-advanced-container"]}>
      <div className={classes["top-child"]}>
        <ODSSwitch
          data-testid="global-match-switch"
          labelText={
            <ODSAdvancedLabel
              labelText="Global Match"
              labelProps={{ variant: "body1" }}
              sx={{ width: "auto" }}
            />
          }
          checked={globalMatch}
          onChange={(e) => {
            setGlobalMatch(e.target.checked);
          }}
        />
        <ODSSwitch
          data-testid="case-sensitive-switch"
          labelText={
            <ODSAdvancedLabel
              labelText="Case Sensitive"
              labelProps={{ variant: "body1" }}
              sx={{ width: "auto" }}
            />
          }
          checked={caseSensitive}
          onChange={(e) => {
            setCaseSensitive(e.target.checked);
          }}
        />
        <ODSSwitch
          data-testid="multiline-switch"
          labelText={
            <ODSAdvancedLabel
              labelText="Multiline"
              labelProps={{ variant: "body1" }}
              sx={{ width: "auto" }}
            />
          }
          checked={multiline}
          onChange={(e) => {
            setMultiline(e.target.checked);
          }}
        />
        <ODSSwitch
          data-testid="singleline-switch"
          labelText={
            <ODSAdvancedLabel
              labelText="Singleline"
              labelProps={{ variant: "body1" }}
              sx={{ width: "auto" }}
            />
          }
          checked={singleline}
          onChange={(e) => {
            setSingleline(e.target.checked);
          }}
        />
      </div>
      <div className={classes["bottom-child"]}>
        <ODSSwitch
          data-testid="continue-execution-switch"
          labelText={
            <ODSAdvancedLabel
              labelText="Continue the execution of the route even if the module finds no matches"
              labelProps={{ variant: "body1", sx: { width: "auto" } }}
            />
          }
          checked={continueExecutionIfNoMatch}
          onChange={(e) => {
            setContinueExecutionIfNoMatch(e.target.checked);
          }}
        />
        <FormulaBar
          variables={variables}
          placeholder="Pattern"
          defaultInputContent={pattern?.blocks || []}
          onInputContentChanged={(blocks) => setPattern({ type: "fx", blocks })}
          slotProps={{
            container: { "data-testid": "pattern-input" },
          }}
        />
        <FormulaBar
          variables={variables}
          placeholder="Text"
          defaultInputContent={text?.blocks || []}
          onInputContentChanged={(blocks) => setText({ type: "fx", blocks })}
          slotProps={{
            container: { "data-testid": "text-input" },
          }}
        />
      </div>
    </div>
  );
};

export default Configure;
