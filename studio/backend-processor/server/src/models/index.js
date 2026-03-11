"use strict";

let _ = require("lodash");
let db_handler_instance = require("oute-services-db-handler-sdk");
let fs = require("fs-extra");
let path = require("path");
let conf = require("../../config/conf");
let db_config = conf?.stores["db_config"]?.store;
let variables = conf?.stores["variables"]?.store;

var loadSchema = (folder_path, client_info, output) => {
  try {
    output = output || {};
    let folder_content = fs.readdirSync(folder_path);
    for (var item of folder_content) {
      var item_path = path.join(folder_path, item);
      if(fs.statSync(item_path).isDirectory()) {
        var _output = loadSchema(item_path, client_info, output);
        output = {...output, ..._output};
      } else {
        if(/.js$|.coffee$/.test(item)) {
          var {
            name
          } = path.parse(item);
          var fn = require(item_path);
          if(_.isFunction(fn)) {
            output[name] = fn(client_info?.db_client, client_info?.orm_misc?.data_types);
          }
        }
      }
    }
    return output;
  } catch (error) {
    throw error;
  }
};

module.exports = () => {
  return new Promise(async (resolve, reject) => {
    let error;
    try {
      let schema_path = path.join(__dirname, "schema");
      for (var connection_id of Object.keys(db_config)) {
        try {
          var client_info = await db_handler_instance.getClient({...variables}, db_config?.[connection_id]?.connection, {logging: false});
          //load the result of load schema of client_info.models if model not found from db
          loadSchema(path.join(schema_path, connection_id), client_info, {});
          conf.add(connection_id, { type: 'literal', store: client_info });
        } catch (error1) {
          error = error1;
          throw error;
        }
      }
      return resolve({message: "Schema loaded"});
    } catch (error2) {
      error = error2;
      return reject(error);
    }
  });
};