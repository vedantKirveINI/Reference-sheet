"use strict";

let _ =require("lodash");
let utility = require("oute-services-utility-sdk");
let flow_utility = require("oute-services-flow-utility-sdk");

let type_fn_map = require("./typeFunctionMap");
let conf = require("../../../../config/conf");
let logger = conf.stores["logger"]?.store;

let uuid_instance = utility.getUuidInstance();

module.exports = (flow, task_id, state, options) => {
  return new Promise(async (resolve, reject)=> {
    let final_result, result;
    let task_obj = flow?.flow?.[task_id];
    let task_config = task_obj?.config;
    let task_type = task_obj?.type;
    let task_name = `${task_id}_${task_type}_uuid_${uuid_instance.v4()}`;
    let skip_task_types = options?.__h_meta?.skip_task_types || [];
    const task_started_at = new Date();
    if (task_obj?.skip !== true) {
      logger.startTime(task_name);
    }
    //nested_logs use to controll the nexted logging, src will be used for from where the request is coming
    let emit_events = ([undefined, null, "", true].includes(options?.nested_logs) ||
      (options?.nested_logs === false && [undefined, null, ""].includes(options?.src)));
    options.emit_events = emit_events;
    try {
      if(_.isEmpty(task_obj)) { return reject({task_obj, result: {message: "Task with the requested ID does not exist. Please verify the provided ID and try again"}}); }
      if (options?.abort === true) { return reject({ task_obj, result: { message: "The operation has been successfully aborted." } }); }
      //Skip the task based on conditions
      if(skip_task_types?.includes(task_type)) { task_obj.skip = true; }
      if(task_obj?.skip === true) { return resolve({task_obj, result: {...(state?.[task_id] || {}), __h_meta: {message: `Skipping for id ${task_id}`}}}); }
      //change credits/operations for the non intigration internal node
      if(!["INTEGRATION", "IC_WORKFLOW", "AGENT_WORKFLOW"].includes(options?.src?.type)) {
        //increase the task exec count
        options.exec_task_counts = parseInt(options?.exec_task_counts || 0, 10) + 1;
        options.exec_task_credits = parseInt(options?.exec_task_credits || 0, 10) + (parseInt(task_config?.credits, 10) || 1);
      }
      //This is for at least one credit deduction
      if(options.exec_task_credits === 0) { options.exec_task_credits = 1; }
      if (emit_events) {
        options?.socket?.emit("begin_node", { options: { ...(options?.toJSON() || options) }, data: { type: "begin_node", node_type: task_type, node_name: (task_obj?.config?.name || task_obj?.config?.label), node_id: task_id, created_at: new Date(), result: "Node is now running" } });
        if (!_.isEmpty(task_config?.logs?.before)) {
          options?.socket?.emit("node_log", { options: { ...(options?.toJSON() || options) }, data: { type: "pre_log", node_type: task_type, node_name: (task_obj?.config?.name || task_obj?.config?.label), node_id: task_id, created_at: new Date(), result: flow_utility.resolveValue(state, "pre_log", task_config?.logs?.before, "ANY", undefined, null)?.value } });
        }
      }
      let fn = type_fn_map?.[task_type];
      if(!(fn)) { return reject({task_obj, result: {message: `Oops! It seems like the task of type[${task_type}] doesn't exist`}}); }
      result = await fn(flow, task_id, state, options);
      final_result = {task_obj};
      if(_.isObject(result)) {
        final_result = { ...final_result, ...result};
        if(result?.__h_result !== undefined) {
          final_result.result = result?.__h_result;
        } else {
          final_result.result = result;
        }
      }
      if (emit_events) {
        if (!_.isEmpty(task_obj?.config?.logs?.after)) {
          options?.socket?.emit("node_log", { options: { ...(options?.toJSON() || options) }, data: { type: "post_log", node_type: task_type, node_name: (task_obj?.config?.name || task_obj?.config?.label), node_id: task_id, created_at: new Date(), result: flow_utility.resolveValue(state, "post_log", task_config?.logs?.after, "ANY", undefined, null)?.value }});
        }
        options?.socket?.emit("end_node", { options: { ...(options?.toJSON() || options) }, data: { type: "end_node", duration_ms: (new Date().getTime() - task_started_at.getTime()), node_type: task_type, node_name: (task_obj?.config?.name || task_obj?.config?.label), node_id: task_id, created_at: new Date(), result: "Node ended" }});
      }
      //This if block is used for soft break of flow
      if(["SKIP", "BREAK", "END", "JUMP_TO"].includes(final_result?.__h_meta?.action_type)) {
        return reject(final_result);
      } else {
        return resolve(final_result);
      }
    } catch (error) {
      //This case is to handle for abort request and passoute the node error
      if(options?.abort === true) {
        return reject(error);
      }
      final_result = {task_obj};
      if(_.isObject(error)) {
        final_result = { ...final_result, ...error};
        if(error?.__h_result !== undefined) {
          final_result.result = error?.__h_result;
        } else {
          final_result.result = error;
        }
      } else {
        final_result.result = error;
      }
      //To handle the stack error
      if(final_result.result instanceof Error) {
        logger.error(final_result.result);
        final_result.result = {message: final_result.result?.message || "Something went wrong. Please contact support if this persists"};
      }
      if (emit_events) {
        options?.socket?.emit("node_error", { options: { ...(options?.toJSON() || options) }, data: { type: "node_error", node_type: task_type, node_name: (task_obj?.config?.name || task_obj?.config?.label), node_id: task_id, created_at: new Date(), result: final_result.result } });
        options?.socket?.emit("end_node", { options: { ...(options?.toJSON() || options) }, data: { type: "end_node", duration_ms: (new Date().getTime() - task_started_at.getTime()), node_type: task_type, node_name: (task_obj?.config?.name || task_obj?.config?.label), node_id: task_id, created_at: new Date(), result: "Node ended" }});
      }
      return reject(final_result);
    } finally {
      if (task_obj?.skip !== true) {
        logger.endTime(task_name);
      }
    }
  });
};