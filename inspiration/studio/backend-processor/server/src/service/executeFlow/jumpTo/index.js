"use strict";

const _ = require("lodash");

module.exports = async (flow, task_id, state, options) => {
  let task_obj = flow?.flow?.[task_id];
  const jump_to_id = task_obj?.config?.jump_to_id;
  const jump_to_task = flow?.flow?.[jump_to_id];
  const message = "Unable to locate the specified jump-to task";
  if(!jump_to_id) {
    throw {message};
  }
  state[task_id] = {jump_to_id};
  if (task_obj?.config?.return_in_response === true) {
    state[task_id] = { response: {jump_to_id} };
  }
  //Here we assumed that when execution type is node then only ask node should run, so returning here
  if (options?.execution_type === "node") {
    return state[task_id];
  }
  if(!jump_to_task) {
    throw {message};
  }
  if (options.emit_events) {
    options?.socket?.emit("node_output", { options: { ...(options?.toJSON() || options) }, data: { type: "node_output", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: (_.has(state[task_id], "response") ? state[task_id]?.response : state[task_id]) } });
  }
  //This line we will use for soft action on flow
  let __h_result = {__h_meta: {action_type: task_obj?.type}, __h_result: state[task_id]};
  return __h_result;
};