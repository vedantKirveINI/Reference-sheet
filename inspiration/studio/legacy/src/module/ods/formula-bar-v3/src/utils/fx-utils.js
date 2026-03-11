import React from "react";
import ReactDOM from "react-dom/client";
import { base64Decode, base64Encode } from "../../../index.jsx";
import DataBlock from "../components/data-block/DataBlock";
import { FUNCTIONS } from "../constants/types";
import { otherData } from "../data/other-data";
import cloneDeep from "lodash/cloneDeep";

const uuid = () => {
  return crypto.randomUUID();
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
export const removeNonPrintableChars = (str) => {
  return str
    .split("")
    .map((char) =>
      char.charCodeAt(0) > 31 && char.charCodeAt(0) < 128 ? char : ""
    )
    .join("");
};
export const isDescendantOfFxPopper = (e) => {
  return !!e?.relatedTarget?.closest("#fx-popper");
};
export const getRange = () => {
  const selection = window.getSelection();
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
      if (!blockCopy.displayValue.endsWith("(")) blockCopy.displayValue += "(";
    } else {
      console.warn("This case should not happen at any point", blockCopy);
      blockCopy.value += "(";
    }
  }
  const span = document.createElement("span");
  span.setAttribute("data-block", base64Encode(JSON.stringify(blockCopy)));
  span.style.padding = "0 0.25rem";
  span.style.display = "inline-block";
  span.setAttribute("data-block-id", blockId);
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
export const createBreakNode = () => {
  return document.createElement("br");
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
  config = { isInitialize: false }
) => {
  const node = createDataBlock(block);
  if (range) {
    range.insertNode(node);
    range.collapse(false);
    if (!config.isInitialize && block.args?.length > 0) {
      block.args.forEach((arg, index) => {
        if (index < block.args.length - 1) {
          range.insertNode(
            createDataBlock(otherData.OPERATORS.find((o) => o.value === ";"))
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
    range.setStartAfter(node);
    range.setEndAfter(node);
  } else {
    el.appendChild(node);
    if (!config.isInitialize && block.args?.length > 0) {
      block.args.forEach((arg, index) => {
        if (index < block.args.length - 1) {
          el.appendChild(
            createDataBlock(otherData.OPERATORS.find((o) => o.value === ";"))
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
    updateRange(range, node);
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
export const addBlock = (block, el, range, searchText) => {
  if (searchText) {
    const startContainer = range.startContainer;
    const searchIndex = startContainer.textContent.indexOf(
      searchText,
      range.startOffset - searchText.length
    );
    const startOffset = searchIndex;
    const endOffset = searchIndex + searchText.length;

    range.setStart(startContainer, startOffset);
    range.setEnd(startContainer, endOffset);
    range.deleteContents();
  }
  if (block.subCategory === FUNCTIONS) {
    insertFunctionalDataBlock(block, el, range);
    return;
  }
  insertDataBlock(block, el, range);
};

export const autoConvertOperator = (char, el, range) => {
  const operatorChars = [';', '(', ')', '[', ']'];
  if (!operatorChars.includes(char)) return false;
  
  let operator = otherData.OPERATORS.find(o => o.value === char);
  
  if (!operator) {
    operator = {
      value: char,
      category: "OTHER",
      subCategory: "OPERATORS",
      description: char === '[' ? "Opening Square Bracket" : char === ']' ? "Closing Square Bracket" : "Operator",
      args: null,
      returnType: "",
      background: "#E5EAF1",
      example: "",
      group: "",
      applicableFor: ["all", "tables"],
    };
  }
  
  if (!range || !range.startContainer) return false;
  
  const startContainer = range.startContainer;
  if (startContainer.nodeType !== Node.TEXT_NODE) return false;
  
  const textContent = startContainer.textContent;
  const charIndex = textContent.lastIndexOf(char, range.startOffset);
  
  if (charIndex === -1) return false;
  
  range.setStart(startContainer, charIndex);
  range.setEnd(startContainer, charIndex + 1);
  range.deleteContents();
  
  insertDataBlock(operator, el, range);
  return true;
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
      if (node.tagName === "SPAN") {
        const content = JSON.parse(
          base64Decode(node.getAttribute("data-block"))
        );
        let value = content.value;
        if (content.subCategory === FUNCTIONS || content?.type === FUNCTIONS) {
          value = value.replace("(", "");
        }
        inputContent.push({
          ...content,
          value,
          type: content.type || content.subCategory,
          subType: content.subType || value,
        });
        if (content.subCategory === FUNCTIONS || content?.type === FUNCTIONS) {
          const operator = otherData.OPERATORS.find((o) => o.value === "(");
          inputContent.push({
            ...operator,
            type: operator.subCategory,
            subType: operator.value,
            blockId: content.blockId,
          });
        }
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
  content?.forEach((block, index) => {
    if (block.type === "PRIMITIVES") {
      insertTextNode(block.value, el, range);
    } else if (block.type === "BREAKLINE") {
      insertTextNode("\n", el, range);
      insertTextNode("\u200b", el, range);
    } else if (block.type === "TABSPACE") {
      insertTextNode("\t", el, range);
    } else if (block.type === "FUNCTIONS") {
      insertFunctionalDataBlock(block, el, range, {
        isInitialize: true,
      });
      if (
        content[index + 1]?.value === "(" ||
        content[index + 1]?.subType === "(" //old fx data
      ) {
        content.splice(index + 1, 1);
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

export const handleEnter = (e, cursorPositionRef) => {
  e.preventDefault();
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = cursorPositionRef.current;

  // Insert a breakline
  const lineBreak = document.createTextNode("\n");
  range.insertNode(lineBreak);
  const parentNode = lineBreak.parentNode;
  let addedZeroWidthNode = null;
  if (parentNode) {
    // Create a second <br> for a clean line break if no siblings exist
    const nextSibling = lineBreak.nextSibling;
    let addZeroWidthNode = false;
    if (nextSibling?.nodeType === Node.TEXT_NODE) {
      if (!nextSibling.nodeValue) {
        if (nextSibling.nextSibling?.nodeType === Node.ELEMENT_NODE) {
          const emptyTextNode = document.createTextNode("\u200b");
          parentNode.insertBefore(emptyTextNode, lineBreak.nextSibling);
          addedZeroWidthNode = emptyTextNode;
        } else {
          addZeroWidthNode = true;
        }
      }
    } else if (nextSibling?.nodeType === Node.ELEMENT_NODE) {
      const emptyTextNode = document.createTextNode("\u200b");
      parentNode.insertBefore(emptyTextNode, lineBreak.nextSibling);
      addedZeroWidthNode = emptyTextNode;
    }
    if (!nextSibling || addZeroWidthNode) {
      const emptyTextNode = document.createTextNode("\u200b");
      parentNode.insertBefore(emptyTextNode, lineBreak.nextSibling);
      addedZeroWidthNode = emptyTextNode;
    }
  }
  // Set the cursor after the zero-width space if it was added
  if (addedZeroWidthNode) {
    range.setStartAfter(addedZeroWidthNode);
  } else {
    // Otherwise set it after the newly added <br>
    range.setStartAfter(lineBreak);
  }
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);
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

export const processNodeVariablesForSchemaList = (nodeVariables) => {
  return nodeVariables?.map((node) => {
    const firstSchema = node.data?.schema?.schema[0];
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
    } else {
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
  });
};
export const truncateMiddle = (text, startChars = 12, endChars = 12) => {
  if (text.length <= startChars + endChars + 5) return text;

  return `${text.slice(0, startChars)} ... ${text.slice(-endChars)}`;
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
    console.warn(`Block with ID ${blockId} not found`);
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

/**
 * Finds a block by its ID and returns the DOM element and its block data
 * @param {Object} contentEditableRef - Reference to the content editable element
 * @param {string} blockId - The unique ID of the block to find
 * @returns {Object|null} - Object containing element and block data, or null if not found
 */
export const findBlockById = (contentEditableRef, blockId) => {
  // Find element by data-block-id
  const element = contentEditableRef.current.querySelector(
    `[data-block-id="${blockId}"]`
  );

  if (!element) {
    return null;
  }

  // Parse and return the block data
  const blockData = JSON.parse(
    base64Decode(element.getAttribute("data-block"))
  );

  // Return both element and parsed data
  return {
    element,
    blockData: {
      ...blockData,
      blockId: element.getAttribute("data-block-id"),
    },
  };
};
