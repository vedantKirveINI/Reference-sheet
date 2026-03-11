import React from "react";
import { ConditionComposer } from "@oute/oute-ds.molecule.condition-composer";
// import default_theme from "oute-ds-shared-assets";
// import Switch from "oute-ds-switch";
// import Label from "oute-ds-label";
import { sharedAssets as default_theme, ODSSwitch as Switch, ODSLabel as Label } from "@src/module/ods";
import classes from "./SheetFilter.module.css";

const SheetFilter = ({
  schema,
  isSingleUpdate,
  variables,
  filter,
  onChange,
  showFilterSwitch = false,
  setIsSingleUpdate,
}) => {
  return (
    <>
      {showFilterSwitch ? (
        <div className={classes.swtich_container}>
          <Label
            variant="subtitle1"
            style={{ opacity: isSingleUpdate ? 1 : 0.4 }}
            fontWeight="600"
            data-testid="filter-single-conditions-label"
          >
            Apply filter to single condition
          </Label>
          <Switch
            variant="black"
            data-testid="apply-filter-switch"
            checked={!isSingleUpdate}
            onChange={(e) => {
              setIsSingleUpdate((prev) => !prev);
            }}
          />
          <Label
            variant="subtitle1"
            style={{ opacity: !isSingleUpdate ? 1 : 0.4 }}
            fontWeight="600"
            data-testid="filter-all-conditions-label"
          >
            Apply filter to all conditions
          </Label>
        </div>
      ) : null}

      <div
        className={classes["container"]}
        data-testid="filter-section"
        style={{
          border: `1px solid ${default_theme.palette?.grey[200]}`,
        }}
      >
        <ConditionComposer
          initialValue={filter}
          schema={schema}
          onChange={(updateFilterVal, whereClauseStr) => {
            onChange(updateFilterVal, whereClauseStr);
          }}
          variables={variables}
        />
      </div>
    </>
  );
};

export default SheetFilter;
