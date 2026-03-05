export interface FormulaArg {
  name: string;
  type: string;
  required: boolean;
  variadic?: boolean;
}

export interface FormulaFunction {
  name: string;
  category: 'Text' | 'Math' | 'Logical' | 'Date';
  description: string;
  args: FormulaArg[];
  returnType: string;
  template: string;
  example?: string;
}

export const FORMULA_FUNCTIONS: FormulaFunction[] = [
  {
    name: 'concatenate',
    category: 'Text',
    description: 'Joins together the text arguments into a single text value.',
    args: [{ name: 'text1', type: 'string', required: true }, { name: 'text2', type: 'string', required: false, variadic: true }],
    returnType: 'string',
    template: 'concatenate(, )',
    example: 'concatenate({First Name}, " ", {Last Name})',
  },
  {
    name: 'lower',
    category: 'Text',
    description: 'Converts a string to lowercase.',
    args: [{ name: 'string', type: 'string', required: true }],
    returnType: 'string',
    template: 'lower()',
    example: 'lower({Email})',
  },
  {
    name: 'upper',
    category: 'Text',
    description: 'Converts a string to uppercase.',
    args: [{ name: 'string', type: 'string', required: true }],
    returnType: 'string',
    template: 'upper()',
    example: 'upper({Name})',
  },
  {
    name: 'trim',
    category: 'Text',
    description: 'Removes whitespace from the beginning and end of a string.',
    args: [{ name: 'string', type: 'string', required: true }],
    returnType: 'string',
    template: 'trim()',
    example: 'trim({Name})',
  },
  {
    name: 'left',
    category: 'Text',
    description: 'Extracts a given number of characters from the start of a string.',
    args: [{ name: 'string', type: 'string', required: true }, { name: 'count', type: 'number', required: true }],
    returnType: 'string',
    template: 'left(, )',
    example: 'left({Name}, 3)',
  },
  {
    name: 'right',
    category: 'Text',
    description: 'Extracts a given number of characters from the end of a string.',
    args: [{ name: 'string', type: 'string', required: true }, { name: 'count', type: 'number', required: true }],
    returnType: 'string',
    template: 'right(, )',
    example: 'right({Name}, 3)',
  },
  {
    name: 'mid',
    category: 'Text',
    description: 'Extracts a substring from a given start index to an end index (zero-based).',
    args: [{ name: 'string', type: 'string', required: true }, { name: 'start', type: 'number', required: true }, { name: 'end', type: 'number', required: true }],
    returnType: 'string',
    template: 'mid(, , )',
    example: 'mid({Name}, 0, 5)',
  },
  {
    name: 'len',
    category: 'Text',
    description: 'Returns the character length of a string.',
    args: [{ name: 'string', type: 'string', required: true }],
    returnType: 'number',
    template: 'len()',
    example: 'len({Name})',
  },
  {
    name: 'substitute',
    category: 'Text',
    description: 'Replaces all occurrences of old_text with new_text in a string.',
    args: [{ name: 'string', type: 'string', required: true }, { name: 'old_text', type: 'string', required: true }, { name: 'new_text', type: 'string', required: true }],
    returnType: 'string',
    template: 'substitute(, , )',
    example: 'substitute({Name}, "Inc", "LLC")',
  },
  {
    name: 'sum',
    category: 'Math',
    description: 'Returns the sum of all numeric arguments.',
    args: [{ name: 'number1', type: 'number', required: true }, { name: 'number2', type: 'number', required: false, variadic: true }],
    returnType: 'number',
    template: 'sum(, )',
    example: 'sum({Price}, {Tax})',
  },
  {
    name: 'average',
    category: 'Math',
    description: 'Returns the average of the given numeric arguments.',
    args: [{ name: 'number1', type: 'number', required: true }, { name: 'number2', type: 'number', required: false, variadic: true }],
    returnType: 'number',
    template: 'average(, )',
    example: 'average({Q1}, {Q2}, {Q3})',
  },
  {
    name: 'round',
    category: 'Math',
    description: 'Rounds a number to a given number of decimal places.',
    args: [{ name: 'number', type: 'number', required: true }, { name: 'decimals', type: 'number', required: true }],
    returnType: 'number',
    template: 'round(, )',
    example: 'round({Price}, 2)',
  },
  {
    name: 'abs',
    category: 'Math',
    description: 'Returns the absolute (non-negative) value of a number.',
    args: [{ name: 'number', type: 'number', required: true }],
    returnType: 'number',
    template: 'abs()',
    example: 'abs({Balance})',
  },
  {
    name: 'max',
    category: 'Math',
    description: 'Returns the largest value among all arguments.',
    args: [{ name: 'number1', type: 'number', required: true }, { name: 'number2', type: 'number', required: false, variadic: true }],
    returnType: 'number',
    template: 'max(, )',
    example: 'max({Q1}, {Q2}, {Q3})',
  },
  {
    name: 'min',
    category: 'Math',
    description: 'Returns the smallest value among all arguments.',
    args: [{ name: 'number1', type: 'number', required: true }, { name: 'number2', type: 'number', required: false, variadic: true }],
    returnType: 'number',
    template: 'min(, )',
    example: 'min({Q1}, {Q2}, {Q3})',
  },
  {
    name: 'if',
    category: 'Logical',
    description: 'Returns one value if a condition is true, another if false.',
    args: [{ name: 'condition', type: 'boolean', required: true }, { name: 'if_true', type: 'any', required: true }, { name: 'if_false', type: 'any', required: true }],
    returnType: 'any',
    template: 'if(, , )',
    example: 'if({Status} = "Active", "Yes", "No")',
  },
  {
    name: 'and',
    category: 'Logical',
    description: 'Returns true only if all arguments are true.',
    args: [{ name: 'expr1', type: 'boolean', required: true }, { name: 'expr2', type: 'boolean', required: false, variadic: true }],
    returnType: 'boolean',
    template: 'and(, )',
    example: 'and({Active}, {Verified})',
  },
  {
    name: 'or',
    category: 'Logical',
    description: 'Returns true if any argument is true.',
    args: [{ name: 'expr1', type: 'boolean', required: true }, { name: 'expr2', type: 'boolean', required: false, variadic: true }],
    returnType: 'boolean',
    template: 'or(, )',
    example: 'or({Active}, {Pending})',
  },
  {
    name: 'not',
    category: 'Logical',
    description: 'Returns the logical inverse of a boolean value.',
    args: [{ name: 'expr', type: 'boolean', required: true }],
    returnType: 'boolean',
    template: 'not()',
    example: 'not({Active})',
  },
];

export const FORMULA_CATEGORIES = ['Text', 'Math', 'Logical'] as const;

export function getFunctionsByCategory(category: string): FormulaFunction[] {
  return FORMULA_FUNCTIONS.filter(f => f.category === category);
}

export const FORMULA_FUNCTION_NAMES = new Set(FORMULA_FUNCTIONS.map(f => f.name));
