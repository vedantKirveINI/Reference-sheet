import {
  getFieldTypeConfig,
  getAllKeysWithLabels,
  FieldKeyConfig,
} from "./field-type-registry";
import { QuestionType } from "./questionType";

export interface LabeledValue {
  [label: string]: unknown;
}

export interface KeyedValue {
  [key: string]: unknown;
}

export const convertKeysToLabels = (
  fieldType: QuestionType | string,
  value: KeyedValue
): LabeledValue => {
  const config = getFieldTypeConfig(fieldType);
  if (!config || typeof value !== "object" || value === null) {
    return value as LabeledValue;
  }

  const allKeys = getAllKeysWithLabels(fieldType);
  const keyToLabelMap: Record<string, string> = {};
  allKeys.forEach((k) => {
    keyToLabelMap[k.key] = k.label;
  });

  const result: LabeledValue = {};
  Object.entries(value).forEach(([key, val]) => {
    const label = keyToLabelMap[key] || key;
    result[label] = val;
  });

  return result;
};

export const convertLabelsToKeys = (
  fieldType: QuestionType | string,
  value: LabeledValue
): KeyedValue => {
  const config = getFieldTypeConfig(fieldType);
  if (!config || typeof value !== "object" || value === null) {
    return value as KeyedValue;
  }

  const allKeys = getAllKeysWithLabels(fieldType);
  const labelToKeyMap: Record<string, string> = {};
  allKeys.forEach((k) => {
    labelToKeyMap[k.label.toLowerCase()] = k.key;
  });

  const result: KeyedValue = {};
  Object.entries(value).forEach(([label, val]) => {
    const key = labelToKeyMap[label.toLowerCase()] || label;
    result[key] = val;
  });

  return result;
};

export const getKeyConfigByLabel = (
  fieldType: QuestionType | string,
  label: string
): FieldKeyConfig | undefined => {
  const allKeys = getAllKeysWithLabels(fieldType);
  return allKeys.find((k) => k.label.toLowerCase() === label.toLowerCase());
};

export const getKeyConfigByKey = (
  fieldType: QuestionType | string,
  key: string
): FieldKeyConfig | undefined => {
  const allKeys = getAllKeysWithLabels(fieldType);
  return allKeys.find((k) => k.key === key);
};

export const createEmptyValueForType = (
  fieldType: QuestionType | string
): unknown => {
  const config = getFieldTypeConfig(fieldType);
  if (!config) return "";

  switch (config.dataStructure) {
    case "primitive":
      return "";
    case "object": {
      const obj: Record<string, string> = {};
      config.keys?.forEach((k) => {
        obj[k.key] = "";
      });
      return obj;
    }
    case "array":
      return [];
    case "arrayOfObjects":
      return [];
    default:
      return "";
  }
};

export const getPlaceholderForKey = (
  fieldType: QuestionType | string,
  key: string
): string => {
  const keyConfig = getKeyConfigByKey(fieldType, key);
  return keyConfig?.placeholder || "";
};

export const getDescriptionForKey = (
  fieldType: QuestionType | string,
  key: string
): string => {
  const keyConfig = getKeyConfigByKey(fieldType, key);
  return keyConfig?.description || "";
};

export const isKeyRequired = (
  fieldType: QuestionType | string,
  key: string
): boolean => {
  const keyConfig = getKeyConfigByKey(fieldType, key);
  return keyConfig?.required || false;
};
