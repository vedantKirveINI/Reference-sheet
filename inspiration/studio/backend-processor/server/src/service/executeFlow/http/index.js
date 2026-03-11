"use strict";

const _ = require("lodash");
const utility = require("oute-services-utility-sdk");
const flow_utility_instance = require("oute-services-flow-utility-sdk");

const getAuthHeader = require("./getAuthHeader");
const getHeaders = require("./response/getHeaders");
const getTransformedBody = require("./getTransformedBody");

//This function will handle success and failed logic
const responder = (resp, task_id, task_obj, state, is_error, options) => {
  let result = {};
  result.headers = getHeaders(resp?.response);
  result.body = resp?.result || resp;
  result.status_code = resp?.status_code;
  result.curl = resp?.curl;
  state[task_id] = result;
  if((is_error === true) && isNaN(resp?.status_code)) {
    //If stack error happens and message key present
    if(result?.body?.message) {
      state[task_id].message = result?.body?.message;
    }
    throw state[task_id];
  } else {
    if (options.emit_events) {
      options?.socket?.emit("node_output", { options: { ...(options?.toJSON() || options) }, data: { type: "node_output", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: (_.has(state[task_id], "response") ? state[task_id]?.response : state[task_id]) } });
    }
    //This line we will use for soft action on flow
    let __h_result = {__h_meta: {action_type: task_obj?.node_marker}, __h_result: state[task_id]};
    return __h_result;
  }
};

module.exports = async (flow, task_id, state, options) => {
  let task_obj;
  try {
    let http_resp;
    task_obj = flow?.flow?.[task_id];
    const execution_info = flow_utility_instance.misc.parseExecutionMode(task_obj?.config?.execution_mode);
    //parse the inputs
    let parsed_input_obj = await flow_utility_instance.parseIOV2(state, task_obj?.inputs);
    if(parsed_input_obj?.headers === undefined) { parsed_input_obj.headers = {}; }
    //append auth headers
    parsed_input_obj.headers = {...parsed_input_obj.headers, ...getAuthHeader(parsed_input_obj, task_obj)};
    //Transform the body based on configs
    let input_obj = { body: parsed_input_obj.body };
    const body_config = task_obj?.config?.body;
    if (body_config?.type === "form-data" && _.isArray(body_config?.data)) {
      const body_array = [];
      for (const row of body_config.data) {
        if (!row?.key) continue;
        if (row.type === "file") {
          const url = row.value || row.valueStr || "";
          if (url) body_array.push({ key: row.key, value: url, type: "file" });
        } else {
          const resolved = flow_utility_instance.resolveValue(
            state,
            row.key,
            row.value,
            "STRING",
            row.valueStr,
            undefined,
          )?.value;
          body_array.push({
            key: row.key,
            value: resolved != null ? String(resolved) : "",
          });
        }
      }
      parsed_input_obj.body = body_array;
    }
    if (parsed_input_obj?.body) {
      parsed_input_obj.body = await getTransformedBody(parsed_input_obj, task_obj);
      if (parsed_input_obj.body === undefined) {
        delete parsed_input_obj?.body;
      } else {
        parsed_input_obj.body_info = task_obj?.config?.body;
      }
    }
    let http_options = {
      method: task_obj?.config?.method,
      timeout: task_obj?.config?.timeout,
      convert_to_curl: execution_info.is_debug,
      ...parsed_input_obj
    };
    http_options.url = flow_utility_instance.resolveValue(state, "url", task_obj?.config?.url, "STRING", undefined, null)?.value;
    input_obj = {
      ...input_obj,
      url: http_options.url,
      method: http_options.method,
      headers: http_options.headers
    };
    if (options.emit_events) {
      options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: input_obj } });
    }
    //delete unnessary key from request options
    delete http_options?.key_config;
    if(Number(task_obj?.config?.max_retry) > 0) {
      task_obj.config.retry_delay = Number(task_obj?.config?.retry_delay) || 1;
      http_resp = await utility.retry(task_obj?.config?.max_retry, task_obj?.config?.retry_delay, utility.executeAPI, "promise", http_options);
    } else {
      http_resp = await utility.executeAPI(http_options);
    }
    if(utility.isStream(http_resp?.result) === true) {
      http_resp.result = await http_resp?.response?.buffer();
    }
    return responder(http_resp, task_id, task_obj, state, false, options);
  } catch (error) {
    return responder(error, task_id, task_obj, state, true, options);
  }
};