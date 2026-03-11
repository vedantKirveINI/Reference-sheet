"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");
const utility = require("oute-services-utility-sdk");
const integration_runner = require("../integration");
const conf = require("../../../../config/conf");
const constants = conf.stores["constants"]?.store;

module.exports = async (flow, task_id, state, options) => {
  try {
    let task_obj = flow?.flow?.[task_id];
    let task_config = task_obj?.config;
    if (!_.isEmpty(task_config?.flow)){
      options.src = {
        task_id: task_id,
        type: task_obj?.type, name: (task_obj?.config?.name || task_obj?.config?.label)
      };
      state[task_id] = await integration_runner(flow, task_id, state, options);
      delete options?.src;
    } else {
      let parsed_obj = await flow_utility_instance.parseIOV2(state, task_obj?.inputs);
      let req_options = {
        max_retry: 3,
        retry_delay_ms: 500,
        use_backoff_retry: true,
        method: "POST",
        url: task_config?.published_url,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsed_obj)
      };
      if(task_config?.published_id && [true, "true"].includes(constants?.enable_internal_api)) {
        const parsed_url = new URL(req_options.url);
        parsed_url.protocol = "http";
        parsed_url.host = `localhost:${conf.get("port")}`;
        req_options.url = parsed_url.toString();
      }
      let input_obj = parsed_obj;
      if (options.emit_events) {
        options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: input_obj } });
      }
      let req_resp = await utility.executeAPI(req_options);
      if (![200, 201].includes(req_resp?.status_code)) {
        if (task_obj?.config?.return_in_response === true) {
          throw { response: req_resp?.result || req_resp };
        }
        throw req_resp;
      }
      let result = req_resp?.result || req_resp;
      state[task_id] = result;
      if (task_obj?.config?.return_in_response === true) {
        state[task_id] = { response: result };
      }
    }
    if (options.emit_events) {
      options?.socket?.emit("node_output", { options: { ...(options?.toJSON() || options) }, data: { type: "node_output", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: (_.has(state[task_id], "response") ? state[task_id]?.response : state[task_id]) } });
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