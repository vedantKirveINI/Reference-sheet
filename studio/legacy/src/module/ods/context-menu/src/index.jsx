import React, { useCallback, useState, forwardRef } from "react";
// import ODSIcon from "oute-ds-icon";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import { ODSIcon } from "../../index.jsx";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiList: {
      styleOverrides: {
        root: {
          // padding: "0.5rem",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          zIndex: 1300,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minWidth: "15.625rem",
          padding: "0.5rem 1rem",
          // borderRadius: "0.375rem",
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        invisible: {
          background: "transparent",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        root: {
          position: "static",
        },
        paper: {
          borderRadius: "0.375rem",
          border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
          boxShadow: "0px 8px 20px 0px rgba(122, 124, 141, 0.20)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          // margin: "0.5rem 1rem",
        },
      },
    },
  },
});

const ODSContextMenu = (props) => {
  const {
    show = true,
    menus,
    anchorEl = null,
    sx,
    menuItemSx,
    coordinates,
    anchorOrigin = { vertical: "center", horizontal: "right" },
    transformOrigin = { vertical: "top", horizontal: "left" },
    onClose = () => {},
  } = props;

  const THROTTLE_TIME_IN_MS = 500;

  const throttle = (fn) => {
    var allow = true;
    const enable = () => {
      allow = true;
    };
    return (e) => {
      if (allow) {
        allow = false;
        setTimeout(enable, THROTTLE_TIME_IN_MS);
        fn.call(this, e);
      }
    };
  };

  const RenderMenu = forwardRef(
    ({ subMenus, anchorOrigin, transformOrigin }, ref) => {
      const [open, setOpen] = useState({});
      const handleMouseMove = useCallback((e) => {
        setOpen(e.currentTarget.id);
      }, []);
      return (
        <Box ref={ref}>
          {subMenus?.map((menu) => {
            if (menu.id === undefined || menu.id === null) {
              console.error(
                "oute-ds-context-menu: Please provide unique id to each submenu item."
              );
            }
            const menuItem = (
              <MenuItem
                onMouseMove={throttle(handleMouseMove)}
                id={menu.id}
                sx={{ ...menuItemSx, ...menu.sx, display: "flex" }}
                onClick={(e) => {
                  menu.onClick && menu.onClick();
                  onClose(e, "menuItemClick");
                }}
                disabled={menu.disabled}
                data-testid="ods-context-menu-item"
              >
                {menu.leftAdornment && (
                  <ListItemIcon>{menu.leftAdornment}</ListItemIcon>
                )}
                <ListItemText
                  primary={menu.name}
                  secondary={
                    menu.disabled && menu.disabledMessage
                      ? menu.disabledMessage
                      : null
                  }
                  sx={{
                    "& .MuiListItemText-secondary": {
                      whiteSpace: "normal",
                    },
                  }}
                />
                {!!menu.subMenu?.length && (
                  <ListItemIcon
                    style={{
                      justifyContent: "flex-end",
                    }}
                  >
                    <ODSIcon outeIconName={"OUTEChevronRightIcon"} />
                  </ListItemIcon>
                )}
              </MenuItem>
            );

            return (
              <div key={menu.id} data-testid="ods-context-menu">
                {menu.disabled && menu.disabledMessage ? (
                  <Tooltip title={menu.disabledMessage} placement="bottom">
                    {menuItem}
                  </Tooltip>
                ) : (
                  menuItem
                )}
                {menu.divider && <Divider />}
                {menu.subMenu?.length > 0 && (
                  <Menu
                    key={menu.id}
                    open={open === menu.id}
                    anchorOrigin={anchorOrigin}
                    transformOrigin={transformOrigin}
                    anchorEl={document.getElementById(menu.id)}
                    sx={sx}
                    onClose={onClose}
                  >
                    <RenderMenu
                      subMenus={menu.subMenu}
                      anchorOrigin={anchorOrigin}
                      transformOrigin={transformOrigin}
                    />
                  </Menu>
                )}
              </div>
            );
          })}
        </Box>
      );
    }
  );

  return (
    <ThemeProvider theme={theme}>
      <Menu
        open={show}
        sx={sx}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorReference={coordinates ? "anchorPosition" : "anchorEl"}
        anchorPosition={coordinates}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
      >
        <Box>
          <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={(e) => {
              const isClickInsideMenu = e.target.closest(
                '[data-testid="ods-context-menu"]'
              );
              if (!isClickInsideMenu) {
                // Trigger onClose only if the click is outside of the menu
                onClose(e, "clickAway");
              }
            }}
          >
            <RenderMenu
              subMenus={menus}
              anchorOrigin={anchorOrigin}
              transformOrigin={transformOrigin}
            />
          </ClickAwayListener>
        </Box>
      </Menu>
    </ThemeProvider>
  );
};

export default ODSContextMenu;
