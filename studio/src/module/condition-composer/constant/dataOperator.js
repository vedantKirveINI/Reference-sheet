export const RHS_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DROPDOWN: 'dropdown',
  DATE: 'date',
  NONE: 'none',
  FORMULA: 'formula',
};

export const BOOLEAN_OPTIONS = [
  { value: true, label: 'True' },
  { value: false, label: 'False' },
];

export const getDataTypeOperator = (key) => {
  switch (key) {
    case "INT":
    case "NUMBER":
    case "RATING":
    case "OPINION_SCALE":
    case "SLIDER":
      return [
        { key: "=", value: "=", rhsType: RHS_TYPES.NUMBER },
        { key: "!=", value: "≠", rhsType: RHS_TYPES.NUMBER },
        { key: ">", value: ">", rhsType: RHS_TYPES.NUMBER },
        { key: "<", value: "<", rhsType: RHS_TYPES.NUMBER },
        { key: "<=", value: "≤", rhsType: RHS_TYPES.NUMBER },
        { key: ">=", value: "≥", rhsType: RHS_TYPES.NUMBER },
        { key: "is_null", value: "is empty", rhsType: RHS_TYPES.NONE },
        { key: "is_not_null", value: "is not empty", rhsType: RHS_TYPES.NONE },
      ];
    case "BOOLEAN":
    case "YES_NO":
      return [
        { key: "=", value: "is", rhsType: RHS_TYPES.DROPDOWN, dropdownOptions: BOOLEAN_OPTIONS },
        { key: "is_null", value: "is empty", rhsType: RHS_TYPES.NONE },
        { key: "is_not_null", value: "is not empty", rhsType: RHS_TYPES.NONE },
      ];
    case "DROP_DOWN_STATIC":
    case "MCQ":
      return [
        { key: "?|", value: "has any of", rhsType: RHS_TYPES.DROPDOWN, useFieldOptions: true },
        { key: "?|", value: "has none of", rhsType: RHS_TYPES.DROPDOWN, useFieldOptions: true },
        { key: "@>", value: "has all of", rhsType: RHS_TYPES.DROPDOWN, useFieldOptions: true },
        { key: "=", value: "is exactly", rhsType: RHS_TYPES.DROPDOWN, useFieldOptions: true },
        { key: "=", value: "is empty", rhsType: RHS_TYPES.NONE },
        { key: ">", value: "is not empty", rhsType: RHS_TYPES.NONE },
      ];
    case "DROP_DOWN":
      return [
        { key: "|", value: "has any of", rhsType: RHS_TYPES.DROPDOWN, useFieldOptions: true },
        { key: "!", value: "has none of", rhsType: RHS_TYPES.DROPDOWN, useFieldOptions: true },
        { key: "&", value: "has all of", rhsType: RHS_TYPES.DROPDOWN, useFieldOptions: true },
        { key: "==", value: "is exactly", rhsType: RHS_TYPES.DROPDOWN, useFieldOptions: true },
        { key: "[]", value: "is empty", rhsType: RHS_TYPES.NONE },
        { key: "[*]", value: "is not empty", rhsType: RHS_TYPES.NONE },
      ];
    case "DATE":
    case "CREATED_TIME":
      return [
        { key: "=", value: "is", rhsType: RHS_TYPES.DATE },
        { key: "<", value: "is before", rhsType: RHS_TYPES.DATE },
        { key: ">", value: "is after", rhsType: RHS_TYPES.DATE },
        { key: ">=", value: "is on or after", rhsType: RHS_TYPES.DATE },
        { key: "<=", value: "is on or before", rhsType: RHS_TYPES.DATE },
        { key: "=''", value: "is empty", rhsType: RHS_TYPES.NONE },
        { key: "<>''", value: "is not empty", rhsType: RHS_TYPES.NONE },
      ];
    case "TIME":
      return [
        { key: "=", value: "=", rhsType: RHS_TYPES.TEXT },
        { key: "!=", value: "≠", rhsType: RHS_TYPES.TEXT },
        { key: ">", value: ">", rhsType: RHS_TYPES.TEXT },
        { key: "<", value: "<", rhsType: RHS_TYPES.TEXT },
        { key: "<=", value: "≤", rhsType: RHS_TYPES.TEXT },
        { key: ">=", value: "≥", rhsType: RHS_TYPES.TEXT },
        { key: "is_null", value: "is empty", rhsType: RHS_TYPES.NONE },
        { key: "is_not_null", value: "is not empty", rhsType: RHS_TYPES.NONE },
      ];
    case "ADDRESS":
    case "PHONE_NUMBER":
      return [
        { key: "=", value: "is...", rhsType: RHS_TYPES.TEXT },
        { key: "!=", value: "is not...", rhsType: RHS_TYPES.TEXT },
        { key: "ilike", value: "contains...", rhsType: RHS_TYPES.TEXT },
        { key: "not_ilike", value: "does not contains...", rhsType: RHS_TYPES.TEXT },
        { key: "=''", value: "is empty", rhsType: RHS_TYPES.NONE },
        { key: "!=''", value: "is not empty", rhsType: RHS_TYPES.NONE },
      ];
    case "STRING":
    case "SHORT_TEXT":
    case "LONG_TEXT":
    case "EMAIL":
    case "SCQ":
    default:
      return [
        { key: "ilike", value: "contains...", rhsType: RHS_TYPES.TEXT },
        { key: "not_ilike", value: "does not contains...", rhsType: RHS_TYPES.TEXT },
        { key: "=", value: "is...", rhsType: RHS_TYPES.TEXT },
        { key: "!=", value: "is not...", rhsType: RHS_TYPES.TEXT },
        { key: "=''", value: "is empty", rhsType: RHS_TYPES.NONE },
        { key: "!=''", value: "is not empty", rhsType: RHS_TYPES.NONE },
      ];
  }
};

export const getRhsConfig = (fieldType, operator, fieldOptions = []) => {
  const operators = getDataTypeOperator(fieldType?.toUpperCase());
  const operatorConfig = operators?.find(op => op.value === operator?.value || op.key === operator?.key);
  
  if (!operatorConfig) {
    return {
      rhsType: RHS_TYPES.FORMULA,
      showModeToggle: false,
      dropdownOptions: [],
    };
  }

  const rhsType = operatorConfig.rhsType || RHS_TYPES.TEXT;
  
  if (rhsType === RHS_TYPES.NONE) {
    return {
      rhsType: RHS_TYPES.NONE,
      showModeToggle: false,
      dropdownOptions: [],
      hideRhs: true,
    };
  }

  if (rhsType === RHS_TYPES.DROPDOWN) {
    const options = operatorConfig.useFieldOptions 
      ? fieldOptions 
      : (operatorConfig.dropdownOptions || []);
    
    return {
      rhsType: RHS_TYPES.DROPDOWN,
      showModeToggle: true,
      dropdownOptions: options,
      defaultMode: 'dropdown',
    };
  }

  return {
    rhsType,
    showModeToggle: false,
    dropdownOptions: [],
    defaultMode: 'formula',
  };
};

export const CONDITION_OPTIONS = ["and", "or"];
