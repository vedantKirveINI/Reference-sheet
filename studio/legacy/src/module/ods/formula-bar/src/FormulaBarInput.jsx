import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

// import Icon from "oute-ds-icon";
// import default_theme from "oute-ds-shared-assets";
// import Popper from "oute-ds-popper";
// import Tooltip from "oute-ds-tooltip";
import { ODSIcon as Icon, ODSPopper as Popper, ODSTooltip as Tooltip } from "../../index.jsx";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;

import classes from './FormulaBarInput.module.css';
import ContentEditable from './components/content-editable/index.jsx';
import FxPopper from './components/popper/index.jsx';
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";

const FX_TYPES = {
  STRING: { id: "STRING", type: ["string"] },
  TEXT: { id: "TEXT", type: ["string"] },
  HTML: { id: "HTML", type: ["string"] },
  XML: { id: "XML", type: ["string"] },
  INT: { id: "INT", type: ["int", "number"] },
  NUMBER: { id: "NUMBER", type: ["number"] },
  BOOLEAN: { id: "BOOLEAN", type: ["boolean"] },
  ARRAY: { id: "ARRAY", type: ["array"] },
  OBJECT: { id: "OBJECT", type: ["object"] },
  JSON: { id: "JSON", type: ["object"] },
  ANY: { id: "ANY", type: ["any"] },
};

