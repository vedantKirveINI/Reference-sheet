"use strict";

const _ = require("lodash");

/*
  This function will handle differnt type of auth and convert it to headers format
*/

const convertToString = (obj, separator) => {
  let keys = Object.keys(obj || {});
  let values = [];
  for (var key of keys) {
    if(["location_type"].includes(key)) { continue; }
    values?.push(obj?.[key]);
  }
  return values?.join(separator);
};

module.exports = (parsed_obj, task_obj) => {
  let result = {};
  let auth_config = task_obj?.config?.authorization;
  if(auth_config !== undefined) {
    if(auth_config?.type === "basic") {
      result.Authorization = `Basic ${Buffer.from(convertToString(parsed_obj?.authorization, ":")).toString("base64")}`;
    } else if(auth_config?.type === "bearer") {
      result.Authorization = `Bearer ${convertToString(parsed_obj?.authorization, "")}`;
    } else if(!(_.isEmpty(parsed_obj?.authorization))) {
      throw {message: "Unauthorized access. You do not have the necessary permissions to perform this action. Please authenticate and try again", result: result?.Authorization};
    }
    delete parsed_obj?.authorization;
  }
  return result;
};