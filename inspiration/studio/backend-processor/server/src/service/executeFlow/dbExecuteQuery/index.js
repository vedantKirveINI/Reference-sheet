"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");
const db_handler_instance = require("oute-services-db-handler-sdk");
const conf = require("../../../../config/conf");

module.exports = async(flow, task_id, state, options) => {
  let result;
  try {
    let task_obj = flow?.flow?.[task_id];
    const connection = task_obj?.config?.connection;
    //get query object
    let query_obj = await flow_utility_instance.parseIOV2(state, task_obj?.inputs);
    const node_input = {
      connection_name: connection?.name,
      query: query_obj?.query
    };
    if (options.emit_events) {
      options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: node_input } });
    }
    let connection_id = connection?.id;
    let client_info = conf?.stores?.[connection_id]?.store;
    let should_close = false;
    //This case will be used if the connection is not active, or individual node ran
    if(_.isEmpty(client_info)) {
      client_info = await db_handler_instance.getClient(state, connection, {logging: false});
      should_close = true;
    }
    //Execute query
    let query = query_obj?.query;
    let execute_options = {};
    result = await db_handler_instance.executeQuery(client_info?.db_client, client_info?.orm_type, client_info?.db_type, query, execute_options);
    //close the connection if created for this node
    if(should_close === true) {
      await db_handler_instance.disconnect(client_info?.db_client, client_info?.orm_type, client_info?.db_type);
    }
    state[task_id] = {response: result};
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