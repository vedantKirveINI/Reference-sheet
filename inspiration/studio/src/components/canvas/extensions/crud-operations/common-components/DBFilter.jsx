import React from "react";
import { ConditionComposerV2 } from "@src/module/condition-composer-v2";
import { cn } from "@/lib/utils";

import classes from "./DBFilter.module.css";

const DBFilter = ({ schema, variables, filter, onChange }) => {
  return (
    <div
      className={cn(classes["container"])}
    >
      <ConditionComposerV2
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
