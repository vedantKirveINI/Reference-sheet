import React from "react";
import { ODSButton } from "@src/module/ods";

// eslint-disable-next-line react/prop-types
const Footer = ({ onDiscard, onSave }) => {
  return (
    <div
      style={{
        width: "100%",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "8px",
        background: "#fff",
        borderTop: "1px solid rgba(0, 0, 0, 0.12)",
        boxSizing: "border-box",
      }}
      data-testid="connection-footer"
    >
      <ODSButton
        label="DISCARD"
        variant="outlined"
        onClick={onDiscard}
        data-testid="connection-form-dialog-discard-button"
      />
      <ODSButton
        label="SAVE"
        onClick={onSave}
        data-testid="connection-form-dialog-save-button"
      />
    </div>
  );
};

export default Footer;
