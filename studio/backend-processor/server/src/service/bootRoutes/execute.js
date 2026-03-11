"use strict";

let _ = require("lodash");
const {getUuidInstance} = require("oute-services-utility-sdk");

let flow_utility_instance = require("oute-services-flow-utility-sdk");
let ExecuteFlow = require("../executeFlow");
let conf = require("../../../config/conf");
let variables = conf.stores["variables"].store;
let constants = conf.stores["constants"].store;
let logger = conf.stores["logger"]?.store;

let client_instance;

module.exports = _params=> {
  return async (req, res) => {
    let result, status_code, socket, emit_data, options, emit_events;
    try {
      if (!client_instance) { client_instance = require("../../plugins/socket/client"); }
      //store required data of request into state var for smooth access
      let params = _.cloneDeep(_params);
      socket = client_instance.getSocket();
      options = {
        socket: socket,
        room_id: `anonymous_${new Date().getTime()}`,
        nested_logs: true,
        asset_id: params?.flow?.asset_id,
        published_id: params?.flow?._id,
        canvas_id: params?.flow?.canvas_id,
        workspace_id: params?.flow?.workspace_id,
        execution_type: "flow"
      };
      options.execution_id = getUuidInstance().v4();
      options.request_id = options.execution_id;
      options.batch_id = options.execution_id;
      options.start_at = new Date();
      options.execution_state = "RUNNING";
      emit_events = ([undefined, null, "", true].includes(options?.nested_logs) ||
        (options?.nested_logs === false && [undefined, null, ""].includes(options?.src)));
      let state = flow_utility_instance.requestToStateTF(req, params?.route_obj?.inputs, variables);
      //Logging the request imp data for testing purpose
      logger.info({"BODY": req?.body});
      logger.info({"QUERY_PARAMS": req?.query});
      logger.info({"HEADERS": req?.headers});
      logger.info({"PATH_PARAMS": req?.params});
      logger.info({"REQUEST_METHOD": req?.method});
      logger.info({"REQUEST_URL": ((req?.baseUrl || "") + (req?.path || "")) || req.url});
      /*
      - Creating a new instance on each request is important, as we will be storing
        all nodes output in the state variable
      */
      //Emit to notify that the flow is going to start
      emit_data = { type: "execute_flow_init", node_type: undefined, node_id: undefined, created_at: new Date(), result: "Workflow is being initialized" };
      if(emit_events) {
        socket?.emit("execute_flow_init", { options: { ...(options?.toJSON() || options) }, data: emit_data });
      }
      let execute_instance = new ExecuteFlow(params?.flow, state, options);
      let task_obj = result?.task_obj;
      let task_id = task_obj?._id || task_obj?.id;
      result = await execute_instance.execute();
      status_code = _.toInteger(result?.result?.__h_meta?.status_code || result?.__h_meta?.status_code || result?.status_code) || 200;
      logger.info({"ROUTE_SUCCESS": result});
      if(![true, "true"].includes(req?.headers?.should_return_state)) {
        result = result?.result;
      }
      result = flow_utility_instance.cleanUnwantedKeys(result, constants.unwanted_keys);
      emit_data = { type: "execute_flow_result", node_type: task_obj?.type, node_id: task_id, created_at: new Date(), result: result };
      options.end_at = new Date();
      options.execution_state = "SUCCESS";
      if(emit_events) {
        socket?.emit("execute_flow_result", { options: { ...(options?.toJSON() || options) }, data: emit_data });
      }
      return res.status(status_code).send(result);
    } catch (error) {
      logger.error({"ROUTE_FAILED": error});
      let task_obj = error?.task_obj;
      let task_id = task_obj?._id || task_obj?.id;
      status_code = _.toInteger(error?.result?.__h_meta?.status_code || error?.__h_meta?.status_code || error?.status_code) || 200;
      if(![true, "true"].includes(req?.headers?.should_return_state)) {
        error = error?.result;
      }
      error = flow_utility_instance.cleanUnwantedKeys(error, constants.unwanted_keys);
      emit_data = { type: "execute_flow_error", node_type: task_obj?.type, node_id: task_id, created_at: new Date(), result: error };
      options.end_at = new Date();
      options.execution_state = "FAILED";
      if(emit_events) {
        socket?.emit("execute_flow_error", { options: { ...(options?.toJSON() || options) }, data: emit_data });
      }
      return res.status(status_code).send(error);
    }
  };
};