const FormulaBarInput = forwardRef(
  (
    {
      defaultInputContent = [],
      startAdornment: StartAdornment,
      startAdornmentProps = {},
      endAdornment: EndAdornment,
      endAdornmentProps = {},
      showSeperatorAfterStartAdornment = true,
      showSeperatorBeforeEndAdornment = true,
      showSeperatorAfterEndAdornment = true,
      isReadOnly = false,
      wrapContent = false,
      placeholder = "",
      variables: allVariables,
      showVariables = true,
      showArithmetic = true,
      showTextAndBinary = true,
      showLogical = true,
      showDateAndTime = true,
      showArray = true,
      showOther = true,
      hideBorders = false,
      displayFunctionsFor = "all", // "all", "table"
      tableColumns = [],
      slotProps = {
        container: {},
        startAdornment: {},
        content: {},
        endAdornment: {},
        icon: {},
      },
      onBlur = () => {},
      onError = () => {},
      onInputContentChanged = () => {},
      variant = "black",
      isVerbose = false,
      defaultPopperPosition = "auto-end",
      type = "any", // "any", "string", "number", "boolean", "int", "object", "array"
      errorType = "default", // "default", "icon"
      showArrayStructure = false,
    },
    ref
  ) => {
    const parentRef = useRef();
    const contentEditableRef = useRef();
    const evaluateFxRef = useRef();
    // const popperRef = useRef();

    const POPPER_MAX_HEIGHT = 350; // 16rem in pixels
    const POPPER_MAX_WIDTH = 450; // 16rem in pixels

    // const [initialValue, setInitialValue] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    const [isPopperOpen, setIsPopperOpen] = useState(false);
    const [searchText, setSearchText] = useState("");

    const [placement, setPlacement] = useState(defaultPopperPosition);

    const variables = cloneDeep(allVariables || {});

    const hidePopper = () => {
      setIsPopperOpen(false);
      setSearchText("");
      onBlur();
    };

    // Create dedicated function to open popper with placement calculation
    const calculatePlacement = useCallback(() => {
      if (parentRef.current) {
        // console.log("calculating placement...");
        const textareaRect = parentRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        const spaceBelow = windowHeight - textareaRect.bottom;
        const spaceAbove = textareaRect.top;
        const spaceRight = windowWidth - textareaRect.right;
        const spaceLeft = textareaRect.left;

        let newPlacement = defaultPopperPosition;

        // Add buffer space to prevent positioning too close to edges
        const BUFFER_SPACE = 20;

        // If default position is specified and there's enough space, use it
        if (
          defaultPopperPosition === "top" &&
          spaceAbove >= POPPER_MAX_HEIGHT + BUFFER_SPACE
        ) {
          newPlacement = "top";
        } else if (
          defaultPopperPosition === "bottom" &&
          spaceBelow >= POPPER_MAX_HEIGHT + BUFFER_SPACE
        ) {
          newPlacement = "bottom";
        } else if (
          defaultPopperPosition === "left" &&
          spaceLeft >= POPPER_MAX_WIDTH + BUFFER_SPACE
        ) {
          newPlacement = "left";
        } else if (
          defaultPopperPosition === "right" &&
          spaceRight >= POPPER_MAX_WIDTH + BUFFER_SPACE
        ) {
          newPlacement = "right";
        } else {
          // Fallback logic for auto positioning
          if (spaceBelow >= POPPER_MAX_HEIGHT + BUFFER_SPACE) {
            newPlacement = "bottom-start";
          } else if (spaceAbove >= POPPER_MAX_HEIGHT + BUFFER_SPACE) {
            newPlacement = "top-start";
          } else if (spaceLeft >= POPPER_MAX_WIDTH + BUFFER_SPACE) {
            newPlacement = "left";
          } else if (spaceRight >= POPPER_MAX_WIDTH + BUFFER_SPACE) {
            newPlacement = "right";
          }
        }

        // console.log("Calculated placement:", newPlacement);
        setPlacement(newPlacement);
      }
    }, [defaultPopperPosition]);

    const openPopperWithPlacement = useCallback(() => {
      if (parentRef.current) {
        calculatePlacement(); // Calculate placement first
        setIsPopperOpen(true); // Then open the popper
      }
    }, [calculatePlacement]);

    // Create debounced version of the resize handler
    const debouncedHandleResize = useMemo(
      () =>
        debounce(() => {
          if (isPopperOpen) {
            calculatePlacement();
          }
        }, 150), // 150ms debounce delay
      [isPopperOpen, calculatePlacement]
    );

    useImperativeHandle(
      ref,
      () => ({
        focus: (end) => {
          contentEditableRef.current?.focus(end);
        },
        updateInputContent: (content) => {
          contentEditableRef.current?.initContent(content);
        },
      }),
      [contentEditableRef.current]
    );

    useEffect(() => {
      const handleScroll = () => {
        if (isPopperOpen) {
          calculatePlacement();
        }
      };

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", debouncedHandleResize);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", debouncedHandleResize);
      };
    }, [isPopperOpen, calculatePlacement, debouncedHandleResize]);

    useEffect(() => {
      const validateAndUpdateDefaultInputData = (data, variables = []) => {
        const updatedDefaultInputContent = data.map((d) => {
          if (d.type === "NODE") {
            const node_variable = variables.find(
              (n) => n.key === d.variableData.nodeId
            );
            if (!node_variable) {
              const error = {
                error: true,
                errorMessage: `Node ${d.variableData.nodeName} not found. Please check connected nodes.`,
                errorType: "NODE_NOT_FOUND",
              };
              onError(error);
              return {
                ...d,
                ...error,
              };
            } else {
              const pathToTraverse = d.variableData.path;
              const currentSchema =
                node_variable?.go_data?.output?.schema?.schema?.[0]?.schema;
              let newLabel =
                node_variable.description ||
                node_variable?.name ||
                d.variableData.nodeName;
              let prev = null;
              let index = 0;
              let updatedData = { ...d };
              while (index < pathToTraverse.length) {
                if (index === 0) {
                  const temp = currentSchema?.find(
                    (s) => s.key === pathToTraverse[index]
                  );
                  if (!temp) {
                    const error = {
                      error: true,
                      errorMessage: `Missing path, please check connected nodes. This could be due to a change in the response structure of ${d.variableData.nodeName}.`,
                      errorType: "PATH_NOT_FOUND",
                    };
                    onError(error);
                    updatedData = {
                      ...updatedData,
                      ...error,
                    };
                    break;
                  }
                  if (temp.key !== "response") {
                    newLabel = newLabel + "." + (temp.label || temp.key);
                  }
                  prev = temp.schema;
                  index++;
                } else {
                  const temp = prev?.find(
                    (s) => s.key === pathToTraverse[index]
                  );
                  if (!temp) {
                    const error = {
                      error: true,
                      errorMessage: `Missing path, please check connected nodes. This could be due to a change in the response structure of ${d.variableData.nodeName}.`,
                      errorType: "PATH_NOT_FOUND",
                    };
                    onError(error);
                    updatedData = {
                      ...updatedData,
                      ...error,
                    };
                    break;
                  }
                  newLabel = newLabel + "." + (temp.label || temp.key);
                  prev = temp.schema;
                  index++;
                }
              }
              return {
                ...updatedData,
                subType: newLabel,
                value: newLabel,
                variableData: {
                  ...updatedData.variableData,
                  nodeName: newLabel,
                },
              };
            }
          } else {
            return d;
          }
        });
        contentEditableRef.current?.initContent(updatedDefaultInputContent);
      };
      validateAndUpdateDefaultInputData(defaultInputContent, variables?.NODE);
    }, []);

    useEffect(() => {
      if (!tableColumns?.length) return;
      const validateTableColumns = (data, tableColumns) => {
        const updatedDefaultInputContent = data.map((d) => {
          if (d.type === "FIELDS") {
            const table = tableColumns.find((t) => d.tableData.id === t.id);
            if (!table) {
              return {
                ...d,
                error: true,
                errorMessage: `Column ${d.displayValue} not found. Please check table columns.`,
              };
            }
            return {
              ...d,
              displayValue: table.name,
              tableData: {
                ...d.tableData,
                name: table.name,
              },
            };
          }
          return d;
        });
        contentEditableRef.current?.initContent(updatedDefaultInputContent);
      };
      validateTableColumns(defaultInputContent, tableColumns);
    }, []);

    return (
      <>
        <div
          ref={parentRef}
          className={`${classes["fx-container"]} ${
            hideBorders && classes["no-border"]
          } ${variant === "black" ? classes["black"] : ""} ${
            errorMessage && classes["error"]
          }`}
          {...slotProps.container}
        >
          <div
            className={classes["fx-start-container"]}
            {...slotProps.startAdornment}
          >
            {StartAdornment && <StartAdornment {...startAdornmentProps} />}
            {showSeperatorAfterStartAdornment && (
              <div className={classes["fx-seperator"]} />
            )}
          </div>
          <ContentEditable
            ref={contentEditableRef}
            isReadOnly={isReadOnly}
            wrapContent={wrapContent}
            placeholder={placeholder}
            onEscape={(e) => {
              if (isPopperOpen) {
                e.stopPropagation();
                e.preventDefault();
                hidePopper();
              }
            }}
            onError={onError}
            onBlur={hidePopper}
            onFocus={() => {
              openPopperWithPlacement();
            }}
            onInput={(content, contentStr, returnType = "ANY") => {
              setErrorMessage("");
              if (evaluateFxRef.current) {
                evaluateFxRef.current.refreshData();
              }
              if (
                type !== "any" &&
                !FX_TYPES[returnType]?.type?.includes(type)
              ) {
                setErrorMessage(
                  `Expected ${type} but got ${FX_TYPES[returnType].type}`
                );
                const error = {
                  error: true,
                  errorMessage: `Expected ${type} but got ${FX_TYPES[returnType].type}`,
                  errorType: "TYPE_MISMATCH",
                };
                onError(error);
              }
              onInputContentChanged(content, contentStr);
            }}
            onSearch={(text) => {
              setSearchText(text);
            }}
            {...slotProps.content}
            type={type}
          />
          <div
            className={classes["fx-end-container"]}
            {...slotProps.endAdornment}
          >
            {showSeperatorBeforeEndAdornment && (
              <div className={classes["fx-seperator"]} />
            )}
            {EndAdornment && <EndAdornment {...endAdornmentProps} />}
            {showSeperatorAfterEndAdornment && (
              <div className={classes["fx-seperator"]} />
            )}
          </div>
          <div className={classes["fx-icon-container"]}>
            <Icon
              outeIconName="OUTEFxIcon"
              outeIconProps={{
                sx: {
                  color:
                    variant === "black"
                      ? "#212121"
                      : default_theme.palette.primary.main,
                  width: "2rem",
                  height: "2rem",
                },
                ...slotProps.icon,
              }}
              buttonProps={{
                "data-testid": "fx-icon",
                sx: {
                  padding: 0,
                },
              }}
              onClick={() => {
                contentEditableRef.current.focus();
              }}
            />
          </div>
          {errorMessage && errorType === "icon" && (
            <Tooltip
              title={errorMessage}
              arrow={false}
              slotProps={{
                tooltip: {
                  sx: {
                    background: "var(--error)",
                    maxWidth: "42rem",
                  },
                },
              }}
            >
              <div>
                <Icon
                  outeIconName="OUTEWarningIcon"
                  outeIconProps={{
                    sx: {
                      color: "#f44336",
                    },
                    width: "2rem",
                    height: "2rem",
                  }}
                />
              </div>
            </Tooltip>
          )}
        </div>
        {errorMessage && errorType === "default" && (
          <div className={classes["error-message"]}>{errorMessage}</div>
        )}
        <Popper
          open={isPopperOpen}
          anchorEl={parentRef.current}
          placement={placement}
          id="fx-popper"
          data-testid="fx-popper"
          tabIndex={-1}
          className={`${classes["fx-popper"]} ag-custom-component-popup`} //ag-custom-component-popup is required for aggrid support
          onClick={(e) => {
            contentEditableRef.current.focus();
          }}
          onClose={() => {
            hidePopper();
          }}
        >
          <FxPopper
            searchText={searchText}
            showVariables={showVariables}
            showArithmetic={showArithmetic}
            showTextAndBinary={showTextAndBinary}
            showLogical={showLogical}
            showDateAndTime={showDateAndTime}
            displayFunctionsFor={displayFunctionsFor}
            tableColumns={tableColumns}
            showArray={showArray}
            showOther={showOther}
            variables={variables}
            contentRef={contentEditableRef}
            evaluateFxRef={evaluateFxRef}
            onClose={(e) => {
              e.stopPropagation();
              hidePopper();
            }}
            onDataBlockClick={(block, text) => {
              setSearchText("");
              contentEditableRef.current.addBlock(block, text);
            }}
            isVerbose={isVerbose}
            showArrayStructure={showArrayStructure}
          />
        </Popper>
      </>
    );
  }
);

export default FormulaBarInput;
