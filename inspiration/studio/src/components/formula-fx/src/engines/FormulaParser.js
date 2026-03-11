import { FUNCTIONS, OPERATORS } from "../constants/types";
import { otherData } from "../data/other-data";

// Normalize only format/invisible chars to U+0020; do NOT match U+0020 so we never alter normal spaces
const PARSE_NORMALIZE_SPACE = /\u200B|\u200C|\u200D|\uFEFF/g;

function isSpaceLikeChar(char) {
  if (!char || char.length === 0) return false;
  const code = char.charCodeAt(0);
  return (
    code === 32 || (code >= 9 && code <= 13) || // space, tab, NL, etc.
    code === 160 || code === 65279 || // NBSP, BOM
    (code >= 8192 && code <= 8206) || // en space, em space, ZWSP, etc.
    code === 8239 || code === 8287 || code === 12288 // narrow NBSP, MMS, CJK space
  );
}

/**
 * FormulaParser class for parsing formula strings into blocks
 * Handles functions, strings, numbers, objects, and arrays
 */
class FormulaParser {
  constructor(allFunctions = []) {
    this.allFunctions = allFunctions;
    this.sortedFunctions = this._sortFunctions(allFunctions);
    this.formulaStr = "";
    this.trimmed = "";
    this.index = 0;
  }

  /**
   * Main entry point - parses a formula string into blocks
   * @param {string} formulaStr - The formula string to parse
   * @returns {Array|null} - Array of blocks if valid formula, null otherwise
   */
  parse(formulaStr) {
    if (!formulaStr || typeof formulaStr !== "string") {
      return null;
    }

    // Reset parser state; normalize space-like chars so _skipWhitespace and unquoted strings preserve spaces
    this.formulaStr = formulaStr;
    this.trimmed = formulaStr.replace(PARSE_NORMALIZE_SPACE, " ").trim();

    this.index = 0;

    if (!this.trimmed) {
      return null;
    }

    // Check if it looks like a formula (contains parentheses)
    if (!this.trimmed.includes("(") || !this.trimmed.includes(")")) {
      return null;
    }

    // Try to parse the formula
    const result = this._parseExpression();
    if (!result) {
      return null;
    }

    // Check if there's remaining unparsed content
    this._skipWhitespace();
    if (this.index < this.trimmed.length) {
      return null; // Invalid formula - unparsed content remaining
    }

    return result;
  }

  /**
   * Sort functions by name length (longest first) for proper matching
   * @private
   */
  _sortFunctions(allFunctions) {
    return [...allFunctions].sort((a, b) => {
      const nameA = (a.value || a.displayValue || "").toLowerCase();
      const nameB = (b.value || b.displayValue || "").toLowerCase();
      return nameB.length - nameA.length;
    });
  }

  /**
   * Skip whitespace and space-like characters (so unquoted strings keep spaces)
   * Use both \s and isSpaceLikeChar so we never miss a space (e.g. U+0020)
   * @private
   */
  _skipWhitespace() {
    while (this.index < this.trimmed.length) {
      const char = this.trimmed[this.index];
      if (/\s/.test(char) || isSpaceLikeChar(char)) {
        this.index++;
      } else {
        break;
      }
    }
  }

  /**
   * Parse a string literal (handles escaped quotes)
   * @private
   * @returns {string|null} - The parsed string with quotes, or null
   */
  _parseString() {
    if (this.trimmed[this.index] !== '"') {
      return null;
    }
    let str = '"';
    this.index++;
    while (this.index < this.trimmed.length) {
      if (
        this.trimmed[this.index] === "\\" &&
        this.index + 1 < this.trimmed.length
      ) {
        // Escaped character
        str += this.trimmed[this.index] + this.trimmed[this.index + 1];
        this.index += 2;
      } else if (this.trimmed[this.index] === '"') {
        str += '"';
        this.index++;
        return str;
      } else {
        str += this.trimmed[this.index];
        this.index++;
      }
    }
    return null; // Unclosed string
  }

