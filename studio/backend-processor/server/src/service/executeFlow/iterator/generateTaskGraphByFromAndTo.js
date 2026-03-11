"use strict";

const _ = require("lodash");

const skip_types = ["from", "to", "both", "none"];

const generateTaskGraphByFromAndTo = (flow, from_task_id, to_task_ids=[], skip_type, position) => {
  let task_graph = [];
  //return if the from is missing
  if(!(from_task_id)) {
    return task_graph;
  }
  let from_task_obj = flow?.flow?.[from_task_id];
  let next_node_ids = _.cloneDeep(from_task_obj?.next_node_ids || []);
  let prev_node_ids = _.cloneDeep(from_task_obj?.prev_node_ids || []);
  //add the start node to task_graph
  if(["from", "both"].includes(skip_type) && (position <= 1)) {
    if(position === 1) {
      if(skip_type === "from" || (skip_type === "both" && !to_task_ids.includes(from_task_id))) {
        task_graph.push([from_task_id, []]);
      }
    }
  } else if(position === 0) {
    task_graph.push([from_task_id, []]);
  } else {
    if(["to", "both"].includes(skip_type)) {
      if(!to_task_ids.includes(from_task_id)) {
        task_graph.push([from_task_id, prev_node_ids]);
      }
    } else {
      task_graph.push([from_task_id, prev_node_ids]);
    }
  }
  //recurse till the last node
  if(from_task_id && !to_task_ids.includes(from_task_id)) {
    for (let next_node_id of next_node_ids) {
      let _task_graph = generateTaskGraphByFromAndTo(flow, next_node_id, to_task_ids, skip_type, ++position);
      for (let _task_ele of _task_graph) {
        let is_new = true;
        for (let task_ele of task_graph) {
          if(_task_ele?.[0] && task_ele?.[0] && (_task_ele?.[0] === task_ele?.[0])) {
            task_ele[1] = _.uniq(task_ele?.[1].concat(_task_ele?.[1]));
            is_new = false;
            break;
          }
        }
        if(is_new === true) {
          task_graph.push(_task_ele);
        }
      }
    }
  }
  return task_graph;
};

module.exports = (flow, from_task_id, to_task_ids=[], skip_type) => {
  skip_type = (skip_type || "none").toLowerCase();
  if(!skip_types.includes(skip_type)) { throw {message: `Skip type should be any of [${skip_types.join(", ")}]`}; }
  return generateTaskGraphByFromAndTo(flow, from_task_id, to_task_ids, skip_type, 0);
};
