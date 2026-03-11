"use strict";

const fs = require("fs");
const initModels = require("../models");
const dataStore = require("../dataStore");
const bootRoutesFn = require("../service/bootRoutes");

let config = undefined;
let conf = undefined;

module.exports = app => {
  return new Promise(async (resolve, reject) => {
    if(!(conf)) { conf = require("../../config/conf"); }
    if(!(config)) { config = conf.stores["config"]; }
    const app_id = conf.get("project_name") || "processor";
    const init_file = `${__dirname}/../public/index.html`;
    try {
      if(fs.existsSync(init_file)) {
        const data = fs.readFileSync(init_file);
        if(/^\s*$/.test(String(data))) {
          fs.writeFileSync(init_file, `<h1 style="text-align: center;">${`Welcome to ${app_id}`.toUpperCase()}</h1>`);
        }
      }
      await dataStore();
      await initModels();
      //make this the last line
      bootRoutesFn(app);
      return resolve({message: "init success"});
    } catch (error) {
      return reject(error);
    }
  });
};