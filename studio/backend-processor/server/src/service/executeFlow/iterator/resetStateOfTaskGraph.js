"use strict";

const _ = require("lodash");

module.exports = (state, task_graph) => {
  let task_ids = _.flattenDeep(task_graph || []);
  for (const task_id of task_ids) {
    delete state?.[task_id];
  }
  return state;
};