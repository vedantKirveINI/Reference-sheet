import React from "react";

const NoRowsOverlayComponent = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "0.75px solid transparent",
        borderRadius: "16px",
        boxSizing: "border-box",
      }}
    >
      No rows to show
    </div>
  );
};

export default NoRowsOverlayComponent;
