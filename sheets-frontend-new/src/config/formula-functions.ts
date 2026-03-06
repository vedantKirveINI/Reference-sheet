// =============================================================================
// Formula Functions Registry
// =============================================================================
// This is the SINGLE SOURCE OF TRUTH for every formula function the app
// supports. To add a new function, add one entry to FORMULA_FUNCTIONS below.
// Every other part of the system (UI panel, validator, tokenizer, tooltips)
// derives its behaviour from this config automatically.
// =============================================================================

// -----------------------------------------------------------------------------
// Primitive types
// -----------------------------------------------------------------------------

/** The set of primitive data types that formula arguments and return values use. */
export type PrimitiveType = 'string' | 'number' | 'boolean' | 'any';

/**
 * The broad category of column that a function argument accepts as input.
 * Used by the UI to visually hint which fields are valid drops for a given arg.
 *   'text'    — string / long-text / single-select / multi-select columns
 *   'numeric' — number / currency columns
 *   'any'     — any column type is accepted
 */
export type FieldInputCategory = 'text' | 'numeric' | 'any';

/** Display categories used to group functions in the UI. */
export type FormulaCategory = 'Text' | 'Math';

// -----------------------------------------------------------------------------
// Argument descriptor
// -----------------------------------------------------------------------------

export interface FormulaArg {
  /** Argument placeholder shown in function signatures and insert templates. */
  name: string;

  /** Expected primitive type of this argument's value. */
  type: PrimitiveType;

  /** Whether this argument must be supplied for the call to be valid. */
  required: boolean;

  /**
   * If true, this argument may be repeated any number of times.
   * Only one variadic arg is allowed and it must be the last in the array.
   */
  variadic?: boolean;

  /**
   * Human-readable description of what this argument represents,
   * displayed in the hover tooltip argument breakdown.
   */
  description: string;

  /**
   * Which column categories are valid as input for this argument.
   * Used by the UI to highlight compatible fields in the Fields panel.
   */
  acceptedFieldCategories: FieldInputCategory[];
}

// -----------------------------------------------------------------------------
// Function descriptor
// -----------------------------------------------------------------------------

export interface FormulaDef {
  /** Lowercase function name as it appears in expression syntax. */
  name: string;

  /** UI grouping; determines which section of the Functions panel it appears in. */
  category: FormulaCategory;

  /** One-sentence summary shown in the function list row. */
  description: string;

  /**
   * Ordered argument descriptors.
   * Minimum and maximum arg counts are derived from this array automatically
   * via getArgBounds() — do not duplicate that information elsewhere.
   */
  args: FormulaArg[];

  /** The primitive type this function produces when evaluated. */
  returnType: PrimitiveType;

  /**
   * The snippet inserted into the expression when the user clicks this function.
   * Use argument names as placeholders (e.g. "concatenate(text1, text2)").
   */
  template: string;

  /** A concrete example expression shown in the hover tooltip. */
  example?: string;
}

// -----------------------------------------------------------------------------
// Computed bounds helper
// -----------------------------------------------------------------------------

/**
 * Derives the minimum and maximum valid argument counts for a function
 * directly from its args descriptor — no manual maintenance needed.
 *
 *   min  = number of required args
 *   max  = total args when no variadic arg exists, null when variadic (unlimited)
 *
 * Used by the validator so argument-count rules never drift from the config.
 */
export function getArgBounds(fn: FormulaDef): { min: number; max: number | null } {
  const min = fn.args.filter(a => a.required).length;
  const hasVariadic = fn.args.some(a => a.variadic);
  const max = hasVariadic ? null : fn.args.length;
  return { min, max };
}

// -----------------------------------------------------------------------------
// Function registry
// =============================================================================
// ADD A FUNCTION HERE — that's all you ever need to do.
// The UI panel, validator, tokenizer, and tooltip all update automatically.
// -----------------------------------------------------------------------------

export const FORMULA_FUNCTIONS: FormulaDef[] = [
  // ── Text ───────────────────────────────────────────────────────────────────
  {
    name: 'concatenate',
    category: 'Text',
    description: 'Joins two or more values into a single text string.',
    args: [
      {
        name: 'text1',
        type: 'string',
        required: true,
        description: 'First value to include in the joined string.',
        acceptedFieldCategories: ['any'],
      },
      {
        name: 'text2',
        type: 'string',
        required: false,
        variadic: true,
        description: 'Additional values to join — repeat as many times as needed.',
        acceptedFieldCategories: ['any'],
      },
    ],
    returnType: 'string',
    template: 'concatenate(text1, text2)',
    example: 'concatenate({first_name}, " ", {last_name})',
  },
  {
    name: 'lower',
    category: 'Text',
    description: 'Converts all characters in a text value to lowercase.',
    args: [
      {
        name: 'string',
        type: 'string',
        required: true,
        description: 'The text value to convert to lowercase.',
        acceptedFieldCategories: ['text'],
      },
    ],
    returnType: 'string',
    template: 'lower(string)',
    example: 'lower({email})',
  },
  {
    name: 'upper',
    category: 'Text',
    description: 'Converts all characters in a text value to uppercase.',
    args: [
      {
        name: 'string',
        type: 'string',
        required: true,
        description: 'The text value to convert to uppercase.',
        acceptedFieldCategories: ['text'],
      },
    ],
    returnType: 'string',
    template: 'upper(string)',
    example: 'upper({product_name})',
  },

  // ── Math ───────────────────────────────────────────────────────────────────
  {
    name: 'average',
    category: 'Math',
    description: 'Returns the arithmetic mean of one or more numeric values.',
    args: [
      {
        name: 'number1',
        type: 'number',
        required: true,
        description: 'First numeric value included in the average.',
        acceptedFieldCategories: ['numeric'],
      },
      {
        name: 'number2',
        type: 'number',
        required: false,
        variadic: true,
        description: 'Additional numeric values — repeat as many times as needed.',
        acceptedFieldCategories: ['numeric'],
      },
    ],
    returnType: 'number',
    template: 'average(number1, number2)',
    example: 'average({unit_price}, {quantity})',
  },
];

// -----------------------------------------------------------------------------
// Derived exports
// All of these are computed from FORMULA_FUNCTIONS — never edit them manually.
// -----------------------------------------------------------------------------

/** UI category labels in display order. */
export const FORMULA_CATEGORIES: FormulaCategory[] = ['Text', 'Math'];

/**
 * O(1) lookup map: lowercase function name → FormulaDef.
 * Use this wherever you need to find a function by name at runtime.
 */
export const FORMULA_REGISTRY = new Map<string, FormulaDef>(
  FORMULA_FUNCTIONS.map(f => [f.name.toLowerCase(), f]),
);

/** Set of all supported function names (lowercase) for fast membership checks. */
export const FORMULA_FUNCTION_NAMES = new Set(FORMULA_REGISTRY.keys());

/** Returns all functions belonging to a given category. */
export function getFunctionsByCategory(category: FormulaCategory): FormulaDef[] {
  return FORMULA_FUNCTIONS.filter(f => f.category === category);
}

/** Returns the FormulaDef for a name (case-insensitive), or undefined if unknown. */
export function getFunctionByName(name: string): FormulaDef | undefined {
  return FORMULA_REGISTRY.get(name.toLowerCase());
}
