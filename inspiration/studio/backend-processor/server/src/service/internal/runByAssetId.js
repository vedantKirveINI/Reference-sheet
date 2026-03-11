"use strict";

const _ = require("lodash");
const utility = require("oute-services-utility-sdk");

const conf = require("../../../config/conf");
const customExecuteFlow = require("./customExecuteFlow");

const constants = conf.stores["constants"].store;
const logger = conf.stores["logger"]?.store;
const ic_backend = constants?.deployment;

module.exports = async (params) => {
  try {
    let req_options = {
      max_retry: 3,
      retry_delay_ms: 500,
      use_backoff_retry: true,
      method: "GET",
      url: `${ic_backend?.url}${ic_backend?.find_one_published_by_asset}`,
      headers: {
        "Content-Type": "application/json"
      },
      query_params: {asset_id: params?.params?.assetId, include_project_variable: true}
    };
    let req_resp = await utility.executeAPI(req_options);
    let result = req_resp?.result;
    if(result?.status !== "success") { throw (result?.result || result); }
    let flow_info = result?.result;
    let state = {};
    let options = {};
    if(flow_info?.variables) {
      state = _.extend(state, _.cloneDeep(flow_info?.variables));
      delete flow_info?.variables;
      delete flow_info?.project_variable;
    }
    if(_.isObject(params?.body)) {
      state = _.extend(state, params?.body);
    }
    state.start_node_data = params?.body;
    let flow_result = await customExecuteFlow({body: {flow: flow_info, state, options}, headers: params?.headers});
    return flow_result;
  } catch (error) {
    logger.error(error);
    throw (error?.result?.result || error?.result || error);
  }
};