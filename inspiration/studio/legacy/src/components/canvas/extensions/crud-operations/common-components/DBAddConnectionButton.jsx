import React from "react";
import ODSIcon from "oute-ds-icon";
import ODSButton from "oute-ds-button";

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
      sx={{
        height: "3rem",
        borderRadius: "0.5rem",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
          transform: "translateY(-1px)",
        },
      }}
      fullWidth
    />
  );
};

export default DBAddConnectionButton;
