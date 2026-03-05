import React from "react";
import ReactDOM from "react-dom/client";
import { base64Decode, base64Encode } from "../../../../module/ods/utils/src/index.jsx";
import DataBlock from "../components/data-block/DataBlock.jsx";
import { FUNCTIONS, OPERATORS, NODE_VARIABLES } from "../constants/types.js";
import { otherData } from "../data/other-data.js";
import cloneDeep from "lodash/cloneDeep";
import { FormulaParser } from "../engines/index.js";
import { generateUUID } from "@/lib/utils";

const uuid = () => {
  return generateUUID();
};

/**
 * Capitalize first letter of a string (e.g. "concatenate" -> "Concatenate").
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (str == null || typeof str !== "string" || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const scrollToCursor = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);

    // Create a temporary span at the cursor's position
    const tempSpan = document.createElement("span");
    range.insertNode(tempSpan);
    range.setStartAfter(tempSpan);
    range.collapse(true);

    // Scroll to the temporary span
    tempSpan.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });

    // Remove the temporary span and restore the cursor position
    tempSpan.remove();
  }
};
export const scrollToEnd = (element) => {
  const range = document.createRange();

  // Set the range to the end of the contenteditable div
  range.selectNodeContents(element);
  range.collapse(false); // Collapse the range to the end

  // Get the selection object and set the range as its only selection
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  setTimeout(() => scrollToCursor(), 0);
};

/**
 * Gets a range at the end of the contentEditable element
 * Used as fallback when cursor position is not available
 * @param {HTMLElement} el - The contentEditable element
 * @returns {Range} - Range positioned at the end of the element
 */
export const getEndRange = (el) => {
  if (!el) return null;
  const range = document.createRange();

  // Get the last child node
  const lastChild = el.lastChild;

  if (!lastChild) {
    // Empty element, set range at start
    range.setStart(el, 0);
    range.setEnd(el, 0);
    return range;
  }

  if (lastChild.nodeType === Node.TEXT_NODE) {
    // Last child is text node, set range at end of text
    range.setStart(lastChild, lastChild.textContent.length);
    range.setEnd(lastChild, lastChild.textContent.length);
  } else if (lastChild.nodeType === Node.ELEMENT_NODE) {
    // Last child is element, set range after it
    range.setStartAfter(lastChild);
    range.setEndAfter(lastChild);
  } else {
    // Fallback: set range at end of element
    range.selectNodeContents(el);
    range.collapse(false);
  }

  return range;
};

/**
 * Converts a Range from contentEditable to a character offset in plain text
 * @param {HTMLElement} container - The contentEditable element
 * @param {Range} range - The range to convert
 * @returns {number} - Character offset in plain text, or -1 if invalid
 */
export const getCharacterOffsetFromRange = (container, range) => {
  if (!container || !range) {
    return -1;
  }

  try {
    // Create a range from start of container to cursor position
    const startRange = document.createRange();
    startRange.selectNodeContents(container);
    startRange.setEnd(range.startContainer, range.startOffset);

    // Get text content length (this gives us the character offset)
    const textContent = startRange.toString();
    return textContent.length;
  } catch {
    return -1;
  }
};

// Normalize all Unicode Space_Separator (Zs) chars to U+0020 so they are preserved, not stripped
const UNICODE_ZS_REGEX = /\p{Zs}/gu;

export const removeNonPrintableChars = (str) => {
  if (str == null || typeof str !== "string") return "";
  const normalized = str.replace(UNICODE_ZS_REGEX, " ");
  const result = normalized
    .split("")
    .map((char) =>
      char.charCodeAt(0) > 31 && char.charCodeAt(0) < 128 ? char : ""
    )
    .join("");
  return result;
};
export const isDescendantOfFxPopper = (e) => {
  return !!e?.relatedTarget?.closest("#fx-popper");
};

/**
 * Checks if the blur event's relatedTarget is the search bar input
 * @param {FocusEvent} e - The blur event
 * @returns {boolean} - True if focus went to search bar
 */
export const isFocusOnSearchBar = (e) => {
  const relatedTarget = e?.relatedTarget;
  if (!relatedTarget) return false;
  // Check if relatedTarget is an input inside #fx-popper
  const popper = relatedTarget.closest("#fx-popper");
  if (!popper) return false;
  // Check if it's the search input (INPUT element inside popper)
  // The search bar is in LeftPanel which contains an Input component
  return (
    relatedTarget.tagName === "INPUT" &&
    popper.contains(relatedTarget)
  );
};
export const getRange = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  const range = selection.getRangeAt(0);
  return range;
};

/**
 *
 * @param {Range} range
 * @param {HTMLElement} node
 * @returns
 */
export const updateRange = (range, node) => {
  const selection = window.getSelection();
  if (!range) {
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    } else {
      range = document.createRange();
    }
  }
  if (node) {
    range.selectNodeContents(node);
    range.setStartAfter(node);
    range.setEndAfter(node);
  }
  selection.removeAllRanges();
  selection.addRange(range);
  return range;
};

