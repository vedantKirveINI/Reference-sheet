import React, { useState } from "react";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
import classes from './index.module.css';

const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiSpeedDial: {
      styleOverrides: {
        root: {
          alignItems: "flex-end",
        },
        actions: {
          alignItems: "flex-end",
        },
      },
    },
  },
});

const ODSSpeedDial = ({ ...props }) => {
  const [open, setOpen] = useState(false);
  return (
    <ThemeProvider theme={theme}>
      <SpeedDial
        ariaLabel="Speed Dial"
        sx={{
          position: "absolute",
          bottom: "1rem",
          right: "1rem",
          "& .MuiSpeedDialIcon-root": {
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          },
          ...props.sx,
        }}
        icon={
          props.icon || (
            <SpeedDialIcon
              color="#2196F3"
              sx={{
                "& .MuiSpeedDialIcon-icon": {
                  height: "2.5rem",
                  width: "2.5rem",
                },
                ...props.sx,
              }}
            />
          )
        }
        FabProps={{
          "data-testid": "speed-dial",
        }}
        open={open}
        onClick={() => setOpen((prev) => !prev)}
        onClose={(e, reason) => {
          if (reason === "blur") setOpen(false);
        }}
        {...props}
      >
        {props.actions?.map((action) => {
          return (
            <SpeedDialAction
              key={action.id}
              icon={
                <div className={classes["speed-dial-action-container"]}>
                  {action.name}
                  {action.icon}
                </div>
              }
              onClick={() => {
                action?.onActionClick && action.onActionClick(action);
              }}
              FabProps={{
                variant: "extended",
                size: "medium",
                "data-testid": `action-${action.name}`,
                sx: {
                  fontSize: "1rem",
                },
                ...action?.FabProps,
              }}
            />
          );
        })}
      </SpeedDial>
    </ThemeProvider>
  );
};

export default ODSSpeedDial;
