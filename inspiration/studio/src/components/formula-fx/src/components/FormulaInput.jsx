import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  memo,
} from "react";
import { cn } from "@/lib/utils";
import {
  addBlock,
  extractContent,
  getRange,
  getEndRange,
  handleArrowKeys,
  handleBackspace,
  handleDelete,
  handleEnter,
  handleHomeEndKeys,
  insertContent,
  isDescendantOfFxPopper,
  isFocusOnSearchBar,
  removeNonPrintableChars,
  restoreSelection,
  saveSelection,
  scrollToEnd,
  updateBlock,
  clearAllErrors,
  parseFormulaString,
  updateNestingDepths,
} from "../utils/fx-utils.jsx";
import { validate } from "oute-services-fx-validator-sdk";
import useAutoComplete from "../hooks/useAutoComplete.js";

const FormulaInput = forwardRef(
  (
    {
      placeholder = "Your formula goes here",
      isReadOnly = false,
      isDropdownMode = false,
      wrapContent = false,
      onInputContentChanged = () => { },
      onError = () => { },
      onSearch = () => { },
      onFocus = () => { },
      onBlur = () => { },
      onBlurToSearchBar = () => { },
      allFunctions = [],
    },
    ref
  ) => {
    const contentEditableRef = useRef();
    const cursorPositionRef = useRef();
    const returnTypeRef = useRef();

    const updateCursorPosition = () => {
      const range = getRange();
      if (range) {
        cursorPositionRef.current = range.cloneRange();
      }
    };

    const handleContentBlur = (e) => {
      // Update cursor position before checking blur destination
      updateCursorPosition();

      // Check if focus went to search bar
      if (isFocusOnSearchBar(e)) {
        // Store cursor position for later use
        if (cursorPositionRef.current && onBlurToSearchBar) {
          onBlurToSearchBar(cursorPositionRef.current);
        }
        // Don't call onBlur since we're staying within the popper
        return;
      }

      const isDescendant = isDescendantOfFxPopper(e);
      if (!isDescendant && e.relatedTarget !== contentEditableRef?.current) {
        onBlur();
      }
    };

    const handleContentFocus = () => {
      if (isReadOnly && !isDropdownMode) return;
      onFocus();
    };

    const validateFxContent = (contentEditableRef, content) => {
      clearAllErrors(contentEditableRef, "VALIDATION_ERROR");
      try {
        const { return_type } = validate(content);
        returnTypeRef.current = return_type;
      } catch (error) {
        if ((error.index !== 0 && !error.index) || !error.message) {
          // SDK prints error to console
        } else {
          const updateErrorBlock = (idx, error) => {
            let errorBlockId;
            if (content[idx]?.type === "PRIMITIVES") {
              if (idx === content.length - 1) {
                content[idx] = {
                  ...content[idx - 1],
                  error: true,
                  errorMessage: error.message,
                  errorType: "VALIDATION_ERROR",
                };
                errorBlockId = content[idx].blockId;
              } else {
                content[idx + 1] = {
                  ...content[idx + 1],
                  error: true,
                  errorMessage: error.message,
                  errorType: "VALIDATION_ERROR",
                };
                errorBlockId = content[idx + 1].blockId;
              }
            } else {
              content[idx] = {
                ...content[idx],
                error: true,
                errorMessage: error.message,
                errorType: "VALIDATION_ERROR",
              };
              errorBlockId = content[idx].blockId;
            }
            // Update DOM immediately if block has an ID
            if (errorBlockId) {
              updateBlock(contentEditableRef, errorBlockId, {
                error: true,
                errorMessage: error.message,
                errorType: "VALIDATION_ERROR",
              });
            }
            onError(error);
          };
          if (Array.isArray(error.index)) {
            for (let i = 0; i < error.index.length; i++) {
              const idx = error.index[i];
              updateErrorBlock(idx, error);
            }
          } else {
            updateErrorBlock(error.index, error);
          }
        }
      }
    };

    const inputChangeHandler = useCallback(() => {
      const container = contentEditableRef.current;
      const savedRange = saveSelection(container);

      const content = extractContent(container);
      validateFxContent(contentEditableRef, content);
      if (savedRange) {
        restoreSelection(container, savedRange);
      }

      onInputContentChanged(
        content,
        removeNonPrintableChars(container?.textContent || ""),
        returnTypeRef?.current
      );

      requestAnimationFrame(() => {
        if (!container) return;
        const savedAfter = saveSelection(container);
        updateNestingDepths(container);
        if (savedAfter) {
          restoreSelection(container, savedAfter);
        }
      });
    }, [onInputContentChanged, onError]);

    // Initialize auto-complete hook
    const {
      handleFunctionAutoComplete,
      handleOpenParenAutoComplete,
      handleCloseParenAutoComplete,
      handleCommaAutoComplete,
    } =
      useAutoComplete({
        contentEditableRef,
        cursorPositionRef,
        allFunctions,
        onBlockInserted: inputChangeHandler,
      });

    const keydownHandler = (e) => {
      updateCursorPosition();

      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.stopPropagation();
        return;
      }

      // Auto-complete handlers (must run before other handlers)
      if (e.key === "(") {
        if (handleFunctionAutoComplete(e)) {
          inputChangeHandler();
          return;
        }
        if (handleOpenParenAutoComplete(e)) {
          inputChangeHandler();
          return;
        }
      }
      if (e.key === ")") {
        if (handleCloseParenAutoComplete(e)) {
          inputChangeHandler();
          return;
        }
      }
      if (e.key === ",") {
        if (handleCommaAutoComplete(e)) {
          inputChangeHandler();
          return;
        }
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        handleArrowKeys(e, cursorPositionRef);
        return;
      }
      if (e.key === "Enter") {
        handleEnter(e, cursorPositionRef, contentEditableRef.current);
        inputChangeHandler();
        return;
      }
      if (e.key === "Backspace") {
        handleBackspace(e, cursorPositionRef);
        inputChangeHandler();
        return;
      }
      if (e.key === "Delete") {
        handleDelete(e, cursorPositionRef);
        inputChangeHandler();
        return;
      }
      if (e.key === "Home" || e.key === "End") {
        handleHomeEndKeys(e, cursorPositionRef, contentEditableRef.current);
        return;
      }
    };

    const keyupHandler = (e) => {
      updateCursorPosition();
      const range = cursorPositionRef?.current;
      if (!range) return;

      const startNode = range.startContainer;
      let text = removeNonPrintableChars(
        startNode?.textContent?.substring(0, range.startOffset) || ""
      );
      let alphanumericMatch = text.match(/[a-zA-Z0-9]+$/);
      let nonAlphanumericMatch = text.match(/[^a-zA-Z0-9\s]+$/);
      if (nonAlphanumericMatch) {
        text = nonAlphanumericMatch[0];
      } else if (alphanumericMatch) {
        text = alphanumericMatch[0];
      }
      if (e.code === "Space" || e.key === "Backspace") {
        onSearch("");
      } else {
        onSearch(text.trim());
      }
    };

    const initialize = (content) => {
      insertContent(content, contentEditableRef.current);
      updateNestingDepths(contentEditableRef.current);
      const contentToValidate = extractContent(contentEditableRef.current);
      validateFxContent(contentEditableRef, contentToValidate);
    };

    useImperativeHandle(
      ref,
      () => ({
        addBlock: (block, searchText, storedRange = null) => {
          // Determine which range to use: storedRange > cursorPositionRef > end of content
          let rangeToUse = storedRange;

          // Validate stored range is still valid (check if it's still in the DOM and offsets are valid)
          if (rangeToUse) {
            try {
              const startContainer = rangeToUse.startContainer;
              const endContainer = rangeToUse.endContainer;

              // Check if containers are still in the document
              if (
                !contentEditableRef.current?.contains(startContainer) ||
                !contentEditableRef.current?.contains(endContainer)
              ) {
                // Stored range is invalid, discard it
                rangeToUse = null;
              } else {
                // Validate offsets are within valid range
                if (startContainer.nodeType === Node.TEXT_NODE) {
                  const maxOffset = startContainer.textContent?.length || 0;
                  if (
                    rangeToUse.startOffset < 0 ||
                    rangeToUse.startOffset > maxOffset
                  ) {
                    rangeToUse = null;
                  }
                }
                if (endContainer.nodeType === Node.TEXT_NODE) {
                  const maxOffset = endContainer.textContent?.length || 0;
                  if (
                    rangeToUse.endOffset < 0 ||
                    rangeToUse.endOffset > maxOffset
                  ) {
                    rangeToUse = null;
                  }
                }
              }
            } catch (e) {
              // Range is invalid (e.g., detached from DOM), discard it
              rangeToUse = null;
            }
          }

          if (!rangeToUse) {
            // Try to use current cursor position
            updateCursorPosition();
            rangeToUse = cursorPositionRef.current;
          }

          if (!rangeToUse) {
            // Fallback to end of content
            rangeToUse = getEndRange(contentEditableRef.current);
          }

          if (rangeToUse) {
            addBlock(block, contentEditableRef.current, rangeToUse, searchText);
            updateNestingDepths(contentEditableRef.current);
            inputChangeHandler();
          }
        },
        focus: (end) => {
          contentEditableRef.current?.focus();
          if (end) {
            scrollToEnd(contentEditableRef.current);
          }
        },
        insertRawFormula: (formulaText) => {
          if (!formulaText || !contentEditableRef.current) return;
          contentEditableRef.current.innerHTML = "";
          const parsedBlocks = parseFormulaString(formulaText, allFunctions);
          const blocks = parsedBlocks && parsedBlocks.length > 0
            ? parsedBlocks
            : [{ type: "PRIMITIVES", value: formulaText }];
          const range = getEndRange(contentEditableRef.current);
          if (range) {
            insertContent(blocks, contentEditableRef.current, range, { isInitialize: false });
            updateNestingDepths(contentEditableRef.current);
            inputChangeHandler();
          }
        },
        initContent: (content) => initialize(content),
        getContent: () => extractContent(contentEditableRef.current),
        getElement: () => contentEditableRef.current,
      }),
      [inputChangeHandler, allFunctions]
    );

    const handlePaste = (e) => {
      e.preventDefault();
      const plainText = e.clipboardData.getData("text/plain");
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textArray = plainText.split("\n");
      let inputContent = [];

      for (let i = 0; i < textArray.length; i++) {
        if (!textArray[i]) continue;

        if (i !== 0) {
          inputContent.push({ type: "BREAKLINE", value: "\n" });
        }

        // Try to parse as formula (only for single-line pastes or first line)
        const line = textArray[i].trim();
        if (line && (textArray.length === 1 || i === 0)) {
          const parsedBlocks = parseFormulaString(line, allFunctions);
          if (parsedBlocks && parsedBlocks.length > 0) {
            // Successfully parsed as formula - use the blocks
            inputContent.push(...parsedBlocks);
            continue;
          }
        }

        // Fall back to plain text
        inputContent.push({ type: "PRIMITIVES", value: textArray[i] });
      }

      insertContent(inputContent, contentEditableRef.current, range, {
        isInitialize: false,
      });
      inputChangeHandler();
    };

    return (
      <div className="w-full min-w-0">
        <div
          data-testid="formula-input"
          tabIndex={0}
          ref={contentEditableRef}
          contentEditable={!isReadOnly}
          className={cn(
            "w-full p-0 text-sm leading-7 text-foreground bg-transparent border-none outline-none overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-words text-left focus:outline-none max-h-[8rem] min-h-[1.75rem] font-[inherit]",
            "[&_[data-block]]:inline-flex [&_[data-block]]:items-center [&_[data-block]]:min-h-[1.75rem] [&_[data-block]]:h-7 [&_[data-block]]:py-0 [&_[data-block]]:px-2.5 [&_[data-block]]:mx-0.5 [&_[data-block]]:rounded-md [&_[data-block]]:text-sm [&_[data-block]]:font-medium [&_[data-block]]:leading-[1.5] [&_[data-block]]:align-middle [&_[data-block]]:bg-muted [&_[data-block]]:text-foreground [&_[data-block]]:border-0 [&_[data-block]]:shadow-none [&_[data-block]]:transition-colors",
            "[&_[data-block]:hover]:bg-muted/80",
            '[&_[data-block][data-error="true"]]:bg-destructive/10 [&_[data-block][data-error="true"]]:text-destructive',
            "[&_[data-block-type=NODE]]:border-0 [&_[data-block][data-variable=true]]:border-0",
            "[&_[data-block-type=FUNCTION]]:bg-primary/10 [&_[data-block-type=FUNCTION]]:text-primary [&_[data-block-type=FUNCTION]]:border-0",
            "[&_[data-block-type=FUNCTION]:hover]:bg-primary/20",
            "[&_[data-block-type=OPERATOR]]:bg-muted [&_[data-block-type=OPERATOR]]:text-muted-foreground [&_[data-block-type=OPERATOR]]:font-semibold [&_[data-block-type=OPERATOR]]:min-h-[1.75rem] [&_[data-block-type=OPERATOR]]:h-7 [&_[data-block-type=OPERATOR]]:py-0 [&_[data-block-type=OPERATOR]]:px-1.5 [&_[data-block-type=OPERATOR]]:min-w-[1.75rem] [&_[data-block-type=OPERATOR]]:justify-center [&_[data-block-type=OPERATOR]]:border-0 [&_[data-block-type=OPERATOR]]:shadow-none",
            wrapContent && "break-words",
            isReadOnly && !isDropdownMode && "cursor-default select-none",
            isDropdownMode && "cursor-pointer select-none [&:hover]:bg-muted/50"
          )}
          onBlur={isDropdownMode ? undefined : handleContentBlur}
          onFocus={handleContentFocus}
          placeholder={placeholder}
          onKeyDown={isDropdownMode ? undefined : keydownHandler}
          onKeyUp={isDropdownMode ? undefined : keyupHandler}
          onMouseUp={isDropdownMode ? undefined : () => setTimeout(updateCursorPosition, 100)}
          onInput={inputChangeHandler}
          onPaste={handlePaste}
        />
      </div>
    );
  }
);

export default memo(FormulaInput);