const handleSpanClick = (e) => {
  const span = e.target;
  const rect = span.getBoundingClientRect();
  const clickX = e.clientX - rect.left;

  const paddingLeft = Number.parseFloat(getComputedStyle(span).paddingLeft);
  const paddingRight = Number.parseFloat(getComputedStyle(span).paddingRight);

  if (clickX < paddingLeft) {
    // Click on the left padding, focus the previous sibling
    const prevSibling = span.previousSibling;
    if (prevSibling) {
      updateRange(null, prevSibling);
    } else {
      const parentDiv = span.parentNode;
      const range = document.createRange();
      range.setStart(parentDiv, 0);
      range.setEnd(parentDiv, 0);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } else if (clickX > rect.width - paddingRight) {
    // Click on the right padding, focus the next sibling
    updateRange(null, span);
  } else {
    // Click on the span content, update the range
    updateRange(null, span);
  }
};
export const createDataBlock = (block) => {
  let blockCopy = cloneDeep(block);
  const blockId = blockCopy.blockId || uuid();
  blockCopy.blockId = blockId;
  if (
    blockCopy?.subCategory === FUNCTIONS ||
    blockCopy?.type === FUNCTIONS //old fx data
  ) {
    if (blockCopy.displayValue) {
      blockCopy.displayValue = blockCopy.displayValue.replace(/\($/, "");
    }
    blockCopy.value = (blockCopy.value || "").replace(/\($/, "");
  }
  const span = document.createElement("span");
  span.setAttribute("data-block", base64Encode(JSON.stringify(blockCopy)));
  span.setAttribute("data-block-id", blockId);

  const blockType = blockCopy.subCategory || blockCopy.type;
  const isPunctuation = blockType === OPERATORS && [",", "(", ")"].includes(blockCopy.value);

  if (isPunctuation) {
    span.setAttribute("data-block-type", "OPERATOR");
    span.style.padding = "0";
    span.style.margin = "0";
    span.style.display = "inline";
    span.style.verticalAlign = "baseline";
  } else {
    span.style.padding = "0";
    span.style.display = "inline-block";
    if (blockType === FUNCTIONS) {
      span.setAttribute("data-block-type", "FUNCTION");
    } else if (blockType === OPERATORS) {
      span.setAttribute("data-block-type", "OPERATOR");
      span.style.textAlign = "center";
    } else if (blockCopy.nodeId || blockCopy.variableData) {
      span.setAttribute("data-block-type", "NODE");
    }
  }

  // span.draggable = true;
  span.contentEditable = false;
  span.onclick = handleSpanClick;
  const root = ReactDOM.createRoot(span);
  span._reactRoot = root;

  root.render(
    <DataBlock
      block={blockCopy}
      onClick={() => {
        updateRange(null, span);
      }}
    />
  );
  return span;
};

export const createTextNode = (text = "") => {
  return document.createTextNode(text);
};
/**
 *
 * @param {*} block
 * @param {HTMLElement} el
 * @param {Range} range
 */
export const insertDataBlock = (
  block,
  el,
  range,
  config = { isInitialize: false }
) => {
  const node = createDataBlock(block);
  if (range) {
    range.insertNode(node);
    range.collapse(false);
  } else {
    el.appendChild(node);
  }
  if (!config.isInitialize) {
    updateRange(range, node);
    setTimeout(() => {
      scrollToCursor();
    }, 0);
  }
};

export const insertFunctionalDataBlock = (
  block,
  el,
  range,
  config = { isInitialize: false, skipCommas: false }
) => {
  const node = createDataBlock(block);
  const openParenOp = otherData.OPERATORS.find((o) => o.value === "(");
  if (!openParenOp) return;
  const openParen = createDataBlock(openParenOp);
  if (range) {
    range.insertNode(node);
    range.collapse(false);
    range.insertNode(openParen);
    range.collapse(false);
    if (!config.isInitialize && !config.skipCommas && block.args?.length > 0) {
      block.args.forEach((arg, index) => {
        if (index < block.args.length - 1) {
          range.insertNode(
            createDataBlock(otherData.OPERATORS.find((o) => o.value === ","))
          );
          range.collapse(false);
        }
      });
    }
    if (!config.isInitialize)
      range.insertNode(
        createDataBlock(otherData.OPERATORS.find((o) => o.value === ")"))
      );
    range.collapse(false);
    range.setStartAfter(openParen);
    range.setEndAfter(openParen);
  } else {
    el.appendChild(node);
    el.appendChild(openParen);
    if (!config.isInitialize && !config.skipCommas && block.args?.length > 0) {
      block.args.forEach((arg, index) => {
        if (index < block.args.length - 1) {
          el.appendChild(
            createDataBlock(otherData.OPERATORS.find((o) => o.value === ","))
          );
        }
      });
    }
    if (!config.isInitialize)
      el.appendChild(
        createDataBlock(otherData.OPERATORS.find((o) => o.value === ")"))
      );
  }
  if (!config.isInitialize) {
    updateRange(range, openParen);
    setTimeout(() => {
      scrollToCursor();
    }, 0);
  }
};

export const insertTextNode = (text, el, range) => {
  const textNode = createTextNode(text);
  if (range) {
    if (range.startContainer.nodeType === Node.TEXT_NODE) {
      const currentTextNode = range.startContainer;
      const offset = range.startOffset;

      // Insert text at the current position within the text node
      currentTextNode.insertData(offset, text);

      // Move the range to the end of the inserted text
      range.setStart(currentTextNode, offset + text.length);
    } else {
      range.insertNode(textNode);
    }
    range.collapse(false);
  } else {
    el.appendChild(textNode);
  }
};

// Helper to insert a generic node at range or append to element
export const insertNodeHelper = (node, el, range) => {
  if (range) {
    range.insertNode(node);
    range.collapse(false);
  } else {
    el.appendChild(node);
  }
};
export const addBlock = (block, el, range, searchText) => {
  // Validate range before using it
  if (!range) {
    return;
  }

  // Validate range is still valid
  try {
    // Check if range containers are valid
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    // Check if containers are in the DOM
    if (!el.contains(startContainer) || !el.contains(endContainer)) {
      return;
    }

    // Validate offsets are within valid range
    if (startContainer.nodeType === Node.TEXT_NODE) {
      const maxOffset = startContainer.textContent?.length || 0;
      if (range.startOffset < 0 || range.startOffset > maxOffset) {
        return;
      }
    }
    if (endContainer.nodeType === Node.TEXT_NODE) {
      const maxOffset = endContainer.textContent?.length || 0;
      if (range.endOffset < 0 || range.endOffset > maxOffset) {
        return;
      }
    }
  } catch (e) {
    return;
  }

  if (searchText) {
    const startContainer = range.startContainer;

    // Only try to find and delete searchText if the container is a text node
    if (startContainer.nodeType === Node.TEXT_NODE) {
      const searchIndex = startContainer.textContent.indexOf(
        searchText,
        Math.max(0, range.startOffset - searchText.length)
      );

      // If searchText is found, delete it before inserting the block
      if (searchIndex !== -1) {
        const startOffset = searchIndex;
        const endOffset = searchIndex + searchText.length;

        // Validate offsets before setting
        const maxOffset = startContainer.textContent?.length || 0;
        if (startOffset >= 0 && startOffset <= maxOffset &&
          endOffset >= 0 && endOffset <= maxOffset &&
          endOffset <= maxOffset) {
          try {
            range.setStart(startContainer, startOffset);
            range.setEnd(startContainer, endOffset);
            range.deleteContents();
          } catch (e) {
            // If setting range fails, just continue without deleting searchText
          }
        }
      }
      // If searchText is not found, just insert at current position (don't delete anything)
    }
  }
  if (block.subCategory === FUNCTIONS) {
    insertFunctionalDataBlock(block, el, range);
    return;
  }
  insertDataBlock(block, el, range);
};

/**
 *
 * @param {HTMLElement} el
 * @returns
 */
export const extractContent = (el) => {
  let inputContent = [];
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.includes("\n")) {
        const parts = node.textContent.split("\n");

        // Iterate through each part
        for (let i = 0; i < parts.length; i++) {
          // If the part is not empty, push it as PRIMITIVES
          if (parts[i] !== "") {
            if (inputContent[inputContent.length - 1]?.type === "PRIMITIVES") {
              inputContent[inputContent.length - 1].value += parts[i];
            } else {
              inputContent.push({ type: "PRIMITIVES", value: parts[i] });
            }
          }

          // If it's not the last part, push the BREAKLINE
          if (i < parts.length - 1) {
            inputContent.push({ type: "BREAKLINE", value: "\n" });
          }
        }
      } else {
        //TODO: handle tabspace
        const text = removeNonPrintableChars(node.textContent);
        if (text?.length > 0) {
          if (inputContent[inputContent.length - 1]?.type === "PRIMITIVES") {
            inputContent[inputContent.length - 1].value += text;
          } else {
            inputContent.push({ type: "PRIMITIVES", value: text });
          }
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === "BR") {
        inputContent.push({ type: "BREAKLINE", value: "\n" });
      } else if (node.tagName === "SPAN") {
        const content = JSON.parse(
          base64Decode(node.getAttribute("data-block"))
        );
        let value = content.value;
        inputContent.push({
          ...content,
          value,
          type: content.type || content.subCategory,
          subType: content.subType || value,
        });
      }
    }
  });
  return inputContent;
};

export const insertContent = (
  content,
  el,
  range,
  config = { isInitialize: true }
) => {
  if (config.isInitialize) {
    el.innerHTML = "";
  }
  // CRITICAL FIX: When isInitialize is true, skip the opening parenthesis block in the array
  // because insertFunctionalDataBlock already inserts it into the DOM automatically.
  // We need to skip it to avoid inserting it twice, but we can't mutate the array during iteration.
  // So we track which index to skip and skip it during processing.
  let skipNextIndex = -1;
  content?.forEach((block, index) => {
    // Skip the opening parenthesis if it was already inserted by insertFunctionalDataBlock
    if (index === skipNextIndex) {
      return;
    }

    if (block.type === "PRIMITIVES") {
      insertTextNode(block.value, el, range);
    } else if (block.type === "BREAKLINE") {
      const br = document.createElement("br");
      insertNodeHelper(br, el, range);
      insertTextNode("\u200b", el, range);
    } else if (block.type === "TABSPACE") {
      insertTextNode("\t", el, range);
    } else if (block.type === "FUNCTIONS") {
      // Check if the following blocks already contain commas (parsed content)
      // If so, skip adding commas in insertFunctionalDataBlock to avoid duplicates
      const hasCommasInBlocks = content
        .slice(index + 1)
        .some(
          (b) =>
            (b.type === "OPERATORS" && (b.value === "," || b.subType === ",")) ||
            (b.subCategory === "OPERATORS" && (b.value === "," || b.subType === ","))
        );

      insertFunctionalDataBlock(block, el, range, {
        isInitialize: config.isInitialize,
        skipCommas: hasCommasInBlocks, // Skip commas if they're already in the blocks
      });
      // If the next block is an opening parenthesis and we're initializing,
      // mark it to be skipped since insertFunctionalDataBlock already inserted it
      // Note: We don't skip the closing parenthesis when isInitialize is true because
      // insertFunctionalDataBlock doesn't add it in that case, so we need it from the blocks
      if (
        config.isInitialize &&
        (content[index + 1]?.value === "(" ||
          content[index + 1]?.subType === "(") //old fx data
      ) {
        skipNextIndex = index + 1;
      }
      // During user input, remove it from the array to prevent duplicates
      else if (
        !config.isInitialize &&
        (content[index + 1]?.value === "(" ||
          content[index + 1]?.subType === "(") //old fx data
      ) {
        content.splice(index + 1, 1);
        // After removing opening parenthesis, find and remove the closing parenthesis
        // since insertFunctionalDataBlock already adds it when isInitialize is false
        for (let i = index + 1; i < content.length; i++) {
          if (
            content[i]?.value === ")" ||
            content[i]?.subType === ")" ||
            (content[i]?.type === "OPERATORS" && content[i]?.value === ")")
          ) {
            content.splice(i, 1);
            break;
          }
        }
      }
    } else {
      insertDataBlock(block, el, range, config);
    }
  });
};