  /**
   * Match a function name from the sorted functions list
   * @private
   * @returns {Object|null} - Function object if matched, null otherwise
   */
  _matchFunction() {
    this._skipWhitespace();
    for (const func of this.sortedFunctions) {
      // Check both value and displayValue for matching
      // Some functions like splice have value="modifyArray" but displayValue="splice"
      const funcValue = (func.value || "").toLowerCase();
      const funcDisplayValue = (func.displayValue || "").toLowerCase();
      if (!funcValue && !funcDisplayValue) continue;

      const remaining = this.trimmed.slice(this.index).toLowerCase();

      // Try matching against displayValue first (more user-friendly name)
      let matchedName = null;
      let matchedLength = 0;

      if (funcDisplayValue && remaining.startsWith(funcDisplayValue)) {
        matchedName = funcDisplayValue;
        matchedLength = funcDisplayValue.length;
      } else if (funcValue && remaining.startsWith(funcValue)) {
        matchedName = funcValue;
        matchedLength = funcValue.length;
      }

      if (matchedName) {
        // Check if next character is '(' or whitespace followed by '('
        const nextCharIndex = this.index + matchedLength;
        let checkIndex = nextCharIndex;
        while (
          checkIndex < this.trimmed.length &&
          isSpaceLikeChar(this.trimmed[checkIndex])
        ) {
          checkIndex++;
        }
        if (
          checkIndex < this.trimmed.length &&
          this.trimmed[checkIndex] === "("
        ) {
          this.index = nextCharIndex;
          return { ...func, subCategory: FUNCTIONS };
        }
      }
    }

    return null;
  }

  /**
   * Parse a number (integer or decimal)
   * @private
   * @returns {string|null} - The parsed number string, or null
   */
  _parseNumber() {
    this._skipWhitespace();
    const match = this.trimmed.slice(this.index).match(/^\d+(\.\d+)?/);
    if (match) {
      const num = match[0];
      this.index += num.length;
      return num;
    }
    return null;
  }

  /**
   * Parse an identifier (variable name, key name, etc.)
   * Matches alphanumeric characters, underscores, and dots
   * @private
   * @returns {string|null} - The parsed identifier string, or null
   */
  _parseIdentifier() {
    this._skipWhitespace();
    const match = this.trimmed.slice(this.index).match(/^[a-zA-Z_][a-zA-Z0-9_.]*/);
    if (match) {
      const identifier = match[0];
      this.index += identifier.length;
      return identifier;
    }
    return null;
  }

  /**
   * Parse an identifier or unquoted string (handles cases like "Hello World" in function arguments)
   * This is used when parsing function arguments that may contain unquoted strings with spaces
   * @private
   * @returns {string|null} - The parsed identifier or unquoted string, or null
   */
  _parseIdentifierOrUnquotedString() {
    // Do not skip leading whitespace here so trim( Hello   ) preserves leading space
    let parts = [];
    const startIndex = this.index;

    // Check if we're at a delimiter - if so, nothing to parse
    if (this.index >= this.trimmed.length ||
      this.trimmed[this.index] === ',' ||
      this.trimmed[this.index] === ')' ||
      this.trimmed[this.index] === ']' ||
      this.trimmed[this.index] === '}') {
      return null;
    }

    // Try to parse first identifier or start with special character (for regex patterns like \d+)
    const firstMatch = this.trimmed.slice(this.index).match(/^[a-zA-Z_][a-zA-Z0-9_.]*/);
    if (firstMatch) {
      parts.push(firstMatch[0]);
      this.index += firstMatch[0].length;
    } else {
      // No identifier match - could be a regex pattern starting with special char (e.g., \d+)
      // We'll handle this in the loop below
    }

    // Check if next character is '(' - if so, this is a function call, not an unquoted string.
    // Look ahead WITHOUT consuming whitespace so we preserve spaces for "quick brown fox".
    let checkIndex = this.index;
    while (checkIndex < this.trimmed.length && (/\s/.test(this.trimmed[checkIndex]) || isSpaceLikeChar(this.trimmed[checkIndex]))) {
      checkIndex++;
    }
    if (checkIndex < this.trimmed.length && this.trimmed[checkIndex] === '(') {
      // This is a function call, not an unquoted string - return null so _parseExpression() can handle it
      this.index = startIndex; // Reset index
      return null;
    }

    // Check if there's whitespace followed by more content (including regex patterns)
    // This handles unquoted strings like "Hello World" and regex patterns like "W.*" or "\d+"
    while (this.index < this.trimmed.length) {
      const beforeSkipIndex = this.index;
      // Skip whitespace using regex on remainder so we never miss a space (U+0020)
      const spaceMatch = this.trimmed.slice(this.index).match(/^\s+/);
      if (spaceMatch) {
        this.index += spaceMatch[0].length;
      }
      const skippedWhitespace = this.index > beforeSkipIndex;

      // Stop if we hit a comma, closing paren, or other delimiter
      if (this.index >= this.trimmed.length ||
        this.trimmed[this.index] === ',' ||
        this.trimmed[this.index] === ')' ||
        this.trimmed[this.index] === ']' ||
        this.trimmed[this.index] === '}' ||
        this.trimmed[this.index] === '(') {
        // Preserve trailing space (e.g. trim( Hello   ))
        if (skippedWhitespace && spaceMatch) {
          parts.push(spaceMatch[0]);
        }
        break;
      }

      // Try to match more identifier-like content
      const nextMatch = this.trimmed.slice(this.index).match(/^[a-zA-Z_][a-zA-Z0-9_.]*/);
      if (nextMatch) {
        // Leading space: parts empty (e.g. trim( Hello   )). Internal space: single space between words (e.g. quick brown fox)
        if (skippedWhitespace) {
          if (parts.length === 0) {
            parts.push(spaceMatch[0]);
          } else {
            parts.push(' ');
          }
        }
        parts.push(nextMatch[0]);
        this.index += nextMatch[0].length;
      } else {
        // If we can't match identifier content, check if it's a regex pattern character
        // Regex patterns can contain: * + ? . \ | ( ) [ ] { } ^ $ and spaces
        // We'll continue parsing until we hit a comma or closing paren
        const char = this.trimmed[this.index];
        if (char && !/\s/.test(char)) {
          // Add the character (could be *, +, ?, ., \, etc. for regex patterns)
          parts.push(char);
          this.index++;
        } else {
          // Whitespace or end of string - stop
          break;
        }
      }
    }

    const result = parts.length > 0 ? parts.join('') : null;
    return result;
  }

