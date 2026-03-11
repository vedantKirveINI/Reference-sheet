import { arithmeticData } from "../data/arithmetic-data";
import { textData } from "../data/text-data";
import { logicalData } from "../data/logical-data";
import { dateData } from "../data/date-data";
import { arrayData } from "../data/array-data";
import { otherData } from "../data/other-data";
import { FUNCTIONS } from "../constants/types";

const CANONICAL_TYPES = {
  string: "string",
  text: "string",
  html: "string",
  xml: "string",
  number: "number",
  float: "number",
  double: "number",
  decimal: "number",
  int: "int",
  integer: "int",
  bool: "boolean",
  boolean: "boolean",
  object: "object",
  json: "object",
  array: "array",
  list: "array",
  date: "date",
  datetime: "date",
  any: "any",
};

function normalizeTypeName(type) {
  if (!type) return "any";
  const lower = String(type).toLowerCase();
  return CANONICAL_TYPES[lower] || "any";
}

function buildFunctionEntry(fn) {
  const args = (fn.args || []).map((arg, idx) => ({
    name: arg.name || `arg${idx}`,
    type: normalizeTypeName(arg.type),
    required: arg.required !== false,
    repeat: arg.repeat === true,
    description: arg.description || "",
  }));

  return {
    name: fn.value,
    displayName: fn.value,
    category: fn.category,
    description: fn.description || "",
    args,
    returnType: normalizeTypeName(fn.returnType),
    examples: fn.examples || [],
    minArgs: args.filter((a) => a.required && !a.repeat).length,
    maxArgs: args.some((a) => a.repeat) ? Infinity : args.length,
    hasVariadicArgs: args.some((a) => a.repeat),
  };
}

function extractFunctions(dataObj) {
  const functions = dataObj?.[FUNCTIONS] || [];
  return functions.map(buildFunctionEntry);
}

const allFunctions = [
  ...extractFunctions(arithmeticData),
  ...extractFunctions(textData),
  ...extractFunctions(logicalData),
  ...extractFunctions(dateData),
  ...extractFunctions(arrayData),
  ...extractFunctions(otherData),
];

const functionByName = new Map();
allFunctions.forEach((fn) => {
  const key = fn.name.toLowerCase();
  functionByName.set(key, fn);
});

export function getFunctionInfo(name) {
  if (!name) return null;
  return functionByName.get(name.toLowerCase()) || null;
}

export function getFunctionReturnType(name) {
  const fn = getFunctionInfo(name);
  return fn?.returnType || "any";
}

export function getFunctionArgs(name) {
  const fn = getFunctionInfo(name);
  return fn?.args || [];
}

export function getArgTypeAt(name, argIndex) {
  const args = getFunctionArgs(name);
  if (argIndex < 0) return "any";

  for (let i = 0; i < args.length; i++) {
    if (args[i].repeat) {
      return args[i].type;
    }
    if (i === argIndex) {
      return args[i].type;
    }
  }
  const lastArg = args[args.length - 1];
  if (lastArg?.repeat) {
    return lastArg.type;
  }
  return "any";
}

export function checkArgCount(name, providedCount) {
  const fn = getFunctionInfo(name);
  if (!fn) return { valid: true, message: null };

  if (providedCount < fn.minArgs) {
    return {
      valid: false,
      message: `${name}() requires at least ${fn.minArgs} argument(s), got ${providedCount}`,
    };
  }

  if (providedCount > fn.maxArgs && fn.maxArgs !== Infinity) {
    return {
      valid: false,
      message: `${name}() accepts at most ${fn.maxArgs} argument(s), got ${providedCount}`,
    };
  }

  return { valid: true, message: null };
}

export function getAllFunctions() {
  return [...allFunctions];
}

export function getFunctionsByReturnType(returnType) {
  const normalized = normalizeTypeName(returnType);
  if (normalized === "any") {
    return [...allFunctions];
  }
  return allFunctions.filter((fn) => fn.returnType === normalized);
}

export function getFunctionsByCategory(category) {
  return allFunctions.filter(
    (fn) => fn.category?.toLowerCase() === category?.toLowerCase()
  );
}

export function searchFunctions(query) {
  if (!query) return [...allFunctions];
  const lower = query.toLowerCase();
  return allFunctions.filter(
    (fn) =>
      fn.name.toLowerCase().includes(lower) ||
      fn.description?.toLowerCase().includes(lower)
  );
}

export function getFunctionsCompatibleWithArgType(expectedType) {
  const normalized = normalizeTypeName(expectedType);
  if (normalized === "any") {
    return [...allFunctions];
  }
  return allFunctions.filter(
    (fn) => fn.returnType === normalized || fn.returnType === "any"
  );
}

export { normalizeTypeName, CANONICAL_TYPES };
