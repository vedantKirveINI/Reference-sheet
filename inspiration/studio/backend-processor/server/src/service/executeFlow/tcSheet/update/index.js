"use strict";

let _ = require("lodash");
let flow_utility_instance = require("oute-services-flow-utility-sdk");
let utility = require("oute-services-utility-sdk");

let conf = require("../../../../../config/conf");
const resolveFilterValue = require("../misc/resolveFilterValue");

let constants = conf.stores["constants"].store;
let sheet_bff = constants?.sheet_bff;

module.exports = (flow, task_id, state, options) => {
  return new Promise(async (resolve, reject)=> {
    try {
      let task_obj = flow?.flow?.[task_id];
      let task_config = task_obj?.config;
      const sheet_info = task_config?.asset;
      let sub_sheet_config = task_config?.subSheet;
      let view_config = task_config?.view;
      const parsed_filter = resolveFilterValue(state, task_config?.filter);
      let body = {
        tableId: sub_sheet_config?.id,
        baseId: sub_sheet_config?.baseId,
        viewId: view_config?.id,
        state: {},
        is_single_update: task_config?.isSingleUpdate || false, //This is to controll single or multi update
        is_delete: false, //This is to controll update or delete
        manual_filters: parsed_filter.filter,
        fields_info: []
      };
      const data = {};
      for (const input of (task_obj?.inputs || [])) {
        let field_info = {};
        field_info.field_id = input?.id;
        field_info.data = flow_utility_instance.resolveValue(state, input?.dbFieldName, input?.value, input?.type, undefined, null)?.value;
        data[input?.key] = field_info.data;
        body.fields_info.push(field_info);
      }
      const node_input = {
        sheet_name: sheet_info?.name,
        table_name: sub_sheet_config?.name,
        view_name: view_config?.name,
        data,
        condition: parsed_filter.filter_str
      };
      let req_options = {
        max_retry: 3,
        retry_delay_ms: 500,
        use_backoff_retry: true,
        method: "POST",
        url: `${sheet_bff?.url}${sheet_bff?.update_record_sub_sheet}`,
        headers: {
          "Content-Type": "application/json",
          token: constants?.mw_token,
          auth: "jwt"
        },
        body: JSON.stringify(body)
      };
      if (options.emit_events) {
        options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: node_input } });
      }
      let req_resp = await utility.executeAPI(req_options);
      if (![200, 201].includes(req_resp?.status_code)){
        throw req_resp;
      }
      state[task_id] = {response: req_resp?.result};
      if (options.emit_events) {
        options?.socket?.emit("node_output", { options: { ...(options?.toJSON() || options) }, data: { type: "node_output", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: (_.has(state[task_id], "response") ? state[task_id]?.response : state[task_id]) } });
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