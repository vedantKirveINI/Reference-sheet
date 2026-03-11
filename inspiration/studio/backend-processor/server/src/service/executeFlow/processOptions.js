"use strict";

const _ = require("lodash");
const utility = require("oute-services-utility-sdk");
const uuid_instance = utility.getUuidInstance();

module.exports = (flow, options, extra_options) => {
  options = options || {};
  extra_options = extra_options || {};
  if(!options?.asset_id) {options.asset_id = flow?.asset_id;}
  if(!options?.published_id) {options.published_id = flow?.published_id || flow?._id;}
  if(!options?.canvas_id) {options.canvas_id = flow?.canvas_id;}
  if(!options?.name) {options.name = (flow?.name || "Anonymous");}
  if(!options?.workspace_id) {options.workspace_id = flow?.workspace_id;}
  if(options?.nested_logs === undefined) {options.nested_logs = true;}
  if(!options?.execution_id) {options.execution_id = uuid_instance.v4();}
  if(!options?.request_id) {options.request_id = uuid_instance.v4();}
  if(!options?.batch_id) {options.batch_id = options?.execution_id;}
  if(!options?.snapshot_canvas_id) {options.snapshot_canvas_id = flow?.snapshot_canvas_id;}
  //Removed keys which will be calculated on the fly
  if(extra_options?.reset_on_init === true) {
    delete options?.exec_task_counts;
    delete options?.exec_task_credits;
  }
  if(!_.isFunction(options?.toJSON)) {
    options.toJSON = function (extra_args) {
      if(!_.isObject(extra_args)) {
        extra_args = {};
      }
      //Here the extra_args is user data so spreading at last to persist it
      return {..._.omit(this, ["toJSON", "socket", "__h_meta"]), ...extra_args};
    };
  }
  return options;
};