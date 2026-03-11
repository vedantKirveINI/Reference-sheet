import React from "react";
// import ODSButton from "oute-ds-button";
import { ODSButton } from "@src/module/ods";

const Footer = ({
  onDiscard,
  onSave,
  //  nextNode,
  loading,
}) => {
  return (
    <div
      style={{
        zIndex: 100,
        width: "100%",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "8px",
        background: "#FAFCFE",
        borderTop: "1px solid rgba(0, 0, 0, 0.12)",
        boxSizing: "border-box",
        boxShadow: " 0px 6px 12px 0px rgba(122, 124, 141, 0.13)",
        backdropFilter: "blur(16px)",
      }}
    >
      <ODSButton
        size="medium"
        label="CANCEL"
        variant="outlined"
        onClick={onDiscard}
        style={{
          borderRadius: "0.75em",
        }}
      />
      <ODSButton
        size="medium"
        // label={nextNode?.node_marker === "END" ? "SAVE" : "NEXT"}
        label="OK"
        onClick={onSave}
        disabled={loading}
        style={{
          borderRadius: "0.75em",
        }}
      />
    </div>
  );
};

export default Footer;
