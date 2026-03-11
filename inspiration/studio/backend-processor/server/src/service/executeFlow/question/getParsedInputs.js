"use strict";

const _ = require("lodash");
const deepExtend = require("deep-extend");  
const flow_utility_instance = require("oute-services-flow-utility-sdk");

module.exports = async (state, task_id, task_obj, options) => {
  try {
    let parsed_obj = {};
    let inputs = task_obj?.inputs || [];
    if(task_obj?.type === "KEY_VALUE_TABLE") {
      for (var input of inputs) {
        if(_.isArray(input?.value)) {
          var values = [];
          for (var item of input.value) {
            var item_value = flow_utility_instance.resolveValue(state, item?.key, item?.value, item?.type, item?.default, null)?.value;
            item.value = item_value;
            values.push(item);
          }
          input.value = values;
        }
        //Key value table are execptional case in value mode
        if(input?.isValueMode === true || input?.is_value_mode === true) {
          delete input?.isValueMode;
          delete input?.is_value_mode;
        }
      }
    }
    parsed_obj = await flow_utility_instance.parseIOV2(state, inputs);
    if (options.emit_events) {
      options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: (_.has(parsed_obj, "response") ? parsed_obj?.response : parsed_obj) } });
    }
    parsed_obj = deepExtend({}, (state?.[task_id] || {}), parsed_obj);    
    return parsed_obj;
  } catch (error) {
    error = error?.result || error;
    if(_.isObject(error)) {
      throw {...error, message: (error?.message || "Something went wrong")};
    }
    throw error;
  }
};