"use strict";

const _ = require("lodash");
const utility = require("oute-services-utility-sdk");

const conf = require("../../../../../../config/conf");
const resolveFilterValue = require("../../misc/resolveFilterValue");
const getOrderBy = require("../../misc/getOrderBy");
const buildSelectedAttributes = require("../../misc/buildSelectedAttributes");
const mapRecordsToFieldNames = require("../../misc/mapRecordsToFieldNames");

const constants = conf.stores["constants"].store;
const sheet_bff = constants?.sheet_bff;

module.exports = async (flow, task_id, state, options) => {
  try {
    let task_obj = flow?.flow?.[task_id];
    let task_config = task_obj?.config;
    const sheet_info = task_config?.asset;
    let sub_sheet_config = task_config?.subSheet;
    let view_config = task_config?.view;
    const parsed_filter = resolveFilterValue(state, task_config?.filter);
    const parsed_order_by = getOrderBy(task_config?.orderBy);
    let body = { 
      tableId: sub_sheet_config?.id,
      baseId: sub_sheet_config?.baseId,
      viewId: view_config?.id,
      state: {},
      manual_filters: parsed_filter.filter,
      should_stringify: false,
      is_field_required: false,
      manual_sort: _.omit(parsed_order_by, ["group_by_str"])
    };
    const attributes = buildSelectedAttributes(task_obj?.inputs);
    if(attributes?.length > 0) {
      body.requiredFields = attributes;
    }
    const node_input = {
      sheet_name: sheet_info?.name,
      table_name: sub_sheet_config?.name,
      view_name: view_config?.name,
      condition: parsed_filter.filter_str,
      order_by: parsed_order_by.group_by_str
    };
    let req_options = {
      max_retry: 3,
      retry_delay_ms: 500,
      use_backoff_retry: true,
      method: "POST",
      url: `${sheet_bff?.url}${sheet_bff?.find_one_record_sub_sheet_v2}`,
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
    const records = [req_resp?.result?.record];
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
    return __h_result;
  } catch (error) {
    error = error?.result || error;
    if(_.isObject(error)) {
      throw {...error, message: (error?.message || "Something went wrong")};
    }
    throw error;
  }
};