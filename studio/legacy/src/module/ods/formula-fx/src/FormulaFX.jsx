import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import Popper from "../../popper/src/index.jsx";
import { ODSIcon as Icon } from "@src/module/ods";
import classes from "./FormulaFX.module.css";
import FormulaInput from "./components/FormulaInput.jsx";
import LeftPanel from "./components/LeftPanel.jsx";
import RightPanel from "./components/RightPanel.jsx";
import AIFixInput from "./components/AIFixInput.jsx";
import { arithmeticData } from "./data/arithmetic-data.jsx";
import { textData } from "./data/text-data.jsx";
import { logicalData } from "./data/logical-data.jsx";
import { dateData } from "./data/date-data.jsx";
import { arrayData } from "./data/array-data.jsx";
import { otherData } from "./data/other-data.jsx";
import { FUNCTIONS, OPERATORS, KEYWORDS, FIELDS } from "./constants/types.jsx";
import {
  ARITHMETIC,
  TEXT_AND_BINARY,
  LOGICAL,
  DATE_AND_TIME,
  ARRAY,
  OTHER,
  VARIABLES,
  TABLE_COLUMNS,
} from "./constants/categories.jsx";
import { filterDataForDisplay, hasContent } from "./utils/fx-utils.jsx";
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";
import utility from "oute-services-flow-utility-sdk";

const RECENT_STORAGE_KEY = "formula-fx-recent";
const MAX_RECENT_ITEMS = 3;

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

