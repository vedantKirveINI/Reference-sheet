"use strict";
//This should be at the top to load the env
require('dotenv').config();
const _ = require("lodash");
const process = require("process");
const fs = require("fs-extra");
const path = require("path");
const Deployment = require("oute-services-deployment-sdk");
const db_handler_instance = require("oute-services-db-handler-sdk");

const config_path = `${__dirname}/../config/config`;
const variables_path = `${__dirname}/../config/variables`;
const flows_path = `${__dirname}/../config/flows`;
const routes_path = `${__dirname}/../config/routes`;
const constants_path = `${__dirname}/../config/constants`;
const db_config_path = `${__dirname}/../config/dbConfig`;
const schema_path = `${__dirname}/models/schema`;

const writeFileSync = (data, file_path, extension) => {
  if(Array.isArray(data) && data?.length) {
    for (let ele of data) {
      writeFileSync(ele, `${file_path}/${ele?._id}`, extension);
    }
  } else {
    let _file_path = `${file_path}.${extension}`;
    if(!(_.isString(data))) { data = JSON.stringify(data, null, 2); }
    fs.outputFileSync(_file_path, data);
  }
  return {message: "Data successfully written to storage"};
};

const generateSchemaFiles = async(db_config, variables) => {
  fs.emptyDirSync(schema_path);
  for (let connection_id of Object.keys(db_config)) {
    let client_info = await db_handler_instance.getClient({...variables}, db_config?.[connection_id]?.connection, {logging: false});
    let schema_name = client_info?.options?.schema_name || "public";
    for (let table_info of db_config?.[connection_id]?.tables || []) {
      let model_info = await db_handler_instance.getModel(client_info?.db_client, client_info?.orm_type, client_info?.orm_misc?.data_types, client_info?.db_type, table_info?.table, table_info?.fields);
      writeFileSync(model_info?.model_str, path.join(schema_path, connection_id, schema_name, model_info?.model_name), "js");
    }
  }
  return {message: "Schema files written"};
};

let getConfigs = async() => {
  let envs = process?.env;
  if(envs?.BOOT_MODE === "skip_preconfig") { return {message: "Skipping preconfig"}; }
  let config = require(config_path);
  if(config?.token && (config?.token === envs?.token)) { return {message: "Booting from local"}; }
  let constants = require(constants_path);
  //Make .env based on env provided
  let env_name = (envs?.NODE_ENV || "local").toLowerCase();
  let org_env_path = `${__dirname}/../.env.${env_name}`;
  let default_env_path = `${__dirname}/../.env.sample`;
  let env_path = `${__dirname}/../.env`;
  if(fs.existsSync(org_env_path)) {
    fs.copySync(org_env_path, env_path);
    console.log("Env setup completed");
  } else {
    console.log(`The provided env[${env_name}] havent configured, Please connect to support, loading the default one`);
    fs.copySync(default_env_path, env_path);
  }
  let deployment_instance = new Deployment({url: constants?.deployment?.url, token: envs?.token, auth: constants?.deployment?.auth});
  //get required deployment configs
  let deployment_configs = (await deployment_instance.getConfigs())?.result;
  //Write the config on disk
  writeFileSync({...deployment_configs.deployment, enable_activity: envs?.enable_activity}, config_path, "json");
  writeFileSync(deployment_configs?.variables, variables_path, "json");
  writeFileSync(deployment_configs?.db_connections, db_config_path, "json");
  writeFileSync(JSON.stringify(deployment_configs?.deployment_routes, null, 2), routes_path, "json");
  await generateSchemaFiles({...deployment_configs.db_connections}, {...deployment_configs.variables});
  fs.emptyDirSync(flows_path);
  writeFileSync(deployment_configs?.flows, flows_path, "json");
  return {message: "Downloaded from cloud"};
};

(async () => {
  try {
    let result = await getConfigs();
    console.log("CONFIG SUCCESS", result);
  } catch (error) {
    console.log("GET CONFIG ERROR", error);
    throw error;
  }
})();