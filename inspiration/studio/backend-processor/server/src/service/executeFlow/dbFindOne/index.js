"use strict";

let _ = require("lodash");
let flow_utility_instance = require("oute-services-flow-utility-sdk");
let utility_instance = require("oute-services-utility-sdk");
let db_handler_instance = require("oute-services-db-handler-sdk");
let conf = require("../../../../config/conf");

module.exports = (flow, task_id, state, options) => {
  return new Promise(async (resolve, reject)=> {
    let result;
    try {
      let task_obj = flow?.flow?.[task_id];
      const task_config = task_obj?.config;
      let inputs = _.filter(task_obj?.inputs, input => { return (input?.checked === true); });
      let find_options = {attributes: []};
      //generate select list
      for (let input of inputs) {
        let key = input?.key;
        let alias = input?.alias;
        if (alias) {
          find_options.attributes.push([key, alias]);
        } else {
          find_options.attributes.push(key);
        }
      }
      //table configs
      let table_config = task_config?.table;
      //fields configs
      let fields_config = task_obj?.inputs;
      let table_name = table_config?.name;
      const connection = task_config?.connection;
      let connection_id = table_config?.connection_id;
      let client_info = conf?.stores?.[connection_id]?.store;
      let model = client_info?.db_client?.models?.[table_name];
      let filter = task_config?.filter;
      let order_by = _.filter(task_config?.orderBy || [], input => { return (input?.checked === true); });
      let should_close = false;
      //This case will be used if the connection is not active, or individual node ran
      if(_.isEmpty(client_info)) {
        client_info = await db_handler_instance.getClient(state, task_config?.connection, {logging: false});
        should_close = true;
      }
      //generate the model if not exists
      if(_.isEmpty(model)) {
        let model_info = await db_handler_instance.getModel(client_info?.db_client, client_info?.orm_type, client_info?.orm_misc?.data_types, client_info?.db_type, table_config, fields_config);
        model = model_info?.model;
      }
      //generate where clause
      const parsed_filter = flow_utility_instance.generateWhereClause(state, filter, client_info?.orm_type, client_info?.db_type, client_info?.orm_misc?.operators);
      find_options.where = parsed_filter.filter;
      //generate order by
      const parsed_order_by = flow_utility_instance.generateOrderByClause(state, order_by, client_info?.orm_type, client_info?.db_type);
      find_options.order = parsed_order_by.sort;
      if(!(find_options.order?.length)) {
        delete find_options.order;
      }
      const node_input = {
        connection_name: connection?.name,
        table_name: table_name,
        condition: parsed_filter.filter_str,
        order_by: parsed_order_by.sort_str
      };
      //find to db
      find_options = utility_instance.cleanObjectBy(find_options);
      if (options.emit_events) {
        options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_config?.name || task_config?.label), created_at: new Date(), result: node_input } });
      }
      result = await db_handler_instance.crud.findOne(client_info?.orm_type, model, find_options);
      //close the connection if created for this node
      if(should_close === true) {
        await db_handler_instance.disconnect(client_info?.db_client, client_info?.orm_type, client_info?.db_type);
      }
      state[task_id] = result;
      if (task_config?.return_in_response === true) {
        state[task_id] = { response: result };
      }
      if (options.emit_events) {
        options?.socket?.emit("node_output", { options: { ...(options?.toJSON() || options) }, data: { type: "node_output", node_type: task_obj?.type, node_id: task_id, node_name: (task_config?.name || task_config?.label), created_at: new Date(), result: (_.has(state[task_id], "response") ? state[task_id]?.response : state[task_id]) } });
      }
      //This line we will use for soft action on flow
      let __h_result = {__h_meta: {action_type: task_obj?.node_marker}, __h_result: state[task_id]};
      return resolve(__h_result);
    } catch (error) {
      error = error?.result || error;
      if(_.isObject(error)) {
        return reject({...error, message: (error?.message || "Something went wrong")});
      }
      return reject(error);
    }
  });
};