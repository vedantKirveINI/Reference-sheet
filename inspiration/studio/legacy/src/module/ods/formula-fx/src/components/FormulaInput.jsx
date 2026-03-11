import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import classes from "./FormulaInput.module.css";
import {
  addBlock,
  extractContent,
  getRange,
  handleArrowKeys,
  handleBackspace,
  handleDelete,
  handleEnter,
  handleHomeEndKeys,
  insertContent,
  isDescendantOfFxPopper,
  removeNonPrintableChars,
  scrollToEnd,
  updateBlock,
  clearAllErrors,
} from "../utils/fx-utils.jsx";
import { validate } from "oute-services-fx-validator-sdk";
import useAutoComplete from "../hooks/useAutoComplete.js";

const FormulaInput = forwardRef(
  (
    {
      placeholder = "Your formula goes here",
      isReadOnly = false,
      onInputContentChanged = () => {},
      onError = () => {},
      onSearch = () => {},
      onFocus = () => {},
      onBlur = () => {},
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
      const isDescendant = isDescendantOfFxPopper(e);
      if (!isDescendant && e.relatedTarget !== contentEditableRef?.current) {
        onBlur();
      }
    };

    const handleContentFocus = () => {
      if (isReadOnly) return;
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
      let content = extractContent(contentEditableRef.current);

      // Validate content before calling parent callback
      validateFxContent(contentEditableRef, content);

      onInputContentChanged(
        content,
        removeNonPrintableChars(contentEditableRef.current?.textContent || ""),
        returnTypeRef?.current
      );
    }, [onInputContentChanged, onError]);

    // Initialize auto-complete hook
    const { handleFunctionAutoComplete, handleSemicolonAutoComplete } =
      useAutoComplete({
        contentEditableRef,
        cursorPositionRef,
        allFunctions,
        onBlockInserted: inputChangeHandler,
      });

    const keydownHandler = (e) => {
      updateCursorPosition();

      // Auto-complete handlers (must run before other handlers)
      if (e.key === "(") {
        if (handleFunctionAutoComplete(e)) {
          inputChangeHandler();
          return;
        }
      }
      if (e.key === ";") {
        if (handleSemicolonAutoComplete(e)) {
          inputChangeHandler();
          return;
        }
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        handleArrowKeys(e, cursorPositionRef);
        return;
      }
      if (e.key === "Enter") {
        handleEnter(e, cursorPositionRef);
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
      const contentToValidate = extractContent(contentEditableRef.current);
      validateFxContent(contentEditableRef, contentToValidate);
    };

    useImperativeHandle(
      ref,
      () => ({
        addBlock: (block, searchText) => {
          addBlock(
            block,
            contentEditableRef.current,
            cursorPositionRef.current,
            searchText
          );
          inputChangeHandler();
        },
        focus: (end) => {
          contentEditableRef.current?.focus();
          if (end) {
            scrollToEnd(contentEditableRef.current);
          }
        },
        initContent: (content) => initialize(content),
        getContent: () => extractContent(contentEditableRef.current),
      }),
      [inputChangeHandler]
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
        inputContent.push({ type: "PRIMITIVES", value: textArray[i] });
      }
      insertContent(inputContent, contentEditableRef.current, range, {
        isInitialize: false,
      });
      inputChangeHandler();
    };

    return (
      <div className={classes.wrapper}>
        <div
          data-testid="formula-input"
          tabIndex={0}
          ref={contentEditableRef}
          contentEditable={!isReadOnly}
          className={classes.input}
          onBlur={handleContentBlur}
          onFocus={handleContentFocus}
          placeholder={placeholder}
          onKeyDown={keydownHandler}
          onKeyUp={keyupHandler}
          onMouseUp={() => setTimeout(updateCursorPosition, 100)}
          onInput={inputChangeHandler}
          onPaste={handlePaste}
        />
      </div>
    );
  }
);

export default FormulaInput;
