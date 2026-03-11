import React from "react";
import { Button } from "@/components/ui/button";
import { getLucideIcon } from "@/components/icons";

/**
 * Tokenizes a formula string and identifies different token types for syntax highlighting
 * @param {string} formula - The formula string to tokenize
 * @returns {Array} Array of token objects with { type, value, start, end }
 */
const tokenizeFormula = (formula) => {
  const tokens = [];
  let i = 0;

  while (i < formula.length) {
    // Preserve whitespace as text
    if (/\s/.test(formula[i])) {
      tokens.push({
        type: "text",
        value: formula[i],
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    // Match string literals (double quotes)
    const stringMatch = formula.slice(i).match(/^"([^"\\]|\\.)*"/);
    if (stringMatch) {
      tokens.push({
        type: "string",
        value: stringMatch[0],
        start: i,
        end: i + stringMatch[0].length,
      });
      i += stringMatch[0].length;
      continue;
    }

    // Match function names (alphanumeric + underscore before opening paren)
    const functionMatch = formula.slice(i).match(/^[a-zA-Z_][a-zA-Z0-9_]*(?=\()/);
    if (functionMatch) {
      tokens.push({
        type: "function",
        value: functionMatch[0],
        start: i,
        end: i + functionMatch[0].length,
      });
      i += functionMatch[0].length;
      continue;
    }

    // Match numbers (integers and decimals)
    const numberMatch = formula.slice(i).match(/^\d+(\.\d+)?/);
    if (numberMatch) {
      tokens.push({
        type: "number",
        value: numberMatch[0],
        start: i,
        end: i + numberMatch[0].length,
      });
      i += numberMatch[0].length;
      continue;
    }

    // Match operators and punctuation
    if (/[(),]/.test(formula[i])) {
      tokens.push({
        type: "operator",
        value: formula[i],
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    // Default: single character
    tokens.push({
      type: "text",
      value: formula[i],
      start: i,
      end: i + 1,
    });
    i++;
  }

  return tokens;
};

/**
 * Renders formula with syntax highlighting
 * @param {string} formula - The formula string to highlight
 * @returns {React.ReactNode} JSX with highlighted formula
 */
const renderHighlightedFormula = (formula) => {
  const tokens = tokenizeFormula(formula);
  const elements = [];

  const tokenClass = (type) => {
    switch (type) {
      case "function":
        return "text-primary font-medium";
      case "number":
        return "text-purple-500 font-medium";
      case "string":
        return "text-green-600 font-medium";
      case "operator":
        return "text-foreground";
      default:
        return "text-foreground";
    }
  };

  tokens.forEach((token, index) => {
    elements.push(
      <span key={index} className={tokenClass(token.type)}>
        {token.value}
      </span>
    );
  });

  return elements;
};

const FormulaExampleCard = ({ formula, result, onCopy, onInsert }) => {
  const handleCopy = (e) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(formula);
    } else {
      navigator.clipboard.writeText(formula);
    }
  };

  const handleInsert = () => {
    if (onInsert) {
      onInsert(formula);
    }
  };

  return (
    <div className="bg-background border border-border rounded-md py-1.5 px-2 mb-1 relative hover:border-border">
      <div className="flex items-start justify-between gap-1.5 mb-0.5">
        <div
          className={`flex-1 text-sm leading-normal break-all whitespace-pre-wrap min-w-0${onInsert ? " cursor-pointer rounded px-1 -mx-1 hover:bg-primary/5 transition-colors duration-150" : ""}`}
          onClick={onInsert ? handleInsert : undefined}
          title={onInsert ? "Click to insert into formula" : undefined}
        >
          {renderHighlightedFormula(formula)}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-5 h-5 shrink-0 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
          onClick={handleCopy}
        >
          {getLucideIcon("OUTECopyContentIcon", { size: 16 })}
        </Button>
      </div>
      {result && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
          <span className="text-foreground font-normal">=</span>
          <span className="text-foreground font-normal">{result}</span>
        </div>
      )}
    </div>
  );
};

export default FormulaExampleCard;