  /**
   * Parse a JavaScript object literal
   * Handles nested objects, arrays, and various value types
   * @private
   * @returns {string|null} - The parsed object string, or null
   */
  _parseObject() {
    this._skipWhitespace();
    if (this.trimmed[this.index] !== "{") {
      return null;
    }

    const startIndex = this.index;
    let braceDepth = 0;
    let bracketDepth = 0;
    let inString = false;
    let escapeNext = false;

    while (this.index < this.trimmed.length) {
      const char = this.trimmed[this.index];

      if (escapeNext) {
        escapeNext = false;
        this.index++;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        this.index++;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
        this.index++;
        continue;
      }

      if (inString) {
        this.index++;
        continue;
      }

      if (char === "{") {
        braceDepth++;
        this.index++;
      } else if (char === "}") {
        braceDepth--;
        this.index++;
        if (braceDepth === 0 && bracketDepth === 0) {
          // Found matching closing brace
          return this.trimmed.substring(startIndex, this.index);
        }
      } else if (char === "[") {
        bracketDepth++;
        this.index++;
      } else if (char === "]") {
        bracketDepth--;
        this.index++;
      } else {
        this.index++;
      }
    }

    return null; // Unclosed object
  }

  /**
   * Parse a JavaScript array literal
   * Handles nested arrays, objects, and various element types
   * @private
   * @returns {string|null} - The parsed array string, or null
   */
  _parseArray() {
    this._skipWhitespace();
    if (this.trimmed[this.index] !== "[") {
      return null;
    }

    const startIndex = this.index;
    let braceDepth = 0;
    let bracketDepth = 0;
    let inString = false;
    let escapeNext = false;

    while (this.index < this.trimmed.length) {
      const char = this.trimmed[this.index];

      if (escapeNext) {
        escapeNext = false;
        this.index++;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        this.index++;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
        this.index++;
        continue;
      }

      if (inString) {
        this.index++;
        continue;
      }

      if (char === "[") {
        bracketDepth++;
        this.index++;
      } else if (char === "]") {
        bracketDepth--;
        this.index++;
        if (braceDepth === 0 && bracketDepth === 0) {
          // Found matching closing bracket
          return this.trimmed.substring(startIndex, this.index);
        }
      } else if (char === "{") {
        braceDepth++;
        this.index++;
      } else if (char === "}") {
        braceDepth--;
        this.index++;
      } else {
        this.index++;
      }
    }

    return null; // Unclosed array
  }

