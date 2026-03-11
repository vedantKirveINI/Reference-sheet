"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");
const db_handler_instance = require("oute-services-db-handler-sdk");
const utility_instance = require("oute-services-utility-sdk");
const conf = require("../../../../config/conf");

module.exports = async(flow, task_id, state, options) => {
  let result;
  try {
    let task_obj = flow?.flow?.[task_id];
    const task_config = task_obj?.config;
    let inputs = _.filter(task_obj?.inputs, input => { return (input?.checked === true); });
    //Create save payload
    let save_obj = await flow_utility_instance.parseIOV2(state, inputs);
    //table configs
    let table_config = task_obj?.config?.table;
    //fields configs
    let fields_config = task_obj?.inputs;
    let table_name = table_config?.name;
    const connection = task_config?.connection;
    let connection_id = table_config?.connection_id;
    let client_info = conf?.stores?.[connection_id]?.store;
    let model = client_info?.db_client?.models?.[table_name];
    let should_close = false;
    //This case will be used if the connection is not active, or individual node ran
    if(_.isEmpty(client_info)) {
      client_info = await db_handler_instance.getClient(state, task_obj?.config?.connection, {logging: false});
      should_close = true;
    }
    //generate the model if not exists
    if(_.isEmpty(model)) {
      let model_info = await db_handler_instance.getModel(client_info?.db_client, client_info?.orm_type, client_info?.orm_misc?.data_types, client_info?.db_type, table_config, fields_config);
      model = model_info?.model;
    }
    //insert to db
    const node_input = {
      connection_name: connection?.name,
      table_name: table_name,
      data: save_obj
    };
    save_obj = utility_instance.cleanObjectBy(save_obj);
    if (options.emit_events) {
      options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: node_input } });
    }
    result = await db_handler_instance.crud.upsert(client_info?.orm_type, model, save_obj);
    //close the connection if created for this node
    if(should_close === true) {
      await db_handler_instance.disconnect(client_info?.db_client, client_info?.orm_type, client_info?.db_type);
    }
    state[task_id] = result;
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