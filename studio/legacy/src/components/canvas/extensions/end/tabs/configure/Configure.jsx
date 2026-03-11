import React, { forwardRef } from "react";
// import ODSNumberInput from "oute-ds-number-input";
import { ODSNumberInput } from "@src/module/ods";
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
          overflowY: "auto",
        }}
      >
        <ODSNumberInput
          label="Status Code"
          placeholder="Enter status code"
          value={statusCode}
          className="black"
          onChange={(e) => {
            setStatusCode(e.target.value);
          }}
          InputProps={{
            "data-testid": "end-node-status-code",
          }}
          decimalScale={0}
          sx={{
            width: "100%",
          }}
        />
        <InputGridV2
          ref={ref}
          variables={variables}
          initialValue={endNodeRowData}
          isValueMode
        />
      </div>
    );
  }
);

export default Configure;
