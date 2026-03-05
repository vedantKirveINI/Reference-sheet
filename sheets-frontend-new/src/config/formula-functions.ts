export interface FormulaArg {
  name: string;
  type: string;
  required: boolean;
  variadic?: boolean;
}

export interface FormulaFunction {
  name: string;
  category: 'Text' | 'Math';
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
    description: 'Joins two or more values into a single text string.',
    args: [
      { name: 'text1', type: 'string', required: true },
      { name: 'text2', type: 'string', required: false, variadic: true },
    ],
    returnType: 'string',
    template: 'concatenate(text1, text2)',
    example: 'concatenate({first_name}, " ", {last_name})',
  },
  {
    name: 'lower',
    category: 'Text',
    description: 'Converts all characters in a text value to lowercase.',
    args: [{ name: 'string', type: 'string', required: true }],
    returnType: 'string',
    template: 'lower(string)',
    example: 'lower({email})',
  },
  {
    name: 'upper',
    category: 'Text',
    description: 'Converts all characters in a text value to uppercase.',
    args: [{ name: 'string', type: 'string', required: true }],
    returnType: 'string',
    template: 'upper(string)',
    example: 'upper({product_name})',
  },
  {
    name: 'average',
    category: 'Math',
    description: 'Returns the arithmetic mean of one or more numeric field values.',
    args: [
      { name: 'number1', type: 'number', required: true },
      { name: 'number2', type: 'number', required: false, variadic: true },
    ],
    returnType: 'number',
    template: 'average(number1, number2)',
    example: 'average({unit_price}, {quantity})',
  },
];

export const FORMULA_CATEGORIES = ['Text', 'Math'] as const;

export function getFunctionsByCategory(category: string): FormulaFunction[] {
  return FORMULA_FUNCTIONS.filter(f => f.category === category);
}

export const FORMULA_FUNCTION_NAMES = new Set(FORMULA_FUNCTIONS.map(f => f.name));