const handleBackspaceText = (container, offset, range) => {
  if (offset === 0) {
    const previousSibling = container.previousSibling;
    if (!previousSibling) return;

    if (previousSibling.nodeType === Node.ELEMENT_NODE) {
      // Remove the element node
      previousSibling.remove();
      // Move caret   to the end of the current container
      range.setStart(container, 0);
      range.collapse(true);
    } else {
      // Handle the previous text node recursively
      handleBackspaceText(previousSibling, previousSibling.length, range);
    }
  } else {
    let newoffset = offset - 1;

    if (container.nodeValue.charAt(newoffset) === "\u200b") {
      newoffset = newoffset - 1;
      container.nodeValue =
        container.nodeValue.slice(0, newoffset) +
        container.nodeValue.slice(offset);
    } else {
      container.nodeValue =
        container.nodeValue.slice(0, newoffset) +
        container.nodeValue.slice(offset);
    }

    if (newoffset < 0) {
      const previousSibling = container.previousSibling;
      if (previousSibling) {
        if (previousSibling.nodeType === Node.ELEMENT_NODE) {
          previousSibling.remove();
          range.setStart(container, 0);
          range.collapse(true);
        } else {
          handleBackspaceText(previousSibling, previousSibling.length, range);
        }
      }
    } else if (newoffset === 0) {
      // Create a text node with zero-width space and add it to the container
      const zeroWidthSpaceNode = document.createTextNode("\u200b");
      container.parentNode.insertBefore(zeroWidthSpaceNode, container);
      // Set the cursor after the zero-width space
      range.setStart(zeroWidthSpaceNode, 1);
      range.collapse(true);
    } else {
      // Update the caret position
      range.setStart(container, newoffset);
      range.collapse(true);
    }
  }
};
export const handleBackspace = (e, cursorPositionRef) => {
  e.preventDefault();
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = cursorPositionRef.current;
  const { startContainer, startOffset, endOffset, endContainer } = range;
  if (startContainer !== endContainer || startOffset !== endOffset) {
    range.deleteContents();
    return;
  }
  let processNode = null;
  if (startContainer.nodeType == Node.ELEMENT_NODE) {
    processNode = startContainer.childNodes[startOffset - 1];
    if (!processNode) return;
    if (processNode.nodeType == Node.ELEMENT_NODE) {
      processNode.remove();
      // Set caret position
      range.setStart(startContainer, startOffset - 1);
      range.collapse(true);
    } else {
      handleBackspaceText(processNode, processNode.length, range);
    }
  } else {
    handleBackspaceText(startContainer, startOffset, range);
  }
  // Update the selection
  selection.removeAllRanges();
  selection.addRange(range);
};

export const isRangeValid = (range, container) => {
  if (!range || !container) return false;
  try {
    const { startContainer, endContainer } = range;
    return container.contains(startContainer) && container.contains(endContainer);
  } catch {
    return false;
  }
};

/**
 * Save the current selection range if it is inside the given container.
 * Used to restore caret after DOM mutations (e.g. updateNestingDepths).
 * @param {HTMLElement} container - The contenteditable or parent element
 * @returns {Range|null} - Cloned range or null
 */
export const saveSelection = (container) => {
  if (!container) return null;
  const range = getRange();
  if (!range || !isRangeValid(range, container)) return null;
  try {
    return range.cloneRange();
  } catch {
    return null;
  }
};

/**
 * Restore a previously saved selection if it is still valid inside the container.
 * @param {HTMLElement} container - The contenteditable or parent element
 * @param {Range|null} savedRange - The range to restore
 * @returns {boolean} - True if restored
 */
export const restoreSelection = (container, savedRange) => {
  if (!container || !savedRange || !isRangeValid(savedRange, container)) return false;
  try {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
    return true;
  } catch {
    return false;
  }
};

export const handleEnter = (e, cursorPositionRef, editableDiv) => {
  e.preventDefault();
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  // Get range from ref, or fallback to current selection
  let range = cursorPositionRef.current;
  if (!isRangeValid(range, editableDiv)) {
    range = selection.getRangeAt(0);
  }
  if (!isRangeValid(range, editableDiv) && editableDiv) {
    // As a last resort, place cursor at the end of the content
    range = getEndRange(editableDiv);
  }
  if (!range) return;

  // Insert a breakline using <br> plus a zero-width space for cursor placement
  const br = document.createElement("br");
  range.insertNode(br);

  // Zero-width space to ensure caret can sit after the new line
  const zeroWidth = document.createTextNode("\u200b");
  br.parentNode.insertBefore(zeroWidth, br.nextSibling);

  range.setStartAfter(zeroWidth);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);
  // Keep cursor ref in sync with latest position
  cursorPositionRef.current = range.cloneRange();

  // Scroll to cursor position after DOM updates
  requestAnimationFrame(() => scrollToCursor());
};