  /**
   * Parse an expression (can be function call, object, array, string, or number)
   * This is the recursive function that handles nested structures
   * @private
   * @returns {Array|null} - Array of blocks if successful, null otherwise
   */
  _parseExpression() {
    this._skipWhitespace();
    if (this.index >= this.trimmed.length) {
      return null;
    }

    // Try to match a function
    const func = this._matchFunction();
    if (func) {
      const funcBlocks = [];
      // Ensure name property is set for evaluation engine compatibility
      const functionBlock = {
        ...func,
        subCategory: FUNCTIONS,
        type: FUNCTIONS,
      };
      // Ensure name is set (evaluation engine may need it)
      if (!functionBlock.name && functionBlock.value) {
        functionBlock.name = functionBlock.value;
      }
      // Ensure id is set (evaluation engine requires it for function resolution)
      // Use value as id since function objects don't have id property
      if (!functionBlock.id && functionBlock.value) {
        functionBlock.id = functionBlock.value;
      }
      // Ensure subType is set to match structure of blocks extracted from DOM
      // extractContent sets subType to content.subType || value
      if (!functionBlock.subType && functionBlock.value) {
        functionBlock.subType = functionBlock.value;
      }
      funcBlocks.push(functionBlock);

      this._skipWhitespace();
      // Expect opening parenthesis
      if (
        this.index >= this.trimmed.length ||
        this.trimmed[this.index] !== "("
      ) {
        return null;
      }

      const openParen = otherData.OPERATORS.find((o) => o.value === "(");
      if (!openParen) {
        return null;
      }
      funcBlocks.push({
        ...openParen,
        subCategory: OPERATORS,
        type: OPERATORS,
        subType: "(",
      });
      this.index++;

      // Parse arguments (do not skip whitespace before each argument so trim( Hello   ) preserves leading space)
      let argCount = 0;
      while (this.index < this.trimmed.length) {
        if (this.trimmed[this.index] === ")") {
          // Closing parenthesis
          const closeParen = otherData.OPERATORS.find((o) => o.value === ")");
          if (!closeParen) {
            return null;
          }
          funcBlocks.push({
            ...closeParen,
            subCategory: OPERATORS,
            type: OPERATORS,
            subType: ")",
          });
          this.index++;
          return funcBlocks;
        }

        if (argCount > 0) {
          // Expect comma between arguments
          if (this.trimmed[this.index] !== ",") {
            return null;
          }

          // Check if this is a trailing comma (comma followed by closing parenthesis)
          let checkIndex = this.index + 1;
          while (checkIndex < this.trimmed.length && /\s/.test(this.trimmed[checkIndex])) {
            checkIndex++;
          }
          if (checkIndex < this.trimmed.length && this.trimmed[checkIndex] === ")") {
            // Trailing comma - skip it and don't add to blocks
            this.index = checkIndex;
            continue; // Skip to closing paren check
          }

          const comma = otherData.OPERATORS.find((o) => o.value === ",");
          if (!comma) {
            return null;
          }
          funcBlocks.push({
            ...comma,
            subCategory: OPERATORS,
            type: OPERATORS,
            subType: ",",
          });
          this.index++;
          this._skipWhitespace();
        }

        // Parse argument (do not skip before value so unquoted strings can preserve leading space, e.g. trim( Hello   ))
        let argBlocks = null;
        const argStartIndex = this.index;

        // Try object first (most specific, starts with '{')
        const obj = this._parseObject();
        if (obj !== null) {
          argBlocks = [{ type: "PRIMITIVES", value: obj }];
        } else {
          // Reset index for next attempt
          this.index = argStartIndex;
          // Try array (starts with '[')
          const arr = this._parseArray();
          if (arr !== null) {
            argBlocks = [{ type: "PRIMITIVES", value: arr }];
          } else {
            // Reset index for next attempt
            this.index = argStartIndex;
            // Try string (quoted, starts with '"')
            const str = this._parseString();
            if (str !== null) {
              argBlocks = [{ type: "PRIMITIVES", value: str }];
            } else {
              // Reset index for next attempt
              this.index = argStartIndex;
              // Try number (starts with digit)
              const num = this._parseNumber();
              if (num !== null) {
                argBlocks = [{ type: "PRIMITIVES", value: num }];
              } else {
                // Reset index for next attempt
                this.index = argStartIndex;
                // Try identifier or unquoted string (for cases like "Hello World" in function arguments)
                // This must come before nested function to handle unquoted strings with spaces
                const identifier = this._parseIdentifierOrUnquotedString();
                if (identifier !== null) {
                  argBlocks = [{ type: "PRIMITIVES", value: identifier }];
                } else {
                  // Reset index for next attempt
                  this.index = argStartIndex;
                  // Try nested function (recursive call) - this must come last
                  // because _parseExpression() will fail if there's remaining content
                  // and we want to try unquoted strings first
                  const nestedExpr = this._parseExpression();
                  if (nestedExpr) {
                    argBlocks = nestedExpr;
                  }
                }
              }
            }
          }
        }

        if (!argBlocks) {
          return null;
        }

        funcBlocks.push(...argBlocks);
        argCount++;
      }

      return null; // Missing closing parenthesis
    }

    // Not a function, try object, array, string, number, or identifier
    const obj = this._parseObject();
    if (obj !== null) {
      return [{ type: "PRIMITIVES", value: obj }];
    }

    const arr = this._parseArray();
    if (arr !== null) {
      return [{ type: "PRIMITIVES", value: arr }];
    }

    const str = this._parseString();
    if (str !== null) {
      return [{ type: "PRIMITIVES", value: str }];
    }

    const num = this._parseNumber();
    if (num !== null) {
      return [{ type: "PRIMITIVES", value: num }];
    }

    const identifier = this._parseIdentifier();
    if (identifier !== null) {
      return [{ type: "PRIMITIVES", value: identifier }];
    }

    return null;
  }
}

export default FormulaParser;
