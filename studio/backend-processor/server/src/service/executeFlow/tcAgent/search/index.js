"use strict";

const _ = require("lodash");
const utility = require("oute-services-utility-sdk");
const flow_utility_instance = require("oute-services-flow-utility-sdk");

const conf = require("../../../../../config/conf");

const constants = conf.stores["constants"].store;
const api_info = constants?.tc_agent_backend;

module.exports = async (flow, task_id, state, options) => {
  try {
    let task_obj = flow?.flow?.[task_id];
    let parsed_input = await flow_utility_instance.parseIOV2(state, task_obj?.inputs);
    let req_options = {
      max_retry: 3,
      retry_delay_ms: 500,
      use_backoff_retry: true,
      method: "GET",
      url: `${api_info?.url}${api_info?.search_path}`,
      headers: {
        "Content-Type": "application/json",
        token: constants?.mw_token
      },
      query_params: parsed_input
    };
    const node_input = parsed_input;
    if (options.emit_events) {
      options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: node_input } });
    }
    let req_resp = await utility.executeAPI(req_options);
    if (![200, 201].includes(req_resp?.status_code)) {
      throw req_resp?.result?.result || req_resp?.result || req_resp;
    }
    if(req_resp?.result?.status !== "success") {
      throw req_resp?.result?.result || req_resp?.result || {message: "Something went wrong"};
    }
    state[task_id] = { response: req_resp?.result?.result };
    if (options.emit_events) {
      options?.socket?.emit("node_output", { options: { ...(options?.toJSON() || options) }, data: { type: "node_output", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: (_.has(state[task_id], "response") ? state[task_id]?.response : state[task_id]) } });
    }
    //This line we will use for soft action on flow
    let __h_result = {__h_meta: {action_type: task_obj?.node_marker}, __h_result: state[task_id]};
    return __h_result;
  } catch (error) {
    error = error?.result?.result || error?.result || error;
    if (_.isObject(error)) {
      throw { ...error, message: (error?.message || "Something went wrong") };
    }
    throw error;
  }
};