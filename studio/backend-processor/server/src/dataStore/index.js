"use strict";

let config  = require("../../config/conf").stores["config"];

module.exports = () => {
  return new Promise((resolve, reject) => {
    if (["NA", "", undefined, null].includes(config.get("db_type"))) {
      return resolve({message: "Starting without db connection"});
    } else {
      return reject({message: `Type[${config.get("db_type")}] not configured. Please connect with support to add this in future release`});
    }
  });
};