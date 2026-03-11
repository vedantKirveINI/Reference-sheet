"use strict";

const _ = require("lodash");

const internal_instance = require("../../service/internal");
const logger = require("../../../config/conf").stores["logger"].store;
const app_utility = require("../../middleware/utility");

module.exports = {
  customExecuteNode: (req, res) => {
    if(_.isEmpty(req?.body)) { return res.status(200).send({status: "failed", result: {message: "Payload missing. Please provide the required data payload before proceeding"}}); }
    internal_instance.customExecuteNode({body: req?.body, headers: req?.headers}, (error, result)=> {
      if(error) { return res.status(200).send({status: "failed", result: error}); }
      return res.status(200).send({status: "success", result});
    });
  },

  customExecuteFlow: (req, res) => {
    if(_.isEmpty(req?.body)) { return res.status(200).send({status: "failed", result: {message: "Payload missing. Please provide the required data payload before proceeding"}}); }
    internal_instance.customExecuteFlow({body: req?.body, headers: req?.headers}, (error, result)=> {
      if(error) { return res.status(200).send({status: "failed", result: error}); }
      return res.status(200).send({status: "success", result});
    });
  },

  //This api function was not following the status, result structure as these needs to be like the deployed flow
  //Here req is sent for creating the state object
  runByid: (req, res) => {
    if(_.isEmpty(req?.params)) { return res.status(400).send({message: "Payload missing. Please provide the required data payload before proceeding"}); }
    internal_instance.runByid({req, params: req?.params, body: req?.body, headers: req?.headers}, (error, result)=> {
      if(error) { return res.status(500).send(error); }
      return res.status(200).send(result);
    });
  },
  runByAssetId: async (req, res) => {
    if(_.isEmpty(req?.params)) { return res.status(400).send({message: "Payload missing. Please provide the required data payload before proceeding"}); }
    try {
      const result = await internal_instance.runByAssetId({req, params: req?.params, body: req?.body, headers: req?.headers});
      return res.status(200).send(result);
    } catch (error) {
      error = app_utility.formatError(error);
      return res.status(500).send(error);
    }
  },
  createJob: (req, res) => {
    internal_instance.createJob({params: req?.params, body: req?.body, headers: req?.headers}, (error, result)=> {
      if(error instanceof Error) {
        logger.error(error);
        error = {message: error?.message || "Oops! Something went wrong"};
      }
      if(error) { return res.status(200).send({status: "failed", result: error}); }
      return res.status(200).send({status: "success", result});
    });
  },
  getJobInfo: (req, res) => {
    internal_instance.getJobInfo({query: req?.query, headers: req?.headers}, (error, result)=> {
      if(error instanceof Error) {
        logger.error(error);
        error = {message: error?.message || "Oops! Something went wrong"};
      }
      if(error) { return res.status(200).send({status: "failed", result: error}); }
      return res.status(200).send({status: "success", result});
    });
  },
  refreshToken: async (req, res) => {
    try {
      const result = await internal_instance.refreshToken({body: req?.body, headers: req?.headers});
      return res.status(200).send({status: "success", result});
    } catch (error) {
      error = app_utility.formatError(error);
      return res.status(200).send({status: "failed", result: error});
    }
  }
};