export const handleArrowKeys = (e, cursorPositionRef) => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  if (e.shiftKey || e.metaKey || e.altKey || e.ctrlKey) return;
  const traverseTextNode = (node, offset, key, range) => {
    if (key === "ArrowLeft") {
      if (offset === 0) {
        const previousSibling = node.previousSibling;
        if (!previousSibling) return;
        if (previousSibling.nodeType === Node.TEXT_NODE) {
          traverseTextNode(
            previousSibling,
            previousSibling.length,
            e.key,
            range
          );
        }
      } else {
        if (node.nodeValue[offset - 1] === "\u200b") {
          traverseTextNode(node, offset - 1, e.key, range);
        } else {
          e.preventDefault();
          //set the cursor at offset - 1
          range.setStart(node, offset - 1);
          range.collapse(true);
        }
      }
    } else if (key === "ArrowRight") {
      if (offset === node.nodeValue.length) {
        const nextSibling = node.nextSibling;
        if (!nextSibling) return;
        if (nextSibling.nodeType === Node.TEXT_NODE) {
          traverseTextNode(nextSibling, 0, e.key, range);
        } else {
          e.preventDefault();
          range.setStartAfter(nextSibling);
          range.collapse(true);
          return;
        }
      } else {
        if (node.nodeValue[offset] === "\u200b") {
          traverseTextNode(node, offset + 1, e.key, range);
        } else {
          e.preventDefault();
          //set the cursor at offset + 1
          range.setStart(node, offset + 1);
          range.collapse(true);
        }
      }
    }
  };

  const range = cursorPositionRef.current;
  const { startContainer, startOffset, endOffset, endContainer } = range;
  if (startContainer !== endContainer || startOffset !== endOffset) {
    // if key is ArrowLeft place the cursor at startOffset
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      range.setStart(startContainer, startOffset);
      range.collapse(true); // Collapse to the start
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    //if key is ArrowRight place the cursor at endOffset
    if (e.key === "ArrowRight") {
      e.preventDefault();
      // Collapse the selection to the end
      range.setEnd(endContainer, endOffset);
      range.collapse(false); // Collapse to the end
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
  }

  if (startContainer.nodeType === Node.TEXT_NODE) {
    traverseTextNode(startContainer, startOffset, e.key, range);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    const previousSibling = startContainer.childNodes[startOffset - 1];
    if (!previousSibling) return;
    if (previousSibling.nodeType === Node.TEXT_NODE) {
      traverseTextNode(previousSibling, previousSibling.length, e.key, range);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
};

const handleDeleteText = (container, offset, range) => {
  if (offset >= container.length) {
    const nextSibling = container.nextSibling;
    if (!nextSibling) return;

    if (nextSibling.nodeType === Node.ELEMENT_NODE) {
      // Remove the element node
      nextSibling.remove();
      // Move caret to the end of the current container
      range.setStart(container, container.length);
      range.collapse(true);
    } else {
      // Handle the next text node recursively
      handleDeleteText(nextSibling, 0, range);
    }
  } else {
    const newoffset = offset;

    if (container.nodeValue.charAt(newoffset) === "\u200b") {
      container.nodeValue =
        container.nodeValue.slice(0, newoffset) +
        container.nodeValue.slice(newoffset + 1);
    } else {
      container.nodeValue =
        container.nodeValue.slice(0, newoffset) +
        container.nodeValue.slice(newoffset + 1);
    }

    if (container.nodeValue.length === 0) {
      // Create a text node with zero-width space and replace the empty container
      const zeroWidthSpaceNode = document.createTextNode("\u200b");
      container.parentNode.replaceChild(zeroWidthSpaceNode, container);
      // Set the cursor after the zero-width space
      range.setStart(zeroWidthSpaceNode, 1);
      range.collapse(true);
    } else {
      // Update the caret position
      range.setStart(container, newoffset);
      range.collapse(true);
    }
  }
};

export const handleDelete = (e, cursorPositionRef) => {
  e.preventDefault();
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = cursorPositionRef.current;
  const { startContainer, startOffset, endOffset, endContainer } = range;
  if (startContainer !== endContainer || startOffset !== endOffset) {
    range.deleteContents();
    return;
  }

  let processNode = null;
  if (startContainer.nodeType == Node.ELEMENT_NODE) {
    processNode = startContainer.childNodes[startOffset];
    if (!processNode) return;
    if (processNode.nodeType == Node.ELEMENT_NODE) {
      processNode.remove();
      // Set caret position
      range.setStart(startContainer, startOffset);
      range.collapse(true);
    } else {
      handleDeleteText(processNode, 0, range);
    }
  } else {
    handleDeleteText(startContainer, startOffset, range);
  }
  // Update the selection
  selection.removeAllRanges();
  selection.addRange(range);
};

export const handleHomeEndKeys = (e, cursorPositionRef, editableDiv) => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = cursorPositionRef.current;
  const { startContainer, startOffset } = range;

  const findLineBreak = (direction, container) => {
    if (!container) return {};
    if (container.nodeType === Node.TEXT_NODE) {
      if (direction === "previous") {
        if (container.nodeValue === "\n") {
          return {
            node: container,
            offset: 1,
          };
        } else {
          return findLineBreak("previous", container.previousSibling);
        }
      } else {
        if (container.nodeValue === "\n") {
          return {
            node: container,
            offset: container.nodeValue.length - 1,
          };
        } else {
          return findLineBreak("next", container.nextSibling);
        }
      }
    } else if (container.nodeType === Node.ELEMENT_NODE) {
      if (direction === "previous") {
        const previousSibling = container.previousSibling;
        if (previousSibling) {
          return findLineBreak("previous", previousSibling);
        } else {
          return {
            node: container,
            offset: 0,
          };
        }
      } else {
        const nextSibling = container.nextSibling;
        if (nextSibling) {
          return findLineBreak("next", nextSibling);
        } else {
          return {
            node: container,
            offset: container.childNodes.length,
          };
        }
      }
    }
  };
  // Handle Home and End keys
  if (e.ctrlKey) {
    e.preventDefault();
    range.selectNodeContents(editableDiv);
    range.collapse(e.key === "Home");
  } else if (e.key === "Home") {
    e.preventDefault();
    let container = null;
    if (startContainer === editableDiv) {
      container = startContainer.childNodes[startOffset - 1];
    } else {
      container = startContainer.previousSibling;
    }
    const { node = editableDiv, offset = 0 } = findLineBreak(
      "previous",
      container
    );
    range.setStart(node, offset);
    range.collapse(true);
  } else if (e.key === "End") {
    e.preventDefault();
    let container = null;
    if (startContainer === editableDiv) {
      container = startContainer.childNodes[startOffset];
    } else {
      container = startContainer.nextSibling;
    }
    const { node = editableDiv, offset = editableDiv.childNodes.length } =
      findLineBreak("next", container);
    range.setStart(node, offset);
    range.collapse(true);
  }
  // Apply the new range and update the selection
  selection.removeAllRanges();
  selection.addRange(range);
};

/**
 * Normalizes node variables from canvas/API (data.schema.schema or go_data.schema / schema)
 * into the shape expected by SchemaList.
 */
export const processNodeVariablesForSchemaList = (nodeVariables) => {
  const list = nodeVariables ?? [];
  return list
    .map((node) => {
      const firstSchema = node.data?.schema?.schema?.[0];
      const goDataSchema = node.go_data?.schema ?? node.schema;

      // Shape 1: formula-fx / ODS shape (node.data.schema.schema[0])
      if (firstSchema) {
        if (firstSchema?.schema?.length === 1) {
          return {
            ...firstSchema.schema[0],
            background: node.light || node.background,
            foreground: node.foreground,
            name: node.name,
            description: node.description,
            type: firstSchema.schema[0]?.type || node.type,
            key: firstSchema.schema[0].key,
            nodeId: node.key,
            module: node.module,
            nodeType: node.type,
            nodeNumber: node.nodeNumber,
          };
        }
        return {
          ...firstSchema,
          background: node.light || node.background,
          foreground: node.foreground,
          name: node.name,
          description: node.description,
          type: firstSchema?.type || node.type,
          key: node.key,
          nodeId: node.key,
          module: node.module,
          nodeType: node.type,
          nodeNumber: node.nodeNumber,
        };
      }

      // Shape 2: canvas/API shape (node.go_data.schema or node.schema array)
      if (Array.isArray(goDataSchema) || node.key != null) {
        const schema = Array.isArray(goDataSchema) ? goDataSchema : [];
        return {
          key: node.key,
          nodeId: node.key,
          name: node.name,
          description: node.description,
          type: node.type,
          schema,
          module: node.module,
          nodeType: node.type,
          nodeNumber: node.nodeNumber,
          background: node.light || node.background,
          foreground: node.foreground,
        };
      }

      return null;
    })
    .filter(Boolean);
};

/**
 * Returns true if pathA is equal to pathB or pathA is a prefix of pathB (pathA.length <= pathB and pathB starts with pathA).
 * Empty path matches only empty path; empty is not treated as prefix of every path.
 */
function pathMatchesOrIsPrefix(pathA, pathB) {
  if (!Array.isArray(pathA) || !Array.isArray(pathB)) return false;
  if (pathA.length === 0) return pathB.length === 0;
  if (pathA.length > pathB.length) return false;
  return pathA.every((seg, i) => seg === pathB[i]);
}

/**
 * Returns true if fullPath should be kept (exact match or prefix of some path in pathsToKeep).
 */
function shouldKeepPath(fullPath, pathsToKeep) {
  if (!Array.isArray(fullPath) || !pathsToKeep?.length) return false;
  return pathsToKeep.some((p,) => {
    return pathMatchesOrIsPrefix(fullPath, p) || pathMatchesOrIsPrefix(p, fullPath)
  });
}

/**
 * Recursively prune a node's schema so only branches that appear in pathsToKeep (or are ancestors of them) remain.
 * parentFullPath: path from root to this node (array of segments).
 * pathsToKeep: array of path arrays (from variableData.path of matched blocks).
 * Returns cloned node with schema pruned; does not mutate original.
 */
function pruneSchemaRecursive(schemaNode, parentFullPath, pathsToKeep) {
  if (!schemaNode || !pathsToKeep?.length) return schemaNode;
  const schema = schemaNode.schema;
  if (!Array.isArray(schema) || schema.length === 0) {
    return { ...schemaNode };
  }

  const isArrayOfObjects = schemaNode.type === "array" && schema?.[0]?.type === "object";
  const parentPathLen = (schemaNode.path || []).length;
  const keptChildren = [];

  for (let i = 0; i < schema.length; i++) {
    const child = schema[i];
    if (schemaNode.type === "array" && child.type !== "object" && child.type !== "array") {
      continue;
    }
    const schemaToShow =
      schemaNode.type === "array" && child.type === "object" ? child.schema : [child];

    for (let si = 0; si < schemaToShow.length; si++) {
      const schemaItem = schemaToShow[si];
      const childPath = schemaItem.path || [];
      const adjustedPath =
        schemaNode.type === "array" &&
          childPath.length > 0 &&
          !childPath.includes("[]") &&
          !childPath.includes("0")
          ? (() => {
            const insertIdx = isArrayOfObjects
              ? Math.max(0, childPath.length - 1)
              : (parentPathLen > 0 ? parentPathLen : 0);
            const p = [...childPath];
            p.splice(insertIdx, 0, isArrayOfObjects ? "0" : "[]");
            return p;
          })()
          : childPath;

      const fullPath = parentFullPath.concat(adjustedPath.length ? adjustedPath : [schemaItem.key].filter(Boolean));
      if (!shouldKeepPath(fullPath, pathsToKeep)) continue;

      const clonedChild = { ...schemaItem, path: adjustedPath };
      if (Array.isArray(schemaItem.schema) && schemaItem.schema.length > 0) {
        clonedChild.schema = pruneSchemaRecursive(
          { ...schemaItem, path: adjustedPath },
          fullPath,
          pathsToKeep,
        ).schema;
      }
      keptChildren.push(clonedChild);
    }
  }
  return { ...schemaNode, schema: keptChildren };
}

/**
 * Derives path array from descriptor id without needing rootId.
 * Matches flattenNodeVariablesToDescriptors: id is "rootName.path.to.field" (rootName = first segment).
 * e.g. "user.email" → ["email"], "user.address.city" → ["address", "city"], "user.items[0].name" → ["items", "0", "name"].
 * @param {string} id - Descriptor id from flattenNodeVariablesToDescriptors
 * @returns {string[]} Path segments from root to the field (empty for root-only id)
 */
function pathFromDescriptorId(id) {
  if (!id || typeof id !== "string") return [];
  const parts = id.split(".");
  if (parts.length <= 1) return [];
  return parts.slice(1).flatMap((seg) => {
    const indexed = seg.match(/^(.+)\[(\d+)\]$/);
    if (indexed) return [indexed[1], indexed[2]];
    const arrayBracket = seg.match(/^(.+)\[\]$/);
    if (arrayBracket) return [arrayBracket[1], "[]"];
    return [seg];
  });
}

/**
 * Builds pruned node trees from descriptors with id and parentId, using raw node list.
 * Groups by root (parentId ?? id), derives paths from id via pathFromDescriptorId (no rootId prefix assumption).
 * @param {Array<{ id: string, parentId?: string }>} descriptors - NODE variable descriptors (id, optional parentId)
 * @param {Array} rawNodeVariables - allFxDataBlocks[VARIABLES][NODE_VARIABLES]
 * @returns {Array} Pruned root nodes in SchemaList shape
 */
export const buildPrunedNodeTreesFromDescriptors = (descriptors, rawNodeVariables) => {
  const list = descriptors ?? [];
  const raw = rawNodeVariables ?? [];
  if (list.length === 0) return [];

  const processedRoots = processNodeVariablesForSchemaList(raw);
  const rootIds = new Set(processedRoots.map((r) => r.nodeId ?? r.key ?? r.name).filter(Boolean));

  const byRoot = {};
  list.forEach((d) => {
    const rootId = d.parentId ?? d.id;
    if (!rootId || !rootIds.has(rootId)) return;
    if (!byRoot[rootId]) byRoot[rootId] = [];
    byRoot[rootId].push(d);
  });

  const result = [];
  Object.keys(byRoot).forEach((rootId) => {
    const fullRoot = processedRoots.find((r) => (r.nodeId ?? r.key ?? r.name) === rootId);
    if (!fullRoot) return;

    const pathsToKeep = byRoot[rootId]
      .map((d) => pathFromDescriptorId(d.id))
      .filter((p) => p.length > 0);

    const hasRootOnly = byRoot[rootId].some((d) => d.id === rootId || !d.parentId);
    const pathsSet = hasRootOnly ? [[]] : [];
    pathsToKeep.forEach((p) => pathsSet.push(p));
    if (pathsSet.length === 0) pathsSet.push([]);

    const rootPath = [];
    const prunedSchema = pruneSchemaRecursive(
      { ...fullRoot, path: rootPath },
      rootPath,
      pathsSet,
    ).schema;

    result.push({ ...fullRoot, schema: prunedSchema ?? fullRoot.schema });
  });

  return result;
};

function walkSchemaForDescriptors(schema, parentNode, parentContext, out) {
  if (!Array.isArray(schema)) return;
  const node = parentNode;
  const isArrayOfObjects = node.type === "array" && node.schema?.[0]?.type === "object";
  const rootId = parentContext?.rootId ?? node.key ?? node.nodeId ?? node.name;

  for (let index = 0; index < schema.length; index++) {
    const child = schema[index];
    if (
      node.type === "array" &&
      child.type !== "object" &&
      child.type !== "array"
    ) {
      continue;
    }
    const schemaToShow =
      node.type === "array" && child.type === "object" ? child.schema : [child];

    for (let si = 0; si < schemaToShow.length; si++) {
      const schemaItem = schemaToShow[si];
      const childPath = schemaItem.path || [];
      const adjustedPath =
        node.type === "array" &&
          childPath.length > 0 &&
          !childPath.includes("[]") &&
          !childPath.includes("0")
          ? (() => {
            const parentPathLen = (node.path || []).length;
            const insertIdx = parentPathLen > 0 ? parentPathLen : 0;
            const p = [...childPath];
            p.splice(insertIdx, 0, isArrayOfObjects ? "0" : "[]");
            return p;
          })()
          : childPath;

      const pathStr =
        adjustedPath.length > 0
          ? "." + adjustedPath.join(".").replace(/\.\[\]/g, "[]")
          : "";

      const nodeName = parentContext?.nodeName ?? node.name ?? node.key;
      const id = `${nodeName}${pathStr}`;
      const name = schemaItem.label ?? schemaItem.key ?? schemaItem.name ?? id;
      const displayName =
        pathStr ? `${schemaItem.label ?? schemaItem.key ?? schemaItem.name}` : name;

      out.push({
        id,
        parentId: rootId,
        name,
        displayName,
      });

      const ctx = {
        rootId,
        nodeName: parentContext?.nodeName ?? node.name ?? node.key,
        nodeId: parentContext?.nodeId ?? node.nodeId,
        nodeType: parentContext?.nodeType ?? node.nodeType,
        nodeNumber: parentContext?.nodeNumber ?? node.nodeNumber,
        background: parentContext?.background ?? node.background,
        foreground: parentContext?.foreground ?? node.foreground,
        isArray: (parentContext?.isArray || node.type === "array") === true,
        isArrayOfObjects: parentContext?.isArrayOfObjects || isArrayOfObjects,
      };
      walkSchemaForDescriptors(
        { ...schemaItem, path: adjustedPath }.schema,
        { ...schemaItem, path: adjustedPath },
        ctx,
        out,
      );
    }
  }
}

/**
 * Flattens processed node variables into a list of minimal descriptor objects (id, parentId, name, displayName).
 * One entry per root and one per nested path. Does not change flattenNodeVariablesWithNested.
 * @param {Array} processedNodes - Result of processNodeVariablesForSchemaList(categoryItems)
 * @returns {Array<{ id: string, parentId?: string, name: string, displayName: string }>}
 */
export const flattenNodeVariablesToDescriptors = (processedNodes) => {
  const list = processedNodes ?? [];
  const out = [];
  list.forEach((root) => {
    const rootId = root.nodeId ?? root.name;
    out.push({
      id: rootId,
      name: root.name ?? root.key ?? "",
      displayName: root.name ?? root.key ?? "",
    });
    walkSchemaForDescriptors(root.schema, root, {
      rootId,
      nodeName: root.name ?? root.key,
      nodeId: root.nodeId,
      nodeType: root.nodeType,
      nodeNumber: root.nodeNumber,
      background: root.background,
      foreground: root.foreground,
    }, out);
  });
  return out;
};

export const truncateMiddle = (text, startChars = 12, endChars = 12) => {
  if (text.length <= startChars + endChars + 5) return text;

  return `${text.slice(0, startChars)} ... ${text.slice(-endChars)}`;
};

/**
 * Checks if a data object has any content (non-empty arrays or non-null values)
 * @param {Object} data - The data object to check
 * @returns {boolean} - True if data has content
 */
export const hasContent = (data) => {
  if (!data || typeof data !== "object") return false;
  return Object.keys(data).some((key) => {
    if (Array.isArray(data[key])) {
      return data[key].length > 0;
    }
    return data[key] !== null && data[key] !== undefined;
  });
};

/**
 * Filters function data based on displayFunctionsFor value
 * @param {Object} data - The data object containing FUNCTIONS, OPERATORS, KEYWORDS arrays
 * @param {string} displayFunctionsFor - Filter criteria ("all", "tables", etc.)
 * @returns {Object} Filtered data object
 */
export const filterDataForDisplay = (data, displayFunctionsFor) => {
  if (displayFunctionsFor !== "tables") {
    return data; // Return as is for "all" or other values
  }

  // Create a new object with filtered arrays
  const filteredData = {};

  // Filter each category (FUNCTIONS, OPERATORS, KEYWORDS)
  Object.keys(data).forEach((category) => {
    if (Array.isArray(data[category])) {
      filteredData[category] = data[category].filter(
        (item) => item.applicableFor && item.applicableFor.includes("tables")
      );
    } else {
      filteredData[category] = data[category]; // Keep as is if not an array
    }
  });

  return filteredData;
};

// Auto-complete utility functions

/**
 * Extracts text content before cursor position from contentEditable element
 * Only collects text from text nodes, skipping element nodes with data-block attributes
 * @param {HTMLElement} contentEditableEl - The contentEditable element
 * @param {Range} range - The current selection range
 * @returns {string} - Plain text string without non-printable characters
 */
export const getTextBeforeCursor = (contentEditableEl, range) => {
  if (!contentEditableEl || !range) return "";

  const textParts = [];
  let currentNode = range.startContainer;
  let offset = range.startOffset;

  // If cursor is in a text node, get text before cursor in that node
  if (currentNode.nodeType === Node.TEXT_NODE) {
    const textBefore = currentNode.textContent.substring(0, offset);
    if (textBefore) {
      textParts.unshift(textBefore);
    }
    // Move to previous sibling
    currentNode = currentNode.previousSibling;
  } else {
    // Cursor is in an element node, start from previous sibling
    if (offset > 0 && currentNode.childNodes[offset - 1]) {
      currentNode = currentNode.childNodes[offset - 1];
    } else {
      currentNode = currentNode.previousSibling;
    }
  }

  // Traverse backwards collecting text from text nodes
  while (currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      textParts.unshift(currentNode.textContent);
    } else if (
      currentNode.nodeType === Node.ELEMENT_NODE &&
      currentNode.hasAttribute("data-block")
    ) {
      // Stop at block elements, don't include their text
      break;
    }
    currentNode = currentNode.previousSibling;
  }

  const combinedText = textParts.join("");
  return removeNonPrintableChars(combinedText);
};

