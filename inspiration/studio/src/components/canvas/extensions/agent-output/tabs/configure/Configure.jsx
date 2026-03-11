import React, { forwardRef } from "react";
import { ODSInputGridV3 as InputGridV3 } from "@src/module/ods";

const Configure = forwardRef(
  ({ statusCode, setStatusCode, endNodeRowData, variables }, ref) => {
    return (
      <div
        style={{
          height: "calc(100% - 0.5rem)",
          padding: "1rem",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <InputGridV3
          ref={ref}
          variables={variables}
          initialValue={endNodeRowData}
          isValueMode
          hideHeaderAndMap
        />
      </div>
    );
  }
);

export default Configure;
