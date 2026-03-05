import { getFunctionInfo, getArgTypeAt, getFunctionsCompatibleWithArgType } from "./function-type-registry.js";

const FIELD_TYPE_FUNCTION_PRIORITIES = {
  string: ["concatenate", "upper", "lower", "trim", "left", "right", "mid", "replace", "split", "join", "length", "contains", "find"],
  text: ["concatenate", "upper", "lower", "trim", "left", "right", "mid", "replace", "split", "join", "length", "contains", "find"],
  number: ["add", "subtract", "multiply", "divide", "round", "floor", "ceil", "abs", "mod", "min", "max", "sum", "average"],
  int: ["add", "subtract", "multiply", "divide", "round", "floor", "ceil", "abs", "mod", "min", "max", "sum"],
  boolean: ["if", "and", "or", "not", "isequal", "isempty", "isnumber", "istext"],
  date: ["formatdate", "now", "today", "adddays", "addmonths", "addyears", "datediff", "datepart", "year", "month", "day"],
  datetime: ["formatdate", "now", "today", "adddays", "addmonths", "addyears", "datediff", "datepart", "year", "month", "day", "hour", "minute", "second"],
  array: ["first", "last", "nth", "count", "join", "map", "filter", "sort", "reverse", "unique", "flatten", "slice"],
  object: ["get", "keys", "values", "entries", "merge", "has"],
};

const CONTEXT_FUNCTION_PRIORITIES = {
  inTextFunction: ["upper", "lower", "trim", "left", "right", "mid", "replace", "length", "concatenate"],
  inMathFunction: ["add", "subtract", "multiply", "divide", "round", "floor", "ceil", "abs", "mod"],
  inLogicalFunction: ["if", "and", "or", "not", "isequal", "isempty"],
  inDateFunction: ["formatdate", "now", "today", "adddays", "datediff"],
  inArrayFunction: ["first", "last", "nth", "count", "map", "filter"],
};

const RECENT_STORAGE_KEY = "formula-fx-smart-recent";
const MAX_RECENT_FUNCTIONS = 5;

let recentFunctions = [];

try {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(RECENT_STORAGE_KEY);
    if (stored) {
      recentFunctions = JSON.parse(stored);
    }
  }
} catch (e) {}

export function trackFunctionUsage(functionName) {
  if (!functionName) return;

  const nameLower = functionName.toLowerCase();
  
  recentFunctions = recentFunctions.filter(f => f !== nameLower);
  recentFunctions.unshift(nameLower);
  recentFunctions = recentFunctions.slice(0, MAX_RECENT_FUNCTIONS);

  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentFunctions));
    }
  } catch (e) {}
}

export function getRecentFunctions() {
  return [...recentFunctions];
}

export function detectCurrentContext(content, cursorPosition) {
  if (!content || content.length === 0) {
    return { context: null, lastFunctionType: null };
  }

  let openParenCount = 0;
  let lastOpenFunction = null;

  for (let i = 0; i < content.length; i++) {
    const block = content[i];
    if (!block) continue;

    if (block.type === "FUNCTIONS" || block.subCategory === "FUNCTIONS") {
      lastOpenFunction = block;
    }

    if (block.value === "(") {
      openParenCount++;
    } else if (block.value === ")") {
      openParenCount--;
      if (openParenCount <= 0) {
        lastOpenFunction = null;
      }
    }
  }

  if (lastOpenFunction && openParenCount > 0) {
    const funcName = (lastOpenFunction.value || lastOpenFunction.displayValue || "").toLowerCase();
    
    const textFunctions = ["concatenate", "upper", "lower", "trim", "left", "right", "mid", "replace", "split", "join", "length", "contains", "find", "substitute"];
    const mathFunctions = ["add", "subtract", "multiply", "divide", "round", "floor", "ceil", "abs", "mod", "min", "max", "sum", "average", "power", "sqrt"];
    const logicalFunctions = ["if", "and", "or", "not", "switch", "isequal", "isempty", "isnumber", "istext", "isblank"];
    const dateFunctions = ["formatdate", "now", "today", "adddays", "addmonths", "addyears", "datediff", "datepart", "year", "month", "day"];
    const arrayFunctions = ["first", "last", "nth", "count", "map", "filter", "sort", "reverse", "unique", "flatten", "slice", "join"];

    if (textFunctions.includes(funcName)) {
      return { context: "inTextFunction", lastFunctionType: "text" };
    }
    if (mathFunctions.includes(funcName)) {
      return { context: "inMathFunction", lastFunctionType: "number" };
    }
    if (logicalFunctions.includes(funcName)) {
      return { context: "inLogicalFunction", lastFunctionType: "boolean" };
    }
    if (dateFunctions.includes(funcName)) {
      return { context: "inDateFunction", lastFunctionType: "date" };
    }
    if (arrayFunctions.includes(funcName)) {
      return { context: "inArrayFunction", lastFunctionType: "array" };
    }
  }

  return { context: null, lastFunctionType: null };
}

