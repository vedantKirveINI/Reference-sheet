"use strict";

const _ = require("lodash");

const conf = require("../../../config/conf");
const authorize = require("./authorize");
const execute = require("./execute");

const constants = conf.stores["constants"]?.store;
const routes = conf.stores["routes"]?.store;
const internalController = require("../../controller/internal/internalController");

module.exports = app => {
  routes.forEach(route_obj=> {
    let auth_flow;
    let method = route_obj?.method?.toLowerCase();
    //Here we need to convert route variable, for now it isnt in scope
    let route = route_obj?.route?.replace(/@/gi, ":");
    let flow = conf.stores[route_obj?.flow_id]?.store;
    if((route_obj?.auth_type === "FLOW") && route_obj?.auth_config && _.isString(route_obj?.auth_config)) {
      auth_flow = conf.stores[route_obj?.auth_config]?.store;
    }
    //route added
    return app?.[method](route, authorize({route_obj, flow: auth_flow}), execute({route_obj, flow}));
  });
  //This block is being used for the internal apis
  if([true, "true"].includes(constants?.enable_internal_api)) {
    app.post("/service/v0/custom/execute/node", internalController.customExecuteNode);
    app.post("/service/v0/custom/execute/flow", internalController.customExecuteFlow);
    app.post("/service/v0/run/asset/:assetId", internalController.runByAssetId);
    app.post("/service/v0/run/:id", internalController.runByid);
    app.post("/service/v0/internal/job/submit/:type", internalController.createJob);
    app.get("/service/v0/internal/job/info", internalController.getJobInfo);
    app.post("/service/v0/internal/refresh/token", internalController.refreshToken);
    // Health check endpoint
    app.get('/health', (req, res) => { res.send({ status: 'ok' }); });
  }
  return app;
};