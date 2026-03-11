import React from "react";
// import default_theme from "oute-ds-shared-assets";
import { sharedAssets as default_theme } from "@src/module/ods";

const SheetFilterPlaceholder = () => {
  return (
    <div
      style={{
        border: `1px solid ${default_theme.palette?.grey[200]}`,
        margin: "1rem 0",
        height: "calc(100% - 2rem)",
        borderRadius: "1rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      Please select a schema.
    </div>
  );
};

export default SheetFilterPlaceholder;
