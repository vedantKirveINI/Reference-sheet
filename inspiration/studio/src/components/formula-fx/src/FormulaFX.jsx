import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useId,
} from "react";
import Popper from "../../../module/ods/popper/src/index.jsx";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLucideIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import useEscapeLayer from "@src/hooks/useEscapeLayer";
import useScrollLock from "@src/hooks/useScrollLock";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FormulaInput from "./components/FormulaInput.jsx";
import LeftPanel from "./components/LeftPanel.jsx";
import RightPanel from "./components/RightPanel.jsx";
import AIAssistTrigger from "./components/AIAssistTrigger.jsx";
import LivePreviewBar from "./components/LivePreviewBar.jsx";
import ErrorIcon from "./components/ErrorIcon.jsx";
import {
  sortItemsByRelevance,
  detectCurrentContext,
  trackFunctionUsage,
} from "./utils/smart-autocomplete.js";
// ModeToggleButton and DropdownInput moved to popper-internal implementation
import { arithmeticData } from "./data/arithmetic-data.js";
import { textData } from "./data/text-data.js";
import { logicalData } from "./data/logical-data.js";
import { dateData } from "./data/date-data.js";
import { arrayData } from "./data/array-data.js";
import { otherData } from "./data/other-data.js";
import { FUNCTIONS, OPERATORS, KEYWORDS, FIELDS, NODE_VARIABLES } from "./constants/types.js";
import {
  ARITHMETIC,
  TEXT_AND_BINARY,
  LOGICAL,
  DATE_AND_TIME,
  ARRAY,
  OTHER,
  VARIABLES,
  TABLE_COLUMNS,
} from "./constants/categories.js";
import { filterDataForDisplay, hasContent, updateBlock, parseFormulaToBlocks as parseFormulaToBlocksUtil, getBlocksForExpansion, serializeBlocksToString, getRange, isRangeValid, getCharacterOffsetFromRange, processNodeVariablesForSchemaList, flattenNodeVariablesToDescriptors } from "./utils/fx-utils.jsx";
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";
import {
  inferFormulaResultType,
  checkTypeCompatibility,
  SEVERITY_LEVELS,
} from "./utils/type-inference.js";
import { validateContentType as validateContentTypeUtil } from "./utils/validate-content-type.js";
import { validateNodeVariables } from "./utils/validate-node-variables.js";

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
      variables = {},
      defaultInputContent = [],
      placeholder = "Your formula goes here",
      isReadOnly = false,
      wrapContent = false,
      onInputContentChanged = () => { },
      onClose = () => { },
      onError = () => { },
      onBlur = () => { },
      hasError = false,
      showAIAssistant = false,
      showPreview = false,
      showLivePreview = true,
      enableSmartAutocomplete = true,
      onOpen = () => { },
      type = "any", // "any", "string", "number", "boolean", "int", "object", "array"
      errorType = "default", // "default", "icon"
      defaultPopperPosition = "auto-end",
      tableColumns = [],
      displayFunctionsFor = "all", // "all", "tables"
      isVerbose = false,
      showArrayStructure = true,
      showArithmetic = true,
      showTextAndBinary = true,
      showLogical = true,
      showDateAndTime = true,
      showArray = true,
      showOther = true,
      showVariables = true,
      showFunctions = true, // When false, hide all function categories (Arithmetic, Text, Logical, etc.); only Variables shown
      showAIFixInput = true,
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
      hideBorders = false,
      variant = "default", // "default", "black"
      appearance = "default", // "default", "minimal"
      slotProps = {
        container: {},
        startAdornment: {},
        content: {},
        endAdornment: {},
        icon: {},
      },
      inputMode = "text", // "formula", "text", "number", "dropdown" - controls which input to show
      dropdownOptions = [], // Array of {value, label} for dropdown mode
      showModeToggle = false, // Show the FX toggle button
      onModeChange = () => { }, // Callback when mode is toggled
      defaultDropdownValue = null, // Default value for dropdown mode
      allowFormulaExpansion = true, // Whether to allow expanding to formula mode via "/"
      singleSelect = false, // When true, only one variable can be selected — acts like a dropdown but with FX nested journeys
    },
    ref,
  ) => {
    // Backward compatibility: new prop names take precedence, fall back to old typo-based names
    const resolvedShowSeparatorAfterStart =
      showSeparatorAfterStartAdornment ??
      showSeperatorAfterStartAdornment ??
      true;
    const resolvedShowSeparatorBeforeEnd =
      showSeparatorBeforeEndAdornment ??
      showSeperatorBeforeEndAdornment ??
      true;
    const resolvedShowSeparatorAfterEnd =
      showSeparatorAfterEndAdornment ?? showSeperatorAfterEndAdornment ?? true;

    const contentEditableRef = useRef();
    const containerRef = useRef();
    const parentRef = useRef();
    const plainInputRef = useRef();
    const [searchText, setSearchText] = useState("");
    const [currentMode, setCurrentMode] = useState(inputMode);
    const [dropdownValue, setDropdownValue] = useState(defaultDropdownValue);
    const [cachedFormulaBlocks, setCachedFormulaBlocks] = useState(null);
    const [cachedFormulaStr, setCachedFormulaStr] = useState("");
    const [isFormulaExpanded, setIsFormulaExpanded] = useState(
      inputMode === "formula",
    );
    const [plainInputValue, setPlainInputValue] = useState("");
    const [isPlainInputFocused, setIsPlainInputFocused] = useState(false);
    const [aiFixInputValue, setAiFixInputValue] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [recentItems, setRecentItems] = useState([]);
    const [currentContent, setCurrentContent] = useState([]);
    const [isNavigating, setIsNavigating] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [messageSeverity, setMessageSeverity] = useState(
      SEVERITY_LEVELS.NONE,
    );
    const [placement, setPlacement] = useState(defaultPopperPosition);
    const [isPopperOpen, setIsPopperOpen] = useState(false);
    const isInitializedRef = useRef(false);
    const isUserTypingRef = useRef(false);
    const typingTimeoutRef = useRef(null);
    const storedCursorPositionRef = useRef(null);
    const lastValueStrRef = useRef("");
    const prevInputModeRef = useRef(inputMode);
    const isTogglingRef = useRef(false);
    const lastDefaultInputContentRef = useRef(null);
    const originalBlocksBeforePlainRef = useRef(null);
    const originalPlainTextRef = useRef(null);


    useEffect(() => {
      if (prevInputModeRef.current !== inputMode) {
        setCurrentMode(inputMode);
        setIsFormulaExpanded(inputMode === "formula");
        prevInputModeRef.current = inputMode;
        // Clear restoration refs when inputMode changes externally
        originalBlocksBeforePlainRef.current = null;
        originalPlainTextRef.current = null;
      }
    }, [inputMode]);

    useEffect(() => {
      setDropdownValue(defaultDropdownValue);
    }, [defaultDropdownValue]);

    const isPlainInputMode =
      (inputMode === "text" || inputMode === "number") && !isFormulaExpanded;

    const handlePlainInputKeyDown = useCallback(
      (e) => {
        if (e.key === "/" && allowFormulaExpansion) {
          e.preventDefault();

          const currentValue = plainInputValue;
          const initialBlocks = currentValue
            ? [{ type: "PRIMITIVES", value: currentValue }]
            : [];
          setCurrentContent(initialBlocks);
          if (contentEditableRef.current?.setContent) {
            contentEditableRef.current.setContent(initialBlocks);
          }
          lastValueStrRef.current = currentValue;
          onInputContentChanged(initialBlocks, currentValue);

          setIsFormulaExpanded(true);
          setTimeout(() => {
            if (contentEditableRef.current?.focus) {
              contentEditableRef.current.focus();
            }
          }, 50);
        }
      },
      [plainInputValue, allowFormulaExpansion, onInputContentChanged],
    );

    const handlePlainInputChange = useCallback(
      (e) => {
        let newValue = e.target.value;

        if (inputMode === "number") {
          newValue = newValue.replace(/[^0-9.\-]/g, "");
        }

        setPlainInputValue(newValue);

        const blocks = newValue
          ? [{ type: "PRIMITIVES", value: newValue }]
          : [];
        onInputContentChanged(blocks, newValue);
      },
      [inputMode, onInputContentChanged],
    );

    const handlePlainInputBlur = useCallback(() => {
      setIsPlainInputFocused(false);
      onBlur();
    }, [onBlur]);

    const resizePlainTextarea = useCallback(() => {
      const el = plainInputRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 128) + "px";
    }, []);

    // Initialize FormulaInput content when switching from plainInputMode to fx mode
    useEffect(() => {
      // Only run when switching TO formula mode (isFormulaExpanded becomes true)
      if (!isFormulaExpanded) {
        return;
      }

      // Only initialize if we have content in state but FormulaInput might not have it yet
      if (currentContent && currentContent.length > 0 && contentEditableRef.current) {
        // Check if FormulaInput already has content by extracting it
        const existingContent = contentEditableRef.current?.getContent?.() || [];

        // Only initialize if FormulaInput is empty or has different content
        const existingContentStr = JSON.stringify(existingContent);
        const currentContentStr = JSON.stringify(currentContent);

        if (existingContentStr !== currentContentStr) {
          // Use initContent to properly initialize the FormulaInput
          if (contentEditableRef.current?.initContent) {
            contentEditableRef.current.initContent(currentContent);
          }
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFormulaExpanded]);

    // Resize plain textarea when value changes (e.g. external set, paste, init)
    useEffect(() => {
      if (!isPlainInputMode) return;
      const frameId = requestAnimationFrame(() => {
        resizePlainTextarea();
      });
      return () => cancelAnimationFrame(frameId);
    }, [plainInputValue, isPlainInputMode, resizePlainTextarea]);

    const handleCollapseToPlain = useCallback(() => {
      // Store original blocks and text BEFORE collapsing for potential restoration
      originalBlocksBeforePlainRef.current = currentContent && currentContent.length > 0
        ? cloneDeep(currentContent)
        : null;

      // Capture cursor position from contentEditable before switching modes
      let cursorOffset = -1;
      // Get the actual DOM element from the FormulaInput component
      const container = contentEditableRef.current?.getElement?.() || null;
      if (container && container instanceof HTMLElement) {
        const range = getRange();
        if (range && isRangeValid(range, container)) {
          cursorOffset = getCharacterOffsetFromRange(container, range);
        } else if (range) {
          // Try to calculate offset even if range validation fails
          try {
            cursorOffset = getCharacterOffsetFromRange(container, range);
          } catch (e) {
            // Ignore errors, cursor will default to start
          }
        }
      }

      // Always use serializeBlocksToString to ensure all blocks (including function names) are preserved
      // lastValueStrRef.current comes from DOM textContent which may miss function names
      const textValue = serializeBlocksToString(currentContent) || lastValueStrRef.current || "";
      const isAtEnd = cursorOffset >= 0 && cursorOffset === textValue.length;
      originalPlainTextRef.current = textValue;
      setPlainInputValue(textValue);
      setIsFormulaExpanded(false);

      // Update parent state with the text value
      const plainBlocks = textValue
        ? [{ type: "PRIMITIVES", value: textValue }]
        : [];
      onInputContentChanged(plainBlocks, textValue);

      setTimeout(() => {
        if (plainInputRef.current) {
          plainInputRef.current.focus();
          // Set cursor position if we captured it
          if (cursorOffset >= 0) {
            // Clamp offset to valid range
            const maxOffset = textValue.length;
            const finalOffset = Math.min(cursorOffset, maxOffset);
            plainInputRef.current.setSelectionRange(finalOffset, finalOffset);
          } else if (isAtEnd) {
            // If cursor was at end, place it at end in plain mode
            plainInputRef.current.setSelectionRange(textValue.length, textValue.length);
          }
        }
      }, 50);
    }, [currentContent, onInputContentChanged]);

    const canCollapseToPlain = useMemo(() => {
      if (inputMode !== "text" && inputMode !== "number") return false;
      return currentContent.every((b) => b?.type === "PRIMITIVES");
    }, [inputMode, currentContent]);



    const handleModeToggle = useCallback(() => {
      const newMode = currentMode === "formula" ? "dropdown" : "formula";

      if (currentMode === "formula" && newMode === "dropdown") {
        setCachedFormulaBlocks(currentContent);
        setCachedFormulaStr(lastValueStrRef.current);
      } else if (currentMode === "dropdown" && newMode === "formula") {
        if (cachedFormulaBlocks && cachedFormulaBlocks.length > 0) {
          setCurrentContent(cachedFormulaBlocks);
          lastValueStrRef.current = cachedFormulaStr;
          if (contentEditableRef.current?.setContent) {
            contentEditableRef.current.setContent(cachedFormulaBlocks);
          }
          onInputContentChanged(cachedFormulaBlocks, cachedFormulaStr);
        }
      }

      setCurrentMode(newMode);
      onModeChange(newMode);
    }, [
      currentMode,
      onModeChange,
      currentContent,
      cachedFormulaBlocks,
      cachedFormulaStr,
      onInputContentChanged,
    ]);

    const handleDropdownChange = useCallback(
      (selectedOption) => {
        setDropdownValue(selectedOption?.value);
        const fxValue = [
          {
            type: "PRIMITIVES",
            value: selectedOption?.value,
          },
        ];
        const valueStr = String(selectedOption?.value ?? "");
        onInputContentChanged(fxValue, valueStr);
      },
      [onInputContentChanged],
    );

    const POPPER_MAX_HEIGHT = 350;
    const POPPER_MAX_WIDTH = 450;

    // Create dedicated function to calculate popper placement
    // Returns the calculated placement value for synchronous use
    const getCalculatedPlacement = useCallback(() => {
      if (!parentRef.current) return defaultPopperPosition;

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

      return newPlacement;
    }, [defaultPopperPosition]);

    // Wrapper that updates state (used by scroll/resize handlers)
    const calculatePlacement = useCallback(() => {
      const newPlacement = getCalculatedPlacement();
      setPlacement(newPlacement);
    }, [getCalculatedPlacement]);

    const openPopperWithPlacement = useCallback(() => {
      if (parentRef.current) {
        // Calculate placement synchronously BEFORE opening
        // This prevents the visual "jump" from default to calculated position
        const newPlacement = getCalculatedPlacement();
        setPlacement(newPlacement);
        // Use requestAnimationFrame to ensure placement is applied before popper becomes visible
        requestAnimationFrame(() => {
          setIsPopperOpen(true);
          if (onOpen) onOpen();
        });
      }
    }, [getCalculatedPlacement, onOpen]);

    const hidePopper = useCallback(() => {
      setIsPopperOpen(false);
      setSearchText("");
      storedCursorPositionRef.current = null;
      onBlur();
      if (onClose) onClose();
    }, [onBlur, onClose]);

    const escapeLayerId = useId();
    useEscapeLayer({
      id: `formula-fx-${escapeLayerId}`,
      onEscape: hidePopper,
      enabled: isPopperOpen,
      priority: 10,
    });

    useScrollLock(isPopperOpen);

    // Handler for when FormulaInput loses focus to SearchBar
    // Also used to clear stored position when FormulaInput regains focus
    const handleBlurToSearchBar = useCallback((cursorRange) => {
      if (cursorRange) {
        // Clone the range to store it
        storedCursorPositionRef.current = cursorRange.cloneRange();
      } else {
        // Clear stored position (when null is passed)
        storedCursorPositionRef.current = null;
      }
    }, []);

    // Create debounced version of the resize handler
    const debouncedHandleResize = useMemo(
      () =>
        debounce(() => {
          if (isPopperOpen || open) {
            calculatePlacement();
          }
        }, 150),
      [isPopperOpen, open, calculatePlacement],
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

      // Process arithmetic category (only when showFunctions is true)
      if (showFunctions && showArithmetic) {
        const filteredArithmetic = filterDataForDisplay(
          arithmeticData,
          displayFunctionsFor,
        );
        if (hasContent(filteredArithmetic)) {
          blocks[ARITHMETIC] = filteredArithmetic;
        }
      }

      // Process text category
      if (showFunctions && showTextAndBinary) {
        const filteredText = filterDataForDisplay(
          textData,
          displayFunctionsFor,
        );
        if (hasContent(filteredText)) {
          blocks[TEXT_AND_BINARY] = filteredText;
        }
      }

      // Process logical category
      if (showFunctions && showLogical) {
        const filteredLogical = filterDataForDisplay(
          logicalData,
          displayFunctionsFor,
        );
        if (hasContent(filteredLogical)) {
          blocks[LOGICAL] = filteredLogical;
        }
      }

      // Process date category
      if (showFunctions && showDateAndTime) {
        const filteredDate = filterDataForDisplay(
          dateData,
          displayFunctionsFor,
        );
        if (hasContent(filteredDate)) {
          blocks[DATE_AND_TIME] = filteredDate;
        }
      }

      // Process array category (array functions like first(), count(), not variable type)
      if (showFunctions && showArray) {
        const filteredArray = filterDataForDisplay(
          arrayData,
          displayFunctionsFor,
        );
        if (hasContent(filteredArray)) {
          blocks[ARRAY] = filteredArray;
        }
      }

      // Process other category
      if (showFunctions && showOther) {
        const filteredOther = filterDataForDisplay(
          otherData,
          displayFunctionsFor,
        );
        if (hasContent(filteredOther)) {
          blocks[OTHER] = filteredOther;
        }
      }

      return blocks;
    }, [
      displayFunctionsFor,
      showFunctions,
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

      // Only include recent items when NOT searching (to avoid duplicates in search results)
      if (
        recentItems.length > 0 &&
        (!searchText || searchText.trim().length === 0)
      ) {
        recentItems.forEach((item) => {
          items.push({
            ...item,
            section: item.originalSection || item.section || "functions",
            isRecent: true,
          });
        });
      }

      Object.entries(allVariables).forEach(([category, categoryItems]) => {
        if (!Array.isArray(categoryItems)) return;
        if (category === NODE_VARIABLES) {
          const processed = processNodeVariablesForSchemaList(categoryItems);
          const nodeBlocksDescriptors = flattenNodeVariablesToDescriptors(processed);

          nodeBlocksDescriptors.forEach((block) => {
            items.push({
              ...block,
              section: "variables",
              category: NODE_VARIABLES,
            });
          });
        } else {
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
    }, [
      allVariables,
      allFunctions,
      allOperators,
      allKeywords,
      recentItems,
      searchText,
    ]);

    const filteredItems = useMemo(() => {
      let items = flattenedItems;

      if (searchText.trim()) {
        const query = searchText.toLowerCase();
        items = flattenedItems.filter((item) => {
          const name = (
            item.displayValue ||
            item.value ||
            item.name ||
            ""
          ).toLowerCase();
          const desc = (item.description || "").toLowerCase();
          return name.includes(query); //|| desc.includes(query);
        });
      }

      if (enableSmartAutocomplete) {
        const context = detectCurrentContext(currentContent);
        items = sortItemsByRelevance(items, {
          expectedType: type,
          currentContext: context.context,
          searchText: searchText.trim(),
          content: currentContent,
        });
      }

      return items;
    }, [
      flattenedItems,
      searchText,
      enableSmartAutocomplete,
      type,
      currentContent,
    ]);

    const handleExpandToFormula = useCallback(() => {
      if (!allowFormulaExpansion) return;

      // Capture cursor position from textarea before switching modes
      const textarea = plainInputRef.current;
      const cursorPosition = textarea ? textarea.selectionStart : null;
      const isAtEnd = cursorPosition !== null && cursorPosition === plainInputValue.length;

      // Get blocks using restoration logic (restore original or parse)
      const initialBlocks = getBlocksForExpansion(
        plainInputValue,
        originalPlainTextRef.current,
        originalBlocksBeforePlainRef.current,
        allFunctions,
        allVariables
      );
      // Calculate the string representation for lastValueStrRef
      const contentStr = serializeBlocksToString(initialBlocks);

      setCurrentContent(initialBlocks);
      // Note: Content initialization is handled by useEffect when FormulaInput mounts
      // Removed immediate setContent call as contentEditableRef.current may be null
      lastValueStrRef.current = contentStr || plainInputValue;
      onInputContentChanged(initialBlocks, contentStr || plainInputValue);

      setIsFormulaExpanded(true);
      setTimeout(() => {
        if (contentEditableRef.current?.focus) {
          // If cursor was at end, place it at end in fx mode
          if (isAtEnd) {
            contentEditableRef.current.focus(true);
          } else {
            // For middle positions, just focus (cursor will be at start, acceptable for now)
            contentEditableRef.current.focus();
          }
        }
      }, 50);
    }, [plainInputValue, allowFormulaExpansion, onInputContentChanged, allFunctions, allVariables]);

    const handleFxToggle = useCallback(() => {
      if (isTogglingRef.current) return;
      isTogglingRef.current = true;

      if (isPlainInputMode) {
        handleExpandToFormula();
      } else {
        handleCollapseToPlain();
      }

      setTimeout(() => {
        isTogglingRef.current = false;
      }, 100);
    }, [isPlainInputMode, handleExpandToFormula, handleCollapseToPlain]);

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
      } catch (e) { }
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

      // Track function usage for smart autocomplete
      const funcName = item.value || item.displayValue;
      if (funcName) {
        trackFunctionUsage(funcName);
      }

      const itemToStore = {
        ...item,

        originalSection: "functions",
      };
      setRecentItems((prev) => {
        const filtered = prev.filter(
          (r) =>
            (r.value || r.displayValue) !==
            (itemToStore.value || itemToStore.displayValue),
        );
        const updated = [itemToStore, ...filtered].slice(0, MAX_RECENT_ITEMS);
        try {
          localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) { }
        return updated;
      });
    }, []);

    const handleItemHover = useCallback((item) => {
      if (item) {
        setHoveredItem(item);
      }
    }, []);

    const handleItemClick = useCallback(
      (item) => {
        setSelectedItem(item);
        addToRecent(item);
        if (contentEditableRef.current) {
          if (singleSelect) {
            contentEditableRef.current.initContent([]);
          }
          const storedRange = singleSelect ? null : storedCursorPositionRef.current;
          contentEditableRef.current.addBlock(item, searchText, storedRange);
          storedCursorPositionRef.current = null;
        }
        setSearchText("");
        if (singleSelect) {
          hidePopper();
        }
      },
      [addToRecent, searchText, singleSelect, hidePopper],
    );

    const handleInsertFormula = useCallback(
      (formulaOrBlock) => {
        if (!formulaOrBlock) return;
        if (typeof formulaOrBlock === "string") {
          if (contentEditableRef.current?.insertRawFormula) {
            contentEditableRef.current.insertRawFormula(formulaOrBlock);
          }
          setSearchText("");
        } else {
          handleItemClick(formulaOrBlock);
        }
      },
      [handleItemClick],
    );

    // Debounced state update function
    const debouncedContentUpdate = useMemo(
      () =>
        debounce((content, contentStr, inferredType, returnType) => {
          const actualType =
            inferredType !== "any"
              ? inferredType
              : FX_TYPES[returnType]?.type?.[0] ||
              returnType?.toLowerCase() ||
              "any";

          // Type checking with severity levels
          setErrorMessage("");
          setMessageSeverity(SEVERITY_LEVELS.NONE);

          if (type !== "any") {
            const compatibility = checkTypeCompatibility(type, actualType);

            if (compatibility.severity !== SEVERITY_LEVELS.NONE) {
              setErrorMessage(compatibility.message);
              setMessageSeverity(compatibility.severity);

              const error = {
                error: compatibility.severity === SEVERITY_LEVELS.ERROR,
                warning: compatibility.severity === SEVERITY_LEVELS.WARNING,
                errorMessage: compatibility.message,
                errorType: "TYPE_MISMATCH",
                severity: compatibility.severity,
              };
              onError(error);
            }
          }

          // Update lastDefaultInputContentRef BEFORE calling parent callback
          // This prevents the sync effect from re-applying content we just sent
          lastDefaultInputContentRef.current = content;

          onInputContentChanged(content, contentStr);

          // Reset typing flag after debounced update
          isUserTypingRef.current = false;
        }, 300),
      [onInputContentChanged, onError, type],
    );

    // Flush debounce on unmount to ensure content is saved before component is destroyed
    useEffect(() => {
      return () => {
        debouncedContentUpdate.flush();
      };
    }, [debouncedContentUpdate]);

    const handleInputChange = useCallback(
      (content, contentStr, returnType = "ANY") => {
        // Mark that user is actively typing to prevent external content resets
        isUserTypingRef.current = true;

        // Update local state immediately for UI responsiveness
        setCurrentContent(content);
        lastValueStrRef.current = contentStr;

        // Use type inference to compute actual result type from formula blocks
        const inferredType = inferFormulaResultType(content);

        // Debounce the expensive operations and parent callback
        debouncedContentUpdate(content, contentStr, inferredType, returnType);
      },
      [debouncedContentUpdate],
    );

    // Memoized handlers for LeftPanel to prevent re-renders
    const handleSearchChange = useCallback((val) => {
      setSearchText(val);
      setIsNavigating(false);
    }, []);

    const handleSearchFocus = useCallback((e) => {
      e.stopPropagation();
    }, []);

    const parseFormulaToBlocks = useCallback(
      (formulaStr) => {
        return parseFormulaToBlocksUtil(formulaStr, allVariables, allFunctions);
      },
      [allVariables, allFunctions],
    );

    useImperativeHandle(
      ref,
      () => ({
        focus: (end) => {
          contentEditableRef.current?.focus(end);
        },
        updateInputContent: (content, force) => {
          const shouldUpdate =
            force === true ||
            (!isUserTypingRef.current && contentEditableRef.current);
          if (!shouldUpdate) return;
          if (contentEditableRef.current) {
            contentEditableRef.current.initContent(content);
          }
          setCurrentContent(content);
          if (force === true) {
            lastDefaultInputContentRef.current = content;
            isUserTypingRef.current = false;
            const textValue = (content || [])
              .filter((b) => b?.type === "PRIMITIVES")
              .map((b) => b?.value || "")
              .join("");
            setPlainInputValue(textValue);
            // Validate content only when force is true
            // Use utility directly to avoid dependency issues
            const result = validateContentTypeUtil(content, type);
            setErrorMessage(result.message);
            setMessageSeverity(result.severity);
            if (result.error) {
              onError(result.error);
            }
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
      [],
    );


    // Variable validation on mount
    useEffect(() => {
      if (!defaultInputContent?.length || !contentEditableRef.current) {
        return;
      }

      const validatedContent = validateNodeVariables(
        defaultInputContent,
        allVariables?.NODE || []
      );

      if (contentEditableRef.current?.initContent) {
        contentEditableRef.current.initContent(validatedContent);
      }

      setCurrentContent(validatedContent);

      // Validate content type
      const result = validateContentTypeUtil(validatedContent, type);
      setErrorMessage(result.message);
      setMessageSeverity(result.severity);
      if (result.error) {
        onError(result.error);
      }

      // Call onError for any NODE_NOT_FOUND errors
      validatedContent.forEach((block) => {
        if (block.error && block.errorType === "NODE_NOT_FOUND") {
          onError({
            error: true,
            errorMessage: block.errorMessage,
            errorType: block.errorType,
          });
        }
      });
    }, []); // Only run on mount

    // Re-validate when variables change (e.g., node deleted)
    useEffect(() => {
      // Skip if no content or user is typing
      if (!currentContent || currentContent.length === 0 || isUserTypingRef.current) {
        return;
      }

      // Skip if content editable ref is not ready
      if (!contentEditableRef.current) {
        return;
      }

      const validatedContent = validateNodeVariables(
        currentContent,
        allVariables?.NODE || []
      );

      // Check if any blocks changed (error added or removed)
      const hasChanges = validatedContent.some((block, index) => {
        const original = currentContent[index];
        return (
          block.error !== original?.error ||
          block.errorType !== original?.errorType ||
          block.errorMessage !== original?.errorMessage
        );
      });

      if (hasChanges) {
        // Update state
        setCurrentContent(validatedContent);

        // Update DOM blocks using updateBlock utility
        validatedContent.forEach((block) => {
          if (block.blockId) {
            if (block.error) {
              updateBlock(contentEditableRef, block.blockId, {
                error: block.error,
                errorMessage: block.errorMessage,
                errorType: block.errorType,
              });
            } else {
              // Clear error if node was re-added
              updateBlock(contentEditableRef, block.blockId, {
                error: false,
                errorMessage: undefined,
                errorType: undefined,
              });
            }
          }
        });

        // Call onError for any new errors
        validatedContent.forEach((block) => {
          if (block.error && block.errorType === "NODE_NOT_FOUND") {
            onError({
              error: true,
              errorMessage: block.errorMessage,
              errorType: block.errorType,
            });
          }
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allVariables?.NODE]);

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
        // Validate content after prefilling
        // Use utility directly to avoid dependency on validateContentType callback
        const result = validateContentTypeUtil(updatedDefaultInputContent, type);
        setErrorMessage(result.message);
        setMessageSeverity(result.severity);
        if (result.error) {
          onError(result.error);
        }
      };
      validateTableColumns(defaultInputContent, tableColumns);
    }, []);

    // Sync content when defaultInputContent prop changes
    // This allows reopening nodes to show the saved content
    useEffect(() => {
      // Skip if user is currently typing to avoid overwriting their input
      if (isUserTypingRef.current) {
        return;
      }

      // CRITICAL FIX: Don't overwrite valid content with empty array during remounts
      // This prevents the bug where tab switching causes FormulaCellEditor to render
      // with empty array temporarily, overwriting the correct blocks
      if (!defaultInputContent || defaultInputContent.length === 0) {
        // Only sync empty array if we don't already have valid content
        // Check both the ref (for persisted state) and currentContent state (for current render)
        // This prevents overwriting valid content during component remounts
        const hasValidContentInRef = lastDefaultInputContentRef.current &&
          Array.isArray(lastDefaultInputContentRef.current) &&
          lastDefaultInputContentRef.current.length > 0;

        const hasValidContentInState = currentContent &&
          Array.isArray(currentContent) &&
          currentContent.length > 0;

        // If we have valid content in either ref or state, don't overwrite with empty array
        // This is critical for preventing empty arrays from overwriting valid content during tab switches
        if (!hasValidContentInRef && !hasValidContentInState) {
          lastDefaultInputContentRef.current = [];
        }
        // Always return early for empty arrays to prevent any processing
        return;
      }

      // Compare with last synced value to avoid unnecessary updates
      const currentJson = JSON.stringify(defaultInputContent);
      const lastJson = JSON.stringify(lastDefaultInputContentRef.current);

      if (currentJson !== lastJson) {
        lastDefaultInputContentRef.current = defaultInputContent;

        // Validate variables before setting content
        const validatedContent = validateNodeVariables(
          defaultInputContent,
          allVariables?.NODE || []
        );

        // Update internal state
        setCurrentContent(validatedContent);

        const syncEditableContent = () => {
          if (contentEditableRef.current?.initContent) {
            contentEditableRef.current.initContent(validatedContent);
          }
          // Validate content after prefilling
          // Use utility directly to avoid dependency on validateContentType callback
          // Only validate if user is not typing (prefilling scenario)
          if (!isUserTypingRef.current) {
            const result = validateContentTypeUtil(validatedContent, type);
            setErrorMessage(result.message);
            setMessageSeverity(result.severity);
            if (result.error) {
              onError(result.error);
            }
          }
        };

        if (contentEditableRef.current) {
          syncEditableContent();
        } else {
          setTimeout(syncEditableContent, 50);
        }

        // For text/number mode, also sync plainInputValue
        if (inputMode === "text" || inputMode === "number") {
          const textValue = validatedContent
            .filter((b) => b?.type === "PRIMITIVES")
            .map((b) => b?.value || "")
            .join("");
          setPlainInputValue(textValue);

          const hasNonTextBlocks = validatedContent.some(
            (b) => b?.type !== "PRIMITIVES",
          );
          if (hasNonTextBlocks) {
            setIsFormulaExpanded(true);
          }
        }

        isInitializedRef.current = true;
      }
    }, [defaultInputContent, inputMode, allVariables?.NODE]);

    // Global ESC key handler for closing popper - works for both external (open) and internal (isPopperOpen) control
    useEffect(() => {
      const shouldShowPopper = open || isPopperOpen;
      if (!shouldShowPopper) return;
      const handleGlobalKeyDown = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          hidePopper();
        }
      };
      document.addEventListener("keydown", handleGlobalKeyDown);
      return () => document.removeEventListener("keydown", handleGlobalKeyDown);
    }, [open, isPopperOpen, hidePopper]);

    // Popup mode: show input field always, popper appears on top when open
    const handleDropdownValueSelect = useCallback(
      (option) => {
        const fxValue = [
          {
            type: "PRIMITIVES",
            value: option.value,
            label: option.label,
          },
        ];
        const valueStr = String(option.value ?? "");

        // Use initContent to update the formula input display
        if (contentEditableRef.current?.initContent) {
          contentEditableRef.current.initContent(fxValue);
        }
        onInputContentChanged(fxValue, valueStr);
        hidePopper();
      },
      [onInputContentChanged, hidePopper],
    );

    const dropdownModeContent = (
      <div
        ref={containerRef}
        className={cn(
          "bg-white rounded-lg border border-gray-200 overflow-hidden",
          hasError && "border-red-400",
        )}
        style={{
          width: "240px",
          boxShadow:
            "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
          marginTop: "-1px",
        }}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 p-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm focus:border-[#1C3693]/50 focus:outline-none focus:ring-1 focus:ring-[#1C3693]/30"
            autoFocus
          />
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "180px" }}>
          {dropdownOptions
            .filter(
              (opt) =>
                !searchText ||
                opt.label.toLowerCase().includes(searchText.toLowerCase()),
            )
            .map((option, index) => (
              <button
                key={option.value ?? index}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm transition-colors",
                  "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                  option.value === true && "text-green-600 font-medium",
                  option.value === false && "text-red-600 font-medium",
                )}
                onClick={() => handleDropdownValueSelect(option)}
              >
                {option.label}
              </button>
            ))}
          {dropdownOptions.filter(
            (opt) =>
              !searchText ||
              opt.label.toLowerCase().includes(searchText.toLowerCase()),
          ).length === 0 && (
              <div className="py-4 text-center text-sm text-gray-400">
                No options found
              </div>
            )}
        </div>
        {showModeToggle && (
          <button
            className="flex w-full items-center justify-center gap-1 border-t border-gray-100 px-3 py-2 text-xs text-[#1C3693] transition-colors hover:bg-gray-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleModeToggle();
            }}
          >
            Use formula instead
            {getLucideIcon("ArrowRight", { size: 12 })}
          </button>
        )}
      </div>
    );

    const formulaModeContent = (
      <Card
        ref={containerRef}
        className={cn(
          "w-[56rem] max-w-[90vw] max-h-[70vh] h-[min(427px,55vh)] flex flex-col overflow-hidden border shadow-lg rounded-2xl",
          hasError && "border-destructive",
        )}
        onWheel={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 rounded-b-none rounded-t-xl border-b bg-card px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            Formula Builder
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              hidePopper();
            }}
          >
            {getLucideIcon("OUTECloseIcon", {
              size: 18,
              className: "text-muted-foreground",
            })}
          </Button>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 rounded-b-xl rounded-t-none bg-muted px-4 pb-4 pt-3">
          {showLivePreview && (
            <LivePreviewBar
              content={currentContent}
              isVisible={showLivePreview}
              expectedType={type}
              selectedFunction={
                ((hoveredItem || selectedItem)?.subCategory === "FUNCTIONS" ||
                  (hoveredItem || selectedItem)?.section === "functions" ||
                  (hoveredItem || selectedItem)?.originalSection === "functions")
                  ? (hoveredItem || selectedItem)
                  : null
              }
            />
          )}
          <div className="flex flex-1 overflow-hidden rounded-lg border border-border bg-card shadow-sm [&>*:first-child]:flex [&>*:first-child]:w-[45%] [&>*:first-child]:flex-col [&>*:first-child]:border-r [&>*:last-child]:w-[55%] [&>*:last-child]:overflow-y-auto [&>div]:h-full">
            <LeftPanel
              variables={allVariables}
              allFxDataBlocks={allFxDataBlocks}
              recentItems={recentItems}
              searchText={searchText}
              filteredItems={filteredItems}
              selectedItem={selectedItem}
              onItemClick={handleItemClick}
              onItemHover={handleItemHover}
              onInsertFormula={handleInsertFormula}
              displayFunctionsFor={displayFunctionsFor}
              isVerbose={isVerbose}
              showArrayStructure={showArrayStructure}
              tableColumns={tableColumns}
              onSearchChange={handleSearchChange}
              onSearchFocus={handleSearchFocus}
              expectedType={type}
            />
            <RightPanel
              selectedItem={hoveredItem || selectedItem}
              onInsertFormula={handleInsertFormula}
            />
          </div>
          {showModeToggle && (
            <Button
              variant="ghost"
              className="w-full justify-center gap-1 rounded-none border-t text-xs text-muted-foreground hover:bg-muted hover:text-primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleModeToggle();
              }}
            >
              {getLucideIcon("ArrowLeft", { size: 12 })}
              Pick from list
            </Button>
          )}
        </CardContent>
      </Card>
    );

    const popperContent =
      currentMode === "dropdown" ? dropdownModeContent : formulaModeContent;

    // Determine popper visibility
    const shouldShowPopper = open || isPopperOpen;
    const popperAnchor = anchorEl || parentRef.current;

    // Render input field with popper appearing on focus/open
    return (
      <div className="formula-fx-root w-full">
        <div
          ref={parentRef}
          {...slotProps.container}
          className={cn(
            "grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,auto)_minmax(0,auto)] border border-input rounded-md items-center box-border py-2 px-3 gap-2 relative w-full min-h-[2.5rem] bg-background transition-all shadow-sm",
            hideBorders && "border-none shadow-none",
            (messageSeverity === SEVERITY_LEVELS.ERROR || hasError) &&
            "border-destructive focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/20",
            messageSeverity === SEVERITY_LEVELS.WARNING &&
            "border-amber-500 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20",
            messageSeverity === SEVERITY_LEVELS.NONE &&
            currentContent.length > 0 &&
            !hasError &&
            "border-green-600 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-600/20",
            !hideBorders &&
            !hasError &&
            messageSeverity !== SEVERITY_LEVELS.ERROR &&
            "hover:border-primary/25 hover:shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
            appearance === "minimal" &&
            "border-none p-2 bg-transparent shadow-none hover:border-none hover:shadow-none focus-within:border-none focus-within:shadow-none",
            slotProps.container?.className,
          )}
        >
          <div
            className="flex items-center gap-1 self-center"
            {...slotProps.startAdornment}
          >
            {StartAdornment && <StartAdornment {...startAdornmentProps} />}
            {resolvedShowSeparatorAfterStart && (
              <Separator orientation="vertical" className="h-full" />
            )}
          </div>
          {isPlainInputMode ? (
            <div className="relative flex h-full min-h-7 min-w-0 flex-1 items-center">
              <textarea
                ref={plainInputRef}
                inputMode={inputMode === "number" ? "decimal" : "text"}
                value={plainInputValue}
                onChange={(e) => {
                  handlePlainInputChange(e);
                  resizePlainTextarea();
                }}
                onKeyDown={handlePlainInputKeyDown}
                onFocus={() => setIsPlainInputFocused(true)}
                onBlur={handlePlainInputBlur}
                placeholder={placeholder}
                disabled={isReadOnly}
                rows={1}
                className={cn(
                  "flex-1 min-w-0 py-0 bg-transparent border-none outline-none text-foreground text-sm leading-7 placeholder:text-muted-foreground resize-none overflow-x-hidden overflow-y-auto font-[inherit] h-[100%]",
                )}
                style={{ maxHeight: "8rem" }}
                data-testid="formula-fx-plain-input"
              />
              {isPlainInputFocused &&
                !plainInputValue &&
                allowFormulaExpansion && (
                  <div className="pointer-events-none flex select-none items-center justify-end gap-1 whitespace-nowrap text-[11px] leading-relaxed text-muted-foreground/40">
                    Press{" "}
                    <kbd className="inline-flex size-[18px] items-center justify-center rounded border border-border/40 bg-muted/70 text-[10px] font-medium text-muted-foreground/70 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
                      /
                    </kbd>{" "}
                    to insert data
                  </div>
                )}
            </div>
          ) : (
            <div className="relative flex min-h-7 min-w-0 flex-1 items-center">
              <FormulaInput
                ref={contentEditableRef}
                placeholder={placeholder}
                isReadOnly={isReadOnly || inputMode === "dropdown"}
                isDropdownMode={inputMode === "dropdown"}
                wrapContent={wrapContent}
                onInputContentChanged={handleInputChange}
                onError={onError}
                onSearch={setSearchText}
                allFunctions={allFunctions}
                onFocus={() => {
                  storedCursorPositionRef.current = null;
                  if (!shouldShowPopper) {
                    openPopperWithPlacement();
                  }
                }}
                onBlur={(e) => {
                  setTimeout(() => {
                    const activeElement = document.activeElement;
                    const popperElement = document.getElementById("fx-popper");
                    const focusOnPopper = popperElement?.contains(activeElement);
                    const focusOnInput =
                      activeElement === contentEditableRef.current;

                    if (!focusOnPopper && !focusOnInput) {
                      storedCursorPositionRef.current = null;
                      hidePopper();
                    }
                  }, 0);
                }}
                onBlurToSearchBar={handleBlurToSearchBar}
                {...slotProps.content}
              />
            </div>
          )}
          <div className="flex items-center gap-1 self-center" {...slotProps.endAdornment}>
            {!isPlainInputMode && resolvedShowSeparatorBeforeEnd && (
              <Separator orientation="vertical" className="h-full" />
            )}
            {!isPlainInputMode && EndAdornment && (
              <EndAdornment {...endAdornmentProps} />
            )}
            {!isPlainInputMode && showAIFixInput && (
              <AIAssistTrigger
                value={aiFixInputValue}
                onChange={(val) => {
                  setAiFixInputValue(val);
                  if (aiError) setAiError(null);
                }}
                isLoading={isAiLoading}
                error={aiError}
                onSubmit={async (prompt) => {
                  if (!prompt.trim()) return;
                  setIsAiLoading(true);
                  setAiError(null);
                  try {
                    const response = await fetch("/api/ai-formula/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        prompt,
                        context: { availableVariables: allVariables },
                      }),
                    });
                    const data = await response.json();
                    if (data.success && data.formula && data.formula.trim()) {
                      const formulaBlocks = parseFormulaToBlocksUtil(data.formula, allVariables, allFunctions);
                      if (formulaBlocks.length > 0) {
                        if (contentEditableRef.current) {
                          contentEditableRef.current.setContent(formulaBlocks);
                        }
                        setCurrentContent(formulaBlocks);
                        lastValueStrRef.current = data.formula;
                        onInputContentChanged(formulaBlocks, data.formula);
                        setAiFixInputValue("");
                      } else {
                        setAiError("Could not parse generated formula");
                      }
                    } else {
                      setAiError(data.error || "Failed to generate formula");
                    }
                  } catch (error) {
                    console.error("AI formula generation failed:", error);
                    setAiError("Connection failed. Please try again.");
                  } finally {
                    setIsAiLoading(false);
                  }
                }}
                placeholder="Describe what you want..."
              />
            )}
            {!isPlainInputMode && resolvedShowSeparatorAfterEnd && (
              <Separator orientation="vertical" className="h-full" />
            )}
            {allowFormulaExpansion && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleFxToggle}
                      className={cn(
                        "h-7 min-h-[1.75rem] px-3 shrink-0 rounded-md transition-all duration-150 text-sm font-medium flex items-center justify-center",
                        isPlainInputMode
                          ? "border border-border bg-transparent text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/30"
                          : "border border-primary bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40",
                      )}
                      data-testid="formula-fx-toggle-button"
                    >
                      fx
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={6}>
                    {isPlainInputMode
                      ? "Switch to formula mode"
                      : "Switch to text mode"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {errorMessage && errorType === "default" && (
            <div
              className={cn(
                "text-sm font-normal flex items-center gap-1 ml-2 mt-1",
                messageSeverity === SEVERITY_LEVELS.WARNING
                  ? "text-amber-600"
                  : "text-destructive",
              )}
            >
              {errorMessage}
            </div>
          )}
          {errorType === "icon" && (
            <ErrorIcon
              errorMessage={errorMessage}
              hasError={hasError}
              messageSeverity={messageSeverity}
            />
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
            className={cn("z-[210]", "ag-custom-component-popup")}
            onClick={(e) => {
              // Refocus input when clicking inside popper (matches legacy behavior)
              const target = e.target;
              const isInteractive =
                target.tagName === "BUTTON" ||
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.closest('button, input, textarea, [role="button"], a');

              if (!isInteractive) {
                contentEditableRef.current?.focus();
              }
            }}
            onClose={hidePopper}
          >
            {popperContent}
          </Popper>
        )}
      </div>
    );
  },
);

// Use default shallow comparison - safer than incomplete custom comparator
// Parents should memoize callbacks with useCallback for optimal performance
export default React.memo(FormulaFX);
