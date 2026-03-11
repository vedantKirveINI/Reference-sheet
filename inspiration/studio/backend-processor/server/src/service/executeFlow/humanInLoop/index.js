"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");
const utility = require("oute-services-utility-sdk");

const conf = require("../../../../config/conf");
const markSkipTask = require("oute-services-flow-utility-sdk/core/taskRunner/ifElse/markSkipTask");

const constants = conf.stores["constants"].store;
const URL = `${constants?.intervene?.url}${constants?.intervene?.create_task_path}`;

//Whenever this node will trigger it will create a task in intervene

module.exports = async (flow, task_id, state, options) => {
  try {
    let task_obj = flow?.flow?.[task_id];
    let task_config = task_obj?.config;
    const on_response_node_id = task_config?.on_response_node_id;
    const initiate_node_id = task_config?.initiate_node_id;
    let payload = _.cloneDeep(task_config);
    if(payload.instructions) {
      payload.instructions = flow_utility_instance.resolveValue(state, "instructions", task_config?.instructions, "STRING", undefined, null)?.value;
    }
    if(payload?.summary_content?.value) {
      payload.summary_content.value = flow_utility_instance.resolveValue(state, "summary_content", payload?.summary_content?.value, "STRING", undefined, null)?.value;
    }
    payload.meta = {
      flow: _.cloneDeep(flow),
      state: _.cloneDeep(state),
      options: {
        ...(options?.toJSON() || options), current_task_id: task_id, from_task_id: on_response_node_id 
      },
    };
    const files = payload?.files || [];
    payload.media_urls = [];
    for (const file of files) {
      payload.media_urls.push({
        url: flow_utility_instance.resolveValue(state, "url", file.url, "STRING", undefined, null)?.value,
        filename: file.name,
        type: file.type
      });
    }
    let req_options = {
      max_retry: 3,
      retry_delay_ms: 500,
      use_backoff_retry: true,
      method: "POST",
      url: URL,
      headers: {
        "Content-Type": "application/json",
        "Content-Encoding": "gzip"
      },
      body: await utility.compression.gzip(payload)
    };
    let input_obj = {
      instructions: payload.instructions,
      content_type: payload.summary_content?.type,
      summary_content: payload.summary_content?.value
    };
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
    let result = {
      id: req_resp?.result?.data?.task_id,
      url: req_resp?.result?.data?.secure_url,
      status: undefined,
      was_edited: undefined,
      original_data: undefined,
      edited_data: undefined
    };
    state[task_id] = result;
    if (task_obj?.config?.return_in_response === true) {
      state[task_id] = { response: result };
    }
    if (options.emit_events) {
      options?.socket?.emit("node_output", { options: { ...(options?.toJSON() || options) }, data: { type: "node_output", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: (_.has(state[task_id], "response") ? state[task_id]?.response : state[task_id]) } });
    }
    //skip the task of on response node id, here in the next node we need to provide the node id which need to be run
    markSkipTask(flow, task_id, initiate_node_id);
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