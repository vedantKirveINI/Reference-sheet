"use strict";

const _ = require("lodash");
const order_map = {
  "ASCENDING": "asc",
  "DESCENDING": "desc"
};

const getSortPayload = (order_by) => {
  if(!_.isArray(order_by)){order_by = [];}
  const result = {sortObjs: [], group_by_str: "", manualSort: false};
  const parts = [];
  for (const element of order_by) {
    result.sortObjs.push(_.extend(element, {order: order_map[element?.order]}));
    if (element?.column) {
      parts.push(`${JSON.stringify(element.column)} ${element?.order}`);
    }
  }
  result.group_by_str = parts.join(", ");
  return result;
};

module.exports = getSortPayload;