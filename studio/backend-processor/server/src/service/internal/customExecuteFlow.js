"use strict";

const flow_utility_instance = require("oute-services-flow-utility-sdk");

const ExecuteFlow = require("../executeFlow");
const conf = require("../../../config/conf");
const server_instance = require("../../plugins/socket/server");
const processOptions = require("../executeFlow/processOptions");
const generateTaskGraphByFromAndTo = require("../executeFlow/iterator/generateTaskGraphByFromAndTo");
const getSocket = require("../../plugins/socket/getSocket");
const constants = conf.stores["constants"].store;

module.exports = async (params) => {
  let body, result, options, emit_data, socket, emit_events;
  try {    
    body = params?.body;
    let flow = body?.flow || {};
    options = params?.body?.options || {};
    options = processOptions(flow, options, { reset_on_init: true });
    let from_task_id = options?.from_task_id;
    let to_task_ids = options?.to_task_ids || [];
    let skip_type = options?.skip_type || "none";
    const socket_io = server_instance.getIO();
    const socket_id = options?.socket_id;
    emit_events = ([undefined, null, "", true].includes(options?.nested_logs) ||
      (options?.nested_logs === false && [undefined, null, ""].includes(options?.src)));
    socket = (await getSocket(socket_io, { socket_id }))?.socket;
    options.socket = socket;
    options.should_return_state = body?.should_return_state || options.should_return_state;
    options.execution_type = options?.execution_type || "flow";
    options.start_at = new Date();
    options.execution_state = "RUNNING";
    //Emit to notify that the flow is going to start
    emit_data = { type: "execute_flow_init", node_type: undefined, node_id: undefined, created_at: new Date(), result: "Workflow is being initialized" };
    if(emit_events) {
      socket?.emit("execute_flow_init", { options: { ...(options?.toJSON() || options) }, data: emit_data });
    }
    //Generate task graph if asked to run partial flow
    if(from_task_id) {
      flow.task_graph = generateTaskGraphByFromAndTo(flow, from_task_id, to_task_ids, skip_type);
    }
    let execute_instance = new ExecuteFlow(flow, body?.state, options);
    result = await execute_instance.execute();
    let task_obj = result?.task_obj;
    let task_id = task_obj?._id || task_obj?.id;
    if (options.should_return_state !== true) {
      result = result?.result;
    }
    result = flow_utility_instance.cleanUnwantedKeys(result, constants.unwanted_keys);
    emit_data = { type: "execute_flow_result", node_type: task_obj?.type, node_id: task_id, created_at: new Date(), result: result };
    options.end_at = new Date();
    options.execution_state = "SUCCESS";
    if(emit_events) {
      socket?.emit("execute_flow_result", { options: { ...(options?.toJSON() || options) }, data: emit_data });
    }
    return result;
  } catch (error) {
    let task_obj = error?.task_obj;
    let task_id = task_obj?._id || task_obj?.id;
    if (options.should_return_state !== true) {
      error = error?.result || error;
    }
    error = flow_utility_instance.cleanUnwantedKeys(error, constants.unwanted_keys);
    emit_data = { type: "execute_flow_result", node_type: task_obj?.type, node_id: task_id, created_at: new Date(), result: error };
    options.end_at = new Date();
    options.execution_state = "FAILED";
    if(emit_events) {
      socket?.emit("execute_flow_error", { options: { ...(options?.toJSON() || options) }, data: emit_data });
    }
    throw error;
  }
};