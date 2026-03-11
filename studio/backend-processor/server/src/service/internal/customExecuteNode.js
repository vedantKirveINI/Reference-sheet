"use strict";

const flow_utility_instance = require("oute-services-flow-utility-sdk");

const ExecuteFlow = require("../executeFlow/index");
const conf = require("../../../config/conf");
const constants = conf.stores["constants"].store;
const server_instance = require("../../plugins/socket/server");
const processOptions = require("../executeFlow/processOptions");
const getSocket = require("../../plugins/socket/getSocket");

module.exports = async (params) => {
  let result, options, emit_data, socket, task_obj, task_id, emit_events;
  try {
    let body = params?.body;
    options = body?.options || {};
    options = processOptions(body?.flow, options, { reset_on_init: true });
    const socket_io = server_instance.getIO();
    const socket_id = options?.socket_id;
    task_id = body?.task_id;
    socket = (await getSocket(socket_io, { socket_id })).socket;
    options.socket = socket;
    options.execution_type = options?.execution_type || "node";
    options.start_at = new Date();
    options.execution_state = "RUNNING";
    emit_events = ([undefined, null, "", true].includes(options?.nested_logs) ||
      (options?.nested_logs === false && [undefined, null, ""].includes(options?.src)));
    options.should_return_state = body?.should_return_state || options.should_return_state;
    let execute_instance = new ExecuteFlow(body?.flow, body?.state, options);
    task_obj = body?.flow?.[task_id];
    result = await execute_instance.task(task_id);
    if (options.should_return_state !== true) {
      result = result?.result;
    }
    result = flow_utility_instance.cleanUnwantedKeys(result, constants.unwanted_keys);
    options.end_at = new Date();
    options.execution_state = "SUCCESS";
    emit_data = { type: "execute_node_result", node_type: task_obj?.type, node_id: task_id, created_at: new Date(), result: result };
    options.end_at = new Date();
    options.execution_state = "SUCCESS";
    if(emit_events) {
      socket?.emit("execute_node_result", { options: { ...(options?.toJSON() || options) }, data: emit_data });
    }
    return result;
  } catch (error) {
    let action_type = error?.__h_meta?.action_type;
    if (options.should_return_state !== true) {
      error = error?.result || error;
    }
    error = flow_utility_instance.cleanUnwantedKeys(error, constants.unwanted_keys);
    options.end_at = new Date();
    let event_name = "execute_node_error";
    options.execution_state = "FAILED";
    //this case for soft flow break which is not an error
    if(["SKIP", "BREAK", "END"].includes(action_type)) {
      event_name = "execute_node_result";
      options.execution_state = "SUCCESS";
    }
    emit_data = { type: event_name, node_type: task_obj?.type, node_id: task_id, created_at: new Date(), result: error };
    if(emit_events) {
      socket?.emit(event_name, { options: { ...(options?.toJSON() || options) }, data: emit_data });
    }
    //this case for soft flow break which is not an error
    if(["SKIP", "BREAK", "END"].includes(action_type)) {
      return error;
    } else {
      throw error;
    }
  }
};