/**
 * Matches text before cursor against available functions
 * Checks if text ends with a function name (used before "(" is inserted)
 * @param {string} textBeforeCursor - Text content before cursor
 * @param {Array} allFunctions - Array of function objects
 * @returns {Object|null} - Matched function object or null
 */
export const findFunctionMatch = (textBeforeCursor, allFunctions) => {
  if (!textBeforeCursor || !allFunctions || allFunctions.length === 0) {
    return null;
  }

  // Match function name (alphanumeric + underscore) at the end
  // Pattern: functionName + optional whitespace at the end
  const match = textBeforeCursor.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);

  if (!match) {
    return null;
  }

  const functionName = match[1].toLowerCase();

  // Find matching function (case-insensitive)
  const matchedFunction = allFunctions.find((fn) => {
    const fnName = (fn.value || fn.name || "").toLowerCase();
    return fnName === functionName;
  });

  return matchedFunction || null;
};

/**
 * Detects the context where the cursor is positioned (function call, object literal, or array literal)
 * Used to determine whether a comma should be converted to an operator block or kept as normal text
 * 
 * @param {HTMLElement} contentEditableEl - The contentEditable element
 * @param {Range} range - The current selection range
 * @param {Array} allFunctions - Array of available function objects for function name matching
 * @returns {Object} - { isInside: boolean, context: 'function' | 'object' | 'array' | null }
 */
