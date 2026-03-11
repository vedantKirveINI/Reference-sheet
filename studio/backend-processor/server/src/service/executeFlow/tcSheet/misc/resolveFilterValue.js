"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");

const resolveFilterValue = (state, filter) => {
  let filterStrParts = [];
  if (_.isArray(filter?.childs) && filter?.childs?.length > 0) {
    for (let child of filter.childs) {
      let value, operator_requires_value = true;
      let operator = child?.operator?.key;
      let operator_text = operator;
      if(["is_null", "is_not_null", "ilike", "not_ilike"].includes(operator)) {
        operator_text = _.upperCase(operator);
      }
      if (_.isArray(child?.childs) && child?.childs?.length > 0) {
        const result = resolveFilterValue(state, child);
        filterStrParts.push(result.filter_str);
      } else {
        child.value = flow_utility_instance.resolveValue(state, child?.key, child?.value, "ANY", child.default, null)?.value;
        value = child.value;
        if (["is_null", "is_not_null"].includes(operator)) {
          value = null;
          operator_requires_value = false;
        } else if (["=''", "!=''"].includes(operator)) {
          value = "";
          operator_requires_value = false;
        }
        if(operator_requires_value !== false) {
          filterStrParts.push(`${JSON.stringify(child.key)} ${operator_text} ${JSON.stringify(value)}`);
        } else {
          filterStrParts.push(`${JSON.stringify(child.key)} ${operator_text}`);
        }
      }
    }
  }
  // join with condition (AND / OR)
  const condition = filter?.condition?.toUpperCase() || "AND";
  return {
    filter,
    filter_str: `(${filterStrParts.join(` ${condition} `)})`
  };
};

module.exports = resolveFilterValue;