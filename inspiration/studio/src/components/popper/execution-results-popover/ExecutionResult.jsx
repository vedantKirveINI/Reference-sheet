import React from "react";

import DataSection from "./DataSection";

const ExecutionResult = ({ execution }) => {
  return (
    <div className="space-y-2">
      <DataSection
        label="Input"
        data={execution?.input}
        emptyText="No input"
        defaultOpen={false}
      />
      <DataSection
        label="Output"
        data={execution?.output}
        emptyText="No output"
        defaultOpen={!execution?.error}
      />
      {execution?.error && (
        <DataSection
          label="Error"
          data={execution?.error}
          emptyText="No error details"
          defaultOpen={true}
          variant="error"
        />
      )}
    </div>
  );
};

export default ExecutionResult;