export const detectCommaContext = (contentEditableEl, range, allFunctions = []) => {
  if (!contentEditableEl || !range) {
    return { isInside: false, context: null };
  }

  // Helper to get block data from element
  const getBlockData = (element) => {
    if (
      !element ||
      element.nodeType !== Node.ELEMENT_NODE ||
      !element.hasAttribute("data-block")
    ) {
      return null;
    }
    try {
      return JSON.parse(base64Decode(element.getAttribute("data-block")));
    } catch (e) {
      return null;
    }
  };

  // Helper to find brackets in text content (scans backwards from start offset)
  const findBracketsInText = (text, startOffset = text.length - 1) => {
    const brackets = [];
    for (let i = startOffset; i >= 0; i--) {
      const char = text[i];
      if (char === "(" || char === "[" || char === "{") {
        brackets.push({ char, position: i });
      }
    }
    return brackets;
  };

  // Helper to get previous sibling node based on node type and offset
  const getPreviousSiblingNode = (node, offset) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.previousSibling;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (offset > 0 && node.childNodes[offset - 1]) {
        return node.childNodes[offset - 1];
      } else {
        return node.previousSibling;
      }
    } else {
      return node.previousSibling;
    }
  };

  // Helper to get next sibling node based on node type and offset
  const getNextSiblingNode = (node, offset) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nextSibling;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (offset < node.childNodes.length) {
        return node.childNodes[offset];
      } else {
        return node.nextSibling;
      }
    } else {
      return node.nextSibling;
    }
  };

  // Helper to check bracket balance in text content using stack algorithm
  const checkBracketBalance = (text, endPosition = text.length) => {
    const stack = [];
    const bracketMap = { '(': ')', '[': ']', '{': '}' };
    const closingBrackets = { ')': '(', ']': '[', '}': '{' };

    for (let i = 0; i < endPosition; i++) {
      const char = text[i];

      if (bracketMap[char]) {
        // Opening bracket - push onto stack
        stack.push({ char, position: i });
      } else if (closingBrackets[char]) {
        // Closing bracket - check if matches top of stack
        if (stack.length === 0) {
          // More closing brackets than opening - unbalanced, but continue for robustness
          continue;
        }
        const top = stack[stack.length - 1];
        if (top.char === closingBrackets[char]) {
          // Matches - pop from stack
          stack.pop();
        } else {
          // Mismatch - still pop for robustness (handle nested mismatches)
          stack.pop();
        }
      }
    }

    // Calculate result
    const balanced = stack.length === 0;
    let lastUnclosedBracket = null;
    let lastUnclosedPosition = -1;

    if (stack.length > 0) {
      const last = stack[stack.length - 1];
      lastUnclosedBracket = last.char;
      lastUnclosedPosition = last.position;
    }

    // Calculate depths from remaining stack
    let parenDepth = 0;
    let bracketDepth = 0;
    let braceDepth = 0;

    for (const item of stack) {
      if (item.char === '(') parenDepth++;
      else if (item.char === '[') bracketDepth++;
      else if (item.char === '{') braceDepth++;
    }

    return {
      balanced,
      parenDepth,
      bracketDepth,
      braceDepth,
      lastUnclosedBracket,
      lastUnclosedPosition,
    };
  };

  // Helper to check if cursor is inside brackets in text content
  const isCursorInsideBrackets = (text, cursorOffset, bracketType) => {
    const matchingClose = bracketType === "(" ? ")" : bracketType === "[" ? "]" : "}";
    let depth = 0;
    let foundOpening = false;
    let openingPosition = -1;

    // Scan backwards from cursor to find opening bracket
    for (let i = cursorOffset - 1; i >= 0; i--) {
      const char = text[i];
      if (char === matchingClose) {
        depth++;
      } else if (char === bracketType) {
        if (depth === 0) {
          foundOpening = true;
          openingPosition = i;
          break;
        }
        depth--;
      }
    }

    if (!foundOpening) {
      return false;
    }

    // Scan forwards from cursor to find matching closing bracket
    depth = 0;
    for (let i = cursorOffset; i < text.length; i++) {
      const char = text[i];
      if (char === bracketType) {
        depth++;
      } else if (char === matchingClose) {
        if (depth === 0) {
          return true; // Found matching closing bracket
        }
        depth--;
      }
    }

    // If no closing bracket found, we're still inside (incomplete structure)
    return true;
  };

  // Walk backwards from cursor to find the nearest opening bracket
  let currentNode = range.startContainer;
  let offset = range.startOffset;

  // Track the nearest bracket to cursor position
  let nearestBracket = null;
  let nearestBracketType = null;
  let nearestBracketDistance = Infinity;
  let nearestBracketInfo = null; // Stores info about where bracket was found

  // First, check if cursor is in text node
  let foundBracketInCurrentText = false;
  let isOutsideTextBrackets = false; // Track if we're outside text node brackets
  let skipForwardVerification = false; // Skip forward verification if we determined we're outside

  if (currentNode.nodeType === Node.TEXT_NODE) {
    const text = currentNode.textContent;
    const isAtEnd = offset >= text.length;

    if (!isAtEnd) {
      // Cursor is NOT at end - check if cursor is inside any bracket structure
      const bracketsInText = findBracketsInText(text, offset - 1);
      if (bracketsInText.length > 0) {
        // Check each bracket type to see if cursor is inside
        for (const bracket of bracketsInText) {
          if (isCursorInsideBrackets(text, offset, bracket.char)) {
            // Cursor is inside this bracket structure
            nearestBracket = { type: "text", char: bracket.char, position: bracket.position, node: currentNode };
            nearestBracketType = bracket.char;
            nearestBracketDistance = offset - bracket.position;
            nearestBracketInfo = { type: "text", node: currentNode, position: bracket.position };
            foundBracketInCurrentText = true;
            break; // Use the closest bracket (first one found)
          }
        }
      }
    } else {
      // Cursor IS at end - check bracket balance
      const balance = checkBracketBalance(text, offset);

      if (balance.balanced) {
        // All brackets are balanced - we're outside the structure
        isOutsideTextBrackets = true;
        skipForwardVerification = true;
        // Don't set foundBracketInCurrentText - will check parent function call
      } else {
        // Brackets are not balanced - we're still inside
        if (balance.lastUnclosedBracket) {
          // Find the position of the last unclosed bracket
          const bracketsInText = findBracketsInText(text, offset - 1);
          const matchingBracket = bracketsInText.find(b => b.char === balance.lastUnclosedBracket);
          if (matchingBracket) {
            nearestBracket = { type: "text", char: matchingBracket.char, position: matchingBracket.position, node: currentNode };
            nearestBracketType = matchingBracket.char;
            nearestBracketDistance = offset - matchingBracket.position;
            nearestBracketInfo = { type: "text", node: currentNode, position: matchingBracket.position };
            foundBracketInCurrentText = true;
          }
        }
      }
    }
  }

  // If we're outside text brackets (balanced, cursor at end), check for parent function call
  if (isOutsideTextBrackets) {
    // Walk backwards through DOM nodes to find function call
    let nodeToCheck = currentNode.previousSibling;
    let functionFound = false;

    while (nodeToCheck) {
      const blockData = getBlockData(nodeToCheck);
      if (blockData) {
        // Check if it's a function block
        if (blockData.subCategory === FUNCTIONS || blockData.type === FUNCTIONS) {
          // Found a function block - check if its closing ) comes after cursor
          // For now, assume if we found function block before cursor, we're inside it
          nearestBracket = { type: "block", node: nodeToCheck };
          nearestBracketType = "("; // Function calls use (
          nearestBracketInfo = { type: "function", node: nodeToCheck };
          functionFound = true;
          break;
        }
        // Check if it's a ( bracket block (function call)
        if (blockData.value === "(") {
          // Found opening parenthesis - check if it's a function call
          let prevNode = nodeToCheck.previousSibling;
          let functionName = "";

          while (prevNode) {
            const prevBlockData = getBlockData(prevNode);
            if (prevBlockData) {
              if (prevBlockData.subCategory === FUNCTIONS || prevBlockData.type === FUNCTIONS) {
                functionFound = true;
                break;
              }
              if (prevBlockData.subCategory === OPERATORS || prevBlockData.type === OPERATORS) {
                break;
              }
              if (prevBlockData.displayValue || prevBlockData.value) {
                functionName = (prevBlockData.displayValue || prevBlockData.value) + functionName;
              }
            } else if (prevNode.nodeType === Node.TEXT_NODE) {
              const text = prevNode.textContent.trim();
              if (text) {
                functionName = text + functionName;
              }
            }
            prevNode = prevNode.previousSibling;
          }

          if (functionFound || functionName) {
            const funcMatch = allFunctions.find(fn => {
              const fnName = (fn.value || fn.name || "").toLowerCase();
              return fnName === functionName.trim().toLowerCase();
            });
            if (funcMatch || functionFound) {
              nearestBracket = { type: "block", node: nodeToCheck };
              nearestBracketType = "(";
              nearestBracketInfo = { type: "block", node: nodeToCheck };
              functionFound = true;
              break;
            }
          }
        }
      }
      nodeToCheck = nodeToCheck.previousSibling;
    }

    if (functionFound) {
      // We're inside a function call
      foundBracketInCurrentText = true; // Mark as found so we skip DOM checking below
    } else {
      // Not inside any function call
      return { isInside: false, context: null };
    }
  }

  // Only check DOM nodes if we didn't find a bracket in current text node
  // If bracket was found in current text, it's definitely the closest, so skip DOM checking
  if (!foundBracketInCurrentText) {
    // Now walk backwards through DOM nodes to find bracket blocks and text nodes with brackets
    let nodeToCheck = getPreviousSiblingNode(currentNode, offset);

    let nodeDistance = 1; // Track approximate distance through DOM nodes

    // Traverse backwards to find bracket blocks and text nodes with brackets
    while (nodeToCheck) {
      const blockData = getBlockData(nodeToCheck);

      if (blockData) {
        // Check if it's a bracket block
        if (blockData.value === "(" || blockData.value === "[" || blockData.value === "{") {
          // Compare distance - if this is closer than current nearest, update
          if (!nearestBracket || nodeDistance < nearestBracketDistance) {
            nearestBracket = { type: "block", node: nodeToCheck };
            nearestBracketType = blockData.value;
            nearestBracketDistance = nodeDistance;
            nearestBracketInfo = { type: "block", node: nodeToCheck };
          }
          // Don't break - continue to check if there's a closer bracket
        }
      } else if (nodeToCheck.nodeType === Node.TEXT_NODE) {
        // Check text content for brackets
        const text = nodeToCheck.textContent;
        const bracketsInText = findBracketsInText(text, text.length - 1);
        if (bracketsInText.length > 0) {
          const closest = bracketsInText[0];
          // Approximate distance: node distance + position from end of text
          const distance = nodeDistance + (text.length - closest.position);
          if (!nearestBracket || distance < nearestBracketDistance) {
            nearestBracket = { type: "text", char: closest.char, position: closest.position, node: nodeToCheck };
            nearestBracketType = closest.char;
            nearestBracketDistance = distance;
            nearestBracketInfo = { type: "text", node: nodeToCheck, position: closest.position };
          }
        }
      }

      nodeToCheck = nodeToCheck.previousSibling;
      nodeDistance++;
    }
  }
  if (!nearestBracket) {
    return { isInside: false, context: null };
  }

  // Determine context based on bracket type
  let context = null;

  // If we found a function block directly, set context to function
  if (nearestBracketInfo && nearestBracketInfo.type === "function") {
    context = "function";
  } else if (nearestBracketType === "{") {
    context = "object";
  } else if (nearestBracketType === "[") {
    context = "array";
  } else if (nearestBracketType === "(") {
    // Check if it's a function call by looking backwards for a function name
    let prevNode;
    let functionName = "";

    // If bracket is in text content, check text before the bracket in the same node
    if (nearestBracketInfo.type === "text") {
      const textNode = nearestBracketInfo.node;
      const bracketPos = nearestBracketInfo.position;
      const textBeforeBracket = textNode.textContent.substring(0, bracketPos).trim();

      if (textBeforeBracket) {
        // Try to extract function name from text before bracket
        // Match alphanumeric function name at the end
        const match = textBeforeBracket.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);
        if (match) {
          const potentialFunctionName = match[1];
          const funcMatch = allFunctions.find(fn => {
            const fnName = (fn.value || fn.name || "").toLowerCase();
            return fnName === potentialFunctionName.toLowerCase();
          });
          if (funcMatch) {
            context = "function";
          }
        }
        functionName = textBeforeBracket;
      }

      // Also check previous sibling nodes
      prevNode = textNode.previousSibling;
    } else {
      // Bracket is a block element
      prevNode = nearestBracketInfo.node.previousSibling;
    }

    // Collect text/function name before the opening parenthesis from previous nodes
    while (prevNode && !context) {
      const blockData = getBlockData(prevNode);
      if (blockData) {
        // If we hit a function block, it's definitely a function call
        if (blockData.subCategory === FUNCTIONS || blockData.type === FUNCTIONS) {
          context = "function";
          break;
        }
        // If we hit an operator or other block, stop
        if (blockData.subCategory === OPERATORS || blockData.type === OPERATORS) {
          break;
        }
        // Collect function name from displayValue or value
        if (blockData.displayValue || blockData.value) {
          functionName = (blockData.displayValue || blockData.value) + functionName;
        }
      } else if (prevNode.nodeType === Node.TEXT_NODE) {
        // Collect text that might be a function name
        const text = prevNode.textContent.trim();
        if (text) {
          functionName = text + functionName;
          // Check if this matches a function name
          const funcMatch = allFunctions.find(fn => {
            const fnName = (fn.value || fn.name || "").toLowerCase();
            return fnName === functionName.toLowerCase();
          });
          if (funcMatch) {
            context = "function";
            break;
          }
        }
      }
      prevNode = prevNode.previousSibling;
    }

    // If we collected a function name, check if it matches
    if (!context && functionName) {
      const funcMatch = allFunctions.find(fn => {
        const fnName = (fn.value || fn.name || "").toLowerCase();
        return fnName === functionName.trim().toLowerCase();
      });
      if (funcMatch) {
        context = "function";
      }
    }

    // Default to function if we can't determine (for backward compatibility)
    if (!context) {
      context = "function";
    }
  }

  return { isInside: true, context };
};

