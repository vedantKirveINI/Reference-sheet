"use strict";

const customExecuteNode = require("./customExecuteNode");
const customExecuteFlow = require("./customExecuteFlow");
const runByid = require("./runByid");
const runByAssetId = require("./runByAssetId");
const job = require("./job");
const refreshToken = require("../executeFlow/authorization/refreshToken");

module.exports = {
  customExecuteNode: async (params, callback) => {
    try {
      const result = await customExecuteNode(params);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  customExecuteFlow: async (params, callback) => {
    try {
      const result = await customExecuteFlow(params);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },

  runByid: async (params, callback) => {
    try {
      const result = await runByid(params);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  createJob: async (params, callback) => {
    try {
      const result = await job.createJob(params);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  getJobInfo: async (params, callback) => {
    try {
      const result = await job.getJobInfo(params);
      return callback(null, result);
    } catch (error) {
      return callback(error);
    }
  },
  refreshToken,
  runByAssetId
};