export interface FormulaFunctionParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface FormulaFunctionDef {
  name: string;
  category: "Numeric" | "Text" | "Logical" | "Date";
  description: string;
  syntax: string;
  example: string;
  params: FormulaFunctionParam[];
}

export const FORMULA_FUNCTION_CATEGORIES = [
  { id: "Numeric" as const, label: "Numeric", icon: "Hash" },
  { id: "Text" as const, label: "Text", icon: "Type" },
  { id: "Logical" as const, label: "Logical", icon: "GitBranch" },
  { id: "Date" as const, label: "Date", icon: "Calendar" },
] as const;

export const FORMULA_FUNCTIONS: FormulaFunctionDef[] = [
  {
    name: "SUM",
    category: "Numeric",
    description: "Returns the sum of all numeric values.",
    syntax: "SUM(number1, number2, ...)",
    example: "SUM(100, 200, 300) = 600",
    params: [
      { name: "number1", type: "number", required: true, description: "First number" },
      { name: "number2", type: "number", required: false, description: "Additional numbers" },
    ],
  },
  {
    name: "AVERAGE",
    category: "Numeric",
    description: "Returns the average of all numeric values.",
    syntax: "AVERAGE(number1, number2, ...)",
    example: "AVERAGE(10, 20, 30) = 20",
    params: [
      { name: "number1", type: "number", required: true, description: "First number" },
      { name: "number2", type: "number", required: false, description: "Additional numbers" },
    ],
  },
  {
    name: "MAX",
    category: "Numeric",
    description: "Returns the largest value among the given numbers.",
    syntax: "MAX(number1, number2, ...)",
    example: "MAX(10, 50, 30) = 50",
    params: [
      { name: "number1", type: "number", required: true, description: "First number" },
      { name: "number2", type: "number", required: false, description: "Additional numbers" },
    ],
  },
  {
    name: "MIN",
    category: "Numeric",
    description: "Returns the smallest value among the given numbers.",
    syntax: "MIN(number1, number2, ...)",
    example: "MIN(10, 50, 30) = 10",
    params: [
      { name: "number1", type: "number", required: true, description: "First number" },
      { name: "number2", type: "number", required: false, description: "Additional numbers" },
    ],
  },
  {
    name: "COUNT",
    category: "Numeric",
    description: "Counts the number of numeric values.",
    syntax: "COUNT(value1, value2, ...)",
    example: "COUNT(1, 'text', 3) = 2",
    params: [
      { name: "value1", type: "any", required: true, description: "First value" },
      { name: "value2", type: "any", required: false, description: "Additional values" },
    ],
  },
  {
    name: "COUNTA",
    category: "Numeric",
    description: "Counts the number of non-empty values.",
    syntax: "COUNTA(value1, value2, ...)",
    example: "COUNTA('a', '', 'c') = 2",
    params: [
      { name: "value1", type: "any", required: true, description: "First value" },
      { name: "value2", type: "any", required: false, description: "Additional values" },
    ],
  },
  {
    name: "ROUND",
    category: "Numeric",
    description: "Rounds a number to the specified number of decimal places.",
    syntax: "ROUND(number, precision)",
    example: "ROUND(3.14159, 2) = 3.14",
    params: [
      { name: "number", type: "number", required: true, description: "Number to round" },
      { name: "precision", type: "number", required: true, description: "Decimal places" },
    ],
  },
  {
    name: "ABS",
    category: "Numeric",
    description: "Returns the absolute value of a number.",
    syntax: "ABS(number)",
    example: "ABS(-5) = 5",
    params: [
      { name: "number", type: "number", required: true, description: "Number" },
    ],
  },
  {
    name: "CEIL",
    category: "Numeric",
    description: "Rounds a number up to the nearest integer.",
    syntax: "CEIL(number)",
    example: "CEIL(3.2) = 4",
    params: [
      { name: "number", type: "number", required: true, description: "Number to round up" },
    ],
  },
  {
    name: "FLOOR",
    category: "Numeric",
    description: "Rounds a number down to the nearest integer.",
    syntax: "FLOOR(number)",
    example: "FLOOR(3.8) = 3",
    params: [
      { name: "number", type: "number", required: true, description: "Number to round down" },
    ],
  },
  {
    name: "MOD",
    category: "Numeric",
    description: "Returns the remainder after dividing one number by another.",
    syntax: "MOD(number, divisor)",
    example: "MOD(10, 3) = 1",
    params: [
      { name: "number", type: "number", required: true, description: "Dividend" },
      { name: "divisor", type: "number", required: true, description: "Divisor" },
    ],
  },
  {
    name: "POWER",
    category: "Numeric",
    description: "Raises a number to the specified power.",
    syntax: "POWER(base, exponent)",
    example: "POWER(2, 3) = 8",
    params: [
      { name: "base", type: "number", required: true, description: "Base number" },
      { name: "exponent", type: "number", required: true, description: "Exponent" },
    ],
  },
  {
    name: "SQRT",
    category: "Numeric",
    description: "Returns the square root of a number.",
    syntax: "SQRT(number)",
    example: "SQRT(16) = 4",
    params: [
      { name: "number", type: "number", required: true, description: "Number" },
    ],
  },
  {
    name: "CONCATENATE",
    category: "Text",
    description: "Joins multiple text values into one string.",
    syntax: "CONCATENATE(text1, text2, ...)",
    example: 'CONCATENATE("Hello", " ", "World") = "Hello World"',
    params: [
      { name: "text1", type: "string", required: true, description: "First text" },
      { name: "text2", type: "string", required: false, description: "Additional text" },
    ],
  },
  {
    name: "UPPER",
    category: "Text",
    description: "Converts text to uppercase.",
    syntax: "UPPER(text)",
    example: 'UPPER("hello") = "HELLO"',
    params: [
      { name: "text", type: "string", required: true, description: "Text to convert" },
    ],
  },
  {
    name: "LOWER",
    category: "Text",
    description: "Converts text to lowercase.",
    syntax: "LOWER(text)",
    example: 'LOWER("HELLO") = "hello"',
    params: [
      { name: "text", type: "string", required: true, description: "Text to convert" },
    ],
  },
  {
    name: "LEN",
    category: "Text",
    description: "Returns the number of characters in a text string.",
    syntax: "LEN(text)",
    example: 'LEN("Hello") = 5',
    params: [
      { name: "text", type: "string", required: true, description: "Text string" },
    ],
  },
  {
    name: "LEFT",
    category: "Text",
    description: "Returns the specified number of characters from the start of a text string.",
    syntax: "LEFT(text, count)",
    example: 'LEFT("Hello", 3) = "Hel"',
    params: [
      { name: "text", type: "string", required: true, description: "Source text" },
      { name: "count", type: "number", required: true, description: "Number of characters" },
    ],
  },
  {
    name: "RIGHT",
    category: "Text",
    description: "Returns the specified number of characters from the end of a text string.",
    syntax: "RIGHT(text, count)",
    example: 'RIGHT("Hello", 3) = "llo"',
    params: [
      { name: "text", type: "string", required: true, description: "Source text" },
      { name: "count", type: "number", required: true, description: "Number of characters" },
    ],
  },
  {
    name: "MID",
    category: "Text",
    description: "Returns a specific number of characters from a text string, starting at a given position.",
    syntax: "MID(text, start, count)",
    example: 'MID("Hello World", 7, 5) = "World"',
    params: [
      { name: "text", type: "string", required: true, description: "Source text" },
      { name: "start", type: "number", required: true, description: "Start position (1-based)" },
      { name: "count", type: "number", required: true, description: "Number of characters" },
    ],
  },
  {
    name: "FIND",
    category: "Text",
    description: "Returns the position of a substring within text. Returns 0 if not found.",
    syntax: "FIND(search, text)",
    example: 'FIND("World", "Hello World") = 7',
    params: [
      { name: "search", type: "string", required: true, description: "Text to find" },
      { name: "text", type: "string", required: true, description: "Text to search in" },
    ],
  },
  {
    name: "SUBSTITUTE",
    category: "Text",
    description: "Replaces occurrences of a substring with a new string.",
    syntax: "SUBSTITUTE(text, old_text, new_text)",
    example: 'SUBSTITUTE("Hello World", "World", "Earth") = "Hello Earth"',
    params: [
      { name: "text", type: "string", required: true, description: "Source text" },
      { name: "old_text", type: "string", required: true, description: "Text to replace" },
      { name: "new_text", type: "string", required: true, description: "Replacement text" },
    ],
  },
  {
    name: "TRIM",
    category: "Text",
    description: "Removes leading and trailing whitespace from text.",
    syntax: "TRIM(text)",
    example: 'TRIM("  Hello  ") = "Hello"',
    params: [
      { name: "text", type: "string", required: true, description: "Text to trim" },
    ],
  },
  {
    name: "TEXT",
    category: "Text",
    description: "Converts a value to text.",
    syntax: "TEXT(value)",
    example: "TEXT(123) = \"123\"",
    params: [
      { name: "value", type: "any", required: true, description: "Value to convert" },
    ],
  },
  {
    name: "IF",
    category: "Logical",
    description: "Returns one value if a condition is true, and another value if it's false.",
    syntax: "IF(condition, value_if_true, value_if_false)",
    example: 'IF(10 > 5, "Yes", "No") = "Yes"',
    params: [
      { name: "condition", type: "boolean", required: true, description: "Condition to evaluate" },
      { name: "value_if_true", type: "any", required: true, description: "Value when true" },
      { name: "value_if_false", type: "any", required: true, description: "Value when false" },
    ],
  },
  {
    name: "AND",
    category: "Logical",
    description: "Returns true if all arguments are true.",
    syntax: "AND(condition1, condition2, ...)",
    example: "AND(true, true, false) = false",
    params: [
      { name: "condition1", type: "boolean", required: true, description: "First condition" },
      { name: "condition2", type: "boolean", required: false, description: "Additional conditions" },
    ],
  },
  {
    name: "OR",
    category: "Logical",
    description: "Returns true if any argument is true.",
    syntax: "OR(condition1, condition2, ...)",
    example: "OR(true, false) = true",
    params: [
      { name: "condition1", type: "boolean", required: true, description: "First condition" },
      { name: "condition2", type: "boolean", required: false, description: "Additional conditions" },
    ],
  },
  {
    name: "NOT",
    category: "Logical",
    description: "Returns the opposite boolean value.",
    syntax: "NOT(value)",
    example: "NOT(true) = false",
    params: [
      { name: "value", type: "boolean", required: true, description: "Value to negate" },
    ],
  },
  {
    name: "SWITCH",
    category: "Logical",
    description: "Evaluates an expression against a list of values and returns a corresponding result.",
    syntax: "SWITCH(expression, pattern1, result1, ..., default)",
    example: 'SWITCH(Status, "Active", "Green", "Inactive", "Red", "Gray")',
    params: [
      { name: "expression", type: "any", required: true, description: "Value to match" },
      { name: "pattern1", type: "any", required: true, description: "First pattern" },
      { name: "result1", type: "any", required: true, description: "Result for first pattern" },
      { name: "default", type: "any", required: false, description: "Default result" },
    ],
  },
  {
    name: "BLANK",
    category: "Logical",
    description: "Returns an empty value (null). Useful for clearing fields or conditional checks.",
    syntax: "BLANK()",
    example: "IF(Name = BLANK(), \"No name\", Name)",
    params: [],
  },
  {
    name: "NOW",
    category: "Date",
    description: "Returns the current date and time.",
    syntax: "NOW()",
    example: "NOW() = 2025-02-26T12:00:00",
    params: [],
  },
  {
    name: "TODAY",
    category: "Date",
    description: "Returns today's date (without time).",
    syntax: "TODAY()",
    example: "TODAY() = 2025-02-26",
    params: [],
  },
];

export function getFunctionsByCategory(category: string): FormulaFunctionDef[] {
  return FORMULA_FUNCTIONS.filter((f) => f.category === category);
}

export function getFunctionByName(name: string): FormulaFunctionDef | undefined {
  return FORMULA_FUNCTIONS.find((f) => f.name.toLowerCase() === name.toLowerCase());
}

export const FORMULA_EXAMPLES = [
  "Amount * Price",
  "AVERAGE(Field1, Field2)",
  'IF(Price > 5, "Yes", "No")',
  'UPPER(Name) & " - " & Status',
  "SUM(Q1, Q2, Q3, Q4)",
  'CONCATENATE(First, " ", Last)',
];

export const ARITHMETIC_OPERATORS = ["+", "-", "*", "/"] as const;
export const COMPARISON_OPERATORS = ["=", "!=", ">", "<", ">=", "<="] as const;
export const LOGICAL_OPERATORS = ["&"] as const;
