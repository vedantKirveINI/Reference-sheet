import { isEmpty } from "lodash";

type ValueType = "any" | "string" | "number" | "boolean" | "int" | "object" | "array";

const validateValueType = (value: unknown, expectedType: ValueType): boolean => {
  if (expectedType === "any") return true;
  
  if (value === null || value === undefined) return true;
  
  switch (expectedType) {
    case "string":
      return typeof value === "string";
    case "number":
      if (typeof value === "number") return true;
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        return !isNaN(parsed);
      }
      return false;
    case "int":
      if (typeof value === "number") return Number.isInteger(value);
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        return !isNaN(parsed) && Number.isInteger(parsed);
      }
      return false;
    case "boolean":
      return typeof value === "boolean" || value === "true" || value === "false";
    case "object":
      if (typeof value === "object" && !Array.isArray(value)) return true;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
        } catch {
          return false;
        }
      }
      return false;
    case "array":
      if (Array.isArray(value)) return true;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      }
      return false;
    default:
      return true;
  }
};

export const formulaBarValidation = (answer, node): string => {
  let error = "";
  const answerObj = answer[node?._id];

  if (
    answerObj === undefined ||
    isEmpty(answerObj["response"]) ||
    isEmpty(answerObj["response"]?.blocks)
  ) {
    if (node?.config?.settings?.required) {
      error = "This field is required";
    }
  }

  if (node?.config?.settings?.regex) {
    if (!answerObj?.response?.blocks?.length) return error;
    const blocks = answerObj?.response?.blocks || [];

    if (blocks.find((block) => block?.type === "NODE")) return error;

    const regex = new RegExp(node?.config?.settings?.regex?.value);
    const value = blocks[0]?.value || "";

    if (!regex.test(value)) {
      error = node?.config?.settings?.regex?.error;
    }
  }

  const valueType: ValueType = node?.config?.settings?.valueType || "any";
  if (valueType !== "any" && !error) {
    const blocks = answerObj?.response?.blocks || [];
    const primitiveBlocks = blocks.filter((block) => block?.type === "PRIMITIVES");
    
    for (const block of primitiveBlocks) {
      if (!validateValueType(block?.value, valueType)) {
        error = `Expected ${valueType} value`;
        break;
      }
    }
  }

  return error;
};
