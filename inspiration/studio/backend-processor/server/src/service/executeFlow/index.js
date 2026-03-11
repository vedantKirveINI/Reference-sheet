"use strict";

const _ = require("lodash");
const taskRunner = require("task-graph-runner");
const utility = require("oute-services-utility-sdk");
const uuid_instance = utility.getUuidInstance();

const conf = require("../../../config/conf");
const logger = conf.stores["logger"]?.store;

const taskFn = require("./task");
const processOptions = require("./processOptions");
const generateTaskGraphByFromAndTo = require("./iterator/generateTaskGraphByFromAndTo");
const resetStateOfTaskGraph = require("./iterator/resetStateOfTaskGraph");

class Execute {
  constructor(flow, state, options={}) {
    this.flow = flow;
    this.state = state;
    this.options = options || {};
    if (!_.isObject(this.options)){
      this.options = {};
    }
    this.options = processOptions(this.flow, this.options);
    //this key to ensure no one called the function without proper initialization
    this.options.is_valid_init = true;
    this.options.max_iterations = 100;
    this.options.iteration = 1;
    //Validation logic
    if (!(this.flow) || !(this.state)) { this.options.is_valid_init = false; }
  }

  task = async (task_id) => {
    if (this.options?.is_valid_init !== true) { throw {message: "Class not initialized with the required payload. Please provide the necessary data during class instantiation", task_obj: this.flow?.[task_id]}; }
    //Excute the each node
    let result = await taskFn(this.flow, task_id, this.state, this.options);
    return result;
  };

  abort = () => {
    if (_.isObject(this.options)){
      this.options.abort = true;
    }
    return { __h_meta: {options: this.options}, message: "Your request to abort the operation has been received and the process is being terminated. Thank you for your patience."};
  };

  invokeRunner = async (params) => {
    if (this.options?.is_valid_init !== true) { throw {message: "Class not initialized with the required payload. Please provide the necessary data during class instantiation"}; }
    try {
      let task_graph = this.flow?.task_graph;
      if(!_.isEmpty(params?.task_graph)) {
        task_graph = params?.task_graph;
      }
      //This lib will help on executing the flow
      const result = await taskRunner({graph: new Map(task_graph), task: this.task});
      return result;
    } catch (error) {
      const action_type = error?.__h_meta?.action_type;
      const jump_to_id = error?.result?.response?.jump_to_id || error?.result?.jump_to_id;
      //if jumpto then need to recursive call
      if(action_type === "JUMP_TO" && jump_to_id !== undefined) {
        if(this.options.iteration > this.options.max_iterations) {
          throw {message: "Maximum iteration limit has been reached"};
        }
        this.options.iteration += 1;
        const task_graph = generateTaskGraphByFromAndTo(this.flow, jump_to_id, [], "none");
        resetStateOfTaskGraph(this.state, task_graph);
        return await this.invokeRunner({task_graph});
      }
      throw error;
    }
  };

  execute = async () => {
    let final_result;
    let task_name = `FLOW_uuid_${uuid_instance.v4()}`;
    logger.startTime(task_name);
    try {
      if (this.options?.is_valid_init !== true) { throw {message: "Class not initialized with the required payload. Please provide the necessary data during class instantiation"}; }
      let result = await this.invokeRunner();
      final_result = {};
      for (const [key] of result.values) {
        //This is useful incase we want to run only few nodes
        let value = result.values.get(key);
        let task_obj = value?.task_obj;
        //Here we are extracting data from added in the response key so that user dont see the custom added keys at end
        //Dont enable the below if block satyendra dont have clarity
        if (false && task_obj?.config?.return_in_response === true) {
          final_result = value?.response;
        } else {
          final_result = value;
        }
        //if end node found and not marked as skip then break as this node to be returns
        if(["END"].includes(task_obj?.node_marker) && (task_obj?.skip !== true)) {
          break;
        }
      }
      if(this.options?.should_return_state === true) {
        final_result.state = this.state;
      }
      return final_result;
    } catch (error) {
      final_result = error;
      const action_type = final_result?.__h_meta?.action_type;
      if (this.options?.should_return_state === true) {
        final_result.state = this.state;
      }
      //This case is to handle for abort request, soft break or skip of flow and passoute the node error
      if(this.options?.abort === true || ["SKIP", "BREAK", "END"].includes(action_type)) {
        return final_result;
      } else {
        throw final_result;
      }
    } finally {
      logger.endTime(task_name);
    }
  };
}

module.exports = Execute;