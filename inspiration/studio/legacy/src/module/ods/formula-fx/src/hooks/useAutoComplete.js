import { useCallback } from "react";
import {
  getTextBeforeCursor,
  findFunctionMatch,
  isInsideFunctionBrackets,
  getSemicolonOperator,
  addBlock,
} from "../utils/fx-utils.jsx";

/**
 * Custom hook for handling auto-complete features in formula input
 * - Function auto-complete: Detects "sum(" and converts to function block
 * - Semicolon auto-convert: Converts ";" to semicolon operator block inside function brackets
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
   * Handles semicolon auto-convert when ";" key is pressed
   * Converts ";" to semicolon operator block if cursor is inside function brackets
   *
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {boolean} - True if auto-convert occurred, false otherwise
   */
  const handleSemicolonAutoComplete = useCallback(
    (e) => {
      if (!contentEditableRef?.current || !cursorPositionRef?.current) {
        return false;
      }

      const range = cursorPositionRef.current;
      const isInside = isInsideFunctionBrackets(
        contentEditableRef.current,
        range
      );

      if (isInside) {
        // Prevent default ";" insertion
        e.preventDefault();

        const semicolonOperator = getSemicolonOperator();

        if (semicolonOperator) {
          // Insert semicolon operator block (no searchText needed)
          addBlock(semicolonOperator, contentEditableRef.current, range, null);

          // Trigger callback if provided
          if (onBlockInserted) {
            onBlockInserted();
          }

          return true;
        }
      }

      return false;
    },
    [contentEditableRef, cursorPositionRef, onBlockInserted]
  );

  return {
    handleFunctionAutoComplete,
    handleSemicolonAutoComplete,
  };
};

export default useAutoComplete;
