const TECHNICAL_PATTERNS = [
  "unexpected token",
  "syntaxerror",
  "unexpected end",
  "unterminated string",
  "is not a function",
  "cannot read prop",
  "maximum call stack",
  "division by zero",
  "infinity",
  "invalid regular expression",
  "referenceerror",
  "typeerror",
  "rangeerror",
];

function isRawParserError(message) {
  if (!message || typeof message !== "string") return false;
  const lower = message.toLowerCase();
  return TECHNICAL_PATTERNS.some((pattern) => lower.includes(pattern));
}

function extractErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || "";
  if (typeof error === "object" && error.message) return String(error.message);
  return String(error);
}

function extractToken(msg) {
  const patterns = [
    /unexpected token\s+['"`]([^'"`]+)['"`]/i,
    /unexpected token\s+(\S+)/i,
  ];
  for (const pattern of patterns) {
    const match = msg.match(pattern);
    if (match && match[1]) {
      return match[1].replace(/['"`,.:;]+$/, "");
    }
  }
  return null;
}

function transformFormulaError(rawError) {
  const msg = extractErrorMessage(rawError).trim();

  if (!msg) {
    return "An unknown error occurred. Check your formula and try again.";
  }

  const lower = msg.toLowerCase();

  if (lower.includes("unexpected token")) {
    const token = extractToken(msg);

    if (token === ")") {
      return "There's a closing bracket ')' without a matching opening bracket. Try adding '(' before your function arguments.";
    }
    if (token === "(") {
      return "There's an opening bracket '(' in an unexpected place. Make sure it follows a function name like sum( or concatenate(.";
    }
    if (token === ",") {
      return "There's a comma where a value is expected. Make sure each argument has a value before the comma.";
    }
    if (token) {
      return `The character '${token}' is in an unexpected position. Check your formula for typos or missing values.`;
    }
    return "There's an unexpected character in your formula. Check for typos or missing values.";
  }

  if (lower.includes("unexpected end of expression") || lower.includes("unexpected end of input") || lower.includes("unexpected end")) {
    return "The formula looks incomplete. You may be missing a closing bracket ')' or a value at the end.";
  }

  if (lower.includes("unterminated string")) {
    return "A text value is missing its closing quote. Make sure every opening quote has a matching closing quote.";
  }

  if (lower.includes("is not a function")) {
    return "One of the functions in your formula isn't recognized. Check the function name for typos.";
  }

  if (lower.includes("cannot read properties of undefined") || lower.includes("cannot read property")) {
    return "A variable or data reference in your formula couldn't be found. It may have been removed or renamed.";
  }

  if (lower.includes("maximum call stack")) {
    return "The formula is too complex or has a circular reference. Try simplifying it.";
  }

  if (lower.includes("division by zero") || lower.includes("infinity")) {
    return "The formula is trying to divide by zero. Check your divisor values.";
  }

  if (lower.includes("invalid regular expression")) {
    return "There's an issue with a pattern match in your formula. Check the regex syntax.";
  }

  if (lower.includes("syntaxerror")) {
    return "There's a syntax issue in your formula. Check for missing brackets, commas, or quotes.";
  }

  if (!isRawParserError(msg)) {
    return msg;
  }

  const simplified = msg
    .replace(/^(TypeError|ReferenceError|RangeError|SyntaxError):\s*/i, "")
    .substring(0, 100);
  return `Something went wrong: ${simplified}. Check your formula for errors.`;
}

export { transformFormulaError, isRawParserError };
