// Regex to check if the input is a valid number format:
// - Optional '+' or '-' at the beginning
// - Digits with an optional single '.'
// - Allows unfinished decimal inputs (e.g., "5.", "-.")
export const VALID_NUMBER_REGEX = /^[+-]?\d*\.?\d*$/;

// Regex to allow intermediate values while typing:
// - Only '+' or '-' (user still typing a sign)
// - A number ending with '.' (user still typing decimal part)
export const INTERMEDIATE_NUMBER_REGEX = /^[+-]?$|^\d+\.$/;
