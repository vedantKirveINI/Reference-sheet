"use strict";

let _ = require("lodash");

module.exports = params => {
  return (req, res, next) => {
    try {
      //Your auth logic
      if(["NONE", null, undefined, ""].includes(params?.route_obj?.auth_type)) { return next(); }
      return res.status(401).send({status: "failed", result: {message: "Unauthorized access. You do not have the necessary permissions to perform this action. Please authenticate and try again"}});
    } catch (error) {
      return res.status(401).send({status: "failed", result: error});
    }
  };
};