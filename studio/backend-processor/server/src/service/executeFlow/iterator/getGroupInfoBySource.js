"use strict";

const _ = require("lodash");

const getEndNodeIdsOfGroup = (flow, source_node_id, curr_node_id) => {
  let end_node_ids = [];
  if(!curr_node_id) {
    curr_node_id = source_node_id;
  }
  let curr_node = flow?.flow?.[curr_node_id];
  if(source_node_id && (curr_node?.config?.source_node_id === source_node_id)) {
    //if current node is grouped by src node then the cuurent node is end of that group
    end_node_ids.push(curr_node_id);
  } if(!curr_node?.next_node_ids?.length) {
    //if current node is not grouped by src node and last node of path then marks as end of group
    end_node_ids.push(curr_node_id);
  } else {
    //iterate for next node to find the end
    for (const next_node_id of (curr_node?.next_node_ids || [])) {
      let _end_node_ids = getEndNodeIdsOfGroup(flow, source_node_id, next_node_id);
      end_node_ids = end_node_ids.concat(_end_node_ids);
    }
  }
  end_node_ids = _.uniq(end_node_ids);
  return end_node_ids;
};

module.exports = (flow, source_node_id) => {
  let result = {from_node_id: source_node_id, to_node_ids: getEndNodeIdsOfGroup(flow, source_node_id, undefined)};
  return result;
};