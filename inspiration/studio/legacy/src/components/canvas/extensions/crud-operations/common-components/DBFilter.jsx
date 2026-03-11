import React from "react";
import { ConditionComposer } from "@oute/oute-ds.molecule.condition-composer";
import default_theme from "oute-ds-shared-assets";

import classes from "./DBFilter.module.css";

const DBFilter = ({ schema, variables, filter, onChange }) => {
  return (
    <div
      className={classes["container"]}
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
  );
};

export default DBFilter;
