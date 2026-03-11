import React from "react";

const SheetFilterPlaceholder = () => {
  return (
    <div
      style={{
        border: "1px solid rgb(207, 216, 220)",
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
