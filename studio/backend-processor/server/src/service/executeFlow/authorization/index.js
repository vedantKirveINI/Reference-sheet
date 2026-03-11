"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");

const refreshToken = require("./refreshToken");

module.exports = async (flow, task_id, state, options) => {
  try {
    //Note as of this writting we are skiping any of action here we are expecting that it will be already done from UI
    let task_obj = flow?.flow?.[task_id];
    let parsed_output_obj = await flow_utility_instance.parseIOV2(state, task_obj?.outputs);
    //This i have to do because on first node the data is not coming as expected
    parsed_output_obj = { ...(parsed_output_obj?.response || parsed_output_obj || {}), ...(state?.[task_id]?.response || state?.[task_id] || {}) };
    //This key to determine if we need to send the output in response key
    let return_in_response = false;
    if (task_obj?.config?.return_in_response === true) {
      return_in_response = true;
    }
    //This is to support the old and new way
    parsed_output_obj = parsed_output_obj?.response || parsed_output_obj;
    let parsed_input_obj = await flow_utility_instance.parseIOV2(state, task_obj?.inputs);
    if (options.emit_events) {
      options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: parsed_input_obj } });
    }
    let parsed_config_obj = await flow_utility_instance.parseIOV2(state, task_obj?.config?.configs);
    const auth_info = await refreshToken({ body: { auth_data: parsed_output_obj, auth_config: parsed_config_obj } });
    parsed_output_obj = { ...parsed_output_obj, ...(auth_info?.auth_data || {}) };
    state[task_id] = { ...parsed_output_obj, ...parsed_input_obj };
    if (return_in_response === true) {
      state[task_id] = { response: state[task_id] };
    }
    if (options.emit_events) {
      options?.socket?.emit("node_output", { options: { ...(options?.toJSON() || options) }, data: { type: "node_output", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: (_.has(state[task_id], "response") ? state[task_id]?.response : state[task_id]) } });
    }
    //This line we will use for soft action on flow
    let __h_result = { __h_meta: { action_type: task_obj?.node_marker }, __h_result: state[task_id] };
    return __h_result;
  } catch (error) {
    error = error?.result || error;
    if (_.isObject(error)) {
      throw { ...error, message: (error?.message || "Something went wrong") };
    }
    throw error;
  }
};