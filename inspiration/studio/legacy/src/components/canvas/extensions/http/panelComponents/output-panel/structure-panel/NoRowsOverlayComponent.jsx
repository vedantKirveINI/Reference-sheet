import React from "react";
// import ODSButton from "oute-ds-button";
import { ODSButton } from "@src/module/ods";

const NoRowsOverlayComponent = ({ onModifyClick = () => {} }) => {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      Auto-fill output by running this module or click on the
      <ODSButton
        label="Modify"
        onClick={onModifyClick}
        size="small"
        variant="text"
      />
      button.
    </div>
  );
};

export default NoRowsOverlayComponent;
