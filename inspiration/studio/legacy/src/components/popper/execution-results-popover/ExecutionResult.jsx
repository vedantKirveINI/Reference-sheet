import React from "react";

import ExecutionInput from "./ExecutionInput";
import ExecutionOutput from "./ExecutionOutput";
import ExecutionError from "./ExecutionError";

const ExecutionResult = ({ execution }) => {
  return (
    <>
      <ExecutionInput data={execution?.input} />
      <ExecutionOutput
        data={execution?.output}
        defaultExpanded={!execution?.error}
      />
      {execution?.error && (
        <ExecutionError data={execution?.error} defaultExpanded={true} />
      )}
    </>
  );
};

export default ExecutionResult;
