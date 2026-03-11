"use strict";

const _ = require("lodash");
const deepExtend = require("deep-extend");
const HookNRun = require("oute-services-hook-n-run-sdk");
const flow_utility_instance = require("oute-services-flow-utility-sdk");
const utility = require("oute-services-utility-sdk");

const conf = require("../../../../config/conf");
const constants = conf.stores["constants"]?.store;

let ExecuteFlow, hook_n_run_instance;
const hooknrun_url = constants?.hooknrun?.url;
if(hooknrun_url) {
  hook_n_run_instance = new HookNRun({url: constants?.hooknrun?.url, token: constants?.mw_token});
}

module.exports = async (flow, task_id, state, options) => {
  let result;
  try {
    //This import needed as we need to get the whole runnuer in one node
    if(ExecuteFlow === undefined) { ExecuteFlow = require("../index"); }
    let task_obj = flow?.flow?.[task_id];
    let task_config = task_obj?.config;
    let task_type = task_obj?.type;
    if(hook_n_run_instance && task_config?.configs?.scheduleAt && !["instant", "now"].includes(options.invoke_type)) {
      let queue_info = {
        event_src: "TC_TASK",
        event_type: "RUN",
        interval: flow_utility_instance.resolveValue(state, "scheduleAt", task_config?.configs?.scheduleAt, "ANY", undefined, null)?.value,
        details: {
          flow,state,task_id,type: task_type,
          options: {...(options?.toJSON({invoke_type: "instant"}) || options)}
        }
      };
      const api_resp = await hook_n_run_instance.saveQueue(queue_info);
      const saved_queue = api_resp?.result;
      state[task_id] = { response: {transaction_id: saved_queue?._id} };
      if (options.emit_events) {
        options?.socket?.emit("node_input", { options: {...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_name: (task_config?.name || task_config?.label), node_id: task_id, created_at: new Date(), result: {schedule_at: queue_info?.interval} } });
        options?.socket?.emit("node_output", { options: {...(options?.toJSON() || options) }, data: { type: "node_output", node_type: task_obj?.type, node_name: (task_config?.name || task_config?.label), node_id: task_id, created_at: new Date(), result: state[task_id] } });
      }
      let __h_result = {__h_meta: {action_type: task_obj?.node_marker}, __h_result: state[task_id]};
      return __h_result;
    }
    //Clone the options so that it wont affected by ongoing changes
    let extra_args = {
      is_advance: options?.is_advance
    };
    let cloned_options = _.cloneDeep(_.omit(options, ["socket"]));
    //overidding the socket as cloning of socket would not work as expected
    cloned_options.socket = options?.socket;
    cloned_options.is_advance = true;
    if(task_type === "INTEGRATION") {
      cloned_options.__h_meta = cloned_options.__h_meta || {};
      cloned_options.__h_meta.skip_task_types = ["HTTP"];
    }
    let task_state = {};
    deepExtend(task_state, (task_config?.state || {}), state);
    let parsed_input_obj = await flow_utility_instance.parseIOV2(task_state, task_obj?.inputs);
    //This parse to log as per alias, here key_value_table node output will be json and duplicate key can be override
    let node_input = await flow_utility_instance.parseIOV2(task_state, task_obj?.inputs, {update_key_by_alias: true});
    if(_.isObject(node_input)) {
      await utility.asyncMap({data: Object.keys(node_input)}, (key) => {
        if(["__h_meta", "project_id__","parent_id__","workspace_id__","asset_id__","access_token__","authorized_data_id__","node_key__","asset_name__","node_name__"].includes(key)) {
          delete node_input[key];
        } else {
          node_input[key] = _.has(node_input[key], "response") ? node_input[key]?.response : node_input[key];
        }
      });
    }
    if (cloned_options.emit_events) {
      cloned_options?.socket?.emit("node_input", { options: {...(cloned_options?.toJSON(extra_args) || cloned_options) }, data: { type: "node_input", node_type: task_obj?.type, node_name: (task_config?.name || task_config?.label), node_id: task_id, created_at: new Date(), result: node_input } });
    }
    deepExtend(task_state, parsed_input_obj);
    cloned_options.src = {
      task_id: task_id,
      type: task_obj?.type, name: (task_config?.name || task_config?.label)
    };
    cloned_options.is_advance = true;
    let execute_instance = new ExecuteFlow(task_config?.flow, task_state, cloned_options);
    result = await execute_instance.execute();
    //Dont enable the below if block satyendra dont have clarity
    if (false && task_config?.return_in_response === true) {
      state[task_id] = { response: result?.result };
    } else {
      state[task_id] = result?.result;
    }
    if (cloned_options.emit_events) {
      cloned_options?.socket?.emit("node_output", { options: {...(cloned_options?.toJSON(extra_args) || cloned_options) }, data: { type: "node_output", node_type: task_obj?.type, node_name: (task_config?.name || task_config?.label), node_id: task_id, created_at: new Date(), result: (_.has(state[task_id], "response") ? state[task_id]?.response : state[task_id]) } });
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