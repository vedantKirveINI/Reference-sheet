"use strict";

const DbManager = require("oute-services-redis-db-handler-sdk");
const conf = require("../../config/conf");
const constants = conf.stores["constants"].store;
const logger = conf.stores["logger"]?.store;

const default_config = {
  redis_conn_string: constants?.redis_conn_string,
  redis_db_index: constants?.redis_db_index,
  prefix: "processor",
  logger: logger
};

DbManager.setConfig(default_config);

module.exports = DbManager;