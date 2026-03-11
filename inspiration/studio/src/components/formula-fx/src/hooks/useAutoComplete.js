import { useCallback } from "react";
import {
  getTextBeforeCursor,
  findFunctionMatch,
  detectCommaContext,
  getCommaOperator,
  getParenOperator,
  addBlock,
} from "../utils/fx-utils.jsx";

/**
 * Custom hook for handling auto-complete features in formula input
 * - Function auto-complete: Detects "sum(" and converts to function block
 * - Comma auto-convert: Converts "," to comma operator block only inside function calls
 *   (allows normal comma insertion in object literals {} and array literals [])
 *
 * @param {Object} params - Hook parameters
 * @param {React.RefObject} params.contentEditableRef - Reference to contentEditable element
 * @param {React.RefObject} params.cursorPositionRef - Reference to cursor position range
 * @param {Array} params.allFunctions - Array of available function objects
 * @param {Function} params.onBlockInserted - Callback when block is inserted
 * @returns {Object} - Object containing auto-complete handlers
 */
const useAutoComplete = ({
  contentEditableRef,
  cursorPositionRef,
  allFunctions = [],
  onBlockInserted,
}) => {
  /**
   * Handles function auto-complete when "(" key is pressed
   * Detects if text before cursor matches a function name
   * and replaces it (plus the "(" being typed) with a function block
   *
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {boolean} - True if auto-complete occurred, false otherwise
   */
  const handleFunctionAutoComplete = useCallback(
    (e) => {
      if (!contentEditableRef?.current || !cursorPositionRef?.current) {
        return false;
      }

      const range = cursorPositionRef.current;
      const textBeforeCursor = getTextBeforeCursor(
        contentEditableRef.current,
        range
      );

      const matchedFunction = findFunctionMatch(textBeforeCursor, allFunctions);

      if (matchedFunction) {
        // Prevent default "(" insertion
        e.preventDefault();

        // Calculate searchText (function name only, "(" will be inserted by the function block)
        const functionName = matchedFunction.value || matchedFunction.name;
        const searchText = functionName;

        // Insert function block, replacing the searchText
        // The function block will add the "(" automatically
        addBlock(
          matchedFunction,
          contentEditableRef.current,
          range,
          searchText
        );

        // Trigger callback if provided
        if (onBlockInserted) {
          onBlockInserted();
        }

        return true;
      }

      return false;
    },
    [contentEditableRef, cursorPositionRef, allFunctions, onBlockInserted]
  );

  /**
   * Inserts an opening parenthesis operator block when "(" is pressed and
   * no function auto-complete occurs.
   */
  const handleOpenParenAutoComplete = useCallback(
    (e) => {
      if (!contentEditableRef?.current || !cursorPositionRef?.current) {
        return false;
      }

      const range = cursorPositionRef.current;
      const openParen = getParenOperator("(");
      if (!openParen) return false;

      e.preventDefault();
      addBlock(openParen, contentEditableRef.current, range, null);
      if (onBlockInserted) onBlockInserted();
      return true;
    },
    [contentEditableRef, cursorPositionRef, onBlockInserted]
  );

  /**
   * Inserts a closing parenthesis operator block when ")" is pressed.
   */
  const handleCloseParenAutoComplete = useCallback(
    (e) => {
      if (!contentEditableRef?.current || !cursorPositionRef?.current) {
        return false;
      }

      const range = cursorPositionRef.current;
      const closeParen = getParenOperator(")");
      if (!closeParen) return false;

      e.preventDefault();
      addBlock(closeParen, contentEditableRef.current, range, null);
      if (onBlockInserted) onBlockInserted();
      return true;
    },
    [contentEditableRef, cursorPositionRef, onBlockInserted]
  );

  /**
   * Handles comma auto-convert when "," key is pressed
   * Converts "," to comma operator block only if cursor is inside function call brackets
   * Allows normal comma insertion for object literals {} and array literals []
   *
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {boolean} - True if auto-convert occurred, false otherwise
   */
  const handleCommaAutoComplete = useCallback(
    (e) => {
      if (!contentEditableRef?.current || !cursorPositionRef?.current) {
        return false;
      }

      const range = cursorPositionRef.current;
      const { isInside, context } = detectCommaContext(
        contentEditableRef.current,
        range,
        allFunctions
      );
      // Only convert comma to operator block if inside a function call
      // Allow normal comma insertion for object/array literals
      if (isInside && context === "function") {
        // Prevent default "," insertion
        e.preventDefault();

        const commaOperator = getCommaOperator();

        if (commaOperator) {
          // Insert comma operator block (no searchText needed)
          addBlock(commaOperator, contentEditableRef.current, range, null);

          // Trigger callback if provided
          if (onBlockInserted) {
            onBlockInserted();
          }

          return true;
        }
      }

      return false;
    },
    [contentEditableRef, cursorPositionRef, allFunctions, onBlockInserted]
  );

  return {
    handleFunctionAutoComplete,
    handleOpenParenAutoComplete,
    handleCloseParenAutoComplete,
    handleCommaAutoComplete,
  };
};

export default useAutoComplete;
