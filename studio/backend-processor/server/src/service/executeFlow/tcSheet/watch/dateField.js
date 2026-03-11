"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");
const mapRecordsToFieldNames = require("../misc/mapRecordsToFieldNames");

module.exports = async(flow, task_id, state, options) => {
  let task_obj = flow?.flow?.[task_id];
  let parsed_obj = await flow_utility_instance.parseIOV2(state, task_obj?.inputs);
  state[task_id] = parsed_obj;
  let records = [parsed_obj?.data];
  const fields = task_obj?.config?.key_config_map;
  const formated_record = (await mapRecordsToFieldNames(records, fields))?.[0];
  let node_output = {..._.omit(parsed_obj, ["data"]), data: formated_record};
  if (task_obj?.config?.return_in_response === true) {
    state[task_id] = { response: parsed_obj };
  }
  if (options.emit_events) {
    options?.socket?.emit("node_output", { options: { ...options, socket: undefined }, data: { type: "node_output", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: node_output } });
  }
  //This line we will use for soft action on flow
  let __h_result = {__h_meta: {action_type: task_obj?.node_marker}, __h_result: state[task_id]};
  return __h_result;
};