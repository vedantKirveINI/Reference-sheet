import React from "react";
import { ODSIcon, ODSButton } from "@src/module/ods";
const DBAddConnectionButton = ({ onClick = () => {}, disabled = false }) => {
  return (
    <ODSButton
      data-testid="db-add-connection-button"
      label="ADD CONNECTION"
      variant="black"
      onClick={onClick}
      disabled={disabled}
      startIcon={
        <ODSIcon
          data-testid="db-add-connection-icon"
          outeIconName={"OUTEAddIcon"}
          outeIconProps={{
            sx: {
              color: "#fff",
              width: "1.25rem",
              height: "1.25rem",
            },
          }}
        />
      }
      
      fullWidth
    />
  );
};

export default DBAddConnectionButton;
