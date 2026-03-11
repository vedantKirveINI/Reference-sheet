"use strict";

const getConnectedTaskByFromAndTo = require("oute-services-flow-utility-sdk/core/taskRunner/ifElse/getConnectedTaskByFromAndTo");
const skip_modes = ["between", "except"];

module.exports = (flow, from_task_id, to_task_ids=[], skip_mode) => {
  if(!skip_modes.includes(skip_mode)) { throw {message: `Invalid type. [${skip_mode}] should be anyone of [${skip_modes?.join(", ")}]`}; }
  //get the skip ids based on mode
  let skip_ids = getConnectedTaskByFromAndTo(flow, from_task_id, to_task_ids, skip_mode, false);
  //mark as skip the flow which based on the mode
  for (var task_id of Object.keys(flow?.flow || {})) {
    if(skip_ids.includes(task_id)) {
      flow.flow[task_id].skip = true;
    } else {
      flow.flow[task_id].skip = false;
    }
  }
  return flow;
};