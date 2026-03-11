import React, { useMemo, useRef, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Card from "@mui/material/Card";
// import default_theme from "oute-ds-shared-assets";
// import ODSLabel from "oute-ds-label";
// import ODSButton from "oute-ds-button";
// import ODSIcon from "oute-ds-icon";
// import ODSContextMenu from "oute-ds-context-menu";
import sharedAssets from "../../shared-assets/src/index.jsx";
import { ODSLabel, ODSButton, ODSIcon, ODSContextMenu } from "../../index.jsx";
const default_theme = sharedAssets;

import classes from './index.module.css';

const theme = createTheme({
  ...default_theme,
});

const ODSSelectionBar = ({
  show = false,
  listItems = [],
  actions = [],
  variant = "text",
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);

  const cardRef = useRef();

  const ctxMenuItems = useMemo(() => {
    return actions.slice(3).map(({ label, startIcon, onClick }, idx) => {
      return {
        id: `${label}_${idx}`,
        name: label,
        leftAdornment: startIcon,
        onClick: () => onClick(),
      };
    });
  }, [actions]);

  const handleClose = () => {
    setShowContextMenu(false);
  };

  return (
    <ThemeProvider theme={theme}>
      {show && (
        <>
          <Card
            ref={cardRef}
            sx={{
              background: default_theme.palette?.grey["A100"],
              display: "flex",
              width: "calc(100% - 4rem)",
              borderRadius: "1rem",
              padding: "1rem",
              margin: "0 1rem",
              position: "absolute",
              bottom: "1rem",
              left: 0,
              zIndex: 1, //added this so that the menu is always on top
            }}
          >
            <div className={classes["count-container"]}>
              <ODSLabel
                color={default_theme.palette?.grey["contrastText"]}
                variant="subtitle1"
              >
                {`${listItems.length}  
             SELECTED`}
              </ODSLabel>
            </div>
            <div className={classes["actions-container"]}>
              {actions
                ?.slice(0, 3)
                .map(({ label, startIcon, onClick }, idx) => (
                  <ODSButton
                    key={`${label}_${idx}`}
                    variant={variant}
                    label={label}
                    startIcon={startIcon}
                    color="inherit"
                    onClick={onClick}
                  />
                ))}
              {!!ctxMenuItems.length && (
                <div
                  className={classes["icons"]}
                  style={{
                    backgroundColor: default_theme.palette?.grey["200"],
                  }}
                >
                  <ODSIcon
                    outeIconName="OUTEMoreVerticalIcon"
                    outeIconProps={{
                      sx: { color: default_theme.palette?.grey["A100"] },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowContextMenu(true);
                    }}
                  />
                </div>
              )}
            </div>
          </Card>
          <ODSContextMenu
            show={showContextMenu}
            menus={ctxMenuItems}
            anchorEl={cardRef.current}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            onClose={handleClose}
          />
        </>
      )}
    </ThemeProvider>
  );
};

export default ODSSelectionBar;
