import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ODSIcon, ODSAdvancedLabel } from "../../index.js";
import { cn } from "@/lib/utils";
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
            <div key={id} className="oute-ds-nested-list p-0">
              <Collapsible open={open[id]} onOpenChange={(isOpen) => {
                setOpen((prevState) => {
                  prevState[id] = isOpen;
                  return { ...prevState };
                });
              }}>
                <div
                  id={id}
                  className={cn(
                    "rounded-2xl px-1.5 py-3 flex items-center cursor-default",
                    isActive === id && "bg-[var(--oute-background-selected)]",
                    "hover:bg-[var(--oute-background-hover)]",
                    listItems?.length ? "is-expandable" : "is-leaf"
                  )}
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
                    if (listItems?.length > 0) {
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
                    if (!listItems?.length) {
                      onListItemClickedHandler(id, li, path);
                    }
                  }}
                  data-path={JSON.stringify(path)}
                  data-testid={label}
                >
                  <div className="w-[30px] h-[30px] flex justify-center items-center cursor-pointer min-w-[1.5rem]">
                    {listItems?.length > 0 && (
                      <CollapsibleTrigger asChild>
                        <button className="p-0">
                          {open[id] ? (
                            <ODSIcon
                              outeIconName="OUTEExpandLessIcon"
                              outeIconProps={{
                                style: {
                                  color: "#686F74",
                                },
                              }}
                            />
                          ) : (
                            <ODSIcon
                              outeIconName="OUTEExpandMoreIcon"
                              outeIconProps={{
                                style: {
                                  color: "#686F74",
                                },
                              }}
                            />
                          )}
                        </button>
                      </CollapsibleTrigger>
                    )}
                  </div>
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
                      style: {
                        background:
                          labelBackground ||
                          defaultLabelBackground ||
                          "transparent",
                        cursor: "pointer",
                        ...labelProps?.style,
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
                </div>
                {listItems?.length > 0 && (
                  <CollapsibleContent className="pl-4">
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
                  </CollapsibleContent>
                )}
              </Collapsible>
            </div>
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
      <div className="oute-ds-nested-list p-0">{getListItems(listItems)}</div>
    );
  }
);

export default ODSNestedList;
