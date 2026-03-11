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
    let output_format = await flow_utility_instance.parseIOV2(state, task_obj?.inputs);
    let persona = flow_utility_instance.resolveValue(state, "persona", task_config?.persona, "ANY", undefined, null)?.value;
    let query = flow_utility_instance.resolveValue(state, "query", task_config?.query, "ANY", undefined, null)?.value;
    let req_options = {
      max_retry: 3,
      retry_delay_ms: 500,
      use_backoff_retry: true,
      method: "POST",
      url: `${gpt_conf?.url}${gpt_conf?.chat_path}`,
      headers: {
        "Content-Type": "application/json",
        token: constants?.mw_token
      },
      body: JSON.stringify({ persona, query, outputFormat: output_format })
    };
    let input_obj = {
      persona, query, output_format
    };
    if (options.emit_events) {
      options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: input_obj } });
    }
    let req_resp = await utility.executeAPI(req_options);
    if (![200, 201].includes(req_resp?.status_code)){
      throw req_resp;
    }
    let result = utility.validateAndParseObject(req_resp?.result?.choices?.[0]?.message?.content)?.result;
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