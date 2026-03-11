"use strict";

const _ = require("lodash");
const conf  = require("../../config/conf");
let logger = conf?.stores["logger"]?.store;

module.exports = {
  formatError: (error)=> {
    if(!logger) {logger = conf?.stores?.logger?.store;}
    if(error instanceof Error)
      logger.error(error);
    if(_.isObject(error)) {
      let message = "An unexpected error occurred. Please try again";
      if(error?.message) {
        message = error?.message;
      } else if(_.isString(error?.error_description)) {
        message = error?.error_description;
      } else if(_.isString(error?.error)) {
        message = error?.error;
      }
      error = {...error, message: message};
    }
    return error;
  }
};