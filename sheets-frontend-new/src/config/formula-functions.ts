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
    description: 'Joins two or more text values into one string.',
    args: [{ name: 'text1', type: 'string', required: true }, { name: 'text2', type: 'string', required: false, variadic: true }],
    returnType: 'string',
    template: 'concatenate(text1, text2)',
    example: 'concatenate({first_name}, " ", {last_name})',
  },
  {
    name: 'lower',
    category: 'Text',
    description: 'Converts all characters in a string to lowercase.',
    args: [{ name: 'string', type: 'string', required: true }],
    returnType: 'string',
    template: 'lower(string)',
    example: 'lower({email})',
  },
  {
    name: 'upper',
    category: 'Text',
    description: 'Converts all characters in a string to uppercase.',
    args: [{ name: 'string', type: 'string', required: true }],
    returnType: 'string',
    template: 'upper(string)',
    example: 'upper({product_name})',
  },
  {
    name: 'trim',
    category: 'Text',
    description: 'Strips leading and trailing whitespace from a string.',
    args: [{ name: 'string', type: 'string', required: true }],
    returnType: 'string',
    template: 'trim(string)',
    example: 'trim({notes})',
  },
  {
    name: 'left',
    category: 'Text',
    description: 'Returns the first N characters from the start of a string.',
    args: [{ name: 'string', type: 'string', required: true }, { name: 'count', type: 'number', required: true }],
    returnType: 'string',
    template: 'left(string, count)',
    example: 'left({product_name}, 3)',
  },
  {
    name: 'right',
    category: 'Text',
    description: 'Returns the last N characters from the end of a string.',
    args: [{ name: 'string', type: 'string', required: true }, { name: 'count', type: 'number', required: true }],
    returnType: 'string',
    template: 'right(string, count)',
    example: 'right({product_name}, 3)',
  },
  {
    name: 'mid',
    category: 'Text',
    description: 'Extracts a substring from start to end index (zero-based).',
    args: [{ name: 'string', type: 'string', required: true }, { name: 'start', type: 'number', required: true }, { name: 'end', type: 'number', required: true }],
    returnType: 'string',
    template: 'mid(string, start, end)',
    example: 'mid({product_name}, 0, 5)',
  },
  {
    name: 'len',
    category: 'Text',
    description: 'Returns the number of characters in a string.',
    args: [{ name: 'string', type: 'string', required: true }],
    returnType: 'number',
    template: 'len(string)',
    example: 'len({notes})',
  },
  {
    name: 'substitute',
    category: 'Text',
    description: 'Replaces every occurrence of old_text with new_text.',
    args: [{ name: 'string', type: 'string', required: true }, { name: 'old_text', type: 'string', required: true }, { name: 'new_text', type: 'string', required: true }],
    returnType: 'string',
    template: 'substitute(string, old_text, new_text)',
    example: 'substitute({notes}, "Inc", "LLC")',
  },
  {
    name: 'sum',
    category: 'Math',
    description: 'Adds all numeric arguments together.',
    args: [{ name: 'number1', type: 'number', required: true }, { name: 'number2', type: 'number', required: false, variadic: true }],
    returnType: 'number',
    template: 'sum(number1, number2)',
    example: 'sum({unit_price}, {discount})',
  },
  {
    name: 'average',
    category: 'Math',
    description: 'Returns the arithmetic mean of all numeric arguments.',
    args: [{ name: 'number1', type: 'number', required: true }, { name: 'number2', type: 'number', required: false, variadic: true }],
    returnType: 'number',
    template: 'average(number1, number2)',
    example: 'average({q1}, {q2}, {q3})',
  },
  {
    name: 'round',
    category: 'Math',
    description: 'Rounds a number to a specified number of decimal places.',
    args: [{ name: 'number', type: 'number', required: true }, { name: 'decimals', type: 'number', required: true }],
    returnType: 'number',
    template: 'round(number, decimals)',
    example: 'round({unit_price}, 2)',
  },
  {
    name: 'abs',
    category: 'Math',
    description: 'Returns the absolute (non-negative) value of a number.',
    args: [{ name: 'number', type: 'number', required: true }],
    returnType: 'number',
    template: 'abs(number)',
    example: 'abs({balance})',
  },
  {
    name: 'max',
    category: 'Math',
    description: 'Returns the largest value among all arguments.',
    args: [{ name: 'number1', type: 'number', required: true }, { name: 'number2', type: 'number', required: false, variadic: true }],
    returnType: 'number',
    template: 'max(number1, number2)',
    example: 'max({q1}, {q2}, {q3})',
  },
  {
    name: 'min',
    category: 'Math',
    description: 'Returns the smallest value among all arguments.',
    args: [{ name: 'number1', type: 'number', required: true }, { name: 'number2', type: 'number', required: false, variadic: true }],
    returnType: 'number',
    template: 'min(number1, number2)',
    example: 'min({q1}, {q2}, {q3})',
  },
  {
    name: 'if',
    category: 'Logical',
    description: 'Returns one value when condition is true, another when false.',
    args: [{ name: 'condition', type: 'boolean', required: true }, { name: 'if_true', type: 'any', required: true }, { name: 'if_false', type: 'any', required: true }],
    returnType: 'any',
    template: 'if(condition, if_true, if_false)',
    example: 'if({status} = "Active", "Yes", "No")',
  },
  {
    name: 'and',
    category: 'Logical',
    description: 'Returns true only when every argument is true.',
    args: [{ name: 'expr1', type: 'boolean', required: true }, { name: 'expr2', type: 'boolean', required: false, variadic: true }],
    returnType: 'boolean',
    template: 'and(expr1, expr2)',
    example: 'and({active}, {verified})',
  },
  {
    name: 'or',
    category: 'Logical',
    description: 'Returns true when at least one argument is true.',
    args: [{ name: 'expr1', type: 'boolean', required: true }, { name: 'expr2', type: 'boolean', required: false, variadic: true }],
    returnType: 'boolean',
    template: 'or(expr1, expr2)',
    example: 'or({active}, {pending})',
  },
  {
    name: 'not',
    category: 'Logical',
    description: 'Returns the logical inverse of a boolean value.',
    args: [{ name: 'expr', type: 'boolean', required: true }],
    returnType: 'boolean',
    template: 'not(expr)',
    example: 'not({active})',
  },
];

export const FORMULA_CATEGORIES = ['Text', 'Math', 'Logical'] as const;

export function getFunctionsByCategory(category: string): FormulaFunction[] {
  return FORMULA_FUNCTIONS.filter(f => f.category === category);
}

export const FORMULA_FUNCTION_NAMES = new Set(FORMULA_FUNCTIONS.map(f => f.name));
