import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Collapse from "@mui/material/Collapse";
// import ODSIcon from "oute-ds-icon";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
// import ODSAdvancedLabel from "oute-ds-advanced-label";
import { ODSIcon, ODSAdvancedLabel } from "../../index.jsx";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;

const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "1rem",
          padding: ".75rem .375rem",
          alignItems: "center",
          "&.Mui-selected": {
            background: default_theme.palette["oute-background-selected"],
          },
          "&:hover": {
            background: default_theme.palette["oute-background-hover"],
          },
          cursor: "default",
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: "1.5rem",
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
  },
});
const ODSNestedList = forwardRef(
  (
    {
      activeId = "", // TODO
      enableListItemSelection = false,
      onListItemClicked = () => {},
      onListItemSelected = () => {},
      onContextMenu = () => {},
      onListItemsUpdated = () => {},
      listItems,
      listItemsMap,
      labelProps,
      subTextProps,
      defaultLabelBackground,
      filterText = "",
      expandOnLabelClick = true,
      showFilteredListItemChildren = false,
    },
    ref
  ) => {
    const [open, setOpen] = useState({});
    const [isActive, setIsActive] = useState(activeId);
    const [showCheckbox, setShowCheckbox] = useState({});
    const [isChecked, setIsChecked] = useState({});

    const getValue = useCallback(
      (li, defaultKey) => {
        let key = listItemsMap ? listItemsMap[defaultKey] : defaultKey;
        if (key) {
          if (key?.indexOf(".") === -1) {
            return li[key];
          } else {
            let keys = key.split(".");
            return keys.reduce((prev, current, index) => {
              if (prev === null && index === 0) return li[current];
              else {
                if (prev) return prev[current];
                return null;
              }
            }, null);
          }
        }
        return li[defaultKey];
      },
      [listItemsMap]
    );

    const renderListItem = useCallback(
      (li, path = [], showChildren = false) => {
        const id = getValue(li, "id");
        const listItems = getValue(li, "listItems");
        const label = getValue(li, "label");
        const subText = getValue(li, "desc");
        const labelVariant = getValue(li, "primaryTextVariant") || "subtitle1";
        const subTextVariant =
          getValue(li, "secondaryTextVariant") || "caption";
        const leftAdornment = getValue(li, "leftAdornment");
        const rightAdornment = getValue(li, "rightAdornment");
        const labelBackground = getValue(li, "labelBackground");
        const onListItemClickedHandler =
          getValue(li, "onListItemClicked") || onListItemClicked;
        path = [...path, { id, label }];

        let isMatched = true;
        let isTextMatched = false;
        let hasTextMatchingChild = false;
        if (filterText) {
          isTextMatched = label
            ?.toLowerCase()
            .includes(filterText.toLowerCase());
          hasTextMatchingChild =
            listItems && listItems.some((child) => renderListItem(child, []));
          isMatched = isTextMatched || hasTextMatchingChild;
        }
        if (isMatched || (showChildren && showFilteredListItemChildren)) {
          return (
            <List key={id} className={`oute-ds-nested-list`}>
              <ListItemButton
                id={id}
                selected={isActive === id}
                onMouseEnter={() => {
                  if (enableListItemSelection && !showCheckbox[id])
                    setShowCheckbox((prev) => {
                      if (!prev[id]) {
                        prev[id] = true;
                      }
                      return { ...prev };
                    });
                }}
                onMouseLeave={() => {
                  if (
                    enableListItemSelection &&
                    showCheckbox[id] &&
                    !isChecked[id]
                  )
                    setShowCheckbox((prev) => {
                      prev[id] = !prev[id];
                      return { ...prev };
                    });
                }}
                onClick={(e) => {
                  if (e?.target?.type === "checkbox") return;
                  if (listItems?.length > 0)
                    setOpen((prevState) => {
                      if (!prevState[id]) {
                        prevState[id] = true;
                      } else {
                        prevState[id] = !prevState[id];
                      }
                      return { ...prevState };
                    });
                  setIsActive(id);
                  if (!listItems?.length) {
                    onListItemClickedHandler(id, li, path);
                  }
                }}
                data-path={JSON.stringify(path)}
                className={`${listItems?.length ? "is-expandable" : "is-leaf"}`}
                data-testid={label}
              >
                <ListItemIcon
                  sx={{
                    width: 30,
                    height: 30,
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  {listItems?.length > 0 &&
                    (open[id] ? (
                      <ODSIcon
                        outeIconName="OUTEExpandLessIcon"
                        outeIconProps={{
                          sx: {
                            color: "#686F74",
                          },
                        }}
                      />
                    ) : (
                      <ODSIcon
                        outeIconName="OUTEExpandMoreIcon"
                        outeIconProps={{
                          sx: {
                            color: "#686F74",
                          },
                        }}
                      />
                    ))}
                </ListItemIcon>
                <ODSAdvancedLabel
                  labelText={label}
                  labelSubText={subText}
                  labelProps={{
                    variant: labelVariant,
                    ...labelProps,
                    onClick: (e) => {
                      e.stopPropagation();
                      onListItemClickedHandler(id, li, path, e);
                      if (listItems?.length > 0 && expandOnLabelClick) {
                        setOpen((prevState) => {
                          if (!prevState[id]) {
                            prevState[id] = true;
                          } else {
                            prevState[id] = !prevState[id];
                          }
                          return { ...prevState };
                        });
                      }
                      setIsActive(id);
                    },
                    onContextMenu: (e) => {
                      onContextMenu(e, id, li, path);
                    },
                    sx: {
                      background:
                        labelBackground ||
                        defaultLabelBackground ||
                        "transparent",
                      cursor: "pointer",
                      ...labelProps?.sx,
                    },
                  }}
                  subTextProps={{
                    variant: subTextVariant,
                    ...subTextProps,
                  }}
                  fullWidth
                  leftAdornment={leftAdornment}
                  rightAdornment={rightAdornment}
                  showCheckbox={showCheckbox[id]}
                  onCheckboxChange={(e) => {
                    setIsChecked((prev) => {
                      prev[id] = e.target.checked;
                      return { ...prev };
                    });
                    onListItemSelected(e, li);
                  }}
                />
              </ListItemButton>
              {listItems?.length > 0 && (
                <Collapse in={open[id]} timeout="auto" sx={{ pl: 1 }}>
                  {listItems.reduce((acc, cli) => {
                    const renderedLi = renderListItem(
                      cli,
                      path,
                      isTextMatched || showChildren
                    );
                    if (renderedLi) {
                      acc = [...acc, renderedLi];
                    }
                    return acc;
                  }, [])}
                </Collapse>
              )}
            </List>
          );
        }
      },
      [
        defaultLabelBackground,
        enableListItemSelection,
        expandOnLabelClick,
        filterText,
        getValue,
        isActive,
        isChecked,
        labelProps,
        onContextMenu,
        onListItemClicked,
        onListItemSelected,
        open,
        showCheckbox,
        showFilteredListItemChildren,
        subTextProps,
      ]
    );

    const fetchParents = (id) => {
      let el = document.getElementById(id);
      if (el) {
        let path = el.getAttribute("data-path");
        if (path) return JSON.parse(path);
      }
      console.info("id or path not found");
    };

    const getListItems = useCallback(
      (listItems) => {
        const renderedOutput = listItems.reduce((acc, li) => {
          const renderedLi = renderListItem(li);
          if (renderedLi) {
            acc = [...acc, renderedLi];
          }
          return acc;
        }, []);
        onListItemsUpdated(renderedOutput);
        return renderedOutput;
      },
      [onListItemsUpdated, renderListItem]
    );
    useEffect(() => {
      if (isActive) {
        let paths = fetchParents(isActive);
        paths?.forEach((p, index) => {
          if (index === paths.length - 1) return;
          setOpen((prev) => {
            prev[p.id] = true;
            return { ...prev };
          });
        });
      }
    }, [isActive]);
    useImperativeHandle(ref, () => {
      return {
        getCurrentPath: fetchParents,
      };
    });

    return (
      <ThemeProvider theme={theme}>
        <List className={`oute-ds-nested-list`}>{getListItems(listItems)}</List>
      </ThemeProvider>
    );
  }
);

export default ODSNestedList;
