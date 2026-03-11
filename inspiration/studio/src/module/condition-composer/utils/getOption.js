import { toUpper } from "lodash";
import { getDataTypeOperator } from "../constant/dataOperator";
import NESTED_FIELD_MAPPING from "../constant/nestedFieldMapping";

const EXCLUDED_OPERATORS = ["is...", "is not..."];

const filterOperatorsByType = ({ type, operatorList, nestedKey = "" }) => {
  if (!NESTED_FIELD_MAPPING?.[toUpper(type)] || nestedKey) {
    return operatorList;
  }

  return operatorList.filter(
    (operator) => !EXCLUDED_OPERATORS.includes(operator.value)
  );
};

const getOperatorsBySchema = ({ schema, colName, nestedKey = "" }) => {
  const columnInfo = schema.find((info) => info.name === colName);
  const { type, options = {} } = columnInfo || {};

  let actualType = type;

  if (type === "FORMULA" && options?.returnType) {
    actualType = options.returnType;
  }

  const operatorList = getDataTypeOperator(toUpper(actualType));

  return filterOperatorsByType({ type: actualType, operatorList, nestedKey });
};

const getOperatorsByColumnInfo = ({ columnInfo, nestedKey = "" }) => {
  const { type, options = {} } = columnInfo || {};

  let actualType = type;

  if (type === "FORMULA" && options?.returnType) {
    actualType = options.returnType;
  }

  const operatorList = getDataTypeOperator(toUpper(actualType));

  return filterOperatorsByType({ type: actualType, operatorList, nestedKey });
};

export { getOperatorsBySchema, getOperatorsByColumnInfo };
