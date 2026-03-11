"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");
const conf = require("../../../../config/conf");
const logger = conf.stores["logger"]?.store;

const log_level_map = {
  ERROR: logger.error,
  WARN: logger.warn,
  INFO: logger.info,
  DEBUG: logger.debug,
  default: logger.log
};

module.exports = async (flow, task_id, state, options) => {
  let task_obj = flow?.flow?.[task_id];
  let parsed_obj = await flow_utility_instance.parseIOV2(state, task_obj?.inputs);
  let logFn = log_level_map[task_obj?.config?.log_level] || log_level_map.default;
  logFn(parsed_obj?.response);
  state[task_id] = parsed_obj;
  if (options.emit_events) {
    options?.socket?.emit("node_output", { options: { ...(options?.toJSON() || options) }, data: { type: "node_output", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: (_.has(state[task_id], "response") ? state[task_id]?.response : state[task_id]) } });
  }
  //This line we will use for soft action on flow
  let __h_result = {__h_meta: {action_type: task_obj?.node_marker}, __h_result: state[task_id]};
  return __h_result;
};