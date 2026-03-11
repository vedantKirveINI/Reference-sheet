"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");
const utility = require("oute-services-utility-sdk");

const conf = require("../../../../../config/conf");
const constants = conf.stores["constants"].store;
const gpt_conf = constants?.gpt;

module.exports = async (flow, task_id, state, options) => {
  try {
    let task_obj = flow?.flow?.[task_id];
    let task_config = task_obj?.config;
    let body = {};
    body.topic = flow_utility_instance.resolveValue(state, "topic", task_config?.topicSpecification, "ANY", undefined, null)?.value;
    body.depth = flow_utility_instance.resolveValue(state, "depth", task_config?.depthOfResearch, "ANY", undefined, null)?.value;
    body.source_preferences = flow_utility_instance.resolveValue(state, "source_preferences", task_config?.sourcePreference, "ANY", undefined, null)?.value;
    body.output_format = flow_utility_instance.resolveValue(state, "output_format", task_config?.outputFormat, "ANY", undefined, null)?.value;
    body.fact_check_level = flow_utility_instance.resolveValue(state, "fact_check_level", task_config?.factCheckLevel, "ANY", undefined, null)?.value;
    body.language_preference = flow_utility_instance.resolveValue(state, "language_preference", task_config?.languagePreference, "ANY", undefined, null)?.value;
    body.update_frequency = flow_utility_instance.resolveValue(state, "update_frequency", task_config?.updateFrequency, "ANY", undefined, null)?.value;
    let req_options = {
      max_retry: 3,
      retry_delay_ms: 500,
      use_backoff_retry: true,
      method: "POST",
      url: `${gpt_conf?.url}${gpt_conf?.researcher_path}`,
      headers: {
        "Content-Type": "application/json",
        token: constants?.mw_token
      },
      body: JSON.stringify(body)
    };
    let input_obj = {...body};
    if (options.emit_events) {
      options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: input_obj } });
    }
    let req_resp = await utility.executeAPI(req_options);
    if (![200, 201].includes(req_resp?.status_code)){
      throw req_resp;
    }
    let result = req_resp?.result?.choices?.[0]?.message?.content;
    state[task_id] = result;
    if (task_obj?.config?.return_in_response === true) {
      state[task_id] = { response: result };
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