/**
 * Returns the comma operator block from otherData
 * @returns {Object} - Comma operator block
 */
export const getCommaOperator = () => {
  return otherData.OPERATORS.find((o) => o.value === ",");
};

export const getParenOperator = (parenValue = "(") => {
  return otherData.OPERATORS.find((o) => o.value === parenValue);
};

export const DEPTH_COLORS = [
  { bg: "rgba(28, 54, 147, 0.06)", border: "rgba(28, 54, 147, 0.2)", text: "#1C3693" },
  { bg: "rgba(0, 137, 123, 0.06)", border: "rgba(0, 137, 123, 0.2)", text: "#00796B" },
  { bg: "rgba(142, 36, 170, 0.06)", border: "rgba(142, 36, 170, 0.2)", text: "#7B1FA2" },
  { bg: "rgba(230, 81, 0, 0.06)", border: "rgba(230, 81, 0, 0.2)", text: "#E65100" },
  { bg: "rgba(194, 24, 91, 0.06)", border: "rgba(194, 24, 91, 0.2)", text: "#AD1457" },
];

export const updateNestingDepths = (contentEditableEl) => {
  if (!contentEditableEl) return;

  const spans = contentEditableEl.querySelectorAll("[data-block]");
  let depth = -1;
  let expectOpenParen = false;

  spans.forEach((span) => {
    let blockData;
    try {
      blockData = JSON.parse(base64Decode(span.getAttribute("data-block")));
    } catch (e) {
      return;
    }

    const isFunc = blockData.subCategory === FUNCTIONS || blockData.type === FUNCTIONS;
    const isOpenParen = blockData.value === "(" && (blockData.subCategory === OPERATORS || blockData.type === OPERATORS);
    const isCloseParen = blockData.value === ")" && (blockData.subCategory === OPERATORS || blockData.type === OPERATORS);
    const isComma = blockData.value === "," && (blockData.subCategory === OPERATORS || blockData.type === OPERATORS);

    if (isFunc) {
      depth++;
      const colorIdx = depth % DEPTH_COLORS.length;
      span.setAttribute("data-depth", String(colorIdx));
      const color = DEPTH_COLORS[colorIdx];
      span.style.setProperty("--depth-text", color.text);
      span.style.setProperty("--depth-bg", color.bg);
      span.style.setProperty("--depth-border", color.border);
      expectOpenParen = true;
    } else if (isOpenParen) {
      if (expectOpenParen) {
        expectOpenParen = false;
      } else {
        depth++;
      }
      const colorIdx = Math.max(0, depth) % DEPTH_COLORS.length;
      span.setAttribute("data-depth", String(colorIdx));
      span.style.setProperty("--depth-text", DEPTH_COLORS[colorIdx].text);
    } else if (isCloseParen) {
      const colorIdx = Math.max(0, depth) % DEPTH_COLORS.length;
      span.setAttribute("data-depth", String(colorIdx));
      span.style.setProperty("--depth-text", DEPTH_COLORS[colorIdx].text);
      depth = Math.max(-1, depth - 1);
    } else if (isComma) {
      const colorIdx = Math.max(0, depth) % DEPTH_COLORS.length;
      span.setAttribute("data-depth", String(colorIdx));
      span.style.setProperty("--depth-text", DEPTH_COLORS[colorIdx].text);
    } else {
      span.removeAttribute("data-depth");
      span.style.removeProperty("--depth-text");
      span.style.removeProperty("--depth-bg");
      span.style.removeProperty("--depth-border");
    }
  });
};

