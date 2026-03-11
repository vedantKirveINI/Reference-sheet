import React, { forwardRef, useImperativeHandle, useState } from "react";
// import { ODSAutocomplete as ODSAutoComplete } from '@src/module/ods';
// import { ODSTextField as TextField } from "@src/module/ods";

// import { FormulaBar } from "@src/module/ods";
import { ODSAutocomplete as ODSAutoComplete, ODSTextField as TextField, ODSFormulaBar as FormulaBar } from "@src/module/ods";
import LOG_NODE, { logOptions } from "./constant";

import classes from "./Log.module.css";

const Log = forwardRef(({ data = {}, variables }, ref) => {
  const [logContent, setLogContent] = useState(data?.content);
  const [label, setLabel] = useState(data?.label || LOG_NODE.name);
  const [logType, setLogType] = useState(data?.logType || null);

  useImperativeHandle(ref, () => ({
    getData: () => {
      return {
        label,
        content: logContent,
        logType,
      };
    },
  }));
  return (
    <div className={classes["log-container"]}>
      <TextField
        label="Label"
        placeholder="Enter Node Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <ODSAutoComplete
        id="authorization"
        options={logOptions}
        textFieldProps={{
          size: "small",
          label: "Log Type",
          placeholder: "Select Log Type",
        }}
        value={logType}
        onChange={(e, value) => {
          setLogType(value);
        }}
      />
      <div className={classes["log-content"]}>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="e.g. Variable 1 = 12345"
          defaultInputContent={logContent?.blocks || []}
          onInputContentChanged={(blocks) =>
            setLogContent({ type: "fx", blocks })
          }
        />
      </div>
    </div>
  );
});

export default Log;
