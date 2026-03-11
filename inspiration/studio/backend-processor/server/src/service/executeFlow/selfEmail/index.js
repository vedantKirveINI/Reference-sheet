"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");
const utility = require("oute-services-utility-sdk");
const conf = require("../../../../config/conf");

const constants = conf.stores["constants"].store;
const mailer_config = constants?.mailer;

module.exports = async (flow, task_id, state, options) => {
  try {
    let task_obj = flow?.flow?.[task_id];
    let parsed_obj = await flow_utility_instance.parseIOV2(state, task_obj?.inputs);
    const from_email = mailer_config?.default_from_email;
    if(!from_email) { throw {message: "We're unable to send emails right now. Please try again later"}; }
    if(!parsed_obj.to) { throw {message: "We couldn't send the email because the recipient address is missing"}; }
    let req_options = {
      max_retry: 3,
      retry_delay_ms: 500,
      use_backoff_retry: true,
      method: "POST",
      url: `${mailer_config?.url}${mailer_config?.ses_send_path}`,
      headers: {
        "Content-Type": "application/json",
        token: constants?.mw_token
      },
      body: JSON.stringify({
        config: {
          "type": "gofo"
        },
        data: {
          from: from_email,
          ...parsed_obj,
          html: parsed_obj.content
        }
      })
    };
    let input_obj = parsed_obj;
    if (options.emit_events) {
      options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: input_obj } });
    }
    let req_resp = await utility.executeAPI(req_options);
    if (![200, 201].includes(req_resp?.status_code) || req_resp?.result?.status !== "success") {
      if (task_obj?.config?.return_in_response === true) {
        throw { response: req_resp?.result?.result || req_resp };
      }
      throw req_resp?.result?.result || req_resp;
    }
    let result = req_resp?.result?.result || req_resp;
    result = {messageId: result?.messageId, response: result?.response};
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
    error = error?.result?.result || error?.result || error;
    if(_.isObject(error)) {
      throw {...error, message: (error?.message || "Something went wrong")};
    }
    throw error;
  }
};