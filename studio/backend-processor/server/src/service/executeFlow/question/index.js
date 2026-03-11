"use strict";

let _ = require("lodash");
let getParsedInputs = require("./getParsedInputs");

module.exports = (flow, task_id, state, options) => {
  return new Promise(async (resolve, reject)=> {
    try {
      let task_obj = flow?.flow?.[task_id];
      state[task_id] = await getParsedInputs(state, task_id, task_obj, options);
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