export function sortFunctionsByRelevance(functions, options = {}) {
  const {
    expectedType = "any",
    currentContext = null,
    searchText = "",
  } = options;

  if (!functions || functions.length === 0) {
    return functions;
  }

  const priorityMap = new Map();

  functions.forEach((fn, index) => {
    const name = (fn.value || fn.displayValue || fn.name || "").toLowerCase();
    let score = 0;

    const recentIndex = recentFunctions.indexOf(name);
    if (recentIndex !== -1) {
      score += (MAX_RECENT_FUNCTIONS - recentIndex) * 10;
    }

    if (expectedType && expectedType !== "any") {
      const typePriorities = FIELD_TYPE_FUNCTION_PRIORITIES[expectedType.toLowerCase()];
      if (typePriorities) {
        const priorityIndex = typePriorities.indexOf(name);
        if (priorityIndex !== -1) {
          score += (typePriorities.length - priorityIndex) * 5;
        }
      }
    }

    if (currentContext) {
      const contextPriorities = CONTEXT_FUNCTION_PRIORITIES[currentContext];
      if (contextPriorities) {
        const priorityIndex = contextPriorities.indexOf(name);
        if (priorityIndex !== -1) {
          score += (contextPriorities.length - priorityIndex) * 3;
        }
      }
    }

    if (searchText) {
      const query = searchText.toLowerCase();
      if (name === query) {
        score += 100;
      } else if (name.startsWith(query)) {
        score += 50;
      } else if (name.includes(query)) {
        score += 20;
      }
    }

    priorityMap.set(fn, score);
  });

  return [...functions].sort((a, b) => {
    const scoreA = priorityMap.get(a) || 0;
    const scoreB = priorityMap.get(b) || 0;
    
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    
    const nameA = (a.value || a.displayValue || a.name || "").toLowerCase();
    const nameB = (b.value || b.displayValue || b.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

export function sortVariablesByRelevance(variables, options = {}) {
  const {
    expectedType = "any",
    searchText = "",
  } = options;

  if (!variables || variables.length === 0) {
    return variables;
  }

  return [...variables].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (expectedType && expectedType !== "any") {
      const typeA = (a.variableData?.type || "any").toLowerCase();
      const typeB = (b.variableData?.type || "any").toLowerCase();

      if (typeA === expectedType.toLowerCase()) scoreA += 20;
      if (typeB === expectedType.toLowerCase()) scoreB += 20;
    }

    if (searchText) {
      const query = searchText.toLowerCase();
      const nameA = (a.value || a.displayValue || a.name || "").toLowerCase();
      const nameB = (b.value || b.displayValue || b.name || "").toLowerCase();

      if (nameA.startsWith(query)) scoreA += 10;
      if (nameB.startsWith(query)) scoreB += 10;
    }

    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    const nameA = (a.value || a.displayValue || a.name || "").toLowerCase();
    const nameB = (b.value || b.displayValue || b.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

export function sortItemsByRelevance(items, options = {}) {
  const {
    expectedType = "any",
    currentContext = null,
    searchText = "",
    content = [],
  } = options;

  if (!items || items.length === 0) {
    return items;
  }

  const context = currentContext || detectCurrentContext(content).context;

  const functions = items.filter(item => 
    item.section === "functions" || 
    item.subCategory === "FUNCTIONS" ||
    item.type === "FUNCTIONS"
  );
  
  const variables = items.filter(item => 
    item.section === "variables" || 
    item.subCategory === "NODE" ||
    item.subCategory === "LOCAL" ||
    item.subCategory === "GLOBAL" ||
    item.variableData
  );
  
  const others = items.filter(item => 
    !functions.includes(item) && !variables.includes(item)
  );

  const sortedFunctions = sortFunctionsByRelevance(functions, {
    expectedType,
    currentContext: context,
    searchText,
  });

  const sortedVariables = sortVariablesByRelevance(variables, {
    expectedType,
    searchText,
  });

  if (expectedType && expectedType !== "any") {
    const typeMatchesVariable = ["string", "text", "number", "int", "boolean", "date", "array", "object"].includes(expectedType.toLowerCase());
    
    if (typeMatchesVariable) {
      return [...sortedVariables, ...sortedFunctions, ...others];
    }
  }

  return [...sortedFunctions, ...sortedVariables, ...others];
}

export function getExpectedArgTypeAtCursor(content = [], cursorBlockIndex = -1) {
  if (!content || content.length === 0) {
    return { expectedType: "any", parentFunction: null, argIndex: 0 };
  }

  let parentFunction = null;
  let argIndex = 0;
  let parenDepth = 0;
  const functionStack = [];

  const effectiveIndex = cursorBlockIndex >= 0 ? cursorBlockIndex : content.length;

  for (let i = 0; i < effectiveIndex && i < content.length; i++) {
    const block = content[i];
    if (!block) continue;

    if (block.type === "FUNCTIONS" || block.subCategory === "FUNCTIONS") {
      functionStack.push({ name: block.value || block.displayValue, argIndex: 0 });
    }

    if (block.value === "(") {
      parenDepth++;
    } else if (block.value === ")") {
      parenDepth--;
      if (parenDepth >= 0 && functionStack.length > 0) {
        functionStack.pop();
      }
    } else if (block.value === "," && functionStack.length > 0) {
      functionStack[functionStack.length - 1].argIndex++;
    }
  }

  if (functionStack.length > 0) {
    const current = functionStack[functionStack.length - 1];
    parentFunction = current.name;
    argIndex = current.argIndex;
  }

  if (!parentFunction) {
    return { expectedType: "any", parentFunction: null, argIndex: 0 };
  }

  const expectedType = getArgTypeAt(parentFunction, argIndex);

  return {
    expectedType,
    parentFunction,
    argIndex,
  };
}

export function filterByExpectedType(items = [], expectedType = "any") {
  if (!expectedType || expectedType === "any" || !items?.length) {
    return items;
  }

  const typeLower = expectedType.toLowerCase();

  return items.filter((item) => {
    if (item.type === "FUNCTIONS" || item.subCategory === "FUNCTIONS") {
      const fnInfo = getFunctionInfo(item.value || item.displayValue);
      if (!fnInfo) return true;
      return fnInfo.returnType === typeLower || fnInfo.returnType === "any";
    }

    if (item.variableData?.type) {
      const varType = item.variableData.type.toLowerCase();
      return varType === typeLower || varType === "any" || typeLower === "any";
    }

    return true;
  });
}

export default {
  trackFunctionUsage,
  getRecentFunctions,
  detectCurrentContext,
  sortFunctionsByRelevance,
  sortVariablesByRelevance,
  sortItemsByRelevance,
  getExpectedArgTypeAtCursor,
  filterByExpectedType,
};
