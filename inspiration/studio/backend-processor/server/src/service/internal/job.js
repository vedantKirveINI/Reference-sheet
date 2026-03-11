"use strict";

const DbManager = require("../../dataStore/redisDbHandler");
const utility = require("oute-services-utility-sdk");

const logger = require("../../../config/conf").stores["logger"]?.store;

const db_instance = new DbManager({prefix: "internal", key_exp_seconds: 24 * 60 * 60});
const uuid_instance = utility.getUuidInstance();
const type_func_map = {
  "node": require("./customExecuteNode"),
  "flow": require("./customExecuteFlow")
};

module.exports = {
  createJob: async (params) => {
    const type = params?.params?.type;
    const func = type_func_map[type];
    if(!func) { throw {message: "The job type you provided isn't valid"}; }
    await db_instance.getClient();
    const job_info = {job_id: uuid_instance.v4(), status: "running", type, started_at: new Date()};
    await db_instance.setKey(job_info.job_id, job_info);
    //anonymous function with instance invocation
    (async ()=> {
      try {
        job_info.result = await func(params);
        job_info.status = "success";
      } catch (error) {
        job_info.result = error;
        job_info.status = "failed";
      } finally {
        job_info.completed_at = new Date();
        await db_instance.setKey(job_info.job_id, job_info);
      }
    })().catch(logger.error);
    return job_info;
  },

  getJobInfo: async (params) => {
    const job_id = params?.query?.job_id;
    if(!job_id) { throw {message: "A job ID is required to continue"}; }
    await db_instance.getClient();
    const job_info = (await db_instance.getKey(job_id, true)) || {message: "We couldn't find the job you're looking for"};
    return job_info;
  }
};