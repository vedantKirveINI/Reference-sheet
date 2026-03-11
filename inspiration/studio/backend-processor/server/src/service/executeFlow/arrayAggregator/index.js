"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");

module.exports = async (flow, task_id, state, options) => {
  try {
    let task_obj = flow?.flow?.[task_id];
    let response = state[task_id]?.response || state[task_id] || {};
    let parsed_obj = await flow_utility_instance.parseIOV2(state, task_obj?.inputs);
    if(options.emit_events){
      options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: parsed_obj } });
    }
    for (var key of Object.keys(parsed_obj || {})) {
      if(!(_.isArray(response?.[key]))) { response[key] = []; }
      response[key].push(parsed_obj?.[key]);
    }
    state[task_id] = response;
    if (task_obj?.config?.return_in_response === true) {
      state[task_id] = {response};
    }
    if (options.emit_events) {
      options?.socket?.emit("node_output", { options: { ...(options?.toJSON() || options) }, data: { type: "node_output", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: _.cloneDeep(_.has(state[task_id], "response") ? state[task_id]?.response : state[task_id]) } });
    }
    //This line we will use for soft action on flow
    let __h_result = {__h_meta: {action_type: task_obj?.node_marker}, __h_result: state[task_id]};
    return __h_result;
  } catch (error) {
    error = error?.result || error;
    if(_.isObject(error)) {
      throw {...error, message: (error?.message || "Something went wrong")};
    }
    throw error;
  }
};