const FormulaFX = forwardRef(
  (
    {
      open = false,
      anchorEl = null,
      inline = false,
      variables = {},
      defaultInputContent = [],
      placeholder = "Your formula goes here",
      onInputContentChanged = () => {},
      onClose = () => {},
      onError = () => {},
      onBlur = () => {},
      hasError = false,
      showAIAssistant = false,
      showPreview = false,
      onOpen = () => {},
      type = "any", // "any", "string", "number", "boolean", "int", "object", "array"
      errorType = "default", // "default", "icon"
      defaultPopperPosition = "auto-end",
      tableColumns = [],
      displayFunctionsFor = "all", // "all", "tables"
      isVerbose = false,
      showArrayStructure = false,
      showArithmetic = true,
      showTextAndBinary = true,
      showLogical = true,
      showDateAndTime = true,
      showArray = true,
      showOther = true,
      showVariables = true,
      showAIFixInput = true,
      startAdornment: StartAdornment,
      startAdornmentProps = {},
      endAdornment: EndAdornment,
      endAdornmentProps = {},
      showSeperatorAfterStartAdornment = true,
      showSeperatorBeforeEndAdornment = true,
      showSeperatorAfterEndAdornment = true,
      hideBorders = false,
      variant = "default", // "default", "black"
      slotProps = {
        container: {},
        startAdornment: {},
        content: {},
        endAdornment: {},
        icon: {},
      },
    },
    ref
  ) => {
    const contentEditableRef = useRef();
    const containerRef = useRef();
    const parentRef = useRef();
    const [searchText, setSearchText] = useState("");
    const [aiFixInputValue, setAiFixInputValue] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentItems, setRecentItems] = useState([]);
    const [currentContent, setCurrentContent] = useState([]);
    const [isNavigating, setIsNavigating] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [placement, setPlacement] = useState(defaultPopperPosition);
    const [isPopperOpen, setIsPopperOpen] = useState(false);
    const isInitializedRef = useRef(false);
    const isUserTypingRef = useRef(false);
    const typingTimeoutRef = useRef(null);

    const POPPER_MAX_HEIGHT = 350;
    const POPPER_MAX_WIDTH = 450;

    // Create dedicated function to open popper with placement calculation
    const calculatePlacement = useCallback(() => {
      if (parentRef.current) {
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

        setPlacement(newPlacement);
      }
    }, [defaultPopperPosition]);

    const openPopperWithPlacement = useCallback(() => {
      if (parentRef.current) {
        calculatePlacement();
        setIsPopperOpen(true);
        if (onOpen) onOpen();
      }
    }, [calculatePlacement, onOpen]);

    const hidePopper = useCallback(() => {
      setIsPopperOpen(false);
      setSearchText("");
      onBlur();
    }, [onBlur]);

    // Create debounced version of the resize handler
    const debouncedHandleResize = useMemo(
      () =>
        debounce(() => {
          if (isPopperOpen || open) {
            calculatePlacement();
          }
        }, 150),
      [isPopperOpen, open, calculatePlacement]
    );

    // Scroll and resize listeners for popper positioning
    useEffect(() => {
      const handleScroll = () => {
        if (isPopperOpen || open) {
          calculatePlacement();
        }
      };

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", debouncedHandleResize);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", debouncedHandleResize);
      };
    }, [isPopperOpen, open, calculatePlacement, debouncedHandleResize]);

    const allVariables = useMemo(() => cloneDeep(variables || {}), [variables]);

    // Organize data by categories (matching FormulaBarV3 pattern)
    const allFxDataBlocks = useMemo(() => {
      const blocks = {};

      // Add table columns if displayFunctionsFor is "tables"
      if (displayFunctionsFor === "tables" && tableColumns.length > 0) {
        blocks[TABLE_COLUMNS] = { [FIELDS]: tableColumns };
      }

      // Add variables if displayFunctionsFor is "all" and showVariables is true
      if (showVariables && displayFunctionsFor === "all") {
        blocks[VARIABLES] = allVariables;
      }

      // Process arithmetic category
      if (showArithmetic) {
        const filteredArithmetic = filterDataForDisplay(
          arithmeticData,
          displayFunctionsFor
        );
        if (hasContent(filteredArithmetic)) {
          blocks[ARITHMETIC] = filteredArithmetic;
        }
      }

      // Process text category
      if (showTextAndBinary) {
        const filteredText = filterDataForDisplay(
          textData,
          displayFunctionsFor
        );
        if (hasContent(filteredText)) {
          blocks[TEXT_AND_BINARY] = filteredText;
        }
      }

      // Process logical category
      if (showLogical) {
        const filteredLogical = filterDataForDisplay(
          logicalData,
          displayFunctionsFor
        );
        if (hasContent(filteredLogical)) {
          blocks[LOGICAL] = filteredLogical;
        }
      }

      // Process date category
      if (showDateAndTime) {
        const filteredDate = filterDataForDisplay(
          dateData,
          displayFunctionsFor
        );
        if (hasContent(filteredDate)) {
          blocks[DATE_AND_TIME] = filteredDate;
        }
      }

      // Process array category
      if (showArray) {
        const filteredArray = filterDataForDisplay(
          arrayData,
          displayFunctionsFor
        );
        if (hasContent(filteredArray)) {
          blocks[ARRAY] = filteredArray;
        }
      }

      // Process other category
      if (showOther) {
        const filteredOther = filterDataForDisplay(
          otherData,
          displayFunctionsFor
        );
        if (hasContent(filteredOther)) {
          blocks[OTHER] = filteredOther;
        }
      }

      return blocks;
    }, [
      displayFunctionsFor,
      showArithmetic,
      showTextAndBinary,
      showLogical,
      showDateAndTime,
      showArray,
      showOther,
      showVariables,
      allVariables,
      tableColumns,
    ]);

    // Create flattened arrays for search (maintain backward compatibility for search)
    const allFunctions = useMemo(() => {
      const functions = [];
      Object.values(allFxDataBlocks).forEach((categoryData) => {
        if (categoryData && categoryData[FUNCTIONS]) {
          categoryData[FUNCTIONS].forEach((fn) => {
            functions.push({
              ...fn,
              displayValue: fn.displayValue || fn.value,
            });
          });
        }
      });
      return functions;
    }, [allFxDataBlocks]);

    const allOperators = useMemo(() => {
      const operators = [];
      Object.values(allFxDataBlocks).forEach((categoryData) => {
        if (categoryData && categoryData[OPERATORS]) {
          categoryData[OPERATORS].forEach((op) => {
            operators.push({
              ...op,
              displayValue: op.displayValue || op.value,
            });
          });
        }
      });
      return operators;
    }, [allFxDataBlocks]);

    const allKeywords = useMemo(() => {
      const keywords = [];
      Object.values(allFxDataBlocks).forEach((categoryData) => {
        if (categoryData && categoryData[KEYWORDS]) {
          categoryData[KEYWORDS].forEach((kw) => {
            keywords.push({
              ...kw,
              displayValue: kw.displayValue || kw.value,
            });
          });
        }
      });
      return keywords;
    }, [allFxDataBlocks]);

    const flattenedItems = useMemo(() => {
      const items = [];

      if (recentItems.length > 0) {
        recentItems.forEach((item) => {
          items.push({
            ...item,
            section: item.originalSection || item.section || "functions",
            isRecent: true,
          });
        });
      }

      Object.entries(allVariables).forEach(([category, categoryItems]) => {
        if (Array.isArray(categoryItems)) {
          categoryItems.forEach((item, idx) => {
            items.push({
              ...item,
              section: "variables",
              nodeNumber: idx + 1,
              category,
            });
          });
        }
      });

      allFunctions.forEach((fn) => {
        items.push({ ...fn, section: "functions" });
      });

      allOperators.forEach((op) => {
        items.push({ ...op, section: "operators" });
      });

      allKeywords.forEach((kw) => {
        items.push({ ...kw, section: "keywords" });
      });

      return items;
    }, [allVariables, allFunctions, allOperators, allKeywords, recentItems]);

    const filteredItems = useMemo(() => {
      if (!searchText.trim()) return flattenedItems;
      const query = searchText.toLowerCase();
      return flattenedItems.filter((item) => {
        const name = (
          item.displayValue ||
          item.value ||
          item.name ||
          ""
        ).toLowerCase();
        const desc = (item.description || "").toLowerCase();
        return name.includes(query) || desc.includes(query);
      });
    }, [flattenedItems, searchText]);

    useEffect(() => {
      if (typeof window === "undefined") return;
      try {
        const stored = localStorage.getItem(RECENT_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentItems(parsed);
          }
        }
      } catch (e) {
        console.warn("Failed to load recent items:", e);
      }
    }, []);

    const addToRecent = useCallback((item) => {
      if (typeof window === "undefined") return;

      // Only store functions - filter out everything else
      const originalSection = item.originalSection || item.section;
      const subCategory = item.subCategory || "";
      const isVariable =
        originalSection === "variables" ||
        subCategory === "NODE" ||
        subCategory === "LOCAL" ||
        subCategory === "GLOBAL" ||
        subCategory === "QUERY_PARAMS" ||
        subCategory === "HIDDEN_PARAMS" ||
        subCategory === "FIELDS" ||
        item.variableData; // If it has variableData, it's a variable

      if (isVariable) {
        return; // Don't store variables
      }

      // Only store functions
      const isFunction =
        originalSection === "functions" || subCategory === "FUNCTIONS";

      if (!isFunction) {
        return; // Don't store operators, keywords, or anything else
      }

      const itemToStore = {
        ...item,
        value: item.value || item.name,
        displayValue: item.displayValue || item.value || item.name,
        description: item.description,
        type: item.type || item.returnType,
        originalSection: "functions",
        subCategory: "FUNCTIONS",
        returnType: item.returnType,
        args: item.args,
        category: item.category,
      };
      setRecentItems((prev) => {
        const filtered = prev.filter(
          (r) =>
            (r.value || r.displayValue) !==
            (itemToStore.value || itemToStore.displayValue)
        );
        const updated = [itemToStore, ...filtered].slice(0, MAX_RECENT_ITEMS);
        try {
          localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to save recent items:", e);
        }
        return updated;
      });
    }, []);

    const handleItemClick = useCallback(
      (item) => {
        addToRecent(item);
        if (contentEditableRef.current) {
          contentEditableRef.current.addBlock(item, searchText);
        }
        setSearchText("");
        setSelectedIndex(-1);
      },
      [addToRecent, searchText]
    );

    const handleItemHover = useCallback((item) => {
      setSelectedItem(item);
    }, []);

    const handleInputChange = useCallback(
      (content, contentStr, returnType = "ANY") => {
        // Mark that user is actively typing to prevent external content resets
        isUserTypingRef.current = true;
        setCurrentContent(content);

        // Type checking - validate return type against expected type
        setErrorMessage("");
        if (type !== "any" && !FX_TYPES[returnType]?.type?.includes(type)) {
          const errorMsg = `Expected ${type} but got ${
            FX_TYPES[returnType]?.type || returnType
          }`;
          setErrorMessage(errorMsg);
          const error = {
            error: true,
            errorMessage: errorMsg,
            errorType: "TYPE_MISMATCH",
          };
          onError(error);
        }

        onInputContentChanged(content, contentStr);

        // Reset typing flag after user stops typing (debounced)
        // This allows external updates via setContent after typing stops
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          isUserTypingRef.current = false;
          typingTimeoutRef.current = null;
        }, 500);
      },
      [onInputContentChanged, onError, type]
    );

    const parseFormulaToBlocks = useCallback(
      (formulaStr) => {
        const blocks = [];
        let remaining = formulaStr;

        const varEntries = [];
        Object.entries(allVariables).forEach(([groupKey, group]) => {
          if (Array.isArray(group)) {
            group.forEach((v) => {
              const name = v.name || v.value;
              if (name) varEntries.push({ name, data: v, group: groupKey });
            });
          }
        });
        varEntries.sort((a, b) => b.name.length - a.name.length);

        const funcEntries = allFunctions
          .map((f) => ({
            name: f.value || f.name,
            data: f,
          }))
          .filter((f) => f.name);
        funcEntries.sort((a, b) => b.name.length - a.name.length);

        while (remaining.length > 0) {
          let matched = false;

          for (const varEntry of varEntries) {
            if (remaining.startsWith(varEntry.name)) {
              blocks.push({
                type: "VARIABLE",
                value: varEntry.name,
                id: varEntry.data.id,
                group: varEntry.group,
              });
              remaining = remaining.slice(varEntry.name.length);
              matched = true;
              break;
            }
          }
          if (matched) continue;

          for (const funcEntry of funcEntries) {
            if (remaining.startsWith(funcEntry.name)) {
              blocks.push({
                type: "FUNCTION",
                value: funcEntry.name,
                id: funcEntry.data.id,
              });
              remaining = remaining.slice(funcEntry.name.length);
              matched = true;
              break;
            }
          }
          if (matched) continue;

          const lastBlock = blocks[blocks.length - 1];
          if (lastBlock && lastBlock.type === "PRIMITIVES") {
            lastBlock.value += remaining[0];
          } else {
            blocks.push({ type: "PRIMITIVES", value: remaining[0] });
          }
          remaining = remaining.slice(1);
        }

        return blocks.length > 0
          ? blocks
          : [{ type: "PRIMITIVES", value: formulaStr }];
      },
      [allVariables, allFunctions]
    );

    useImperativeHandle(
      ref,
      () => ({
        focus: (end) => {
          contentEditableRef.current?.focus(end);
        },
        updateInputContent: (content) => {
          // Only set content if user is not actively typing
          // This matches legacy updateInputContent pattern
          if (!isUserTypingRef.current && contentEditableRef.current) {
            contentEditableRef.current.initContent(content);
            setCurrentContent(content);
            // Don't reset isInitializedRef - allow external updates via imperative handle
          }
        },
        getContent: () => contentEditableRef.current?.getContent(),
        // Keep setContent for backward compatibility
        setContent: (content) => {
          if (!isUserTypingRef.current && contentEditableRef.current) {
            contentEditableRef.current.initContent(content);
            setCurrentContent(content);
          }
        },
      }),
      []
    );

    // Variable validation on mount - following legacy pattern
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
      validateAndUpdateDefaultInputData(
        defaultInputContent,
        allVariables?.NODE
      );
    }, []);

    // Table columns validation on mount
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

    // Initialize content once on mount - following legacy pattern exactly
    // Legacy FormulaBarInput uses empty dependency array [] and doesn't watch defaultInputContent
    useEffect(() => {
      // Only initialize once - don't re-initialize on prop changes
      if (isInitializedRef.current) return;

      const initializeContent = () => {
        if (
          contentEditableRef.current &&
          defaultInputContent &&
          defaultInputContent.length > 0
        ) {
          isInitializedRef.current = true;
          // Initialize content - don't call onInputContentChanged during init (legacy pattern)
          // Legacy code only calls initContent, doesn't trigger parent callbacks
          contentEditableRef.current.initContent(defaultInputContent);
          setCurrentContent(defaultInputContent);
        }
      };

      if (contentEditableRef.current) {
        initializeContent();
      } else {
        const timer = setTimeout(initializeContent, 50);
        return () => clearTimeout(timer);
      }
    }, []); // Empty dependency array - only run once on mount, exactly like legacy

    useEffect(() => {
      if (!open || inline) return;
      const handleGlobalKeyDown = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      };
      document.addEventListener("keydown", handleGlobalKeyDown);
      return () => document.removeEventListener("keydown", handleGlobalKeyDown);
    }, [open, inline, onClose]);

    // Popup mode: show input field always, popper appears on top when open
    const popperContent = (
      <div
        ref={containerRef}
        className={`${classes.container} ${
          hasError ? classes.errorBorder : ""
        }`}
      >
        <div className={classes.header}>
          <span className={classes.headerTitle}>FORMULA FX</span>
          <Icon
            outeIconName="OUTECloseIcon"
            outeIconProps={{
              sx: {
                color: "#ffffff",
                width: "1.5rem",
                height: "1.5rem",
                cursor: "pointer",
              },
            }}
            buttonProps={{
              sx: {
                padding: "0rem",
                borderRadius: "0.25rem",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.1)",
                },
              },
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              hidePopper();
              if (onClose) onClose();
            }}
          />
        </div>

        <div className={classes.contentWrapper}>
          {showAIFixInput && (
            <AIFixInput
              value={aiFixInputValue}
              onChange={setAiFixInputValue}
              onEnter={(text) => {
                console.log(text);
              }}
            />
          )}
          <div className={classes.inputSection}>
            <div className={classes.inputWrapper}>
              <FormulaInput
                ref={contentEditableRef}
                placeholder={placeholder}
                onInputContentChanged={handleInputChange}
                onError={onError}
                onSearch={setSearchText}
                allFunctions={allFunctions}
              />
            </div>
          </div>

          <div className={classes.panelsContainer}>
            <LeftPanel
              variables={allVariables}
              allFxDataBlocks={allFxDataBlocks}
              recentItems={recentItems}
              searchText={searchText}
              filteredItems={filteredItems}
              selectedIndex={selectedIndex}
              selectedItem={selectedItem}
              onItemClick={handleItemClick}
              onItemHover={handleItemHover}
              displayFunctionsFor={displayFunctionsFor}
              isVerbose={isVerbose}
              showArrayStructure={showArrayStructure}
              tableColumns={tableColumns}
              onSearchChange={(val) => {
                setSearchText(val);
                setSelectedIndex(-1);
                setIsNavigating(false);
              }}
              onSearchKeyDown={(e) => {
                const items = filteredItems;
                if (items.length === 0) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setIsNavigating(true);
                  setSelectedIndex((prev) => {
                    const next = prev < items.length - 1 ? prev + 1 : 0;
                    setSelectedItem(items[next]);
                    return next;
                  });
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setIsNavigating(true);
                  setSelectedIndex((prev) => {
                    const next = prev > 0 ? prev - 1 : items.length - 1;
                    setSelectedItem(items[next]);
                    return next;
                  });
                } else if (
                  e.key === "Enter" &&
                  selectedIndex >= 0 &&
                  isNavigating
                ) {
                  e.preventDefault();
                  handleItemClick(items[selectedIndex]);
                  setIsNavigating(false);
                }
              }}
              onSearchFocus={(e) => {
                e.stopPropagation();
                // Prevent focus from moving to formula input
              }}
            />
            <RightPanel
              selectedItem={selectedItem}
              isVerbose={isVerbose}
              showArrayStructure={showArrayStructure}
            />
          </div>
        </div>
      </div>
    );

    // In popper mode, always render the input field (like legacy)
    // The popper appears on top when open
    const shouldShowPopper = open || isPopperOpen;
    const popperAnchor = anchorEl || parentRef.current;

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
            {showSeperatorAfterStartAdornment && (
              <div className={classes.fxSeperator} />
            )}
          </div>
          <FormulaInput
            ref={contentEditableRef}
            placeholder={placeholder}
            onInputContentChanged={handleInputChange}
            onError={onError}
            onSearch={setSearchText}
            allFunctions={allFunctions}
            onFocus={() => {
              // Open popper on focus, like legacy
              if (!shouldShowPopper) {
                openPopperWithPlacement();
              }
            }}
            onBlur={hidePopper}
            {...slotProps.content}
          />
          <div className={classes.fxEndContainer} {...slotProps.endAdornment}>
            {showSeperatorBeforeEndAdornment && (
              <div className={classes.fxSeperator} />
            )}
            {EndAdornment && <EndAdornment {...endAdornmentProps} />}
            {showSeperatorAfterEndAdornment && (
              <div className={classes.fxSeperator} />
            )}
          </div>
          {errorMessage && errorType === "default" && (
            <div className={classes.errorMessage}>{errorMessage}</div>
          )}
        </div>
        {shouldShowPopper && popperAnchor && (
          <Popper
            open={shouldShowPopper}
            anchorEl={popperAnchor}
            placement={placement}
            id="fx-popper"
            data-testid="fx-popper"
            tabIndex={-1}
            className={`${classes.popperRoot} ag-custom-component-popup`}
            onClose={() => {
              hidePopper();
              if (onClose) onClose();
            }}
          >
            {popperContent}
          </Popper>
        )}
      </>
    );
  }
);

export default FormulaFX;
