"use strict";

const _ = require("lodash");
const conf = require("../../../../config/conf");
const logger = conf.stores["logger"]?.store;

/*
  This function will handle differnt type of auth and convert it to headers format
*/

module.exports = async (parsed_obj, task_obj) => {
  try {
    let result = {};
    let body_config = task_obj?.config?.body;    
    if(body_config?.type === "raw") {
      if(_.isObject(parsed_obj?.body)) {
        result = JSON.stringify(parsed_obj?.body);
      } else {
        result = parsed_obj?.body;
      }
    } else if ((body_config?.type === "form-data") && (_.isPlainObject(parsed_obj?.body) || _.isArray(parsed_obj?.body))) {
      result = parsed_obj?.body;
    } else if((body_config?.type === "x-www-form-urlencoded") && _.isPlainObject(parsed_obj?.body)) {
      result = parsed_obj?.body;
    } else if ([null, undefined, "none"].includes(body_config?.type)) {
      result = undefined;
    } else if((body_config?.type === "binary")) {
      const bodyVal = parsed_obj?.body;
      const message = "No file found. Please ensure a file is provided before proceeding";
      if (typeof bodyVal === "string" && bodyVal.trim() !== "") {
        result = { url: bodyVal.trim() };
      } else if (bodyVal && typeof bodyVal === "object" && bodyVal.cdn) {
        result = { url: bodyVal.cdn };
      } else {
        throw { message };
      }
    } else {
      throw {message: "Body type not configured. Please set the appropriate body type before making the request"};
    }
    return result;
  } catch (error) {
    if(error instanceof Error) {
      logger.error(error);
      error = {message: error?.message || "Something went wrong. Please contact support if this persists"};
    }
    throw error;
  }
};