/**
 * Parses a formula string into blocks that can be inserted into the formula bar
 * @param {string} formulaStr - The formula string to parse (e.g., "sum(10, 20, 30)")
 * @param {Array} allFunctions - Array of all available function objects
 * @returns {Array|null} - Array of blocks if valid formula, null otherwise
 */
export const parseFormulaString = (formulaStr, allFunctions = []) => {
  const parser = new FormulaParser(allFunctions);
  return parser.parse(formulaStr);
};

/**
 * Parses a formula string into blocks by matching variables and functions
 * This is a simpler parser that handles basic variable and function matching
 * @param {string} formulaStr - The formula string to parse
 * @param {Object} allVariables - Object containing all available variables
 * @param {Array} allFunctions - Array of all available function objects
 * @returns {Array} - Array of blocks
 */
export const parseFormulaToBlocks = (formulaStr, allVariables = {}, allFunctions = []) => {
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
};

/**
 * Gets blocks for expanding from plain mode to formula mode
 * Restores original blocks if text unchanged, otherwise parses the text
 * @param {string} plainInputValue - Current plain input value
 * @param {string|null} originalPlainText - Original plain text before collapse (if any)
 * @param {Array|null} originalBlocks - Original blocks before collapse (if any)
 * @param {Array} allFunctions - Array of all available function objects
 * @param {Object} allVariables - Object containing all available variables
 * @returns {Array} - Array of blocks to use for expansion
 */
export const getBlocksForExpansion = (
  plainInputValue,
  originalPlainText,
  originalBlocks,
  allFunctions = [],
  allVariables = {}
) => {
  // If no plain input value, return empty blocks
  if (!plainInputValue) {
    return [];
  }

  // Check if plain text matches the original (unchanged)
  if (
    originalPlainText !== null &&
    plainInputValue === originalPlainText &&
    originalBlocks !== null &&
    originalBlocks.length > 0
  ) {
    // Restore original blocks
    return cloneDeep(originalBlocks);
  }

  // Text was changed or no original blocks - try parsing
  // First try: parseFormulaString (more robust parser, requires parentheses)
  const parsedBlocks = parseFormulaString(plainInputValue, allFunctions);
  if (parsedBlocks && parsedBlocks.length > 0) {
    return parsedBlocks;
  }

  // Second try: parseFormulaToBlocks (simpler parser, handles variables and functions)
  const simpleParsedBlocks = parseFormulaToBlocks(plainInputValue, allVariables, allFunctions);
  if (simpleParsedBlocks && simpleParsedBlocks.length > 0) {
    return simpleParsedBlocks;
  }

  // Fallback: single PRIMITIVES block
  return [{ type: "PRIMITIVES", value: plainInputValue }];
};

/**
 * Serializes an array of formula blocks into a plain text string representation
 * Handles all block types and preserves function names, operators, and values
 * @param {Array} blocks - Array of block objects to serialize
 * @returns {string} - Serialized string representation of the blocks
 */
export const serializeBlocksToString = (blocks = []) => {
  if (!blocks || blocks.length === 0) {
    return "";
  }

  return blocks
    .map((block) => {
      if (!block) return "";

      // Handle BREAKLINE blocks - convert to newline character
      if (block.type === "BREAKLINE") {
        return "\n";
      }

      // Determine the value to use with priority: displayValue > value > name
      let blockValue = block.displayValue ?? block.value ?? block.name ?? "";

      // Convert to string safely (handle null/undefined)
      if (blockValue !== null && blockValue !== undefined) {
        blockValue = String(blockValue);
      } else {
        blockValue = "";
      }

      return blockValue;
    })
    .join("");
};

// Phase 1: Error State Management Functions

/**
 * Updates a specific DOM element with error state without affecting cursor position
 * @param {Object} contentEditableRef - Reference to the content editable element
 * @param {string} blockId - The unique ID of the block to update
 * @param {Object} errorState - Error state object { error: boolean, errorMessage?: string }
 * @returns {boolean} - Success status
 */
export const updateBlock = (contentEditableRef, blockId, errorState) => {
  // Find all elements with the given blockId
  const elements = contentEditableRef.current.querySelectorAll(
    `[data-block-id="${blockId}"]`
  );
  if (!elements.length) {
    return false;
  }

  elements.forEach((element) => {
    // Update the data-block attribute (contains the block data)
    const currentBlockData = JSON.parse(
      base64Decode(element.getAttribute("data-block"))
    );
    let updatedBlockData = {
      ...currentBlockData,
      error: errorState.error,
      errorMessage: errorState.errorMessage,
      errorType: errorState.errorType,
    };
    element.setAttribute(
      "data-block",
      base64Encode(JSON.stringify(updatedBlockData))
    );
    // ✅ Only create root once and store it on the element
    if (!element._reactRoot) {
      element._reactRoot = ReactDOM.createRoot(element);
    }

    element._reactRoot.render(
      <DataBlock
        block={updatedBlockData}
        onClick={() => {
          updateRange(null, element);
        }}
      />
    );
  });

  // Return success status
  return true;
};

/**
 * Clears all error states from all blocks
 * @param {Object} contentEditableRef - Reference to the content editable element
 */
export const clearAllErrors = (contentEditableRef, errorType) => {
  const container = contentEditableRef.current;

  // // Step 1: Revert all error wrapper spans (e.g., red error <span>) to plain text
  // const errorSpans = container.querySelectorAll("span[style*='color: red']");
  // errorSpans.forEach((span) => {
  //   const textNode = document.createTextNode(
  //     removeNonPrintableChars(span.textContent)
  //   );
  //   span.parentNode.replaceChild(textNode, span);
  // });

  // Step 2: Reset error state for all data-block elements
  const blockElements = container.querySelectorAll("[data-block-id]");
  blockElements.forEach((element) => {
    const blockId = element.getAttribute("data-block-id");
    const currentBlockData = JSON.parse(
      base64Decode(element.getAttribute("data-block"))
    );
    if (errorType) {
      if (currentBlockData.errorType === errorType) {
        updateBlock(contentEditableRef, blockId, {
          error: false,
          errorType: undefined,
          errorMessage: undefined,
        });
      }
    } else {
      updateBlock(contentEditableRef, blockId, {
        error: false,
        errorType: undefined,
        errorMessage: undefined,
      });
    }
  });
};
