"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");
const utility = require("oute-services-utility-sdk");

const conf = require("../../../../../../config/conf");
const mapRecordsToFieldNames = require("../../misc/mapRecordsToFieldNames");
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
      let body = {
        tableId: sub_sheet_config?.id,
        baseId: sub_sheet_config?.baseId,
        viewId: view_config?.id,
        state: {},
        fields_info: []
      };
      const data = {};
      for (const input of (task_obj?.inputs || [])) {
        let field_info = {};
        field_info.field_id = input?.fieldId;
        if(input?.isValueMode === true && _.isArray(input?.value)) {
          field_info.data = await flow_utility_instance.parseIOV2(state, {type: input?.type, isValueMode: true, value: input?.value});
        } else {
          field_info.data = flow_utility_instance.resolveValue(state, (input?.key || input?.dbFieldName), input?.value, input?.type, undefined, null)?.value;
        }
        data[input?.key] = field_info.data;
        body.fields_info.push(field_info);
      }
      const node_input = {
        sheet_name: sheet_info?.name,
        table_name: sub_sheet_config?.name,
        view_name: view_config?.name,
        data
      };
      let req_options = {
        max_retry: 3,
        retry_delay_ms: 500,
        use_backoff_retry: true,
        method: "POST",
        url: `${sheet_bff?.url}${sheet_bff?.insert_record_sub_sheet_v2}`,
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
      const records = req_resp?.result?.records;
      const fields = req_resp?.result?.fields;
      const formated_record = (await mapRecordsToFieldNames(records, fields))?.[0];
      let node_output = formated_record;
      state[task_id] = records?.[0];
      if (task_obj?.config?.return_in_response === true) {
        state[task_id] = { response: records?.[0] };
      }
      if (options.emit_events) {
        options?.socket?.emit("node_output", { options: { ...(options?.toJSON() || options) }, data: { type: "node_output", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: node_output } });
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