import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  ODSIcon as Icon,
  sharedAssets as default_theme,
  ODSPopper as Popper,
  ODSTooltip as Tooltip,
} from "../../../index.js";
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";

import classes from "./FormulaBarV3.module.css";
import ContentEditable from "../components/content-editable/index.jsx";
import FxPopperV3 from "./FxPopperV3.jsx";
import { validateFormula } from "../engine/index.js";

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

const FormulaBarV3 = forwardRef(
  (
    {
      defaultInputContent = [],
      startAdornment: StartAdornment,
      startAdornmentProps = {},
      endAdornment: EndAdornment,
      endAdornmentProps = {},
      showSeparatorAfterStartAdornment,
      showSeparatorBeforeEndAdornment,
      showSeparatorAfterEndAdornment,
      // Backward compatibility - accept old prop names with typo
      showSeperatorAfterStartAdornment,
      showSeperatorBeforeEndAdornment,
      showSeperatorAfterEndAdornment,
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
      displayFunctionsFor = "all",
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
      defaultPopperPosition = "bottom-start",
      type = "any",
      expectedType = "any",
      errorType = "default",
      showArrayStructure = false,
      enableDebugMode = true,
    },
    ref
  ) => {
    // Backward compatibility: new prop names take precedence, fall back to old typo-based names
    const resolvedShowSeparatorAfterStart = showSeparatorAfterStartAdornment ?? showSeperatorAfterStartAdornment ?? true;
    const resolvedShowSeparatorBeforeEnd = showSeparatorBeforeEndAdornment ?? showSeperatorBeforeEndAdornment ?? true;
    const resolvedShowSeparatorAfterEnd = showSeparatorAfterEndAdornment ?? showSeperatorAfterEndAdornment ?? true;

    const parentRef = useRef();
    const contentEditableRef = useRef();
    const evaluateFxRef = useRef();
    const fxPopperRef = useRef();

    const POPPER_HEIGHT = 400;
    const POPPER_WIDTH = 520;

    const [errorMessage, setErrorMessage] = useState("");
    const [isPopperOpen, setIsPopperOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [placement, setPlacement] = useState(defaultPopperPosition);
    const [debugMode, setDebugMode] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [validationDiagnostics, setValidationDiagnostics] = useState([]);
    const [currentContent, setCurrentContent] = useState([]);
    const [cursorPosition, setCursorPosition] = useState(0);

    const variables = useMemo(
      () => cloneDeep(allVariables || {}),
      [allVariables]
    );

    const functionRegistry = useMemo(() => {
      const registry = {};
      const allFunctionData = [
        require("../data/arithmetic-data.js").arithmeticData,
        require("../data/text-data.js").textData,
        require("../data/logical-data.js").logicalData,
        require("../data/date-data.js").dateData,
        require("../data/array-data.js").arrayData,
        require("../data/other-data.js").otherData,
      ];

      allFunctionData.forEach((data) => {
        if (data.FUNCTIONS) {
          data.FUNCTIONS.forEach((fn) => {
            const args = fn.args || [];
            const requiredCount = args.filter((a) => a.required).length;
            const totalCount = args.length;
            const hasRepeat = args.some((a) => a.repeat);

            registry[fn.value] = {
              name: fn.value,
              returnType: fn.returnType || "any",
              nullable: false,
              minArgs: requiredCount,
              maxArgs: hasRepeat ? Infinity : totalCount,
              args: args,
            };
          });
        }
      });

      return registry;
    }, []);

    const variableRegistry = useMemo(() => {
      const registry = {};
      const varList = variables?.VARIABLES || [];

      varList.forEach((v) => {
        registry[v.value || v.name] = {
          type: v.returnType || "any",
          nullable: v.nullable || false,
        };
      });

      return registry;
    }, [variables]);

    const runValidation = useCallback(
      (content) => {
        if (!content || content.length === 0) {
          setValidationErrors([]);
          setValidationDiagnostics([]);
          return;
        }

        try {
          const result = validateFormula(content, {
            functionRegistry,
            variableRegistry,
          });

          setValidationErrors(result.errors || []);
          setValidationDiagnostics(result.diagnostics || []);
        } catch (e) {
          setValidationErrors([]);
          setValidationDiagnostics([]);
        }
      },
      [functionRegistry, variableRegistry]
    );

    const debouncedValidateRef = useRef();

    useEffect(() => {
      debouncedValidateRef.current = debounce(runValidation, 300);
      return () => {
        if (debouncedValidateRef.current) {
          debouncedValidateRef.current.cancel();
        }
      };
    }, [runValidation]);

    useEffect(() => {
      if (
        debugMode &&
        currentContent.length > 0 &&
        debouncedValidateRef.current
      ) {
        debouncedValidateRef.current(currentContent);
      } else {
        setValidationErrors([]);
        setValidationDiagnostics([]);
      }
    }, [debugMode, currentContent]);

    const placementCalculatedRef = useRef(false);

    const hidePopper = () => {
      setIsPopperOpen(false);
      setSearchText("");
      placementCalculatedRef.current = false;
      onBlur();
    };

    const calculatePlacement = useCallback(
      (force = false) => {
        if (parentRef.current && (force || !placementCalculatedRef.current)) {
          const textareaRect = parentRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const spaceBelow = windowHeight - textareaRect.bottom;
          const spaceAbove = textareaRect.top;
          const BUFFER_SPACE = 20;

          let newPlacement = defaultPopperPosition;

          if (spaceBelow >= POPPER_HEIGHT + BUFFER_SPACE) {
            newPlacement = "bottom-start";
          } else if (spaceAbove >= POPPER_HEIGHT + BUFFER_SPACE) {
            newPlacement = "top-start";
          }

          setPlacement(newPlacement);
          placementCalculatedRef.current = true;
        }
      },
      [defaultPopperPosition]
    );

    const openPopperWithPlacement = useCallback(() => {
      if (parentRef.current && !isPopperOpen) {
        calculatePlacement(true);
        setIsPopperOpen(true);
      }
    }, [calculatePlacement, isPopperOpen]);

    const handlePopperKeyDown = useCallback((e) => {
      if (isPopperOpen && fxPopperRef.current?.handleKeyDown) {
        return fxPopperRef.current.handleKeyDown(e);
      }
      return false;
    }, [isPopperOpen]);

    const debouncedHandleResize = useMemo(
      () =>
        debounce(() => {
          if (isPopperOpen) {
            calculatePlacement();
          }
        }, 150),
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
      window.addEventListener("resize", debouncedHandleResize);

      return () => {
        window.removeEventListener("resize", debouncedHandleResize);
      };
    }, [debouncedHandleResize]);

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
              return { ...d, ...error };
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
                      errorMessage: `Missing path, please check connected nodes.`,
                      errorType: "PATH_NOT_FOUND",
                    };
                    onError(error);
                    updatedData = { ...updatedData, ...error };
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
                      errorMessage: `Missing path, please check connected nodes.`,
                      errorType: "PATH_NOT_FOUND",
                    };
                    onError(error);
                    updatedData = { ...updatedData, ...error };
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
                errorMessage: `Column ${d.displayValue} not found.`,
              };
            }
            return {
              ...d,
              displayValue: table.name,
              tableData: { ...d.tableData, name: table.name },
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
          className={`${classes.fxContainer} ${
            hideBorders ? classes.noBorder : ""
          } ${variant === "black" ? classes.black : ""} ${
            errorMessage ? classes.error : ""
          }`}
          {...slotProps.container}
        >
          <div
            className={classes.fxStartContainer}
            {...slotProps.startAdornment}
          >
            {StartAdornment && <StartAdornment {...startAdornmentProps} />}
            {resolvedShowSeparatorAfterStart && (
              <div className={classes.fxSeparator} />
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
            onPopperKeyDown={handlePopperKeyDown}
            onInput={(content, contentStr, returnType = "ANY") => {
              setErrorMessage("");
              setCurrentContent(content);
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
            onCursorPositionChange={(pos) => {
              setCursorPosition(pos);
            }}
            onSearch={(text) => {
              setSearchText(text);
            }}
            {...slotProps.content}
            type={type}
          />
          <div className={classes.fxEndContainer} {...slotProps.endAdornment}>
            {resolvedShowSeparatorBeforeEnd && (
              <div className={classes.fxSeparator} />
            )}
            {EndAdornment && <EndAdornment {...endAdornmentProps} />}
            {resolvedShowSeparatorAfterEnd && (
              <div className={classes.fxSeparator} />
            )}
          </div>
          <div className={classes.fxIconContainer}>
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
                sx: { padding: 0 },
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
                  sx: { background: "var(--error)", maxWidth: "42rem" },
                },
              }}
            >
              <div>
                <Icon
                  outeIconName="OUTEWarningIcon"
                  outeIconProps={{
                    sx: { color: "#f44336" },
                    width: "2rem",
                    height: "2rem",
                  }}
                />
              </div>
            </Tooltip>
          )}
        </div>
        {errorMessage && errorType === "default" && (
          <div className={classes.errorMessage}>{errorMessage}</div>
        )}
        <Popper
          open={isPopperOpen}
          anchorEl={parentRef.current}
          placement={placement}
          id="fx-popper"
          data-testid="fx-popper"
          tabIndex={-1}
          className={`${classes.fxPopper} ag-custom-component-popup`}
          onClick={(e) => {
            contentEditableRef.current.focus();
          }}
          onClose={() => {
            hidePopper();
          }}
        >
          <FxPopperV3
            ref={fxPopperRef}
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
            onDataBlockClick={(block) => {
              const currentSearchText = searchText;
              setSearchText("");
              contentEditableRef.current.addBlock(block, currentSearchText);
            }}
            isVerbose={isVerbose}
            showArrayStructure={showArrayStructure}
            debugMode={enableDebugMode ? debugMode : false}
            onDebugModeChange={enableDebugMode ? setDebugMode : () => {}}
            validationErrors={validationErrors}
            validationDiagnostics={validationDiagnostics}
            expectedType={expectedType}
            functionRegistry={functionRegistry}
            currentContent={currentContent}
            cursorPosition={cursorPosition}
          />
        </Popper>
      </>
    );
  }
);

export default FormulaBarV3;
