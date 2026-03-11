import React, {
  forwardRef,
  useCallback,
  // useEffect,
  useImperativeHandle,
  useRef,
  // useState,
} from "react";
import classes from "./ContentEditable.module.css";
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
  autoConvertOperator,
} from "../../utils/fx-utils";

const validate = (content) => {
  return { return_type: "unknown" };
};
// import debounce from "lodash/debounce";
const ContentEditable = forwardRef(
  (
    {
      // defaultInputContent,
      isReadOnly = true,
      wrapContent = false,
      placeholder,
      onEscape = () => {},
      onBlur = () => {},
      onFocus = () => {},
      onInput = () => {},
      onSearch = () => {},
      onError = () => {},
      onPopperKeyDown = () => false,
      ...others
    },
    ref
  ) => {
    const contentEditableRef = useRef();
    const cursorPositionRef = useRef();
    const returnTypeRef = useRef();

    // const initialized = useRef(false);
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
          // console.error(error); //since sdk is printing the error in console
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

      // Clear previous errors before validation
      validateFxContent(contentEditableRef, content);
      // insertContent(content, contentEditableRef.current);

      // const selection = window.getSelection();
      // if (!selection) return;

      // selection.removeAllRanges(); // Clear current selection
      // selection.addRange(cursorPositionRef.current);
      // setTimeout(() => {
      onInput(
        content,
        removeNonPrintableChars(contentEditableRef.current?.textContent || ""),
        returnTypeRef?.current
      );
      // }, 0);
    }, []);
    // const debouncedInputChangeHandler = debounce(inputChangeHandler, 500);
    const keydownHandler = (e) => {
      updateCursorPosition();
      
      if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Enter") {
        const handled = onPopperKeyDown(e);
        if (handled) {
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
      if (e.key === "Escape") {
        onEscape(e);
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
      
      if ([';', '(', ')', '[', ']'].includes(e.key)) {
        const converted = autoConvertOperator(
          e.key,
          contentEditableRef.current,
          cursorPositionRef.current
        );
        if (converted) {
          inputChangeHandler();
        }
      }
    };
    const initialize = (content) => {
      insertContent(content, contentEditableRef.current);
      const contentToValidate = extractContent(contentEditableRef.current);
      validateFxContent(contentEditableRef, contentToValidate);
      // inputChangeHandler(); //commneted due to issue in question setup - to check in depth but doesnt seem to be necessary
    };
    useImperativeHandle(
      ref,
      () => {
        return {
          addBlock: (block, searchText) => {
            addBlock(
              block,
              contentEditableRef.current,
              cursorPositionRef.current,
              searchText
            );
            inputChangeHandler();
          },
          getCursorPosition: () => cursorPositionRef.current,
          focus: (end) => {
            contentEditableRef.current.focus();
            if (end) {
              scrollToEnd(contentEditableRef.current);
            }
          },
          initContent: (content) => initialize(content),
          getContent: () => extractContent(contentEditableRef.current),
        };
      },
      [cursorPositionRef.current]
    );
    // useEffect(() => {
    //   if (!initialized.current) {
    //     initialized.current = true;
    //     initialize(defaultInputContent);
    //   }
    // }, [defaultInputContent]);
    return (
      <div
        className={`${classes["content-editable-wrapper"]} ${
          wrapContent ? classes["wrap-content"] : ""
        } ${isReadOnly ? classes["read-only"] : ""}`}
        {...others}
      >
        <div
          data-testid="content-editable"
          tabIndex={0}
          ref={contentEditableRef}
          contentEditable={!isReadOnly}
          className={`${classes["content-editable"]}`}
          onBlur={handleContentBlur}
          onFocus={handleContentFocus}
          placeholder={placeholder}
          onKeyDown={keydownHandler}
          onKeyUp={keyupHandler}
          onMouseUp={() =>
            setTimeout(() => {
              updateCursorPosition();
            }, 100)
          }
          onInput={inputChangeHandler}
          onPaste={(e) => {
            e.preventDefault();
            const plainText = e.clipboardData.getData("text/plain"); //code to ensure that only text is pasted
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
          }}
        />
      </div>
    );
  }
);

export default ContentEditable;
