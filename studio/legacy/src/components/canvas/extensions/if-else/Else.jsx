import React from "react";
// import Label from "oute-ds-label";
// import Grid from "oute-ds-grid";
import { ODSLabel as Label, ODSGrid as Grid } from "@src/module/ods";
const Else = ({ elseRowData, elseConditionColDefs, defaultColDef }) => {
  return (
    <div
      style={{
        padding: "1.5rem",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        gap: "2rem",
        flexDirection: "column",
      }}
    >
      <Label
        sx={{
          font: "var(--body1)",
          fontWeight: "600",
        }}
      >
        Else Condition
      </Label>
      <Grid
        rowData={elseRowData}
        columnDefs={elseConditionColDefs}
        defaultColDef={defaultColDef}
        headerHeight={0}
      />
    </div>
  );
};

export default Else;
