"use strict";

const _ = require("lodash");
const flow_utility_instance = require("oute-services-flow-utility-sdk");
const utility_instance = require("oute-services-utility-sdk");
const markSkipTaskByFromAndTo = require("./markSkipTaskByFromAndTo");
const generateTaskGraphByFromAndTo = require("./generateTaskGraphByFromAndTo");
const getGroupInfoBySource = require("./getGroupInfoBySource");
const resetStateOfTaskGraph = require("./resetStateOfTaskGraph");
const mapRecordsToFieldNames = require("../tcSheet/misc/mapRecordsToFieldNames");

let ExecuteFlow = undefined;

module.exports = async (flow, task_id, state, options) => {
  try {
    //This import needed as we need to get the whole runnuer in one node
    if(ExecuteFlow === undefined) { ExecuteFlow = require("../index"); }
    let task_obj = flow?.flow?.[task_id];
    const chunk_size = 50;
    let parsed_obj = await flow_utility_instance.parseIOV2(state, task_obj?.inputs);
    parsed_obj.data = parsed_obj?.data || [];
    const key_config_map = await flow_utility_instance.misc.extractKeyConfigMap(task_obj?.outputs);
    let node_input = _.cloneDeep(parsed_obj.data);
    if(!_.isEmpty(key_config_map)) {
      node_input = await mapRecordsToFieldNames(node_input, key_config_map);
    }
    if (options.emit_events) {
      options?.socket?.emit("node_input", { options: { ...(options?.toJSON() || options) }, data: { type: "node_input", node_type: task_obj?.type, node_id: task_id, node_name: (task_obj?.config?.name || task_obj?.config?.label), created_at: new Date(), result: node_input } });
    }
    //Here we assumed that when execution type is node then only ask node should run, so returning here
    if (options?.execution_type === "node") {
      state[task_id] = parsed_obj.data;
      return state[task_id];
    }
    let group_info = getGroupInfoBySource(flow, task_id);
    let to_node_ids = group_info?.to_node_ids;
    let task_graph_of_group = generateTaskGraphByFromAndTo(flow, task_id, to_node_ids, "from");
    //loop through the data
    //reset the state if next nodes exists in state
    state = resetStateOfTaskGraph(state, [...task_graph_of_group, [task_id]]);
    state[task_id] = {__h_meta: {message: `The operation will iterate ${parsed_obj?.data?.length} times`}};
    await utility_instance.asyncMap({data: parsed_obj?.data, chunk_size}, async (response, data_index)=> {
      //loop through the tasks
      state[task_id].response = response;
      state[task_id].index = data_index;
      //deep clone the flow to preserve modification
      let cloned_flow = _.cloneDeep(flow);
      cloned_flow.task_graph = task_graph_of_group;
      let execute_instance = new ExecuteFlow(cloned_flow, state, options);
      let execute_result = await execute_instance.execute();
      let action_type = (execute_result?.result?.response?.__h_meta?.action_type || execute_result?.__h_meta?.action_type);
      //This is used to pause the execution so that the function dont block main thread    
      if(data_index > 0 && (data_index % chunk_size) === 0) {
        await utility_instance.sleep(0);
      }
      if(action_type === "SKIP") {
        return;
      } else if(["BREAK"].includes(action_type)) {
        return action_type;
      }
    });
    //skip the task which were part of the iteration
    markSkipTaskByFromAndTo(flow, task_id, to_node_ids, "between");
    state[task_id] = parsed_obj.data;
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