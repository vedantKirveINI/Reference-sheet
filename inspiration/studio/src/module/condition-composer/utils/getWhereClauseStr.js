import { upperCase } from "lodash";

const getValue = ({ operatorObj, value, type }) => {
  const { key } = operatorObj || {};

  const val = value?.blocks?.[0]?.value || "";

  if (["ilike", "not_ilike"].includes(key)) {
    return `'%${val}%'`;
  }

  if (type && type.toUpperCase() === "STRING" && val) {
    return `'${val}'`;
  }

  return val;
};

export const getWhereClauseStr = ({
  initialVal = {},
  includeWhere = false,
}) => {
  if (!initialVal || Object.keys(initialVal).length === 0) return "";

  const { condition = "", childs = [] } = initialVal || {};
  let str = includeWhere ? "WHERE" : "";

  childs.forEach((ele, i) => {
    const { key, type, operator, value } = ele;

    if (i !== 0) {
      str += condition.toUpperCase();
    }

    if (ele?.childs) {
      const childCndStr = getWhereClauseStr({ initialVal: ele });
      str += ` (${childCndStr}) `;
    } else {
      const val = getValue({ value, operatorObj: operator, type });
      const opVal = upperCase(operator?.key) || operator?.key;

      str += ` ${key} ${opVal} ${val} `;
    }
  });

  return str;
};
