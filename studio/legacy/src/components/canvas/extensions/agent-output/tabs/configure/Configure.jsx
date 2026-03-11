import React, { forwardRef } from "react";
import InputGridV2 from "@oute/oute-ds.molecule.input-grid-v2";

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
        <InputGridV2
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
