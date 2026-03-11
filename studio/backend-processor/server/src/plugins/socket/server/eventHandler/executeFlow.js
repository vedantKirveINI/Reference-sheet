"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");
const ExecuteFlow = require("../../../../service/executeFlow");
const conf = require("../../../../../config/conf");
const processOptions = require("../../../../service/executeFlow/processOptions");
const constants = conf.stores["constants"].store;
const logger = conf.stores["logger"]?.store;

module.exports = socket => {
  return async (payload) => {
    let options, emit_data, emit_events;
    try {
      //initialized processor
      //This will be used in the flow to emit the events on socket
      options = {};
      let data = payload?.data;
      if(_.isPlainObject(payload?.options)){
        options = payload?.options;
      }
      options = {...options, ...(data?.options || {})};
      options = processOptions(data?.flow, options, { reset_on_init: true });
      options.socket = socket;
      options.execution_type = options?.execution_type || "flow";
      options.start_at = new Date();
      options.execution_state = "RUNNING";
      emit_events = ([undefined, null, "", true].includes(options?.nested_logs) ||
      (options?.nested_logs === false && [undefined, null, ""].includes(options?.src)));
      //Emit to notify that the flow is going to start
      emit_data = { type: "execute_flow_init", node_type: undefined, node_id: undefined, created_at: new Date(), result: "Workflow is being initialized" };
      if(emit_events) {
        socket?.emit("execute_flow_init", { options: { ...(options?.toJSON() || options) }, data: emit_data });
      }
      let execute_instance = new ExecuteFlow(data?.flow, data?.state, options);
      //call abort on request
      //this check if to ensure it is added only once
      const abortListner = (abort_data) => {
        let abort_result = execute_instance.abort();
        let __h_meta = _.cloneDeep(abort_result?.__h_meta);
        delete abort_result?.__h_meta;
        emit_data = { type: "abort_flow_result", node_type: undefined, node_id: undefined, created_at: new Date(), result: abort_result };
        if(emit_events) {
          socket?.emit("abort_flow_result", { options: { ...(__h_meta?.options || {}), socket: undefined }, data: emit_data });
        }
        return;
      };
      socket?.once(`abort_flow_${options?.room_id}`, abortListner);
      //run the flow
      try {
        let result = await execute_instance.execute();
        logger.info({"SOCKET_FLOW_SUCCESS": result});
        let task_obj = result?.task_obj;
        let task_id = task_obj?._id || task_obj?.id;
        if (data?.should_return_state !== true) {
          result = result?.result;
        }
        result = flow_utility_instance.cleanUnwantedKeys(result, constants.unwanted_keys);
        emit_data = { type: "execute_flow_result", node_type: task_obj?.type, node_id: task_id, created_at: new Date(), result: result };
        options.end_at = new Date();
        options.execution_state = "SUCCESS";
        if(emit_events) {
          socket?.emit("execute_flow_result", { options: { ...(options?.toJSON() || options) }, data: emit_data });
        }
        return;
      } catch (error) {
        let task_obj = error?.task_obj;
        let task_id = task_obj?._id || task_obj?.id;
        if (data?.should_return_state !== true) {
          error = error?.result || error;
        }
        error = flow_utility_instance.cleanUnwantedKeys(error, constants.unwanted_keys);
        emit_data = { type: "execute_flow_error", node_type: task_obj?.type, node_id: task_id, created_at: new Date(), result: error };
        options.end_at = new Date();
        options.execution_state = "FAILED";
        if(emit_events) {
          socket?.emit("execute_flow_error", { options: { ...(options?.toJSON() || options) }, data: emit_data });
        }
        return;
      } finally {
        socket?.off(`abort_flow_${options?.room_id}`, abortListner);
      }
    } catch (error) {
      //This case should not happen
      logger.error({"ON-SOCKET-FLOW-EXECUTE-ERROR": error});
      emit_data = { type: "execute_flow_error", node_type: undefined, node_id: undefined, created_at: new Date(), result: error };
      options.end_at = new Date();
      options.execution_state = "FAILED";
      if(emit_events) {
        socket?.emit("execute_flow_error", { options: { ...(options?.toJSON() || options) }, data: emit_data });
      }
      return;
    }
  };
};